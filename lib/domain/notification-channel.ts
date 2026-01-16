/**
 * NotificationChannelSubscription Domain Model
 *
 * Represents a user's subscription to receive notifications on a specific channel.
 * Channel-agnostic: the same model works for Web Push, Mobile Push, or future channels.
 * Provider details (tokens, endpoints) are intentionally opaque at this level.
 */

import type { UserId } from './user';

/**
 * Unique identifier for a channel subscription.
 * A user may have multiple subscriptions (e.g., web + mobile).
 */
export type ChannelSubscriptionId = string;

/**
 * Abstract channel types supported by the notification system.
 * These are logical channels, not provider implementations.
 * Delivery layer maps these to actual providers (FCM, APNs, etc.).
 */
export type NotificationChannelType =
  | 'web_push'      // Browser-based push notifications
  | 'mobile_push';  // Native mobile app push notifications

/**
 * Current state of a channel subscription.
 * Used to determine if notifications should be attempted on this channel.
 */
export type ChannelSubscriptionStatus =
  | 'active'        // Ready to receive notifications
  | 'paused'        // Temporarily disabled by user
  | 'expired'       // Token/endpoint no longer valid
  | 'revoked';      // User explicitly unsubscribed

/**
 * NotificationChannelSubscription links a user to a notification channel.
 * Contains enough information to route notifications without exposing
 * provider-specific details in the domain layer.
 *
 * The actual delivery credentials (push tokens, endpoints, keys) are stored
 * separately by the delivery infrastructure, referenced via subscriptionId.
 */
export interface NotificationChannelSubscription {
  /** Unique identifier for this subscription */
  readonly id: ChannelSubscriptionId;

  /** User who owns this subscription */
  readonly userId: UserId;

  /** Type of notification channel */
  readonly channelType: NotificationChannelType;

  /** Current subscription status */
  readonly status: ChannelSubscriptionStatus;

  /** Optional human-readable label (e.g., "Chrome on MacBook") */
  readonly deviceLabel?: string;

  /** ISO 8601 timestamp when the subscription was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp of last successful notification delivery */
  readonly lastDeliveredAt?: string;
}

/**
 * Creates a new active channel subscription.
 * Does not persist or register with push provider - caller handles those concerns.
 */
export function createChannelSubscription(
  params: Pick<NotificationChannelSubscription, 'id' | 'userId' | 'channelType'> &
    Partial<Pick<NotificationChannelSubscription, 'deviceLabel'>>
): NotificationChannelSubscription {
  return {
    id: params.id,
    userId: params.userId,
    channelType: params.channelType,
    status: 'active',
    deviceLabel: params.deviceLabel,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Checks if a subscription can receive notifications.
 * Only active subscriptions should be used for delivery attempts.
 */
export function isSubscriptionDeliverable(
  subscription: NotificationChannelSubscription
): boolean {
  return subscription.status === 'active';
}
