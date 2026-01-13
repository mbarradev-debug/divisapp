'use client';

import { useState } from 'react';
import { SerieItem } from '@/lib/api/mindicador';
import { formatValue } from '@/lib/format';
import { RangeSelector } from './range-selector';
import { IndicatorSeriesList } from './indicator-series-list';

type RangeOption = 7 | 30;

interface IndicatorHistoryProps {
  serie: SerieItem[];
  unidadMedida: string;
}

export function IndicatorHistory({ serie, unidadMedida }: IndicatorHistoryProps) {
  const [range, setRange] = useState<RangeOption>(7);

  if (serie.length === 0) {
    return null;
  }

  const displayedSerie = serie.slice(0, range);

  const values = displayedSerie
    .map((item) => item.valor)
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));

  const min = values.length >= 2 ? Math.min(...values) : null;
  const max = values.length >= 2 ? Math.max(...values) : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <RangeSelector value={range} onChange={setRange} />
      </div>
      {min !== null && max !== null && (
        <div className="flex gap-6 text-[length:var(--text-label)] leading-[var(--leading-label)]">
          <div>
            <span className="text-text-muted">Mín </span>
            <span className="text-text-secondary">{formatValue(min, unidadMedida)}</span>
          </div>
          <div>
            <span className="text-text-muted">Máx </span>
            <span className="text-text-secondary">{formatValue(max, unidadMedida)}</span>
          </div>
        </div>
      )}
      <IndicatorSeriesList serie={displayedSerie} unidadMedida={unidadMedida} />
    </div>
  );
}
