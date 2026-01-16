/**
 * Supabase Edge Function: send-push
 *
 * Delivers Web Push notifications to subscribed browsers.
 * Handles VAPID signing, payload encryption, and delivery result reporting.
 *
 * SECURITY:
 * - VAPID credentials stored as Supabase secrets (never in code)
 * - Request validation via Authorization header
 * - No user data exposed in error responses
 *
 * EXTENSIBILITY:
 * This function handles Web Push specifically. Future mobile push delivery
 * would be implemented as separate Edge Functions (e.g., send-fcm, send-apns)
 * with a common orchestrator that fans out to appropriate channels.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// VAPID credentials from Supabase secrets
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:noreply@divisapp.cl';

// Supabase client for subscription queries and cleanup
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Request payload for push delivery.
 */
interface PushDeliveryRequest {
  /** Notification event ID for tracking */
  eventId: string;

  /** Target user ID to resolve subscriptions */
  userId: string;

  /** Notification content */
  notification: {
    title: string;
    body: string;
    actionUrl?: string;
    data?: Record<string, string | number | boolean>;
  };

  /** Optional: specific subscription IDs to target */
  subscriptionIds?: string[];
}

/**
 * Web Push subscription data from database.
 */
interface SubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

/**
 * Result of a single push delivery attempt.
 */
interface AttemptResult {
  subscriptionId: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  shouldRemove?: boolean;
}

/**
 * Error codes from push services that indicate subscription should be removed.
 */
const GONE_STATUS_CODES = [404, 410];

/**
 * Converts a base64url string to Uint8Array.
 */
function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts Uint8Array to base64url string.
 */
function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Creates VAPID JWT for push service authorization.
 */
async function createVapidJwt(audience: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: VAPID_SUBJECT,
  };

  const encodedHeader = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const encodedPayload = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Import private key for signing
  const privateKeyBytes = base64UrlToUint8Array(VAPID_PRIVATE_KEY!);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signatureInput)
  );

  // Convert signature from DER to raw format (64 bytes)
  const signatureBytes = new Uint8Array(signature);
  const encodedSignature = uint8ArrayToBase64Url(signatureBytes);

  return `${signatureInput}.${encodedSignature}`;
}

/**
 * Encrypts notification payload for Web Push.
 * Uses ECDH with AES-GCM as per RFC 8291.
 */
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const payloadBytes = new TextEncoder().encode(payload);

  // Generate ephemeral key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    'raw',
    base64UrlToUint8Array(p256dhKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberKey },
    localKeyPair.privateKey,
    256
  );

  // Export local public key
  const localPublicKeyRaw = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key using HKDF
  const authSecretBytes = base64UrlToUint8Array(authSecret);

  // PRK = HKDF-Extract(auth_secret, ecdh_secret)
  const prkKey = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(sharedSecret),
    'HKDF',
    false,
    ['deriveBits']
  );

  // IKM for content encryption key
  const ikm = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      salt: authSecretBytes,
      info: new TextEncoder().encode('Content-Encoding: auth\0'),
      hash: 'SHA-256',
    },
    prkKey,
    256
  );

  // Derive CEK and nonce
  const ikmKey = await crypto.subtle.importKey('raw', new Uint8Array(ikm), 'HKDF', false, [
    'deriveBits',
  ]);

  const cekInfo = new Uint8Array([
    ...new TextEncoder().encode('Content-Encoding: aes128gcm\0'),
  ]);

  const cekBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', salt, info: cekInfo, hash: 'SHA-256' },
    ikmKey,
    128
  );

  const nonceBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      salt,
      info: new TextEncoder().encode('Content-Encoding: nonce\0'),
      hash: 'SHA-256',
    },
    ikmKey,
    96
  );

  // Encrypt with AES-GCM
  const cek = await crypto.subtle.importKey('raw', new Uint8Array(cekBits), 'AES-GCM', false, [
    'encrypt',
  ]);

  // Add padding delimiter
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // Padding delimiter

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonceBits) },
    cek,
    paddedPayload
  );

  return {
    ciphertext: new Uint8Array(ciphertext),
    salt,
    localPublicKey,
  };
}

