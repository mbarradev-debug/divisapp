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
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {amount.toLocaleString('es-CL')} {fromName} equivale a
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {result.toLocaleString('es-CL', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{toName}</p>
    </div>
  );
}
