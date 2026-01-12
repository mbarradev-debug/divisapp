interface IndicatorHeaderProps {
  nombre: string;
  unidadMedida: string;
}

export function IndicatorHeader({ nombre, unidadMedida }: IndicatorHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {nombre}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{unidadMedida}</p>
    </div>
  );
}
