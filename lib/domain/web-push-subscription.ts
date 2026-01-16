/**
 * WebPushSubscription Domain Model
 *
 * Web Push-specific subscription data required for delivery.
 * Contains the PushSubscription credentials from the browser's Push API.
 * This extends the channel-agnostic NotificationChannelSubscription.
 */

import type { ChannelSubscriptionId } from './notification-channel';
import type { UserId } from './user';

/**
 * Web Push subscription keys as provided by the browser.
 * These are the ECDH keys used for payload encryption.
 */
export interface WebPushKeys {
  /** Public key for ECDH (base64url encoded) */
  readonly p256dh: string;

  /** Authentication secret (base64url encoded) */
  readonly auth: string;
}

/**
 * Complete Web Push subscription data.
 * Matches the structure of browser's PushSubscription.toJSON()
 */
export interface WebPushSubscriptionData {
  /** Push service endpoint URL */
  readonly endpoint: string;

  /** Expiration time in milliseconds (null if never expires) */
  readonly expirationTime: number | null;

  /** Encryption keys for push message delivery */
  readonly keys: WebPushKeys;
}

/**
 * WebPushSubscription links a user to their Web Push subscription credentials.
 * This is persisted to Supabase and used by the delivery infrastructure.
 */
export interface WebPushSubscription {
  /** Unique identifier matching the ChannelSubscription */
  readonly id: ChannelSubscriptionId;

  /** User who owns this subscription */
  readonly userId: UserId;

  /** The browser's PushSubscription data */
  readonly subscription: WebPushSubscriptionData;

  /** User agent string for device identification */
  readonly userAgent?: string;

  /** ISO 8601 timestamp when the subscription was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp when the subscription was last updated */
  readonly updatedAt: string;
}

/**
 * Creates a new Web Push subscription record.
 * Does not persist - caller handles storage.
 */
export function createWebPushSubscription(
  params: Pick<WebPushSubscription, 'id' | 'userId' | 'subscription'> &
    Partial<Pick<WebPushSubscription, 'userAgent'>>
): WebPushSubscription {
  const now = new Date().toISOString();
  return {
    id: params.id,
    userId: params.userId,
    subscription: params.subscription,
    userAgent: params.userAgent,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Converts a browser PushSubscription to our domain model format.
 */
export function fromBrowserPushSubscription(
  pushSubscription: PushSubscription
): WebPushSubscriptionData {
  const json = pushSubscription.toJSON();

  if (!json.endpoint) {
    throw new Error('PushSubscription is missing endpoint');
  }

  if (!json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('PushSubscription is missing encryption keys');
  }

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}
