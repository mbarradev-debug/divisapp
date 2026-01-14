# Conversion Feature

The conversion feature allows users to convert amounts between different Chilean economic indicators. It's available at the `/convert` URL and supports smart defaults, real-time calculation, and persistent state.

## How the Conversion Feature Works

The conversion tool takes three inputs:

1. **Amount**: A number to convert
2. **From indicator**: The source currency/indicator
3. **To indicator**: The target currency/indicator

The tool calculates the equivalent value in real time as you type, and the result persists across page visits.

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
const CLP_INDICATOR: IndicatorValue = {
  codigo: 'clp',
  nombre: 'Peso Chileno',
  unidad_medida: 'Pesos',
  fecha: '',
  valor: 1  // Always 1
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

## How Contextual Entry Works

The conversion page supports URL query parameters to pre-fill the form:

### URL Format

```
/convert?from=dolar
/convert?from=uf&to=clp
```

### Implementation

```tsx
// In ConversionForm
const searchParams = useSearchParams();

useEffect(() => {
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  if (fromParam) {
    setFromCode(fromParam);
    // Set opposite currency as smart default
    if (!toParam) {
      setToCode(fromParam === 'clp' ? 'uf' : 'clp');
    }
  }
  if (toParam) {
    setToCode(toParam);
  }
}, [searchParams]);
```

### Use Cases

1. **From indicator detail page**: Link says "Convertir" → goes to `/convert?from=dolar`
2. **From home page**: Quick conversion link for each indicator
3. **Direct linking**: Share a conversion URL with someone

## How Real-Time Recalculation Is Handled

The form updates the result as you type, without requiring a "Convert" button click.

### Implementation

```tsx
// In ConversionForm
useEffect(() => {
  performConversion();
}, [amount, fromCode, toCode]);

const performConversion = useCallback(() => {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) return;
  if (fromCode === toCode) return;
  if (!fromCode || !toCode) return;

  const fromIndicator = indicators.find(i => i.codigo === fromCode);
  const toIndicator = indicators.find(i => i.codigo === toCode);

  if (!fromIndicator || !toIndicator) return;

  const clpValue = parsedAmount * fromIndicator.valor;
  const result = clpValue / toIndicator.valor;

  onConvert({
    amount: parsedAmount,
    fromIndicator,
    toIndicator,
    result
  });
}, [amount, fromCode, toCode, indicators, onConvert]);
```

### Why useCallback?

The `useCallback` hook ensures the function reference stays stable unless its dependencies change. This prevents unnecessary effect re-runs.

## How Atomic Swap Works

The swap button exchanges the "from" and "to" indicators instantly.

### Implementation

```tsx
// In ConversionForm
function handleSwap() {
  const temp = fromCode;
  setFromCode(toCode);
  setToCode(temp);
}

// In the JSX
<button type="button" onClick={handleSwap} aria-label="Intercambiar">
  ↔
</button>
```

### Behavior

- Click swaps from ↔ to
- Amount stays the same
- Result recalculates automatically (via useEffect)
- Persisted state updates accordingly

## Code Structure

The conversion feature spans multiple files:

```
app/convert/
├── page.tsx              # Server Component (fetches data)
└── conversion-client.tsx # Client Component (orchestrates interaction)

components/conversion/
├── conversion-form.tsx   # Form inputs with swap and real-time calculation
└── conversion-result.tsx # Result display card
```

### Server Component: `page.tsx`

```tsx
// app/convert/page.tsx
import { getAllIndicators } from '@/lib/api/mindicador';
import { ConversionClient } from './conversion-client';

export default async function ConvertPage() {
  const data = await getAllIndicators();
  return (
    <main>
      <h1>Convertir</h1>
      <ConversionClient indicators={data} />
    </main>
  );
}
```

### Client Component: `conversion-client.tsx`

```tsx
// app/convert/conversion-client.tsx
'use client';

export function ConversionClient({ indicators }) {
  const { conversion, setConversion, swapCodes } = usePersistedConversion();

  // Add CLP as virtual indicator
  const allIndicators = [CLP_INDICATOR, ...extractIndicators(indicators)];

  return (
    <div>
      <ConversionForm
        indicators={allIndicators}
        initialFromCode={conversion?.fromCode}
        initialToCode={conversion?.toCode}
        onConvert={setConversion}
        onSwap={swapCodes}
      />
      {conversion && (
        <ConversionResult
          amount={conversion.amount}
          fromName={conversion.fromIndicator.nombre}
          toName={conversion.toIndicator.nombre}
          result={conversion.result}
        />
      )}
    </div>
  );
}
```

### Form Component: `conversion-form.tsx`

```tsx
// components/conversion/conversion-form.tsx
'use client';

export function ConversionForm({
  indicators,
  initialFromCode,
  initialToCode,
  onConvert,
  onSwap
}) {
  const [amount, setAmount] = useState('');
  const [fromCode, setFromCode] = useState(initialFromCode || 'uf');
  const [toCode, setToCode] = useState(initialToCode || 'clp');

  // Real-time calculation effect
  useEffect(() => {
    performConversion();
  }, [amount, fromCode, toCode]);

  function handleSwap() {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
    onSwap?.();
  }

  return (
    <form>
      <Input
        label="Cantidad"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <Select
        label="De"
        value={fromCode}
        onChange={e => setFromCode(e.target.value)}
        options={indicators}
      />

      <button type="button" onClick={handleSwap}>↔</button>

      <Select
        label="A"
        value={toCode}
        onChange={e => setToCode(e.target.value)}
        options={indicators}
      />
    </form>
  );
}
```

### Result Component: `conversion-result.tsx`

```tsx
// components/conversion/conversion-result.tsx
export function ConversionResult({ amount, fromName, toName, result }) {
  return (
    <div className="result-card">
      <p>{formatValue(amount)} {fromName} equivale a</p>
      <p className="text-2xl font-bold">{formatValue(result)}</p>
      <p>{toName}</p>
    </div>
  );
}
```

## State Persistence

Conversion state is persisted to localStorage using `usePersistedConversion`:

```tsx
// lib/storage.ts
const CONVERSION_KEY = 'divisapp_last_conversion';

export function usePersistedConversion() {
  const conversion = useSyncExternalStore(
    subscribe,
    getConversionSnapshot,
    getServerConversionSnapshot
  );

  function setConversion(data) {
    localStorage.setItem(CONVERSION_KEY, JSON.stringify(data));
    notifyListeners();
  }

  function swapCodes() {
    if (conversion) {
      setConversion({
        ...conversion,
        fromCode: conversion.toCode,
        toCode: conversion.fromCode
      });
    }
  }

  return { conversion, setConversion, swapCodes };
}
```

### What's Persisted

```typescript
{
  amount: number;
  fromCode: string;
  toCode: string;
  fromIndicator: IndicatorValue;
  toIndicator: IndicatorValue;
  result: number;
}
```

### Benefits

- Returning to the page restores your last conversion
- The result is immediately visible without re-entering data
- State survives page refreshes and browser restarts

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
│  │              [↔ Intercambiar]                    │   │
│  │                                                  │   │
│  │ A                                                │   │
│  │ [Euro                                    ▼]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 100,00 Dólar observado equivale a               │   │
│  │ 91,80                                           │   │
│  │ Euro                                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Validation Rules

The form validates inputs and only shows results when valid:

| Validation | Behavior |
|------------|----------|
| Amount is empty | No result shown |
| Amount is 0 or negative | No result shown |
| From not selected | No result shown |
| To not selected | No result shown |
| From equals To | No result shown |
| Valid inputs | Result updates in real time |

## How to Extend or Modify Conversion Logic

### Adding a Fee or Spread

To add a conversion fee:

```tsx
const FEE_PERCENTAGE = 0.01; // 1% fee

const clpValue = amount * fromIndicator.valor;
const rawResult = clpValue / toIndicator.valor;
const result = rawResult * (1 - FEE_PERCENTAGE);

// Optionally show the fee
const fee = rawResult * FEE_PERCENTAGE;
```

### Adding More Synthetic Indicators

To add custom indicators that aren't from the API:

```tsx
const CUSTOM_INDICATORS: IndicatorValue[] = [
  {
    codigo: 'custom',
    nombre: 'Custom Currency',
    unidad_medida: 'Pesos',
    fecha: '',
    valor: 123.45  // Value in CLP
  }
];

const allIndicators = [
  CLP_INDICATOR,
  ...extractIndicators(apiResponse),
  ...CUSTOM_INDICATORS
];
```

### Showing Exchange Rate

To display the exchange rate alongside the result:

```tsx
const exchangeRate = fromIndicator.valor / toIndicator.valor;

// In the result display
<p>Tipo de cambio: 1 {fromIndicator.nombre} = {formatValue(exchangeRate)} {toIndicator.nombre}</p>
```

## Testing Considerations

When testing the conversion feature:

1. **Basic conversion**: USD to EUR produces correct result
2. **CLP conversion**: CLP to USD and USD to CLP work correctly
3. **Same indicator**: Cannot convert USD to USD (no result shown)
4. **Zero amount**: No result shown
5. **Negative amount**: No result shown
6. **Empty selections**: No result shown
7. **Real-time update**: Typing updates result immediately
8. **Swap button**: Exchanges from/to correctly
9. **Persistence**: Refreshing page restores last conversion
10. **URL parameters**: `/convert?from=dolar` pre-fills form
11. **Number formatting**: Results use Chilean locale
12. **Large numbers**: No overflow or precision issues
13. **Small numbers**: Decimal precision is preserved
