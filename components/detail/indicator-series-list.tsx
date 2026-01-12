import { SerieItem } from '@/lib/api/mindicador';
import { IndicatorSeriesItem } from './indicator-series-item';

interface IndicatorSeriesListProps {
  serie: SerieItem[];
}

export function IndicatorSeriesList({ serie }: IndicatorSeriesListProps) {
  if (serie.length === 0) {
    return (
      <p className="text-center text-zinc-500 dark:text-zinc-400">
        No hay datos históricos disponibles.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Valores recientes
      </h2>
      <div>
        {serie.map((item) => (
          <IndicatorSeriesItem
            key={item.fecha}
            fecha={item.fecha}
            valor={item.valor}
          />
        ))}
      </div>
    </div>
  );
}
