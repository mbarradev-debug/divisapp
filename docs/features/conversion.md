# Conversion Feature

The conversion feature allows users to convert amounts between different Chilean economic indicators. It's available at the `/convert` URL.

## How the Conversion Feature Works

The conversion tool takes three inputs:

1. **Amount**: A number to convert
2. **From indicator**: The source currency/indicator
3. **To indicator**: The target currency/indicator

The tool then calculates the equivalent value in the target indicator.

### The Core Concept

All indicators in the mindicador.cl API express their value in Chilean Pesos (CLP). For example:

- 1 USD = 895.23 CLP
- 1 EUR = 975.18 CLP
- 1 UF = 36,789.45 CLP

To convert between any two indicators, we use CLP as the intermediate:

```
100 USD → CLP → EUR

Step 1: 100 USD × 895.23 = 89,523 CLP
Step 2: 89,523 CLP ÷ 975.18 = 91.80 EUR

Result: 100 USD = 91.80 EUR
```

## What Assumptions Are Made

### Current Values Only

The conversion uses the most recent value for each indicator, not historical values. This means:

- Conversions reflect today's rates
- Historical conversions are not supported
- Values update when the API data is refreshed (hourly cache)

### All Indicators Have CLP Equivalents

The mindicador.cl API provides all indicator values in pesos. This assumption is fundamental to the conversion logic. If an indicator didn't have a peso value, the conversion would fail.

### CLP as Virtual Indicator

Chilean Peso (CLP) is not provided by the API as an indicator (since all values are already in pesos). The application adds CLP as a "virtual" indicator with a value of 1:

```typescript
const clpIndicator: IndicatorValue = {
  codigo: 'clp',
  nombre: 'Peso Chileno',
  unidad_medida: 'Pesos',
  fecha: new Date().toISOString(),
  valor: 1
};
```

This allows users to convert from/to CLP directly.

## How Conversion Calculations Are Performed

### The Math

```typescript
function calculateConversion(
  amount: number,
  fromIndicator: IndicatorValue,
  toIndicator: IndicatorValue
): number {
  // Step 1: Convert to CLP
  const clpValue = amount * fromIndicator.valor;

  // Step 2: Convert from CLP to target
  const result = clpValue / toIndicator.valor;

  return result;
}
```

### Example Calculations

**Example 1: USD to EUR**
```
amount = 100
fromIndicator.valor = 895.23 (1 USD in CLP)
toIndicator.valor = 975.18 (1 EUR in CLP)

clpValue = 100 × 895.23 = 89,523
result = 89,523 ÷ 975.18 = 91.80
```

**Example 2: CLP to UF**
```
amount = 1000000
fromIndicator.valor = 1 (CLP has valor=1)
toIndicator.valor = 36789.45 (1 UF in CLP)

clpValue = 1000000 × 1 = 1,000,000
result = 1,000,000 ÷ 36,789.45 = 27.18
```

**Example 3: UF to CLP**
```
amount = 10
fromIndicator.valor = 36789.45
toIndicator.valor = 1 (CLP)

clpValue = 10 × 36,789.45 = 367,894.50
result = 367,894.50 ÷ 1 = 367,894.50
```

## Code Structure

The conversion feature spans multiple files:

```
app/convert/
├── page.tsx              # Server Component (fetches data)
└── conversion-client.tsx # Client Component (handles interaction)

components/conversion/
├── conversion-form.tsx   # Form inputs
└── conversion-result.tsx # Result display
```

### Server Component: `page.tsx`

```tsx
// app/convert/page.tsx
import { getAllIndicators } from '@/lib/api/mindicador';
import { ConversionClient } from './conversion-client';

export default async function ConvertPage() {
  const data = await getAllIndicators();
  return (
    <main className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6">Convertir</h1>
      <ConversionClient indicators={data} />
    </main>
  );
}
```

This component:
- Runs on the server
- Fetches all indicator data
- Passes data to the client component

