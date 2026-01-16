'use client';

/**
 * PushSubscriptionCard Component
 *
 * UI component for managing Web Push notification subscription.
 * Displays current state and provides subscribe/unsubscribe actions.
 */

import { usePushSubscription } from '@/lib/push';
import { Button } from '@/components/ui/button';

export function PushSubscriptionCard() {
  const {
    state,
    permission,
    isSupported,
    isSubscribed,
    error,
    subscribe,
    unsubscribe,
  } = usePushSubscription();

  // Unsupported browser
  if (!isSupported) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
        <div className="flex items-start gap-3">
          <NotificationIcon className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
          <div>
            <h3 className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
              Notificaciones push
            </h3>
            <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
              Tu navegador no soporta notificaciones push.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
        <div className="flex items-start gap-3">
          <NotificationOffIcon className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
          <div>
            <h3 className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
              Notificaciones bloqueadas
            </h3>
            <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
              Has bloqueado las notificaciones. Para activarlas, debes cambiar
              los permisos en la configuración de tu navegador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
        <div className="flex items-center gap-3">
          <LoadingSpinner className="h-5 w-5 text-text-muted" />
          <span className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-text-secondary">
            Cargando...
          </span>
        </div>
      </div>
    );
  }

  // Subscribed state
  if (isSubscribed) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
        <div className="flex items-start gap-3">
          <NotificationActiveIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="flex-1">
            <h3 className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
              Notificaciones activadas
            </h3>
            <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
              Recibirás alertas de cambios en los indicadores que configures.
            </p>
            {error && (
              <p className="mt-2 text-[length:var(--text-small)] leading-[var(--leading-small)] text-error">
                {error}
              </p>
            )}
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={unsubscribe}
                className="text-[length:var(--text-label)]"
              >
                Desactivar notificaciones
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prompt or unsubscribed state - show subscribe option
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-subtle p-4">
      <div className="flex items-start gap-3">
        <NotificationIcon className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
        <div className="flex-1">
          <h3 className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] text-text">
            Notificaciones push
          </h3>
          <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
            Recibe alertas cuando los indicadores que te interesan cambien de valor.
            Podrás desactivarlas en cualquier momento.
          </p>
          {error && (
            <p className="mt-2 text-[length:var(--text-small)] leading-[var(--leading-small)] text-error">
              {error}
            </p>
          )}
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={subscribe}
              className="text-[length:var(--text-label)]"
            >
              Activar notificaciones
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationIcon({ className }: { className?: string }) {
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

function NotificationActiveIcon({ className }: { className?: string }) {
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
      />
    </svg>
  );
}

function NotificationOffIcon({ className }: { className?: string }) {
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
        d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.097M9.143 17.082a24.255 24.255 0 0 0 5.714 0M18 8.982V9a6 6 0 0 0-.225 1.593M3 3l18 18"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
