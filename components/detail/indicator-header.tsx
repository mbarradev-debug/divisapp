interface IndicatorHeaderProps {
  nombre: string;
  unidadMedida: string;
}

export function IndicatorHeader({ nombre, unidadMedida }: IndicatorHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
        {nombre}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {unidadMedida}
      </p>
    </div>
  );
}