### Client Component: `conversion-client.tsx`

```tsx
// app/convert/conversion-client.tsx
'use client';

import { useState } from 'react';
import { GlobalIndicatorsResponse, IndicatorValue } from '@/lib/api/mindicador';
import { ConversionForm } from '@/components/conversion/conversion-form';
import { ConversionResult } from '@/components/conversion/conversion-result';

interface ConversionClientProps {
  indicators: GlobalIndicatorsResponse;
}

interface ConversionData {
  amount: number;
  fromName: string;
  toName: string;
  result: number;
}

export function ConversionClient({ indicators }: ConversionClientProps) {
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);

  // Extract indicator values and add CLP
  const indicatorValues = extractIndicators(indicators);
  const indicatorsWithClp = [createClpIndicator(), ...indicatorValues];

  function handleConvert({
    amount,
    fromIndicator,
    toIndicator
  }: {
    amount: number;
    fromIndicator: IndicatorValue;
    toIndicator: IndicatorValue;
  }) {
    const clpValue = amount * fromIndicator.valor;
    const result = clpValue / toIndicator.valor;

    setConversionData({
      amount,
      fromName: fromIndicator.nombre,
      toName: toIndicator.nombre,
      result
    });
  }

  return (
    <div className="space-y-6">
      <ConversionForm
        indicators={indicatorsWithClp}
        onConvert={handleConvert}
      />
      {conversionData && (
        <ConversionResult {...conversionData} />
      )}
    </div>
  );
}
```

This component:
- Runs in the browser
- Manages conversion state with `useState`
- Performs the calculation when form is submitted
- Displays results

### Form Component: `conversion-form.tsx`

```tsx
// components/conversion/conversion-form.tsx
'use client';

import { useState, FormEvent } from 'react';
import { IndicatorValue } from '@/lib/api/mindicador';

interface ConversionFormProps {
  indicators: IndicatorValue[];
  onConvert: (params: {
    amount: number;
    fromIndicator: IndicatorValue;
    toIndicator: IndicatorValue;
  }) => void;
}

export function ConversionForm({ indicators, onConvert }: ConversionFormProps) {
  const [amount, setAmount] = useState('');
  const [fromCode, setFromCode] = useState('');
  const [toCode, setToCode] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const fromIndicator = indicators.find(i => i.codigo === fromCode);
    const toIndicator = indicators.find(i => i.codigo === toCode);

    if (!fromIndicator || !toIndicator) return;
    if (fromCode === toCode) return;

    onConvert({
      amount: numAmount,
      fromIndicator,
      toIndicator
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount input */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Cantidad
        </label>
        <input
          type="number"
          id="amount"
          min="0"
          step="any"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="mt-1 w-full rounded-md border ..."
        />
      </div>

      {/* From dropdown */}
      <div>
        <label htmlFor="from" className="block text-sm font-medium">
          De
        </label>
        <select
          id="from"
          value={fromCode}
          onChange={e => setFromCode(e.target.value)}
          className="mt-1 w-full rounded-md border ..."
        >
          <option value="">Seleccionar...</option>
          {indicators.map(ind => (
            <option key={ind.codigo} value={ind.codigo}>
              {ind.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* To dropdown */}
      <div>
        <label htmlFor="to" className="block text-sm font-medium">
          A
        </label>
        <select
          id="to"
          value={toCode}
          onChange={e => setToCode(e.target.value)}
          className="mt-1 w-full rounded-md border ..."
        >
          <option value="">Seleccionar...</option>
          {indicators.map(ind => (
            <option key={ind.codigo} value={ind.codigo}>
              {ind.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 rounded-md bg-zinc-900 text-white ..."
      >
        Convertir
      </button>
    </form>
  );
}
```

### Result Component: `conversion-result.tsx`

