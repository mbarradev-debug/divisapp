import Link from 'next/link';
import { getAllIndicators, IndicatorValue } from '@/lib/api/mindicador';
import { NotificationSettingsClient } from './notification-settings-client';

export default async function NotificationsPage() {
  let indicators: IndicatorValue[] = [];
  let error: string | null = null;

  try {
    const data = await getAllIndicators();
    indicators = Object.values(data).filter(
      (value): value is IndicatorValue =>
        typeof value === 'object' && value !== null && 'codigo' in value
    );
  } catch {
    error = 'Error al cargar los indicadores. Intente nuevamente más tarde.';
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Volver
      </Link>
      <h1 className="mb-6 text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-text">
        Configuracion de notificaciones
      </h1>
      {error ? (
        <div className="rounded-lg border border-error-border bg-error-bg p-4">
          <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-error-text">
            {error}
          </p>
        </div>
      ) : (
        <NotificationSettingsClient indicators={indicators} />
      )}
    </div>
  );
}
