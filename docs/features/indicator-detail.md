# Indicator Detail Page

The indicator detail page shows historical data for a specific economic indicator. Each indicator has its own page at a dynamic URL like `/dolar`, `/euro`, or `/uf`.

## How Dynamic Routes Work

In Next.js App Router, square brackets in folder names create dynamic routes. The folder structure:

```
app/
└── [indicator]/
    └── page.tsx
```

This means:

- `/dolar` → `page.tsx` runs with `indicator = "dolar"`
- `/euro` → `page.tsx` runs with `indicator = "euro"`
- `/bitcoin` → `page.tsx` runs with `indicator = "bitcoin"`
- `/anything` → `page.tsx` runs with `indicator = "anything"`

The actual value comes from the URL, not from the code.

### Accessing the Parameter

In Next.js 16, route parameters are accessed asynchronously:

```tsx
// app/[indicator]/page.tsx
interface IndicatorPageProps {
  params: Promise<{
    indicator: string;
  }>;
}

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { indicator } = await params;
  // Now `indicator` contains the URL segment (e.g., "dolar")
}
```

**Why `Promise`?** Next.js 16 made params asynchronous to support streaming and partial rendering. The `await` ensures the parameter is available before use.

## How Indicator Detail Pages Are Generated

### The Full Page Component

```tsx
// app/[indicator]/page.tsx
import { notFound } from 'next/navigation';
import { getIndicatorByCode, MindicadorApiError } from '@/lib/api/mindicador';
import { IndicatorHeader } from '@/components/detail/indicator-header';
import { IndicatorHistory } from '@/components/detail/indicator-history';

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { indicator } = await params;

  try {
    const data = await getIndicatorByCode(indicator);

    return (
      <main>
        <IndicatorHeader
          nombre={data.nombre}
          unidadMedida={data.unidad_medida}
          serie={data.serie}
        />
        <IndicatorHistory
          serie={data.serie}
          unidadMedida={data.unidad_medida}
        />
      </main>
    );
  } catch (error) {
    if (error instanceof MindicadorApiError && error.status === 404) {
      notFound();
    }
    // Show error message for other errors
  }
}
```

### Step by Step

1. **Extract parameter**: Get the indicator code from the URL
2. **Fetch data**: Call `getIndicatorByCode(indicator)`
3. **Handle 404**: If indicator doesn't exist, show 404 page
4. **Render components**: Display header, chart, and historical series

## How Historical Data is Fetched

### The API Call

```tsx
// lib/api/mindicador.ts
export async function getIndicatorByCode(
  codigo: string
): Promise<IndicatorDetailResponse> {
  const response = await fetch(`https://mindicador.cl/api/${codigo}`, {
    next: { revalidate: 3600 }  // Cache for 1 hour
  });

  if (!response.ok) {
    throw new MindicadorApiError(
      `Failed to fetch indicator: ${codigo}`,
      response.status
    );
  }

  const data = await response.json();
  // Validation and return...
}
```

### Response Structure

```typescript
interface IndicatorDetailResponse {
  version: string;
  autor: string;
  codigo: string;           // "dolar"
  nombre: string;           // "Dólar observado"
  unidad_medida: string;    // "Pesos"
  serie: SerieItem[];       // Array of historical values
}

interface SerieItem {
  fecha: string;  // ISO 8601 date
  valor: number;  // Value on that date
}
```

The `serie` array contains up to 30+ historical values (most recent first).

## Page Components

### Component Hierarchy

```
IndicatorPage (Server)
  └─ IndicatorHeader (Server/Client)
      └─ TrendIndicator (displays current vs yesterday change)
  └─ IndicatorHistory (Client)
      ├─ RangeSelector (7/30/90 day buttons)
      ├─ LineChartBase (Recharts wrapper)
      ├─ Analytics section (min, max, delta with tooltips)
      └─ IndicatorSeriesList (table of recent values)
          └─ IndicatorSeriesItem (single row)
