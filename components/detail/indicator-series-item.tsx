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
    <div className="flex items-center justify-between border-b border-zinc-200 py-3 last:border-b-0 dark:border-zinc-800">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {formattedDate}
      </span>
      <span className="font-medium text-zinc-900 dark:text-zinc-50">
        {valor.toLocaleString('es-CL')}
      </span>
    </div>
  );
}
