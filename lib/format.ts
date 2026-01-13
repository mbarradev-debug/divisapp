const LOCALE = 'es-CL';

type FormatType = 'currency-clp' | 'currency-usd' | 'currency-eur' | 'percentage' | 'decimal';

function getFormatType(unit: string): FormatType {
  const normalizedUnit = unit.toLowerCase();

  if (normalizedUnit.includes('porcentaje')) {
    return 'percentage';
  }

  if (normalizedUnit.includes('pesos') || normalizedUnit === 'clp') {
    return 'currency-clp';
  }

  if (normalizedUnit.includes('dólar') || normalizedUnit.includes('dolar')) {
    return 'currency-usd';
  }

  if (normalizedUnit.includes('euro')) {
    return 'currency-eur';
  }

  return 'decimal';
}

export function formatValue(value: number, unit: string): string {
  const formatType = getFormatType(unit);

  switch (formatType) {
    case 'currency-clp':
      return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    case 'currency-usd':
      return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(value);

    case 'currency-eur':
      return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(value);

    case 'percentage':
      return new Intl.NumberFormat(LOCALE, {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
        signDisplay: 'auto',
      }).format(value / 100);

    case 'decimal':
    default:
      return new Intl.NumberFormat(LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(value);
  }
}

export function formatAmount(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function isPercentageUnit(unit: string): boolean {
  return unit.toLowerCase().includes('porcentaje');
}

export function formatVariation(value: number, unit: string): string {
  if (value === 0) {
    return formatValue(0, unit);
  }

  const formatted = formatValue(Math.abs(value), unit);
  const sign = value > 0 ? '+\u00A0' : '−\u00A0';

  return `${sign}${formatted}`;
}
