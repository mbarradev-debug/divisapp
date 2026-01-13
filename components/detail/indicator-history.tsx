'use client';

import { useState } from 'react';
import { SerieItem } from '@/lib/api/mindicador';
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

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <RangeSelector value={range} onChange={setRange} />
      </div>
      <IndicatorSeriesList serie={displayedSerie} unidadMedida={unidadMedida} />
    </div>
  );
}
