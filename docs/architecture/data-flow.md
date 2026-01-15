# Data Flow

This document explains how data moves through DivisApp, from the external API to what users see on screen. Understanding this flow is crucial for debugging issues and adding new features.

## Where Does Data Come From?

All economic indicator data comes from the **mindicador.cl API**, a free public API provided by the Chilean government. The API has no authentication requirements and provides:

- Current values for economic indicators (Dollar, Euro, UF, UTM, etc.)
- Historical values for each indicator (last 30+ days)
- Metadata about each indicator (name, unit of measurement)

### API Endpoints Used

| Endpoint | Returns | Used By |
|----------|---------|---------|
| `GET https://mindicador.cl/api` | All current indicators | Home page, Conversion page |
| `GET https://mindicador.cl/api/{code}` | Single indicator with history | Detail pages |

### Example Response: All Indicators

```json
{
  "version": "1.7.0",
  "autor": "mindicador.cl",
  "fecha": "2025-01-15T12:00:00.000Z",
  "dolar": {
    "codigo": "dolar",
    "nombre": "Dólar observado",
    "unidad_medida": "Pesos",
    "fecha": "2025-01-15T12:00:00.000Z",
    "valor": 895.23
  },
  "euro": {
    "codigo": "euro",
    "nombre": "Euro",
    "unidad_medida": "Pesos",
    "fecha": "2025-01-15T12:00:00.000Z",
    "valor": 975.18
  }
  // ... more indicators
}
```

### Example Response: Single Indicator

```json
{
  "version": "1.7.0",
  "autor": "mindicador.cl",
  "codigo": "dolar",
  "nombre": "Dólar observado",
  "unidad_medida": "Pesos",
  "serie": [
    { "fecha": "2025-01-15T12:00:00.000Z", "valor": 895.23 },
    { "fecha": "2025-01-14T12:00:00.000Z", "valor": 893.45 },
    { "fecha": "2025-01-13T12:00:00.000Z", "valor": 891.00 }
    // ... up to 30+ items
  ]
}
```

## The API Client

All API calls go through `lib/api/mindicador.ts`. This file provides a clean interface between the external API and our application.

### Function: `getAllIndicators()`

```tsx
export async function getAllIndicators(): Promise<GlobalIndicatorsResponse> {
  const response = await fetch('https://mindicador.cl/api', {
    next: { revalidate: 3600 }  // Cache for 1 hour
  });

  if (!response.ok) {
    throw new MindicadorApiError('Failed to fetch indicators', response.status);
  }

  const data = await response.json();

  if (!isValidGlobalResponse(data)) {
    throw new MindicadorApiError('Invalid response format');
  }

  return data;
}
```

**What this does:**

1. Makes an HTTP GET request to the API
2. Configures caching (1 hour)
3. Checks if the response was successful (status 200-299)
4. Parses the JSON
5. Validates the response has expected fields
6. Returns typed data or throws a descriptive error

### Function: `getIndicatorByCode(code)`

```tsx
export async function getIndicatorByCode(
  codigo: string
): Promise<IndicatorDetailResponse> {
  const response = await fetch(`https://mindicador.cl/api/${codigo}`, {
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new MindicadorApiError(
      `Failed to fetch indicator: ${codigo}`,
      response.status
    );
  }

  const data = await response.json();

  if (!isValidIndicatorDetailResponse(data)) {
    throw new MindicadorApiError('Invalid indicator response format');
  }

  return data;
}
```

**What this does:**

1. Makes an HTTP GET request to `/api/{code}`
2. Same caching and error handling as above
3. Validates the detail response format
4. Returns the indicator with its historical series

## Data Flow: Home Page

Let's trace data from the API to the user's screen for the home page.

### Step 1: User Requests Page

User navigates to `/` (home page). The request reaches the Next.js server.

### Step 2: Server Component Executes

```tsx
// app/page.tsx
export default async function Home() {
  const data = await getAllIndicators();
  return <HomeIndicators indicators={data} />;
}
```

The `Home` function is `async`, so it can `await` the API call. This happens on the server.

### Step 3: API Client Fetches Data

`getAllIndicators()` makes the HTTP request to mindicador.cl. The server waits for the response.

### Step 4: Data Processing

The `HomeIndicators` component splits indicators into favorites, recents, and others:

```tsx
// components/home/home-indicators.tsx
export function HomeIndicators({ indicators }) {
  const { favorites, reorderFavorites } = useFavorites();
  const { recents } = useRecentIndicators();

  // Split into favorites, recents, and others
  const { favoriteIndicators, recentIndicators, otherIndicators } = useMemo(() => {
    const favoritesSet = new Set(favorites);
    const indicatorMap = new Map(indicators.map((ind) => [ind.codigo, ind]));
    // ... separation logic
  }, [indicators, favorites, recents]);

  // ...
}
```

### Step 5: HTML Generation

React converts the component tree into HTML on the server (for the initial render), then the Client Component hydrates in the browser.

### Step 6: Response Sent

The complete HTML is sent to the browser. Client-side React then takes over for interactivity.

### Visual Flow

```
┌─────────────────┐
│   User Browser  │
│  Requests "/"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js Server │
│                 │
│  ┌───────────┐  │
│  │ Home()    │  │
│  │  async    │  │
│  └─────┬─────┘  │
│        │        │
│        ▼        │
│  ┌───────────┐  │
│  │ getAllInd │  │
│  │ icators() │  │
│  └─────┬─────┘  │
│        │        │
└────────┼────────┘
         │
         ▼
