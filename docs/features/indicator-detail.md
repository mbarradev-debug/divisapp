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
import { IndicatorSeriesList } from '@/components/detail/indicator-series-list';

interface IndicatorPageProps {
  params: Promise<{
    indicator: string;
  }>;
}

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { indicator } = await params;

  try {
    const data = await getIndicatorByCode(indicator);

    return (
      <main className="container mx-auto px-4 py-8">
        <BackButton />
        <IndicatorHeader
          nombre={data.nombre}
          unidadMedida={data.unidad_medida}
        />
        <IndicatorSeriesList
          serie={data.serie.slice(0, 10)}
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
4. **Render components**: Display header and historical series

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

The `serie` array contains up to 30 historical values (most recent first).

## Page Components

### IndicatorHeader

Displays the indicator name and unit:

```tsx
// components/detail/indicator-header.tsx
interface IndicatorHeaderProps {
  nombre: string;
  unidadMedida: string;
}

export function IndicatorHeader({ nombre, unidadMedida }: IndicatorHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {nombre}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Unidad: {unidadMedida}
      </p>
    </header>
  );
}
```

### IndicatorSeriesList

Renders the list of historical values:

```tsx
// components/detail/indicator-series-list.tsx
import { SerieItem } from '@/lib/api/mindicador';
import { IndicatorSeriesItem } from './indicator-series-item';

interface IndicatorSeriesListProps {
  serie: SerieItem[];
}

export function IndicatorSeriesList({ serie }: IndicatorSeriesListProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Últimos valores
      </h2>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {serie.map((item, index) => (
          <IndicatorSeriesItem key={index} item={item} />
        ))}
      </ul>
    </div>
  );
}
```

### IndicatorSeriesItem

Displays a single historical value:

```tsx
// components/detail/indicator-series-item.tsx
import { SerieItem } from '@/lib/api/mindicador';

interface IndicatorSeriesItemProps {
  item: SerieItem;
}

export function IndicatorSeriesItem({ item }: IndicatorSeriesItemProps) {
  const formattedDate = new Date(item.fecha).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedValue = item.valor.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <li className="py-3 flex justify-between items-center">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {formattedDate}
      </span>
      <span className="font-medium text-zinc-900 dark:text-zinc-50 tabular-nums">
        {formattedValue}
      </span>
    </li>
  );
}
```

**Formatting details:**

- Dates appear as "15 ene 2024" (Spanish short month)
- Values use Chilean locale (comma as decimal separator)
- `tabular-nums` ensures aligned numbers

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
│  Últimos valores                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 15 ene 2024                           895,23    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 14 ene 2024                           893,45    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 13 ene 2024                           891,00    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ ...                                   ...       │   │
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

### The 404 Page

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        404
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        La página que buscas no existe.
      </p>
      <Link
        href="/"
        className="text-zinc-900 dark:text-zinc-50 underline hover:no-underline"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
```

## How to Add Support for New Indicators

The application automatically supports any indicator that mindicador.cl provides. No code changes are needed to support new indicators.

### Why It Works Automatically

1. The home page fetches **all** indicators from the API
2. New indicators appear in the response
3. The detail page uses the indicator code from the URL
4. If the code exists in the API, it works

### If You Need to Filter Indicators

To explicitly allow or deny certain indicators, modify the home page:

```tsx
// In components/home/indicators-list.tsx
const allowedCodes = ['dolar', 'euro', 'uf', 'utm', 'bitcoin'];

const indicatorValues = Object.entries(indicators)
  .filter(([_, value]) =>
    typeof value === 'object' &&
    'codigo' in value &&
    allowedCodes.includes((value as IndicatorValue).codigo)
  );
```

### Adding Custom Indicator Metadata

If you need to display custom information for certain indicators (like descriptions or icons), create a mapping:

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
```

Then use it in the component:

```tsx
const meta = indicatorMeta[indicator.codigo];
```

## How to Modify the Detail Page

### Showing More Historical Values

Currently, only 10 values are shown:

```tsx
<IndicatorSeriesList serie={data.serie.slice(0, 10)} />
```

To show more, change the slice:

```tsx
<IndicatorSeriesList serie={data.serie.slice(0, 30)} />  // Show all
```

Or make it configurable:

```tsx
const ITEMS_TO_SHOW = 15;
<IndicatorSeriesList serie={data.serie.slice(0, ITEMS_TO_SHOW)} />
```

### Adding a Chart

To add a visual chart:

1. Install a chart library (e.g., Chart.js, Recharts)
2. Create a new Client Component (charts need browser APIs)
3. Pass the series data to the chart component

```tsx
// components/detail/indicator-chart.tsx
'use client';

import { SerieItem } from '@/lib/api/mindicador';
// import chart library...

export function IndicatorChart({ serie }: { serie: SerieItem[] }) {
  // Reverse to show oldest first for charts
  const chartData = [...serie].reverse();

  return (
    <div className="h-64">
      {/* Chart implementation */}
    </div>
  );
}
```

### Adding Value Change Indicators

To show if the value went up or down:

```tsx
// components/detail/indicator-series-item.tsx
interface IndicatorSeriesItemProps {
  item: SerieItem;
  previousValue?: number;
}

export function IndicatorSeriesItem({ item, previousValue }: IndicatorSeriesItemProps) {
  const change = previousValue ? item.valor - previousValue : 0;
  const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  const changeColor = change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : '';

  return (
    <li className="py-3 flex justify-between items-center">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {formattedDate}
      </span>
      <span className="font-medium text-zinc-900 dark:text-zinc-50 tabular-nums">
        {formattedValue}
        <span className={`ml-2 ${changeColor}`}>{changeIcon}</span>
      </span>
    </li>
  );
}
```

## Testing Considerations

When testing the indicator detail page:

1. **Valid indicator codes**: Page renders with correct data
2. **Invalid indicator codes**: 404 page is shown
3. **API errors**: Error message is displayed
4. **Date formatting**: Dates appear in Spanish format
5. **Number formatting**: Values use Chilean locale
6. **Navigation**: Back button returns to home
7. **Series length**: Correct number of items shown
