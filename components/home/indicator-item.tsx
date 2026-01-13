import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';
import { formatValue } from '@/lib/format';

interface IndicatorItemProps {
  indicator: IndicatorValue;
}

export function IndicatorItem({ indicator }: IndicatorItemProps) {
  return (
    <Link
      href={`/${indicator.codigo}`}
      className="block rounded-lg border border-border-subtle bg-bg-subtle p-4 hover:border-border hover:bg-bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset"
    >
      <p className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
        {indicator.nombre}
      </p>
      <p className="mt-1 text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-text">
        {formatValue(indicator.valor, indicator.unidad_medida)}
      </p>
    </Link>
  );
}
