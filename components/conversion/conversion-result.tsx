import { Card } from '@/components/ui';
import { formatValue, formatAmount, isPercentageUnit } from '@/lib/format';

interface ConversionResultProps {
  amount: number;
  fromName: string;
  toName: string;
  toUnit: string;
  result: number;
}

export function ConversionResult({
  amount,
  fromName,
  toName,
  toUnit,
  result,
}: ConversionResultProps) {
  const formattedResult = formatValue(result, toUnit);
  const formattedAmount = formatAmount(amount);
  const isPercentage = isPercentageUnit(toUnit);

  return (
    <Card>
      <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
        {formattedAmount} {fromName} equivale a
      </p>
      <p className="mt-2 text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums text-text">
        {formattedResult}
      </p>
      {!isPercentage && (
        <p className="mt-1 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-muted">
          {toName}
        </p>
      )}
    </Card>
  );
}
