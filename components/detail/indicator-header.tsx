interface IndicatorHeaderProps {
  nombre: string;
  unidadMedida: string;
}

export function IndicatorHeader({ nombre, unidadMedida }: IndicatorHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-zinc-900 dark:text-zinc-50">
        {nombre}
      </h1>
      <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-zinc-500 dark:text-zinc-400">
        {unidadMedida}
      </p>
    </div>
  );
}
