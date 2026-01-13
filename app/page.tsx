import { getAllIndicators, IndicatorValue } from '@/lib/api/mindicador';
import { IndicatorsList } from '@/components/home/indicators-list';

export default async function Home() {
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
        Indicadores Económicos
      </h1>
      {error ? (
        <div className="rounded-lg border border-error-border bg-error-bg p-4">
          <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-error-text">{error}</p>
        </div>
      ) : (
        <IndicatorsList indicators={indicators} />
      )}
    </div>
  );
}
