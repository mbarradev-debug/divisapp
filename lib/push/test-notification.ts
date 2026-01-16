/**
 * Test Notification Factory
 *
 * Creates test notifications for validating push delivery.
 * Clearly marked as test-only - not for production use.
 *
 * @testOnly This module is for development/testing purposes only.
 */

import type { NotificationContent } from '@/lib/domain/notification-event';

/**
 * Test notification template types.
 */
export type TestNotificationTemplate =
  | 'simple'      // Basic title + body
  | 'indicator'   // Simulates indicator alert
  | 'action';     // Includes action URL

/**
 * Result of sending a test notification.
 */
export interface TestNotificationResult {
  success: boolean;
  error?: string;
  timestamp: string;
}

/**
 * Creates a test notification content based on template.
 */
export function createTestNotification(
  template: TestNotificationTemplate = 'simple'
): NotificationContent {
  const timestamp = new Date().toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  switch (template) {
    case 'simple':
      return {
        title: 'Notificación de prueba',
        body: `Esta es una notificación de prueba enviada a las ${timestamp}`,
        data: { test: true },
      };

    case 'indicator':
      return {
        title: 'Dólar actualizado',
        body: `El dólar subió a $987,50 (+0,45%)`,
        actionUrl: '/dolar',
        data: {
          test: true,
          indicatorCode: 'dolar',
          value: 987.5,
          change: 0.45,
        },
      };

    case 'action':
      return {
        title: 'Alerta de precio',
        body: 'La UF superó tu umbral configurado de $38.000',
        actionUrl: '/uf',
        data: {
          test: true,
          indicatorCode: 'uf',
          threshold: 38000,
        },
      };
  }
}

/**
 * Generates a unique test event ID.
 */
export function generateTestEventId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
