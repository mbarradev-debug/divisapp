/**
 * AlertRule Domain Model
 *
 * User-defined conditions that trigger notifications when indicator values
 * match specified criteria. Rules are explicit, machine-evaluable, and
 * completely independent of delivery mechanism.
 */

import type { UserId } from './user';
import type { IndicatorCode } from './user-settings';

/**
 * Unique identifier for an alert rule.
 * Used to link NotificationEvents back to their triggering rule.
 */
export type AlertRuleId = string;

/**
 * Comparison operators for threshold evaluation.
 * All comparisons are numeric against indicator values.
 */
export type ComparisonOperator =
  | 'gt'    // Greater than
  | 'gte'   // Greater than or equal
  | 'lt'    // Less than
  | 'lte'   // Less than or equal
  | 'eq';   // Equal (with tolerance for floating point)

/**
 * Types of conditions that can trigger an alert.
 * Each type has specific semantics for evaluation.
 */
export type AlertConditionType =
  | 'threshold'           // Value crosses a specific boundary
  | 'percentage_change';  // Value changes by percentage within time window

/**
 * Threshold condition: triggers when indicator value crosses a boundary.
 * Example: "Alert when UF > 40000"
 */
export interface ThresholdCondition {
  readonly type: 'threshold';

  /** The indicator to monitor */
  readonly indicatorCode: IndicatorCode;

  /** How to compare current value against target */
  readonly operator: ComparisonOperator;

  /** The target value to compare against */
  readonly targetValue: number;
}

/**
 * Percentage change condition: triggers on significant value movement.
 * Example: "Alert when dollar changes by ±5% in 24 hours"
 */
export interface PercentageChangeCondition {
  readonly type: 'percentage_change';

  /** The indicator to monitor */
  readonly indicatorCode: IndicatorCode;

  /** Direction of change to watch for */
  readonly direction: 'increase' | 'decrease' | 'any';

  /** Percentage threshold (e.g., 5 means 5%) */
  readonly percentageThreshold: number;

  /** Time window in hours for measuring change */
  readonly timeWindowHours: number;
}

/**
 * Union of all supported condition types.
 * Designed for exhaustive pattern matching in evaluation logic.
 */
export type AlertCondition = ThresholdCondition | PercentageChangeCondition;

/**
 * Controls when a triggered rule can fire again.
 * Prevents notification flooding for volatile indicators.
 */
export interface AlertCooldown {
  /** Minimum hours between notifications for this rule */
  readonly minimumHours: number;

  /** ISO 8601 timestamp of last notification (if any) */
  readonly lastTriggeredAt?: string;
}

/**
 * AlertRule defines when a user should be notified about indicator changes.
 * Evaluated periodically against current indicator data.
 * Does not specify notification channel - that's handled by subscriptions.
 */
export interface AlertRule {
  /** Unique identifier for this rule */
  readonly id: AlertRuleId;

  /** Owner of this rule */
  readonly userId: UserId;

  /** Human-readable name for display in UI */
  readonly name: string;

  /** The condition that triggers this alert */
  readonly condition: AlertCondition;

  /** Whether this rule is actively being evaluated */
  readonly enabled: boolean;

  /** Cooldown settings to prevent notification spam */
  readonly cooldown: AlertCooldown;

  /** ISO 8601 timestamp when the rule was created */
  readonly createdAt: string;
}

/**
 * Creates a new enabled alert rule with default cooldown.
 * Does not persist - caller is responsible for storage.
 */
export function createAlertRule(
  params: Pick<AlertRule, 'id' | 'userId' | 'name' | 'condition'> &
    Partial<Pick<AlertRule, 'enabled' | 'cooldown'>>
): AlertRule {
  return {
    id: params.id,
    userId: params.userId,
    name: params.name,
    condition: params.condition,
    enabled: params.enabled ?? true,
    cooldown: params.cooldown ?? { minimumHours: 1 },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Type guard for threshold conditions.
 * Enables exhaustive pattern matching with type narrowing.
 */
export function isThresholdCondition(
  condition: AlertCondition
): condition is ThresholdCondition {
  return condition.type === 'threshold';
}

/**
 * Type guard for percentage change conditions.
 * Enables exhaustive pattern matching with type narrowing.
 */
export function isPercentageChangeCondition(
  condition: AlertCondition
): condition is PercentageChangeCondition {
  return condition.type === 'percentage_change';
}
