/**
 * Send Test Push Notification
 *
 * Client-side function to trigger test push notifications.
 * Supports both local (service worker direct) and remote (Edge Function) delivery.
 *
 * @testOnly This module is for development/testing purposes only.
 */

import type { NotificationContent } from '@/lib/domain/notification-event';
import { createNotificationEvent } from '@/lib/domain/notification-event';
import { createWebPushAdapter } from '@/lib/delivery/web-push-adapter';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  createTestNotification,
  generateTestEventId,
  type TestNotificationTemplate,
  type TestNotificationResult,
} from './test-notification';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Sends a test notification using the local service worker.
 * Does not go through the Edge Function - useful for testing SW display.
 */
export async function sendLocalTestNotification(
  content: NotificationContent
): Promise<TestNotificationResult> {
  try {
    // Check if we have a service worker registration
    const registration = await navigator.serviceWorker?.ready;
    if (!registration) {
      return {
        success: false,
        error: 'Service Worker no está activo',
        timestamp: new Date().toISOString(),
      };
    }

    // Check if notifications are permitted
    if (Notification.permission !== 'granted') {
      return {
        success: false,
        error: 'Los permisos de notificación no están concedidos',
        timestamp: new Date().toISOString(),
      };
    }

    // Show notification directly via the service worker
    // Note: vibrate is part of the Notification API but not all TS libs include it
    const options: NotificationOptions & { vibrate?: number[] } = {
      body: content.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: `test-local-${Date.now()}`,
      data: {
        url: content.actionUrl || '/',
        ...content.data,
      },
      vibrate: [100, 50, 100],
      requireInteraction: false,
    };
    await registration.showNotification(content.title, options);

    return {
      success: true,
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
      debug: true,
    });

    const event = createNotificationEvent({
      id: generateTestEventId(),
      userId,
      category: 'system',
      content,
    });

    const result = await adapter.deliver(event);

    if (result.successCount > 0) {
      return {
        success: true,
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

/**
 * Sends a test notification using a predefined template.
 * Wrapper for convenience.
 */
export async function sendTestNotificationFromTemplate(
  template: TestNotificationTemplate,
  options: { local?: boolean; userId?: string } = {}
): Promise<TestNotificationResult> {
  const content = createTestNotification(template);

  if (options.local || !options.userId) {
    return sendLocalTestNotification(content);
  }

  return sendRemoteTestNotification(options.userId, content);
}
