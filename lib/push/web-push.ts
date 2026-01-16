/**
 * Web Push API Client
 *
 * Client-side logic for Web Push permission and subscription management.
 * Handles browser Push API interactions and service worker registration.
 */

import {
  createWebPushSubscription,
  fromBrowserPushSubscription,
  type WebPushSubscription,
} from '@/lib/domain/web-push-subscription';
import type { UserId } from '@/lib/domain/user';
import {
  saveSubscription,
  deleteSubscriptionByEndpoint,
  findSubscriptionByEndpoint,
  isSupabaseConfigured,
} from '@/lib/supabase';

/**
 * Permission states for push notifications.
 */
export type PushPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

/**
 * Subscription states for UI display.
 */
export type PushSubscriptionState =
  | 'loading'
  | 'unsupported'
  | 'prompt'
  | 'denied'
  | 'subscribed'
  | 'unsubscribed'
  | 'error';

/**
 * Result type for push operations.
 */
export type PushResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * VAPID public key from environment (base64url encoded).
 */
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Service worker path for push notifications.
 */
const SERVICE_WORKER_PATH = '/sw.js';

/**
 * Checks if Web Push is supported in the current browser.
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Gets the current push notification permission state.
 */
export function getPushPermission(): PushPermissionState {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission as PushPermissionState;
}

/**
 * Converts a URL-safe base64 string to a Uint8Array.
 * Required for applicationServerKey in PushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

/**
 * Registers the service worker if not already registered.
 */
async function registerServiceWorker(): Promise<PushResult<ServiceWorkerRegistration>> {
  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return { success: true, data: registration };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Service worker registration failed',
    };
  }
}

/**
 * Gets the existing service worker registration.
 */
async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration ?? null;
  } catch {
    return null;
  }
}

/**
 * Gets the current push subscription from the browser.
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) return null;
  try {
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/**
 * Requests push notification permission from the user.
 * This should only be called after explicit user action.
 */
export async function requestPushPermission(): Promise<PushResult<NotificationPermission>> {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    return { success: true, data: permission };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Permission request failed',
    };
  }
}

/**
 * Subscribes to push notifications.
 * Creates a browser subscription and persists it to Supabase.
 *
 * @param userId - The user ID to associate with the subscription
 */
export async function subscribeToPush(
  userId: UserId
): Promise<PushResult<WebPushSubscription>> {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, error: 'VAPID public key not configured' };
  }

  // Check permission
  const permission = getPushPermission();
  if (permission === 'denied') {
    return { success: false, error: 'Push permission denied' };
  }

  // Request permission if needed
  if (permission === 'prompt') {
    const permResult = await requestPushPermission();
    if (!permResult.success) {
      return { success: false, error: permResult.error };
    }
    if (permResult.data !== 'granted') {
      return { success: false, error: 'Push permission not granted' };
    }
  }

  // Register service worker
  const swResult = await registerServiceWorker();
  if (!swResult.success) {
    return { success: false, error: swResult.error };
  }

  try {
    // Subscribe to push
    const browserSubscription = await swResult.data.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Check if this endpoint already exists
    const existingResult = await findSubscriptionByEndpoint(browserSubscription.endpoint);
    if (existingResult.success && existingResult.data) {
      return { success: true, data: existingResult.data };
    }

    // Create domain model
    const subscriptionId = crypto.randomUUID();

    const webPushSubscription = createWebPushSubscription({
      id: subscriptionId,
      userId,
      subscription: fromBrowserPushSubscription(browserSubscription),
      userAgent: navigator.userAgent,
    });

    // Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      const saveResult = await saveSubscription(webPushSubscription);
      if (!saveResult.success) {
        // Rollback browser subscription
        await browserSubscription.unsubscribe();
        return { success: false, error: saveResult.error };
      }
      return { success: true, data: saveResult.data };
    }

    // If Supabase not configured, return the local subscription
    return { success: true, data: webPushSubscription };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Subscription failed',
    };
  }
}

/**
 * Unsubscribes from push notifications.
 * Removes the browser subscription and deletes from Supabase.
 */
export async function unsubscribeFromPush(): Promise<PushResult<void>> {
  const subscription = await getCurrentSubscription();
  if (!subscription) {
    return { success: true, data: undefined };
  }

  try {
    // Delete from Supabase first (if configured)
    if (isSupabaseConfigured()) {
      const deleteResult = await deleteSubscriptionByEndpoint(subscription.endpoint);
      if (!deleteResult.success) {
        return { success: false, error: deleteResult.error };
      }
    }

    // Unsubscribe from browser
    await subscription.unsubscribe();
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unsubscribe failed',
    };
  }
}

