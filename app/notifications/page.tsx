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
