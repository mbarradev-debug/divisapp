'use client';

/**
 * PushTestButton Component
 *
 * Minimal test button for validating real push delivery end-to-end.
 * Sends a real notification through the full delivery pipeline.
 * Intentionally non-prominent - placed below main notification settings.
 */

import { useState } from 'react';
import { useAuthState } from '@/lib/storage';
import { usePushSubscription, sendRemoteTestNotification } from '@/lib/push';
import type { NotificationContent } from '@/lib/domain/notification-event';

/** Fixed test notification payload - clearly identifiable as a test */
const TEST_NOTIFICATION: NotificationContent = {
  title: 'Test notification',
  body: 'Push notifications are working correctly.',
  data: { test: true },
};

type TestStatus = 'idle' | 'sending' | 'success' | 'error';

export function PushTestButton() {
  const { user } = useAuthState();
  const { isSubscribed } = usePushSubscription();
  const [status, setStatus] = useState<TestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Only show when subscribed - keeps UI clean when not relevant
  if (!isSubscribed) {
    return null;
  }

  const handleSendTest = async () => {
    setStatus('sending');
    setErrorMessage(null);

    // Uses the real delivery pipeline (Edge Function → Web Push)
    const result = await sendRemoteTestNotification(user.id, TEST_NOTIFICATION);

    if (result.success) {
      setStatus('success');
      // Reset to idle after brief feedback
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(result.error ?? 'Error desconocido');
    }
  };

  return (
    <div className="mt-3 flex items-center justify-between rounded-md border border-border-subtle bg-bg-subtle px-4 py-3">
      <div>
        <span className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
          Verificar entrega
        </span>
        {status === 'error' && errorMessage && (
          <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-error">
            {errorMessage}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleSendTest}
        disabled={status === 'sending'}
        className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-muted underline-offset-2 hover:text-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {status === 'sending' && 'Enviando...'}
        {status === 'success' && 'Enviada'}
        {status === 'error' && 'Reintentar'}
        {status === 'idle' && 'Enviar prueba'}
      </button>
    </div>
  );
}