┌─────────────────┐
│  mindicador.cl  │
│      API        │
│                 │
│  Returns JSON   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js Server │
│                 │
│  Renders HTML   │
│  with data      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   User Browser  │
│                 │
│  Receives HTML  │
│  Hydrates React │
│  useFavorites() │
│  loads from     │
│  localStorage   │
└─────────────────┘
```

## Data Flow: Detail Page with Charts

The detail page involves more data processing for charts and analytics.

### Step 1: URL Parameter Extraction

User visits `/dolar`. Next.js extracts the `indicator` parameter:

```tsx
// app/[indicator]/page.tsx
export default async function IndicatorPage({ params }) {
  const { indicator } = await params;  // indicator = "dolar"
```

### Step 2: Data Fetch with Parameter

```tsx
const data = await getIndicatorByCode(indicator);
```

The API client uses the parameter to build the URL: `https://mindicador.cl/api/dolar`

### Step 3: Component Hierarchy

```
IndicatorPage (Server)
  └─ IndicatorHeader (current value + variation)
  └─ IndicatorHistory (Client)
      ├─ RangeSelector (7/30/90 day buttons)
      ├─ LineChartBase (Recharts wrapper)
      ├─ Analytics (min, max, delta)
      └─ IndicatorSeriesList (table of values)
```

### Step 4: Derived Data Calculations

In `IndicatorHistory`, data is processed with memoization:

```tsx
// Memoize filtered history based on range
const displayedSerie = useMemo(() =>
  serie.slice(0, range),
  [serie, range]
);

// Memoize chart data
const chartData = useMemo(() => {
  return [...displayedSerie]
    .reverse()  // Oldest first for charts
    .map(item => ({ x: item.fecha, y: item.valor }));
}, [displayedSerie]);

// Memoize analytics
const { min, max } = useMemo(() => {
  const values = displayedSerie.map(i => i.valor);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}, [displayedSerie]);

// Memoize delta (period change)
const delta = useMemo(() => {
  if (displayedSerie.length < 2) return 0;
  return displayedSerie[0].valor - displayedSerie[displayedSerie.length - 1].valor;
}, [displayedSerie]);
```

**Why memoization?** Changing the range selector re-renders the component. Memoization ensures we only recalculate data when the inputs actually change, not on every render.

### Step 5: Chart Rendering

The `LineChartBase` component receives processed chart data:

```tsx
<LineChartBase
  data={chartData}
  xKey="x"
  yKey="y"
  unit={unidadMedida}
/>
```

Recharts handles the actual SVG rendering in the browser.

## Data Flow: Conversion Page

The conversion page involves both server and client data flow.

### Server Part (Initial Load)

```tsx
// app/convert/page.tsx (Server Component)
export default async function ConvertPage() {
  const data = await getAllIndicators();  // Fetch on server
  return <ConversionClient indicators={data} />;  // Pass to client
}
```

### Client Part (User Interaction)

```tsx
// app/convert/conversion-client.tsx (Client Component)
'use client';

export function ConversionClient({ indicators }) {
  const { conversion, setConversion } = usePersistedConversion();

  function handleConvert({ amount, fromIndicator, toIndicator }) {
    // Conversion happens in the browser
    const clpValue = amount * fromIndicator.valor;
    const convertedValue = clpValue / toIndicator.valor;

    setConversion({
      amount,
      fromIndicator,
      toIndicator,
      result: convertedValue
    });
  }

  return (
    <>
      <ConversionForm
        indicators={indicators}
        onConvert={handleConvert}
      />
      {conversion && <ConversionResult {...conversion} />}
    </>
  );
}
```

### Why This Split?

1. **Server Component** fetches data (no loading spinner for the user)
2. **Client Component** handles interactivity (form state, calculations)
3. Data is passed once from server to client (not re-fetched)
4. Conversion state persists to localStorage via `usePersistedConversion`

### Conversion Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     INITIAL LOAD (Server)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ConvertPage (Server)                                      │
│        │                                                    │
│        ▼                                                    │
│   getAllIndicators() ──────► mindicador.cl API              │
│        │                                                    │
│        ▼                                                    │
│   ConversionClient receives indicators as prop              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  USER INTERACTION (Browser)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User fills form:                                          │
│   - Amount: 100                                             │
│   - From: Dólar (valor: 895.23)                             │
│   - To: Euro (valor: 975.18)                                │
│        │                                                    │
│        ▼                                                    │
│   handleConvert() runs in browser:                          │
│   - clpValue = 100 * 895.23 = 89,523 CLP                    │
│   - result = 89,523 / 975.18 = 91.80 Euro                   │
│        │                                                    │
│        ▼                                                    │
│   setConversion() updates state AND localStorage            │
│   React re-renders ConversionResult                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Local Storage Data Flow

Certain data persists in the browser's localStorage.

### Favorites

```tsx
// lib/storage.ts
const FAVORITES_KEY = 'divisapp_favorites';

// Reading
const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');

// Writing
localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
```

The `useFavorites` hook uses `useSyncExternalStore` to:

1. Read initial state from localStorage on hydration
2. Update localStorage when favorites change
3. Re-render components when localStorage changes (even from other tabs)

### Conversion State

```tsx
const CONVERSION_KEY = 'divisapp_last_conversion';

// Stored data shape
{
  amount: 100,
  fromCode: 'dolar',
  toCode: 'euro',
  result: 91.80
}
```

This allows the last conversion to persist across page refreshes.

## When and Why Client Components Are Used

### When to Use Server Components (Default)

Use Server Components when:

- Fetching data from APIs or databases
- Accessing backend resources
- Keeping sensitive information on the server
- Reducing JavaScript sent to the browser

All page components in DivisApp are Server Components for these reasons.

### When to Use Client Components

Use Client Components when:

- Using React hooks (`useState`, `useEffect`, `useRef`, `useMemo`)
- Adding event listeners (`onClick`, `onChange`, `onSubmit`)
- Using browser APIs (`window`, `document`, `localStorage`)
- Using libraries that require browser environment (Recharts)

In DivisApp, Client Components are used for:

- **HomeIndicators**: Manages favorites state
- **IndicatorHistory**: Range selection, chart rendering, memoized calculations
- **ConversionClient**: Form state and calculations
- **ConversionForm**: User input handling
- **UI primitives**: Tooltips, favorite buttons, etc.

### The `'use client'` Directive

When a component needs to be a Client Component, add this at the very top:

```tsx
'use client';

import { useState, useMemo } from 'react';

export function MyInteractiveComponent() {
  const [value, setValue] = useState('');
  // ...
}
```

**Important**: All components imported by a Client Component also become Client Components. Plan your component boundaries carefully.

## Caching and Data Freshness

### How Caching Works

Every API call includes:

```tsx
fetch(url, {
  next: { revalidate: 3600 }  // 3600 seconds = 1 hour
});
```

This means:

| Time Since Last Fetch | What Happens |
|----------------------|--------------|
| < 1 hour | Cached data is used (fast) |
| >= 1 hour | Fresh data is fetched (slower, but current) |

### Cache Behavior by Page

| Page | Cache Behavior |
|------|----------------|
| Home (`/`) | Shared cache, revalidates hourly |
| Detail (`/dolar`) | Per-indicator cache, revalidates hourly |
| Convert (`/convert`) | Uses same cache as Home |

### Why 1 Hour?

Economic indicators typically update once per day (business days). One hour provides:

- Fresh enough data for most use cases
- Reduced load on the mindicador.cl API
- Faster page loads for most requests

To change this, modify the `revalidate` value in `lib/api/mindicador.ts`.

## Error States and Recovery

### Network Errors

If the API is unreachable:

```tsx
try {
  const response = await fetch(url);
} catch (error) {
  throw new MindicadorApiError('Network error', undefined, error);
}
```

The page catches this and shows an error message to the user.

### 404 Errors

If an indicator doesn't exist (e.g., `/invalid-indicator`):

```tsx
if (error instanceof MindicadorApiError && error.status === 404) {
  notFound();  // Shows the 404 page
}
```

### Invalid Data

If the API returns unexpected data:

```tsx
if (!isValidGlobalResponse(data)) {
  throw new MindicadorApiError('Invalid response format');
}
```

This protects against API changes breaking the application silently.

## Summary

1. **Data Source**: All data comes from mindicador.cl public API
2. **API Client**: `lib/api/mindicador.ts` handles all API communication
3. **Server Components**: Pages fetch data on the server before rendering
4. **Client Components**: Handle user interactions (forms, favorites, charts)
5. **Memoization**: Derived data (chart data, analytics) is memoized for performance
6. **Local Storage**: Favorites and conversion state persist in the browser
7. **Caching**: Data is cached for 1 hour to improve performance
8. **Error Handling**: Network, 404, and validation errors are all handled

The key insight is that most data fetching happens on the server, with Client Components handling interactivity and derived calculations. This architecture provides fast initial loads and a smooth user experience.
