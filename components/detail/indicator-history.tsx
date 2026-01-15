'use client';

import { useState, useMemo } from 'react';
import { SerieItem } from '@/lib/api/mindicador';
import { formatValue } from '@/lib/format';
import { LineChartBase, ChartDataPoint } from '@/components/ui/line-chart-base';
import { RangeSelector } from './range-selector';
import { IndicatorSeriesList } from './indicator-series-list';
import { TrendIndicator } from './trend-indicator';
import { Tooltip } from '@/components/ui/tooltip';

type RangeOption = 7 | 30 | 90;

interface IndicatorHistoryProps {
  serie: SerieItem[];
  unidadMedida: string;
}

export function IndicatorHistory({ serie, unidadMedida }: IndicatorHistoryProps) {
  const [range, setRange] = useState<RangeOption>(7);

  // Memoize filtered history range to avoid recalculating on unrelated re-renders
  const displayedSerie = useMemo(() => serie.slice(0, range), [serie, range]);

  // Memoize chart data - depends on displayedSerie which is now stable
  const chartData: ChartDataPoint[] = useMemo(() => {
    return [...displayedSerie]
      .reverse()
      .map((item) => ({
        x: item.fecha,
        y: item.valor,
      }));
  }, [displayedSerie]);

  // Memoize min/max calculations
  const { min, max } = useMemo(() => {
    const values = displayedSerie
      .map((item) => item.valor)
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));

    return {
      min: values.length >= 2 ? Math.min(...values) : null,
      max: values.length >= 2 ? Math.max(...values) : null,
    };
  }, [displayedSerie]);

  // Memoize trend delta calculation
  const delta = useMemo(() => {
    const firstValue = displayedSerie[0]?.valor;
    const lastValue = displayedSerie[displayedSerie.length - 1]?.valor;

    if (
      typeof firstValue === 'number' &&
      typeof lastValue === 'number' &&
      !Number.isNaN(firstValue) &&
      !Number.isNaN(lastValue)
    ) {
      return firstValue - lastValue;
    }
    return null;
  }, [displayedSerie]);

  if (serie.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <RangeSelector value={range} onChange={setRange} />
      </div>
      {(min !== null && max !== null) || delta !== null ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[length:var(--text-label)] leading-[var(--leading-label)]">
          {delta !== null && <TrendIndicator delta={delta} unit={unidadMedida} />}
          {min !== null && max !== null && (
            <>
              <Tooltip content="Valor más bajo en el período">
                <span>
                  <span className="text-text-muted">Mín </span>
                  <span className="text-text-secondary">{formatValue(min, unidadMedida)}</span>
                </span>
              </Tooltip>
              <Tooltip content="Valor más alto en el período">
                <span>
                  <span className="text-text-muted">Máx </span>
                  <span className="text-text-secondary">{formatValue(max, unidadMedida)}</span>
                </span>
              </Tooltip>
            </>
          )}
        </div>
      ) : null}
      {chartData.length >= 2 && (
        <LineChartBase
          data={chartData}
          height={120}
          formatValue={(v) => formatValue(v, unidadMedida)}
          formatDate={(date) =>
            new Date(date).toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'short',
            })
          }
        />
      )}
      <IndicatorSeriesList serie={displayedSerie} unidadMedida={unidadMedida} />
    </div>
  );
}
