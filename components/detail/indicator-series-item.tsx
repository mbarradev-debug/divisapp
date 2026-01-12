interface IndicatorSeriesItemProps {
  fecha: string;
  valor: number;
}

export function IndicatorSeriesItem({ fecha, valor }: IndicatorSeriesItemProps) {
  const formattedDate = new Date(fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {formattedDate}
      </span>
      <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
        {valor.toLocaleString('es-CL')}
      </span>
    </div>
  );
}
