/**
 * Delivery Port Interface (Domain Layer)
 *
 * Defines the contract for notification delivery adapters.
 * This is a port in hexagonal architecture - the domain defines what it needs,
 * and infrastructure adapters implement the specifics.
 *
 * PROVIDER-AGNOSTIC: Domain code imports only this interface.
 * Supabase, FCM, APNs, or any provider implements this contract.
 *
 * EXTENSIBILITY: Future mobile push adapters implement the same interface.
 * No domain changes required - just add new adapter implementations.
 */

import type { NotificationEvent, NotificationEventId } from './notification-event';
import type { UserId } from './user';

/**
 * Result of a single delivery attempt.
 * Captures success/failure with enough detail for retry and cleanup decisions.
 */
export interface DeliveryAttemptResult {
  /** Whether the delivery was successful */
  readonly success: boolean;

  /** Subscription ID that was targeted */
  readonly subscriptionId: string;

  /** Error code if delivery failed */
  readonly errorCode?: DeliveryErrorCode;

  /** Human-readable error message */
  readonly errorMessage?: string;

  /** Whether the subscription should be removed (e.g., expired, unsubscribed) */
  readonly shouldRemoveSubscription?: boolean;
}

/**
 * Standard error codes for delivery failures.
 * Used by cleanup logic to decide appropriate action.
 */
export type DeliveryErrorCode =
  | 'invalid_subscription'    // Subscription data is malformed
  | 'expired_subscription'    // Push service rejected as expired
  | 'unsubscribed'           // User unsubscribed from push service
  | 'rate_limited'           // Too many requests to push service
  | 'payload_too_large'      // Notification content exceeds limits
  | 'network_error'          // Temporary network failure
  | 'provider_error'         // Push service internal error
  | 'unknown';               // Unclassified error

/**
 * Aggregate result of delivering a notification to all eligible subscriptions.
 */
export interface DeliveryResult {
  /** The notification event that was delivered */
  readonly eventId: NotificationEventId;

  /** Total number of subscriptions attempted */
  readonly totalAttempts: number;

  /** Number of successful deliveries */
  readonly successCount: number;

  /** Number of failed deliveries */
  readonly failureCount: number;

  /** Details for each delivery attempt */
  readonly attempts: readonly DeliveryAttemptResult[];

  /** Subscription IDs that should be cleaned up */
  readonly subscriptionsToRemove: readonly string[];
}

/**
 * DeliveryPort defines the contract for notification delivery adapters.
 *
 * Implementations handle:
 * - Resolving eligible subscriptions for a user
 * - Translating NotificationEvent to provider-specific format
 * - Sending via the appropriate push service
 * - Reporting results for status tracking and cleanup
 *
 * FUTURE EXTENSION POINT:
 * When adding mobile push support, create a new adapter implementing this interface.
 * The delivery orchestrator can then fan out to multiple adapters without domain changes.
 *
 * Example future adapters:
 * - WebPushDeliveryAdapter (current, via Supabase Edge Function)
 * - FCMDeliveryAdapter (Android, via Firebase Cloud Messaging)
 * - APNsDeliveryAdapter (iOS, via Apple Push Notification service)
 */
export interface DeliveryPort {
  /**
   * Delivers a notification to all eligible subscriptions for the target user.
   *
   * @param event - The notification to deliver
   * @returns Aggregate result with per-subscription outcomes
   */
  deliver(event: NotificationEvent): Promise<DeliveryResult>;

  /**
   * Delivers a notification to specific subscriptions only.
   * Useful for retry scenarios or targeted delivery.
   *
   * @param event - The notification to deliver
   * @param subscriptionIds - Specific subscriptions to target
   * @returns Aggregate result with per-subscription outcomes
   */
  deliverToSubscriptions(
    event: NotificationEvent,
    subscriptionIds: readonly string[]
  ): Promise<DeliveryResult>;

  /**
   * Checks if there are any active subscriptions for a user.
   * Used to short-circuit delivery when no targets exist.
   *
   * @param userId - User to check subscriptions for
   * @returns True if at least one active subscription exists
   */
  hasActiveSubscriptions(userId: UserId): Promise<boolean>;
}

/**
 * Factory function type for creating delivery adapters.
 * Allows dependency injection of configuration.
 */
export type DeliveryAdapterFactory = (config: DeliveryAdapterConfig) => DeliveryPort;

/**
 * Configuration for delivery adapters.
 * Provider-specific settings without exposing provider details to domain.
 */
export interface DeliveryAdapterConfig {
  /** Base URL for the delivery service */
  readonly serviceUrl: string;

  /** Service-level API key or authentication token */
  readonly serviceKey?: string;

  /** Request timeout in milliseconds */
  readonly timeoutMs?: number;

  /** Whether to enable detailed logging */
  readonly debug?: boolean;
}
