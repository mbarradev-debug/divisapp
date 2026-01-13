import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';

interface IndicatorItemProps {
  indicator: IndicatorValue;
}

export function IndicatorItem({ indicator }: IndicatorItemProps) {
  return (
    <Link
      href={`/${indicator.codigo}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 dark:focus-visible:ring-offset-zinc-950"
    >
      <p className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-zinc-900 dark:text-zinc-100">
        {indicator.nombre}
      </p>
      <p className="mt-1 text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-zinc-900 dark:text-zinc-50">
        {indicator.valor.toLocaleString('es-CL')}
      </p>
      <p className="mt-0.5 text-[length:var(--text-small)] leading-[var(--leading-small)] text-zinc-500 dark:text-zinc-400">
        {indicator.unidad_medida}
      </p>
    </Link>
  );
}
