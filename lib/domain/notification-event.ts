/**
 * NotificationEvent Domain Model
 *
 * Channel-agnostic representation of a notification to be delivered.
 * Captures the intent and content without specifying how or where delivery occurs.
 * Supports Web Push, Mobile Push, or any future channel without modification.
 */

import type { UserId } from './user';
import type { AlertRuleId } from './alert-rule';

/**
 * Unique identifier for a notification event.
 * Generated at creation time, used for deduplication and tracking.
 */
export type NotificationEventId = string;

/**
 * Priority level for notification delivery.
 * Higher priority may affect delivery timing and presentation.
 */
export type NotificationPriority = 'low' | 'normal' | 'high';

/**
 * Semantic category of the notification.
 * Used by channels to determine presentation style (badge, sound, grouping).
 */
export type NotificationCategory =
  | 'alert'           // Triggered by user-defined alert rules
  | 'price_change'    // Significant indicator value change
  | 'daily_summary'   // Scheduled daily digest
  | 'system';         // App updates, maintenance notices

/**
 * Current lifecycle state of a notification event.
 * Tracks progression from creation through delivery attempts.
 */
export type NotificationEventStatus =
  | 'pending'         // Created, awaiting delivery
  | 'delivered'       // Successfully sent to at least one channel
  | 'failed'          // All delivery attempts exhausted
  | 'expired';        // TTL exceeded before delivery

/**
 * Core notification content.
 * Provider-agnostic payload that channels translate to native formats.
 */
export interface NotificationContent {
  /** Short headline displayed prominently (max ~50 chars recommended) */
  readonly title: string;

  /** Detailed message body (max ~200 chars recommended) */
  readonly body: string;

  /** Optional deep link path within the app (e.g., "/dolar") */
  readonly actionUrl?: string;

  /** Optional structured data for rich presentation */
  readonly data?: Record<string, string | number | boolean>;
}

/**
 * NotificationEvent represents a single notification instance.
 * Immutable record capturing what to notify and to whom.
 * Does not specify channel - that's determined by user subscriptions.
 */
export interface NotificationEvent {
  /** Unique identifier for this notification */
  readonly id: NotificationEventId;

  /** Target user for this notification */
  readonly userId: UserId;

  /** ID of the alert rule that triggered this event (if rule-based) */
  readonly triggeredByRuleId?: AlertRuleId;

  /** Semantic category for presentation hints */
  readonly category: NotificationCategory;

  /** Delivery priority level */
  readonly priority: NotificationPriority;

  /** The actual notification content */
  readonly content: NotificationContent;

  /** Current delivery status */
  readonly status: NotificationEventStatus;

  /** ISO 8601 timestamp when the event was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp after which the event should not be delivered */
  readonly expiresAt?: string;
}

/**
 * Creates a new pending notification event.
 * Does not persist or deliver - caller handles those concerns.
 */
export function createNotificationEvent(
  params: Pick<NotificationEvent, 'id' | 'userId' | 'category' | 'content'> &
    Partial<Pick<NotificationEvent, 'triggeredByRuleId' | 'priority' | 'expiresAt'>>
): NotificationEvent {
  return {
    id: params.id,
    userId: params.userId,
    triggeredByRuleId: params.triggeredByRuleId,
    category: params.category,
    priority: params.priority ?? 'normal',
    content: params.content,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: params.expiresAt,
  };
}
