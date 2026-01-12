# Data Flow

This document explains how data moves through DivisApp, from the external API to what users see on screen. Understanding this flow is crucial for debugging issues and adding new features.

## Where Does Data Come From?

All economic indicator data comes from the **mindicador.cl API**, a free public API provided by the Chilean government. The API has no authentication requirements and provides:

- Current values for economic indicators (Dollar, Euro, UF, UTM, etc.)
- Historical values for each indicator (last 30 days)
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
  "fecha": "2024-01-15T12:00:00.000Z",
  "dolar": {
    "codigo": "dolar",
    "nombre": "Dólar observado",
    "unidad_medida": "Pesos",
    "fecha": "2024-01-15T12:00:00.000Z",
    "valor": 895.23
  },
  "euro": {
    "codigo": "euro",
    "nombre": "Euro",
    "unidad_medida": "Pesos",
    "fecha": "2024-01-15T12:00:00.000Z",
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
    { "fecha": "2024-01-15T12:00:00.000Z", "valor": 895.23 },
    { "fecha": "2024-01-14T12:00:00.000Z", "valor": 893.45 },
    { "fecha": "2024-01-13T12:00:00.000Z", "valor": 891.00 }
    // ... up to 30 items
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
  try {
    const data = await getAllIndicators();
    return <IndicatorsList indicators={data} />;
  } catch (error) {
    return <ErrorMessage error={error} />;
  }
}
```

The `Home` function is `async`, so it can `await` the API call. This happens on the server.

### Step 3: API Client Fetches Data

`getAllIndicators()` makes the HTTP request to mindicador.cl. The server waits for the response.

### Step 4: Data Processing

The API response is validated and typed. The raw response becomes a TypeScript object:

```tsx
const data: GlobalIndicatorsResponse = {
  version: "1.7.0",
  autor: "mindicador.cl",
  fecha: "2024-01-15T...",
  dolar: { codigo: "dolar", nombre: "Dólar observado", ... },
  euro: { codigo: "euro", nombre: "Euro", ... },
  // ...
}
```

### Step 5: Component Receives Data

The `IndicatorsList` component receives the typed data as a prop:

```tsx
// components/home/indicators-list.tsx
export function IndicatorsList({ indicators }) {
  // Extract indicator values from the response
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

### Step 6: HTML Generation

React converts the component tree into HTML on the server:

```html
<div class="grid grid-cols-2 gap-4">
  <a href="/dolar" class="...">
    <h2>Dólar observado</h2>
    <p>895,23</p>
    <p>Pesos</p>
  </a>
  <a href="/euro" class="...">
    <h2>Euro</h2>
    <p>975,18</p>
    <p>Pesos</p>
  </a>
  <!-- more indicators -->
</div>
```

### Step 7: Response Sent

The complete HTML (including layout, header, etc.) is sent to the browser. The user sees the page immediately with all data already rendered.

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
│  Shows page     │
└─────────────────┘
```

## Data Flow: Detail Page

The detail page flow is similar but with a dynamic parameter.

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

### Step 3: Historical Series Processing

The response includes a `serie` array with historical values. The page shows the last 10:

```tsx
const recentSeries = data.serie.slice(0, 10);
```

### Step 4: Date Formatting

Each date is formatted for display in Spanish locale:

```tsx
const formattedDate = new Date(item.fecha).toLocaleDateString('es-CL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
// Result: "15 ene 2024"
```

## Data Flow: Conversion Page

The conversion page is more complex because it involves user interaction.

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
  const [result, setResult] = useState(null);

  function handleConvert({ amount, fromIndicator, toIndicator }) {
    // Conversion happens in the browser
    const clpValue = amount * fromIndicator.valor;
    const convertedValue = clpValue / toIndicator.valor;
    setResult(convertedValue);
  }

  return (
    <>
      <ConversionForm indicators={indicators} onConvert={handleConvert} />
      {result && <ConversionResult result={result} />}
    </>
  );
}
```

### Why This Split?

1. **Server Component** fetches data (no loading spinner for the user)
2. **Client Component** handles interactivity (form state, calculations)
3. Data is passed once from server to client (not re-fetched)

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
│   setResult(91.80) updates state                            │
│   React re-renders ConversionResult                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

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

- Using React hooks (`useState`, `useEffect`, `useRef`)
- Adding event listeners (`onClick`, `onChange`, `onSubmit`)
- Using browser APIs (`window`, `document`, `localStorage`)
- Using libraries that require browser environment

In DivisApp, Client Components are used for:

- **ConversionClient**: Manages form state and calculates results
- **ConversionForm**: Handles user input with `useState`

### The `'use client'` Directive

When a component needs to be a Client Component, add this at the very top:

```tsx
'use client';

import { useState } from 'react';

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
4. **Client Components**: Handle user interactions (forms, state)
5. **Caching**: Data is cached for 1 hour to improve performance
6. **Error Handling**: Network, 404, and validation errors are all handled

The key insight is that most data fetching happens on the server, and only interactive features require client-side code. This architecture provides fast initial loads and a smooth user experience.
