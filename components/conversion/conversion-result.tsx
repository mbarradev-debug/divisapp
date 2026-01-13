interface ConversionResultProps {
  amount: number;
  fromName: string;
  toName: string;
  result: number;
}

export function ConversionResult({
  amount,
  fromName,
  toName,
  result,
}: ConversionResultProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-subtle p-4">
      <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
        {amount.toLocaleString('es-CL')} {fromName} equivale a
      </p>
      <p className="mt-2 text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-text">
        {result.toLocaleString('es-CL', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </p>
      <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">{toName}</p>
    </div>
  );
}
