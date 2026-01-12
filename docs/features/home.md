# Home Page

The home page is the main entry point of DivisApp. It displays a list of all available Chilean economic indicators with their current values.

## What the Home Page Does

When a user visits the root URL (`/`), they see:

1. A header with the application name and navigation
2. A title "Indicadores Económicos"
3. A grid of cards, each showing one economic indicator
4. Each card displays:
   - Indicator name (e.g., "Dólar observado")
   - Current value (e.g., "895,23")
   - Unit of measurement (e.g., "Pesos")
5. Cards are clickable and navigate to the indicator's detail page

## How Indicator Data is Fetched

The home page is a Server Component, which means data fetching happens on the server before the page is sent to the browser.

### The Page Component

```tsx
// app/page.tsx
import { getAllIndicators, MindicadorApiError } from '@/lib/api/mindicador';
import { IndicatorsList } from '@/components/home/indicators-list';

export default async function Home() {
  try {
    const data = await getAllIndicators();

    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
          Indicadores Económicos
        </h1>
        <IndicatorsList indicators={data} />
      </main>
    );
  } catch (error) {
    // Error handling...
  }
}
```

### Key Points

1. **`async function`**: The component is asynchronous, allowing `await` for data fetching
2. **`getAllIndicators()`**: Calls the mindicador.cl API
3. **Server execution**: This code runs on the server, not in the browser
4. **`IndicatorsList`**: Receives the data as a prop

### The API Call

```tsx
// lib/api/mindicador.ts
export async function getAllIndicators(): Promise<GlobalIndicatorsResponse> {
  const response = await fetch('https://mindicador.cl/api', {
    next: { revalidate: 3600 }  // Cache for 1 hour
  });

  if (!response.ok) {
    throw new MindicadorApiError('Failed to fetch indicators', response.status);
  }

  const data = await response.json();
  // Validation and return...
}
```

The data is cached for 1 hour, so subsequent requests within that time are fast.

## How Components Are Structured

The home page uses two components from `components/home/`:

### IndicatorsList

This component receives all indicator data and renders a grid of items.

```tsx
// components/home/indicators-list.tsx
'use client';

import { GlobalIndicatorsResponse, IndicatorValue } from '@/lib/api/mindicador';
import { IndicatorItem } from './indicator-item';

interface IndicatorsListProps {
  indicators: GlobalIndicatorsResponse;
}

export function IndicatorsList({ indicators }: IndicatorsListProps) {
  // Extract indicator values from the response object
  const indicatorValues = Object.entries(indicators)
    .filter(([key, value]) =>
      typeof value === 'object' && value !== null && 'codigo' in value
    )
    .map(([, value]) => value as IndicatorValue);

  return (
    <div className="grid grid-cols-2 gap-4">
      {indicatorValues.map(indicator => (
        <IndicatorItem key={indicator.codigo} indicator={indicator} />
      ))}
    </div>
  );
}
```

**Why is this a Client Component?**

The `'use client'` directive is used because this component could potentially need client-side interactivity. However, in its current form, it could also be a Server Component. The directive was added for future flexibility.

**What does the filtering do?**

The API response is an object with metadata fields (`version`, `autor`, `fecha`) mixed with indicator objects. The filter separates indicator objects from metadata by checking for the `codigo` property.

### IndicatorItem

This component renders a single indicator card.

```tsx
// components/home/indicator-item.tsx
import Link from 'next/link';
import { IndicatorValue } from '@/lib/api/mindicador';

interface IndicatorItemProps {
  indicator: IndicatorValue;
}

export function IndicatorItem({ indicator }: IndicatorItemProps) {
  const formattedValue = indicator.valor.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <Link
      href={`/${indicator.codigo}`}
      className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800
                 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
    >
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {indicator.nombre}
      </h2>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
        {formattedValue}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {indicator.unidad_medida}
      </p>
    </Link>
  );
}
```

**Key features:**

- **`Link`**: Next.js component for client-side navigation
- **`toLocaleString`**: Formats numbers for Chilean locale (comma as decimal separator)
- **`tabular-nums`**: CSS class that ensures numbers are evenly spaced
- **Dynamic href**: Links to `/{indicator.codigo}` (e.g., `/dolar`, `/uf`)

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  DivisApp                           [Inicio] [Convertir]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Indicadores Económicos                                 │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │ Dólar observado │    │ Euro            │            │
│  │ 895,23          │    │ 975,18          │            │
│  │ Pesos           │    │ Pesos           │            │
│  └─────────────────┘    └─────────────────┘            │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │ UF              │    │ UTM             │            │
│  │ 36.789,45       │    │ 64.343,00       │            │
│  │ Pesos           │    │ Pesos           │            │
│  └─────────────────┘    └─────────────────┘            │
│                                                         │
│  ... more indicators ...                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Error Handling

If the API call fails, the page shows an error message:

```tsx
catch (error) {
  const errorMessage = error instanceof MindicadorApiError
    ? error.message
    : 'Error al cargar los indicadores';

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20
                      border border-red-200 dark:border-red-800">
        <p className="text-red-700 dark:text-red-400">
          {errorMessage}
        </p>
      </div>
    </main>
  );
}
```

Users see a red alert box with an error message. This is better than a blank page or a generic error.

## How to Safely Modify the Home Page

### Adding More Information to Cards

To show additional data on each card:

1. Open `components/home/indicator-item.tsx`
2. The `indicator` prop has these properties:
   - `codigo`: Indicator code (e.g., "dolar")
   - `nombre`: Display name (e.g., "Dólar observado")
   - `unidad_medida`: Unit (e.g., "Pesos")
   - `fecha`: Date of the value
   - `valor`: Current numeric value

3. Add the new element to the JSX:

```tsx
// Example: Adding the date
<p className="text-xs text-zinc-400">
  Actualizado: {new Date(indicator.fecha).toLocaleDateString('es-CL')}
</p>
```

### Changing the Grid Layout

The grid is defined in `IndicatorsList`:

```tsx
<div className="grid grid-cols-2 gap-4">
```

To change to 3 columns on larger screens:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
```

### Filtering Indicators

To show only specific indicators:

```tsx
const allowedCodes = ['dolar', 'euro', 'uf', 'utm'];

const indicatorValues = Object.entries(indicators)
  .filter(([key, value]) =>
    typeof value === 'object' &&
    value !== null &&
    'codigo' in value &&
    allowedCodes.includes((value as IndicatorValue).codigo)
  )
  .map(([, value]) => value as IndicatorValue);
```

### Sorting Indicators

To sort alphabetically by name:

```tsx
const indicatorValues = Object.entries(indicators)
  .filter(/* ... */)
  .map(/* ... */)
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-CL'));
```

## Testing Considerations

The home page depends on the API client, which has its own tests. To test the home page specifically:

1. The page renders without crashing
2. All indicators from the API are displayed
3. Each card links to the correct detail page
4. Error states are displayed properly
5. Number formatting is correct (Chilean locale)

Consider adding integration tests with mock API responses if you make significant changes.