```tsx
// components/conversion/conversion-result.tsx
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
  result
}: ConversionResultProps) {
  const formattedAmount = amount.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formattedResult = result.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });

  return (
    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border ...">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {formattedAmount} {fromName} =
      </p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {formattedResult} {toName}
      </p>
    </div>
  );
}
```

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  DivisApp                           [Inicio] [Convertir]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ← Volver                                               │
│                                                         │
│  Convertir                                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Cantidad                                         │   │
│  │ [100                                        ]    │   │
│  │                                                  │   │
│  │ De                                               │   │
│  │ [Dólar observado                         ▼]     │   │
│  │                                                  │   │
│  │ A                                                │   │
│  │ [Euro                                    ▼]     │   │
│  │                                                  │   │
│  │ [          Convertir                      ]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 100,00 Dólar observado =                        │   │
│  │ 91,80 Euro                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Validation Rules

The form validates inputs before performing conversions:

| Validation | Message/Behavior |
|------------|------------------|
| Amount is empty | Form doesn't submit |
| Amount is 0 or negative | Form doesn't submit |
| From not selected | Form doesn't submit |
| To not selected | Form doesn't submit |
| From equals To | Form doesn't submit |
| Division by zero | Protected (indicators always have values > 0) |

## How to Extend or Modify Conversion Logic

### Adding a Fee or Spread

To add a conversion fee:

```tsx
function handleConvert({ amount, fromIndicator, toIndicator }) {
  const FEE_PERCENTAGE = 0.01; // 1% fee

  const clpValue = amount * fromIndicator.valor;
  const rawResult = clpValue / toIndicator.valor;
  const result = rawResult * (1 - FEE_PERCENTAGE);

  setConversionData({
    amount,
    fromName: fromIndicator.nombre,
    toName: toIndicator.nombre,
    result,
    fee: rawResult * FEE_PERCENTAGE  // Add fee to display
  });
}
```

### Supporting Historical Conversions

To convert using a specific date's values:

1. Add a date picker to the form
2. Create a new API function to fetch historical rates
3. Use historical values in the calculation

```tsx
// New API function needed
async function getIndicatorByDate(codigo: string, date: string) {
  // Implementation depends on mindicador.cl API support
}
```

### Adding More Indicators

The form automatically includes all indicators from the API plus CLP. To add custom indicators:

```tsx
const customIndicators: IndicatorValue[] = [
  {
    codigo: 'custom',
    nombre: 'Custom Currency',
    unidad_medida: 'Pesos',
    fecha: new Date().toISOString(),
    valor: 123.45  // Value in CLP
  }
];

const allIndicators = [
  ...indicatorsWithClp,
  ...customIndicators
];
```

### Showing Exchange Rate

To display the exchange rate alongside the result:

```tsx
function handleConvert({ amount, fromIndicator, toIndicator }) {
  const clpValue = amount * fromIndicator.valor;
  const result = clpValue / toIndicator.valor;
  const exchangeRate = fromIndicator.valor / toIndicator.valor;

  setConversionData({
    amount,
    fromName: fromIndicator.nombre,
    toName: toIndicator.nombre,
    result,
    exchangeRate  // 1 FROM = X TO
  });
}
```

### Swap Button

To add a button that swaps the from/to indicators:

```tsx
// In ConversionForm
function handleSwap() {
  const temp = fromCode;
  setFromCode(toCode);
  setToCode(temp);
}

// In the JSX
<button type="button" onClick={handleSwap} className="...">
  ↔ Intercambiar
</button>
```

## Testing Considerations

When testing the conversion feature:

1. **Basic conversion**: USD to EUR produces correct result
2. **CLP conversion**: CLP to USD and USD to CLP work correctly
3. **Same indicator**: Cannot convert USD to USD
4. **Zero amount**: Form doesn't submit
5. **Negative amount**: Form doesn't submit
6. **Empty selections**: Form doesn't submit
7. **Number formatting**: Results use Chilean locale
8. **Large numbers**: No overflow or precision issues
9. **Small numbers**: Decimal precision is preserved
