import { formatValue } from '@/lib/format';

interface IndicatorSeriesItemProps {
  fecha: string;
  valor: number;
  unit: string;
}

export function IndicatorSeriesItem({ fecha, valor, unit }: IndicatorSeriesItemProps) {
  const formattedDate = new Date(fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
        {formattedDate}
      </span>
      <span className="text-[length:var(--text-body)] font-medium leading-[var(--leading-body)] tabular-nums text-text">
        {formatValue(valor, unit)}
      </span>
    </div>
  );
}
