/**
 * Push Module
 *
 * Exports for Web Push functionality.
 */

export {
  isPushSupported,
  getPushPermission,
  getCurrentSubscription,
  requestPushPermission,
  subscribeToPush,
  unsubscribeFromPush,
  type PushPermissionState,
  type PushSubscriptionState,
  type PushResult,
} from './web-push';

export {
  usePushSubscription,
  type UsePushSubscriptionReturn,
} from './use-push-subscription';

// Test-only exports (for development/testing purposes)
export {
  createTestNotification,
  generateTestEventId,
  type TestNotificationTemplate,
  type TestNotificationResult,
} from './test-notification';

export {
  sendLocalTestNotification,
  sendRemoteTestNotification,
  sendTestNotificationFromTemplate,
} from './send-test-push';
