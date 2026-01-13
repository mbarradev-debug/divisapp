interface IndicatorHeaderProps {
  nombre: string;
  unidadMedida: string;
}

export function IndicatorHeader({ nombre, unidadMedida }: IndicatorHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-text">
        {nombre}
      </h1>
      <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
        {unidadMedida}
      </p>
    </div>
  );
}