```

### IndicatorHeader

Displays the indicator name, unit, current value, and day-over-day change:

```tsx
// components/detail/indicator-header.tsx
export function IndicatorHeader({ nombre, unidadMedida, serie }) {
  const currentValue = serie[0]?.valor;
  const previousValue = serie[1]?.valor;
  const change = currentValue - previousValue;

  return (
    <header>
      <h1>{nombre}</h1>
      <p>Unidad: {unidadMedida}</p>
      <p className="text-2xl font-bold">
        {formatValue(currentValue, unidadMedida)}
      </p>
      <TrendIndicator delta={change} unidadMedida={unidadMedida} />
    </header>
  );
}
```

### TrendIndicator

Shows an up or down arrow with the change value:

```tsx
// components/detail/trend-indicator.tsx
export function TrendIndicator({ delta, unidadMedida }) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <div className={isPositive ? 'text-success' : 'text-error'}>
      {isPositive ? '↑ Subió' : '↓ Bajó'}
      {formatVariation(delta, unidadMedida)} vs ayer
    </div>
  );
}
```

### IndicatorHistory (Client Component)

The main interactive component that manages range selection and displays the chart:

```tsx
// components/detail/indicator-history.tsx
'use client';

export function IndicatorHistory({ serie, unidadMedida }) {
  const [range, setRange] = useState(7);  // Default to 7 days

  // Memoized calculations for performance
  const displayedSerie = useMemo(() =>
    serie.slice(0, range),
    [serie, range]
  );

  const chartData = useMemo(() =>
    [...displayedSerie].reverse().map(item => ({
      x: item.fecha,
      y: item.valor
    })),
    [displayedSerie]
  );

  const { min, max } = useMemo(() => {
    const values = displayedSerie.map(i => i.valor);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [displayedSerie]);

  const delta = useMemo(() => {
    if (displayedSerie.length < 2) return 0;
    return displayedSerie[0].valor - displayedSerie[displayedSerie.length - 1].valor;
  }, [displayedSerie]);

  return (
    <div>
      <RangeSelector
        currentRange={range}
        onRangeChange={setRange}
      />

      <LineChartBase
        data={chartData}
        xKey="x"
        yKey="y"
        unit={unidadMedida}
      />

      <div className="analytics">
        <Tooltip content="Valor más bajo en el período">
          <span>Mín: {formatValue(min, unidadMedida)}</span>
        </Tooltip>
        <Tooltip content="Valor más alto en el período">
          <span>Máx: {formatValue(max, unidadMedida)}</span>
        </Tooltip>
        <Tooltip content="Cambio desde el inicio del período">
          <span>Delta: {formatVariation(delta, unidadMedida)}</span>
        </Tooltip>
      </div>

      <IndicatorSeriesList serie={displayedSerie} />
    </div>
  );
}
```

### RangeSelector

Buttons to switch between time ranges:

```tsx
// components/detail/range-selector.tsx
'use client';

const RANGES = [
  { value: 7, label: '7 días' },
  { value: 30, label: '30 días' },
  { value: 90, label: '90 días' }
];

export function RangeSelector({ currentRange, onRangeChange }) {
  return (
    <div className="flex gap-2">
      {RANGES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onRangeChange(value)}
          className={currentRange === value ? 'active' : ''}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

### LineChartBase

A wrapper around Recharts for consistent chart styling:

```tsx
// components/ui/line-chart-base.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function LineChartBase({ data, xKey, yKey, unit }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip formatter={(value) => formatValue(value, unit)} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## How Analytics Are Derived

All analytics values (min, max, delta) are computed from the displayed series and memoized:

### Why Memoization?

```tsx
// Without memoization: recalculates on every render
const min = Math.min(...displayedSerie.map(i => i.valor));

// With memoization: only recalculates when displayedSerie changes
const min = useMemo(() =>
  Math.min(...displayedSerie.map(i => i.valor)),
  [displayedSerie]
);
```

Memoization prevents unnecessary recalculations when:
- The user hovers over the chart
- A tooltip appears
- Any other state changes that cause re-renders

### Calculation Logic

| Metric | Calculation |
|--------|-------------|
| **Min** | Smallest value in the selected range |
| **Max** | Largest value in the selected range |
| **Delta** | First value minus last value (change over period) |
| **Chart data** | Reversed series (oldest first) mapped to x/y coordinates |

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  DivisApp                           [Inicio] [Convertir]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ← Volver                                               │
│                                                         │
│  Dólar observado                                        │
│  Unidad: Pesos                                          │
│                                                         │
│  $895,23                                                │
│  ↑ Subió $1,78 vs ayer                                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [7 días]  [30 días]  [90 días]                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │             📈 Chart                             │   │
│  │                                                  │   │
│  │    ·····                                        │   │
│  │   ·     ···                                     │   │
│  │  ·         ····                                 │   │
│  │ ·                                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Mín: $891,00 ℹ️  Máx: $897,45 ℹ️  Delta: +$4,23 ℹ️    │
│                                                         │
│  Últimos valores                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 15 ene 2025                           895,23    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 14 ene 2025                           893,45    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 13 ene 2025                           891,00    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 404 Handling for Invalid Indicators

If a user visits `/invalid-indicator-code`:

1. `getIndicatorByCode('invalid-indicator-code')` is called
2. mindicador.cl returns a 404 status
3. The API client throws `MindicadorApiError` with `status: 404`
4. The page catches the error and calls `notFound()`
5. Next.js shows the `app/not-found.tsx` page

## How to Add Support for New Indicators

The application automatically supports any indicator that mindicador.cl provides. No code changes are needed to support new indicators.

### Why It Works Automatically

1. The home page fetches **all** indicators from the API
2. New indicators appear in the response
3. The detail page uses the indicator code from the URL
4. If the code exists in the API, it works

### Adding Custom Indicator Metadata

If you need to display custom information for certain indicators:

```tsx
// lib/constants/indicators.ts
export const indicatorMeta: Record<string, { icon: string; description: string }> = {
  dolar: {
    icon: '💵',
    description: 'Tipo de cambio oficial del dólar estadounidense'
  },
  euro: {
    icon: '💶',
    description: 'Tipo de cambio oficial del euro'
  },
  // ...
};

// Usage in component:
const meta = indicatorMeta[indicator.codigo];
```

## How to Modify the Detail Page

### Showing More Historical Values

Currently, the range selector determines how many values are shown. To change the options:

```tsx
// components/detail/range-selector.tsx
const RANGES = [
  { value: 7, label: '7 días' },
  { value: 30, label: '30 días' },
  { value: 90, label: '90 días' },
  { value: 180, label: '6 meses' }  // Add new option
];
```

Note: The API may not provide data beyond a certain range.

### Customizing the Chart

To change chart appearance, modify `LineChartBase`:

```tsx
<Line
  type="monotone"        // Try "linear" or "step"
  strokeWidth={2}        // Thicker or thinner line
  dot={true}            // Show dots on data points
  activeDot={{ r: 6 }}  // Larger hover dot
/>
```

### Adding New Analytics

To add a new derived value:

```tsx
// In IndicatorHistory
const average = useMemo(() => {
  const sum = displayedSerie.reduce((acc, item) => acc + item.valor, 0);
  return sum / displayedSerie.length;
}, [displayedSerie]);

// In the JSX
<Tooltip content="Promedio del período">
  <span>Prom: {formatValue(average, unidadMedida)}</span>
</Tooltip>
```

## Testing Considerations

When testing the indicator detail page:

1. **Valid indicator codes**: Page renders with correct data
2. **Invalid indicator codes**: 404 page is shown
3. **API errors**: Error message is displayed
4. **Range selector**: Changing range updates chart and analytics
5. **Chart rendering**: Chart displays correctly with data
6. **Analytics accuracy**: Min, max, delta match displayed data
7. **Tooltips**: Hovering shows explanatory text
8. **Date formatting**: Dates appear in Spanish format
9. **Number formatting**: Values use Chilean locale
10. **Navigation**: Back button returns to home
