import { SerieItem } from '@/lib/api/mindicador';
import { IndicatorSeriesItem } from './indicator-series-item';
import { Card } from '@/components/ui';

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
    <Card header="Valores recientes">
      <div className="divide-y divide-border-subtle">
        {serie.map((item) => (
          <IndicatorSeriesItem
            key={item.fecha}
            fecha={item.fecha}
            valor={item.valor}
          />
        ))}
      </div>
    </Card>
  );
}
