import { SerieItem } from '@/lib/api/mindicador';
import { IndicatorSeriesItem } from './indicator-series-item';

interface IndicatorSeriesListProps {
  serie: SerieItem[];
}

export function IndicatorSeriesList({ serie }: IndicatorSeriesListProps) {
  if (serie.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No hay datos históricos disponibles.
      </p>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
        Valores recientes
      </h2>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {serie.map((item) => (
          <IndicatorSeriesItem
            key={item.fecha}
            fecha={item.fecha}
            valor={item.valor}
          />
        ))}
      </div>
    </section>
  );
}