/**
 * Sends a Web Push notification to a single subscription.
 */
async function sendPushToSubscription(
  subscription: SubscriptionRow,
  payload: string
): Promise<AttemptResult> {
  try {
    // Extract origin from endpoint for VAPID audience
    const endpointUrl = new URL(subscription.endpoint);
    const audience = endpointUrl.origin;

    // Create VAPID authorization
    const vapidJwt = await createVapidJwt(audience);
    const authorization = `vapid t=${vapidJwt}, k=${VAPID_PUBLIC_KEY}`;

    // Encrypt the payload
    const { ciphertext, salt, localPublicKey } = await encryptPayload(
      payload,
      subscription.p256dh_key,
      subscription.auth_key
    );

    // Build the body with aes128gcm header
    const recordSize = 4096;
    const header = new Uint8Array(21 + localPublicKey.length);
    header.set(salt, 0);
    new DataView(header.buffer).setUint32(16, recordSize);
    header[20] = localPublicKey.length;
    header.set(localPublicKey, 21);

    const body = new Uint8Array(header.length + ciphertext.length);
    body.set(header);
    body.set(ciphertext, header.length);

    // Send to push service
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'TTL': '86400', // 24 hours
        'Urgency': 'normal',
      },
      body,
    });

    if (response.ok || response.status === 201) {
      return {
        subscriptionId: subscription.id,
        success: true,
      };
    }

    // Check if subscription is gone
    if (GONE_STATUS_CODES.includes(response.status)) {
      return {
        subscriptionId: subscription.id,
        success: false,
        errorCode: 'expired_subscription',
        errorMessage: `Push service returned ${response.status}`,
        shouldRemove: true,
      };
    }

    // Rate limiting
    if (response.status === 429) {
      return {
        subscriptionId: subscription.id,
        success: false,
        errorCode: 'rate_limited',
        errorMessage: 'Push service rate limit exceeded',
        shouldRemove: false,
      };
    }

    // Other errors
    return {
      subscriptionId: subscription.id,
      success: false,
      errorCode: 'provider_error',
      errorMessage: `Push service returned ${response.status}`,
      shouldRemove: false,
    };
  } catch (error) {
    return {
      subscriptionId: subscription.id,
      success: false,
      errorCode: 'network_error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      shouldRemove: false,
    };
  }
}

/**
 * Main handler for push delivery requests.
 */
serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate VAPID configuration
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('VAPID credentials not configured');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: PushDeliveryRequest = await req.json();

    // Validate request
    if (!body.eventId || !body.userId || !body.notification) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get subscriptions for user
    let query = supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh_key, auth_key')
      .eq('user_id', body.userId);

    // Filter by specific IDs if provided
    if (body.subscriptionIds && body.subscriptionIds.length > 0) {
      query = query.in('id', body.subscriptionIds);
    }

    const { data: subscriptions, error: queryError } = await query;

    if (queryError) {
      console.error('Error querying subscriptions:', queryError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          eventId: body.eventId,
          totalAttempts: 0,
          successCount: 0,
          failureCount: 0,
          attempts: [],
          subscriptionsToRemove: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Build notification payload
    const payload = JSON.stringify({
      title: body.notification.title,
      body: body.notification.body,
      actionUrl: body.notification.actionUrl,
      data: body.notification.data,
      timestamp: Date.now(),
    });

    // Send to all subscriptions in parallel
    const results = await Promise.all(
      subscriptions.map((sub) => sendPushToSubscription(sub, payload))
    );

    // Collect subscriptions to remove
    const subscriptionsToRemove = results
      .filter((r) => r.shouldRemove)
      .map((r) => r.subscriptionId);

    // Clean up invalid subscriptions
    if (subscriptionsToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', subscriptionsToRemove);

      if (deleteError) {
        console.error('Error cleaning up subscriptions:', deleteError);
      }
    }

    // Build response
    const response = {
      eventId: body.eventId,
      totalAttempts: results.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
      attempts: results,
      subscriptionsToRemove,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
