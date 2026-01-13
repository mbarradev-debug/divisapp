'use client';

import { formatVariation } from '@/lib/format';

interface TrendIndicatorProps {
  delta: number;
  unit: string;
}

export function TrendIndicator({ delta, unit }: TrendIndicatorProps) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
        <span aria-hidden="true">―</span>
        <span className="tabular-nums">Sin cambio</span>
      </span>
    );
  }

  const isUp = delta > 0;
  const colorClass = isUp ? 'text-success-text' : 'text-error-text';
  const arrowLabel = isUp ? 'Subió' : 'Bajó';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[length:var(--text-label)] leading-[var(--leading-label)] ${colorClass}`}
    >
      <span aria-hidden="true">{isUp ? '↑' : '↓'}</span>
      <span className="tabular-nums">{formatVariation(delta, unit)}</span>
      <span className="sr-only">{arrowLabel}</span>
    </span>
  );
}
