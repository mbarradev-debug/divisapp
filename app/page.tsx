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
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
        Indicadores Económicos
      </h1>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <IndicatorsList indicators={indicators} />
      )}
    </div>
  );
}
