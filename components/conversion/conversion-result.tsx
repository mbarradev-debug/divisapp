import { Card } from '@/components/ui';
import { formatValue, formatAmount, isPercentageUnit } from '@/lib/format';

interface ConversionResultProps {
  amount: number;
  fromName: string;
  toName: string;
  toUnit: string;
  result: number;
  fromValue: number;
  toValue: number;
  referenceDate: string;
}

function formatReferenceDate(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ConversionResult({
  amount,
  fromName,
  toName,
  toUnit,
  result,
  fromValue,
  toValue,
  referenceDate,
}: ConversionResultProps) {
  const formattedResult = formatValue(result, toUnit);
  const formattedAmount = formatAmount(amount);
  const isPercentage = isPercentageUnit(toUnit);
  const formattedDate = formatReferenceDate(referenceDate);

  // Build context message based on which indicators are involved
  const isCLPFrom = fromValue === 1;
  const isCLPTo = toValue === 1;

  let contextMessage = '';
  if (isCLPFrom && !isCLPTo) {
    // Converting from CLP to indicator
    contextMessage = `Valor oficial del ${toName}: ${formatValue(toValue, 'Pesos')}`;
  } else if (!isCLPFrom && isCLPTo) {
    // Converting from indicator to CLP
    contextMessage = `Valor oficial del ${fromName}: ${formatValue(fromValue, 'Pesos')}`;
  } else {
    // Converting between two non-CLP indicators
    contextMessage = `${fromName}: ${formatValue(fromValue, 'Pesos')} · ${toName}: ${formatValue(toValue, 'Pesos')}`;
  }

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
      {formattedDate && (
        <p className="mt-3 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-muted">
          {contextMessage} · {formattedDate}
        </p>
      )}
    </Card>
  );
}
