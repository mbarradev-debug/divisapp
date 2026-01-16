'use client';

/**
 * PushTestPanel Component
 *
 * Testing UI for push notifications. Provides:
 * - Preview of notification content before sending
 * - Local test (service worker only)
 * - Remote test (full Edge Function path)
 * - Clear error feedback
 *
 * @testOnly This component is for development/testing purposes only.
 */

import { useState } from 'react';
import { useAuthState } from '@/lib/storage';
import { usePushSubscription } from '@/lib/push';
import {
  createTestNotification,
  sendLocalTestNotification,
  sendRemoteTestNotification,
  type TestNotificationTemplate,
  type TestNotificationResult,
} from '@/lib/push';
import { Button } from '@/components/ui/button';

type TestMode = 'local' | 'remote';

interface TestAttempt {
  mode: TestMode;
  template: TestNotificationTemplate;
  result: TestNotificationResult;
}

export function PushTestPanel() {
  const { user } = useAuthState();
  const { isSubscribed, state } = usePushSubscription();
  const [selectedTemplate, setSelectedTemplate] =
    useState<TestNotificationTemplate>('simple');
  const [isSending, setIsSending] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<TestAttempt | null>(null);

  const notificationContent = createTestNotification(selectedTemplate);

  const handleSendLocal = async () => {
    setIsSending(true);
    setLastAttempt(null);

    const result = await sendLocalTestNotification(notificationContent);

    setLastAttempt({
      mode: 'local',
      template: selectedTemplate,
      result,
    });
    setIsSending(false);
  };

  const handleSendRemote = async () => {
    setIsSending(true);
    setLastAttempt(null);

    const result = await sendRemoteTestNotification(user.id, notificationContent);

    setLastAttempt({
      mode: 'remote',
      template: selectedTemplate,
      result,
    });
    setIsSending(false);
  };

  // Not subscribed - show message
  if (!isSubscribed && state !== 'loading') {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
        <div className="flex items-start gap-3">
          <TestIcon className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
          <div>
            <h3 className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
              Prueba de notificaciones
            </h3>
            <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
              Activa las notificaciones push para poder enviar notificaciones de prueba.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
      <div className="flex items-start gap-3">
        <TestIcon className="mt-0.5 h-5 w-5 shrink-0 text-info-text" />
        <div className="flex-1">
          <h3 className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
            Prueba de notificaciones
          </h3>
          <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
            Envía una notificación de prueba para verificar que el sistema funciona correctamente.
          </p>

          {/* Template selector */}
          <div className="mt-4">
            <label className="text-[length:var(--text-small)] font-medium leading-[var(--leading-small)] text-text-secondary">
              Tipo de notificación
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <TemplateButton
                label="Simple"
                selected={selectedTemplate === 'simple'}
                onClick={() => setSelectedTemplate('simple')}
              />
              <TemplateButton
                label="Indicador"
                selected={selectedTemplate === 'indicator'}
                onClick={() => setSelectedTemplate('indicator')}
              />
              <TemplateButton
                label="Con acción"
                selected={selectedTemplate === 'action'}
                onClick={() => setSelectedTemplate('action')}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4">
            <label className="text-[length:var(--text-small)] font-medium leading-[var(--leading-small)] text-text-secondary">
              Vista previa
            </label>
            <div className="mt-2 rounded-md border border-border bg-bg p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                  <span className="text-[length:var(--text-small)] font-bold text-primary-foreground">
                    D
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
                    {notificationContent.title}
                  </p>
                  <p className="mt-0.5 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
                    {notificationContent.body}
                  </p>
                  {notificationContent.actionUrl && (
                    <p className="mt-1 text-[length:var(--text-small)] leading-[var(--leading-small)] text-info-text">
                      Abre: {notificationContent.actionUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Send buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleSendLocal}
              disabled={isSending}
              className="text-[length:var(--text-label)]"
            >
              {isSending ? 'Enviando...' : 'Prueba local'}
            </Button>
            <Button
              variant="primary"
              onClick={handleSendRemote}
              disabled={isSending}
              className="text-[length:var(--text-label)]"
            >
              {isSending ? 'Enviando...' : 'Prueba remota'}
            </Button>
          </div>

          {/* Help text */}
          <p className="mt-2 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-muted">
            <strong>Local:</strong> Muestra directamente en el Service Worker.{' '}
            <strong>Remota:</strong> Pasa por el servidor de push completo.
          </p>

          {/* Result */}
          {lastAttempt && (
            <div
              className={`mt-4 rounded-md border p-3 ${
                lastAttempt.result.success
                  ? 'border-success-border bg-success-bg'
                  : 'border-error-border bg-error-bg'
              }`}
            >
              <div className="flex items-start gap-2">
                {lastAttempt.result.success ? (
                  <SuccessIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <ErrorIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] ${
                      lastAttempt.result.success ? 'text-success-text' : 'text-error-text'
                    }`}
                  >
                    {lastAttempt.result.success
                      ? `Notificación enviada (${lastAttempt.mode === 'local' ? 'local' : 'remota'})`
                      : 'Error al enviar'}
                  </p>
                  {lastAttempt.result.error && (
                    <p className="mt-1 text-[length:var(--text-small)] leading-[var(--leading-small)] text-error-text">
                      {lastAttempt.result.error}
                    </p>
                  )}
                  <p className="mt-1 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-muted">
                    {new Date(lastAttempt.result.timestamp).toLocaleTimeString('es-CL')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-[length:var(--text-label)] leading-[var(--leading-label)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        selected
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-bg text-text hover:bg-bg-muted'
      }`}
    >
      {label}
    </button>
  );
}

function TestIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23.693L5 15.3m14.8 0 .21 1.847a1.796 1.796 0 0 1-1.91 1.975l-2.485-.248M5 15.3l-.21 1.847a1.796 1.796 0 0 0 1.91 1.975l2.485-.248m9.03-.14a18.905 18.905 0 0 1-9.03.14"
      />
    </svg>
  );
}

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
      />
    </svg>
  );
}
