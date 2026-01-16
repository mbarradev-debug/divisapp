/**
 * Send Test Push Notification
 *
 * Client-side function to trigger a real test push notification
 * through the full delivery pipeline (Edge Function).
 */

import type { NotificationContent } from '@/lib/domain/notification-event';
import { createNotificationEvent } from '@/lib/domain/notification-event';
import { createWebPushAdapter } from '@/lib/delivery/web-push-adapter';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Result of sending a test notification */
export interface TestNotificationResult {
  success: boolean;
  error?: string;
  timestamp: string;
}

/** Generates a unique test event ID */
function generateTestEventId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Sends a test notification through the full Edge Function delivery path.
 * Tests the complete push infrastructure including encryption.
 */
export async function sendRemoteTestNotification(
  userId: string,
  content: NotificationContent
): Promise<TestNotificationResult> {
  if (!isSupabaseConfigured() || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      success: false,
      error: 'Supabase no está configurado',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const adapter = createWebPushAdapter({
      serviceUrl: `${SUPABASE_URL}/functions/v1/send-push`,
      serviceKey: SUPABASE_ANON_KEY,
    });

    const event = createNotificationEvent({
      id: generateTestEventId(),
      userId,
      category: 'system',
      content,
    });

    const result = await adapter.deliver(event);

    // Diagnostic logging (remove after debugging)
    console.log('[SendTestPush] Delivery result:', {
      eventId: result.eventId,
      totalAttempts: result.totalAttempts,
      successCount: result.successCount,
      failureCount: result.failureCount,
      attempts: result.attempts,
    });

    if (result.successCount > 0) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    }

    // If no attempts, subscriptions were not found
    if (result.totalAttempts === 0) {
      return {
        success: false,
        error: 'No hay suscripciones activas. Intenta desactivar y volver a activar las notificaciones.',
        timestamp: new Date().toISOString(),
      };
    }

    // Find the error from attempts
    const failedAttempt = result.attempts.find((a) => !a.success);
    return {
      success: false,
      error: failedAttempt?.errorMessage || 'No se pudo entregar la notificación',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    };
  }
}
