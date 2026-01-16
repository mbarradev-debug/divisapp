/**
 * Delivery Module
 *
 * Infrastructure layer for notification delivery.
 * Exports adapters that implement the domain's DeliveryPort interface.
 *
 * ARCHITECTURE:
 * The domain layer defines DeliveryPort (what it needs).
 * This module provides implementations (how it's done).
 * Supabase details are encapsulated here, not in domain.
 *
 * CURRENT ADAPTERS:
 * - WebPushDeliveryAdapter: Browser push via Supabase Edge Function
 *
 * FUTURE ADAPTERS (extension points):
 * - FCMDeliveryAdapter: Android push via Firebase Cloud Messaging
 * - APNsDeliveryAdapter: iOS push via Apple Push Notification service
 *
 * Each adapter handles its specific push protocol while presenting
 * the same DeliveryPort interface to the domain.
 */

export { WebPushDeliveryAdapter, createWebPushAdapter } from './web-push-adapter';
export {
  cleanupInvalidSubscriptions,
  cleanupExpiredSubscriptions,
  cleanupSubscriptionsById,
  type CleanupResult,
} from './subscription-cleanup';
