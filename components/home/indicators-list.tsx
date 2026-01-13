import { IndicatorValue } from '@/lib/api/mindicador';
import { IndicatorItem } from './indicator-item';

interface IndicatorsListProps {
  indicators: IndicatorValue[];
}

export function IndicatorsList({ indicators }: IndicatorsListProps) {
  if (indicators.length === 0) {
    return (
      <p className="py-8 text-center text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
        No hay indicadores disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {indicators.map((indicator) => (
        <IndicatorItem key={indicator.codigo} indicator={indicator} />
      ))}
    </div>
  );
}
