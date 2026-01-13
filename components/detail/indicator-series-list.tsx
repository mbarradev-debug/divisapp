import { SerieItem } from '@/lib/api/mindicador';
import { IndicatorSeriesItem } from './indicator-series-item';

interface IndicatorSeriesListProps {
  serie: SerieItem[];
}

export function IndicatorSeriesList({ serie }: IndicatorSeriesListProps) {
  if (serie.length === 0) {
    return (
      <p className="py-8 text-center text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
        No hay datos históricos disponibles.
      </p>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-bg-subtle">
      <h2 className="border-b border-border px-4 py-3 text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
        Valores recientes
      </h2>
      <div className="divide-y divide-border-subtle">
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
