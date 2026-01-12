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
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Indicadores Económicos
        </h1>
        {error ? (
          <p className="text-center text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <IndicatorsList indicators={indicators} />
        )}
      </main>
    </div>
  );
}
