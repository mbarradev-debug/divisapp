import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';
import { formatValue } from '@/lib/format';
import { FavoriteButton } from '@/components/ui/favorite-button';

interface IndicatorItemProps {
  indicator: IndicatorValue;
}

export function IndicatorItem({ indicator }: IndicatorItemProps) {
  return (
    <div className="relative rounded-lg border border-border-subtle bg-bg-subtle hover:border-border hover:bg-bg-muted">
      <Link
        href={`/${indicator.codigo}`}
        className="block p-4 pr-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset rounded-lg"
      >
        <p className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
          {indicator.nombre}
        </p>
        <p className="mt-1 text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-text">
          {formatValue(indicator.valor, indicator.unidad_medida)}
        </p>
      </Link>
      <FavoriteButton
        codigo={indicator.codigo}
        nombre={indicator.nombre}
        className="absolute right-2 top-2"
      />
    </div>
  );
}
