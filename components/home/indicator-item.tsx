import { IndicatorValue } from '@/lib/api/mindicador';

interface IndicatorItemProps {
  indicator: IndicatorValue;
}

export function IndicatorItem({ indicator }: IndicatorItemProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {indicator.nombre}
      </span>
      <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {indicator.valor.toLocaleString('es-CL')}
      </span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500">
        {indicator.unidad_medida}
      </span>
    </div>
  );
}
