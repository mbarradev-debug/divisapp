/**
 * Domain Models
 *
 * Provider-agnostic types for User, UserSettings, Notifications, and Alerts.
 * Local-first, Server Component compatible.
 */

export type { User, UserId } from './user';
export { createAnonymousUser } from './user';

export type {
  UserSettings,
  ThemePreference,
  HomeOrderingMode,
  IndicatorCode,
} from './user-settings';
export {
  DEFAULT_USER_SETTINGS,
  USER_SETTINGS_VERSION,
  createUserSettings,
} from './user-settings';

export type {
  AlertRuleId,
  ComparisonOperator,
  AlertConditionType,
  ThresholdCondition,
  PercentageChangeCondition,
  AlertCondition,
  AlertCooldown,
  AlertRule,
} from './alert-rule';
export {
  createAlertRule,
  isThresholdCondition,
  isPercentageChangeCondition,
} from './alert-rule';

export type {
  NotificationEventId,
  NotificationPriority,
  NotificationCategory,
  NotificationEventStatus,
  NotificationContent,
  NotificationEvent,
} from './notification-event';
export { createNotificationEvent } from './notification-event';

export type {
  ChannelSubscriptionId,
  NotificationChannelType,
  ChannelSubscriptionStatus,
  NotificationChannelSubscription,
} from './notification-channel';
export {
  createChannelSubscription,
  isSubscriptionDeliverable,
} from './notification-channel';

export type {
  WebPushKeys,
  WebPushSubscriptionData,
  WebPushSubscription,
} from './web-push-subscription';
export {
  createWebPushSubscription,
  fromBrowserPushSubscription,
} from './web-push-subscription';

export type {
  DeliveryPort,
  DeliveryResult,
  DeliveryAttemptResult,
  DeliveryErrorCode,
  DeliveryAdapterConfig,
  DeliveryAdapterFactory,
} from './delivery-port';
