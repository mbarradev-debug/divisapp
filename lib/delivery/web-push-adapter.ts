/**
 * Web Push Delivery Adapter
 *
 * Implements DeliveryPort for Web Push notifications via Supabase Edge Function.
 * Handles communication with the send-push Edge Function and result processing.
 *
 * ARCHITECTURE:
 * This adapter is part of the infrastructure layer - it knows about Supabase
 * and HTTP specifics, but the domain only sees the DeliveryPort interface.
 *
 * FUTURE MOBILE EXTENSION:
 * When adding mobile push support, create similar adapters:
 * - FCMDeliveryAdapter for Android (calls send-fcm Edge Function)
 * - APNsDeliveryAdapter for iOS (calls send-apns Edge Function)
 *
 * The delivery orchestrator can then route to appropriate adapters based on
 * subscription channel type, without any domain layer changes.
 */

import type {
  DeliveryPort,
  DeliveryResult,
  DeliveryAttemptResult,
  DeliveryAdapterConfig,
  DeliveryErrorCode,
} from '@/lib/domain/delivery-port';
import type { NotificationEvent } from '@/lib/domain/notification-event';
import type { UserId } from '@/lib/domain/user';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Response structure from send-push Edge Function.
 */
interface EdgeFunctionResponse {
  eventId: string;
  totalAttempts: number;
  successCount: number;
  failureCount: number;
  attempts: Array<{
    subscriptionId: string;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
    shouldRemove?: boolean;
  }>;
  subscriptionsToRemove: string[];
}

/**
 * Maps Edge Function error codes to domain error codes.
 */
function mapErrorCode(code?: string): DeliveryErrorCode {
  switch (code) {
    case 'expired_subscription':
      return 'expired_subscription';
    case 'invalid_subscription':
      return 'invalid_subscription';
    case 'rate_limited':
      return 'rate_limited';
    case 'network_error':
      return 'network_error';
    case 'provider_error':
      return 'provider_error';
    default:
      return 'unknown';
  }
}

/**
 * Creates an empty delivery result for edge cases (no subscriptions, errors).
 */
function createEmptyResult(eventId: string): DeliveryResult {
  return {
    eventId,
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    attempts: [],
    subscriptionsToRemove: [],
  };
}

/**
 * Creates a failure result when delivery cannot be attempted.
 */
function createFailureResult(eventId: string, error: string): DeliveryResult {
  return {
    eventId,
    totalAttempts: 1,
    successCount: 0,
    failureCount: 1,
    attempts: [
      {
        subscriptionId: 'system',
        success: false,
        errorCode: 'network_error',
        errorMessage: error,
        shouldRemoveSubscription: false,
      },
    ],
    subscriptionsToRemove: [],
  };
}

/**
 * WebPushDeliveryAdapter implements DeliveryPort for Web Push delivery.
 *
 * Uses Supabase Edge Function for actual push delivery, keeping VAPID
 * credentials secure on the server side.
 */
export class WebPushDeliveryAdapter implements DeliveryPort {
  private readonly serviceUrl: string;
  private readonly serviceKey?: string;
  private readonly timeoutMs: number;
  private readonly debug: boolean;

  constructor(config: DeliveryAdapterConfig) {
    this.serviceUrl = config.serviceUrl;
    this.serviceKey = config.serviceKey;
    this.timeoutMs = config.timeoutMs ?? 30000;
    this.debug = config.debug ?? false;
  }

  /**
   * Delivers a notification to all Web Push subscriptions for the target user.
   */
  async deliver(event: NotificationEvent): Promise<DeliveryResult> {
    if (this.debug) {
      console.log('[WebPushAdapter] Delivering event:', event.id);
    }

    try {
      const response = await this.callEdgeFunction({
        eventId: event.id,
        userId: event.userId,
        notification: {
          title: event.content.title,
          body: event.content.body,
          actionUrl: event.content.actionUrl,
          data: event.content.data,
        },
      });

      return this.mapResponse(response);
    } catch (error) {
      if (this.debug) {
        console.error('[WebPushAdapter] Delivery failed:', error);
      }
      return createFailureResult(
        event.id,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Delivers a notification to specific subscriptions only.
   */
  async deliverToSubscriptions(
    event: NotificationEvent,
    subscriptionIds: readonly string[]
  ): Promise<DeliveryResult> {
    if (subscriptionIds.length === 0) {
      return createEmptyResult(event.id);
    }

    if (this.debug) {
      console.log(
        '[WebPushAdapter] Delivering to subscriptions:',
        subscriptionIds.length
      );
    }

    try {
      const response = await this.callEdgeFunction({
        eventId: event.id,
        userId: event.userId,
        notification: {
          title: event.content.title,
          body: event.content.body,
          actionUrl: event.content.actionUrl,
          data: event.content.data,
        },
        subscriptionIds: [...subscriptionIds],
      });

      return this.mapResponse(response);
    } catch (error) {
      if (this.debug) {
        console.error('[WebPushAdapter] Targeted delivery failed:', error);
      }
      return createFailureResult(
        event.id,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Checks if there are any active Web Push subscriptions for a user.
   */
  async hasActiveSubscriptions(userId: UserId): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const client = getSupabaseClient();
    if (!client) {
      return false;
    }

    const { count, error } = await client
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      if (this.debug) {
        console.error('[WebPushAdapter] Error checking subscriptions:', error);
      }
      return false;
    }

    return (count ?? 0) > 0;
  }

  /**
   * Calls the send-push Edge Function.
   */
  private async callEdgeFunction(payload: {
    eventId: string;
    userId: string;
    notification: {
      title: string;
      body: string;
      actionUrl?: string;
      data?: Record<string, string | number | boolean>;
    };
    subscriptionIds?: string[];
  }): Promise<EdgeFunctionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.serviceKey) {
        headers['Authorization'] = `Bearer ${this.serviceKey}`;
      }

      const response = await fetch(this.serviceUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge Function returned ${response.status}: ${errorText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Maps Edge Function response to DeliveryResult.
   */
  private mapResponse(response: EdgeFunctionResponse): DeliveryResult {
    const attempts: DeliveryAttemptResult[] = response.attempts.map((attempt) => ({
      subscriptionId: attempt.subscriptionId,
      success: attempt.success,
      errorCode: mapErrorCode(attempt.errorCode),
      errorMessage: attempt.errorMessage,
      shouldRemoveSubscription: attempt.shouldRemove,
    }));

    return {
      eventId: response.eventId,
      totalAttempts: response.totalAttempts,
      successCount: response.successCount,
      failureCount: response.failureCount,
      attempts,
      subscriptionsToRemove: response.subscriptionsToRemove,
    };
  }
}

/**
 * Factory function to create a Web Push delivery adapter.
 *
 * USAGE:
 * ```typescript
 * const adapter = createWebPushAdapter({
 *   serviceUrl: process.env.SUPABASE_URL + '/functions/v1/send-push',
 *   serviceKey: process.env.SUPABASE_ANON_KEY,
 * });
 * ```
 */
export function createWebPushAdapter(config: DeliveryAdapterConfig): WebPushDeliveryAdapter {
  return new WebPushDeliveryAdapter(config);
}
