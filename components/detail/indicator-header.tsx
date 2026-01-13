import { formatValue, formatVariation } from '@/lib/format';

interface IndicatorHeaderProps {
  nombre: string;
  unidadMedida: string;
  valorActual?: number;
  valorAnterior?: number;
}

export function IndicatorHeader({
  nombre,
  unidadMedida,
  valorActual,
  valorAnterior,
}: IndicatorHeaderProps) {
  const hasVariation =
    valorActual !== undefined && valorAnterior !== undefined;
  const variation = hasVariation ? valorActual - valorAnterior : null;

  const variationColorClass =
    variation === null || variation === 0
      ? 'text-text-muted'
      : variation > 0
        ? 'text-success-text'
        : 'text-error-text';

  return (
    <div className="mb-6">
      <h1 className="text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-text">
        {nombre}
      </h1>
      <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
        {unidadMedida}
      </p>
      {valorActual !== undefined && (
        <div className="mt-3">
          <p className="text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-text">
            {formatValue(valorActual, unidadMedida)}
          </p>
          {variation !== null && (
            <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)]">
              <span className={`tabular-nums ${variationColorClass}`}>
                {formatVariation(variation, unidadMedida)}
              </span>
              <span className="text-text-muted"> vs ayer</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
