# Home Page

The home page is the main entry point of DivisApp. It displays all available Chilean economic indicators with favorites prominently shown at the top.

## What the Home Page Does

When a user visits the root URL (`/`), they see:

1. A header with the application name and navigation links
2. A **Favorites section** (if any favorites exist) with reorderable cards
3. An **All Indicators section** showing remaining indicators
4. Each card displays the indicator name, current value, and unit
5. Cards are clickable and navigate to the indicator's detail page

## How Indicator Data is Fetched

The home page is a Server Component, which means data fetching happens on the server before the page is sent to the browser.

### The Page Component

```tsx
// app/page.tsx
import { getAllIndicators } from '@/lib/api/mindicador';
import { HomeIndicators } from '@/components/home/home-indicators';

export default async function Home() {
  const data = await getAllIndicators();
  return <HomeIndicators indicators={data} />;
}
```

### Key Points

1. **`async function`**: The component is asynchronous, allowing `await` for data fetching
2. **`getAllIndicators()`**: Calls the mindicador.cl API
3. **Server execution**: This code runs on the server, not in the browser
4. **`HomeIndicators`**: Receives the data as a prop and handles favorites logic

### The API Call

```tsx
// lib/api/mindicador.ts
export async function getAllIndicators(): Promise<GlobalIndicatorsResponse> {
  const response = await fetch('https://mindicador.cl/api', {
    next: { revalidate: 3600 }  // Cache for 1 hour
  });
  // ...
}
```

The data is cached for 1 hour, so subsequent requests within that time are fast.

## How Components Are Structured

The home page uses components from `components/home/`:

### HomeIndicators (Client Component)

This is the main orchestrator that handles favorites state and splits indicators into sections.

```tsx
// components/home/home-indicators.tsx
'use client';

export function HomeIndicators({ indicators }) {
  const { favorites, isFavorite, toggleFavorite, moveFavorite } = useFavorites();

  // Extract indicator values from the API response
  const indicatorValues = Object.entries(indicators)
    .filter(([_, value]) => typeof value === 'object' && 'codigo' in value)
    .map(([_, value]) => value as IndicatorValue);

  // Split into favorites and non-favorites
  const favoriteIndicators = favorites
    .map(code => indicatorValues.find(i => i.codigo === code))
    .filter(Boolean);

  const otherIndicators = indicatorValues
    .filter(i => !favorites.includes(i.codigo));

  return (
    <>
      {favoriteIndicators.length > 0 && (
        <section>
          <h2>Favoritos</h2>
          {favoriteIndicators.map((indicator, index) => (
            <FavoriteIndicatorItem
              key={indicator.codigo}
              indicator={indicator}
              onToggleFavorite={() => toggleFavorite(indicator.codigo)}
              onMoveUp={() => moveFavorite(indicator.codigo, 'up')}
              onMoveDown={() => moveFavorite(indicator.codigo, 'down')}
              isFirst={index === 0}
              isLast={index === favoriteIndicators.length - 1}
            />
          ))}
        </section>
      )}

      <section>
        <h2>Todos los indicadores</h2>
        <IndicatorsList
          indicators={otherIndicators}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      </section>
    </>
  );
}
```

### FavoriteIndicatorItem

Displays a favorite indicator card with reorder controls:

```tsx
// components/home/favorite-indicator-item.tsx
export function FavoriteIndicatorItem({
  indicator,
  onToggleFavorite,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) {
  return (
    <div className="...">
      <Link href={`/${indicator.codigo}`}>
        <h3>{indicator.nombre}</h3>
        <p>{formatValue(indicator.valor)}</p>
        <p>{indicator.unidad_medida}</p>
      </Link>

      <FavoriteButton
        isFavorite={true}
        onToggle={onToggleFavorite}
      />

      <ReorderControls
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        disableUp={isFirst}
        disableDown={isLast}
      />
    </div>
  );
}
```

### IndicatorItem

Displays a regular (non-favorite) indicator card:

```tsx
// components/home/indicator-item.tsx
export function IndicatorItem({ indicator, isFavorite, onToggleFavorite }) {
  return (
    <div className="...">
      <Link href={`/${indicator.codigo}`}>
        <h3>{indicator.nombre}</h3>
        <p>{formatValue(indicator.valor)}</p>
        <p>{indicator.unidad_medida}</p>
      </Link>

      <FavoriteButton
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
      />
    </div>
  );
}
```

## How Favorites Are Handled

### The useFavorites Hook

Favorites are managed by a custom hook in `lib/storage.ts`:

```tsx
const { favorites, isFavorite, toggleFavorite, moveFavorite } = useFavorites();
```

| Function | Purpose |
|----------|---------|
| `favorites` | Array of favorite indicator codes in order |
| `isFavorite(code)` | Check if an indicator is favorited |
| `toggleFavorite(code)` | Add or remove from favorites |
| `moveFavorite(code, direction)` | Move up or down in the list |

### Storage Details

- **Key**: `divisapp_favorites`
- **Format**: JSON array of indicator codes (`["uf", "dolar", "euro"]`)
- **Persistence**: localStorage (survives page refreshes and browser restarts)

### useSyncExternalStore

The hook uses React's `useSyncExternalStore` for SSR-safe localStorage access:

```tsx
function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,           // Listen for changes
    getSnapshot,         // Get current value (browser)
    getServerSnapshot    // Get value during SSR (empty array)
  );
  // ...
}
```

This pattern ensures:
- No hydration mismatches between server and client
- Components re-render when localStorage changes
- Changes sync across browser tabs

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  DivisApp                           [Inicio] [Convertir]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Favoritos                                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [↑] [↓]  Dólar observado        895,23  [♥]     │   │
│  │          Pesos                                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [↑] [↓]  UF                     36.789,45 [♥]   │   │
│  │          Pesos                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Todos los indicadores                                  │
│                                                         │
│  ┌───────────────────┐    ┌───────────────────┐        │
│  │ Euro        [♡]   │    │ Bitcoin     [♡]   │        │
│  │ 975,18            │    │ 42.500.000        │        │
│  │ Pesos             │    │ Pesos             │        │
│  └───────────────────┘    └───────────────────┘        │
│                                                         │
│  ... more indicators ...                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Empty State for Favorites

When no favorites are saved, a helpful message appears:

```tsx
{favoriteIndicators.length === 0 && (
  <div className="text-center py-8 text-muted">
    <HeartIcon className="mx-auto mb-2" />
    <p>No tienes favoritos aún.</p>
    <p>Toca el ♡ en cualquier indicador para agregarlo.</p>
  </div>
)}
```

## How to Safely Modify the Home Page

### Adding More Information to Cards

To show additional data on each card, modify `IndicatorItem` or `FavoriteIndicatorItem`:

```tsx
// The indicator prop has these properties:
interface IndicatorValue {
  codigo: string;        // "dolar"
  nombre: string;        // "Dólar observado"
  unidad_medida: string; // "Pesos"
  fecha: string;         // "2025-01-14T..."
  valor: number;         // 895.23
}

// Example: Adding the date
<p className="text-xs text-muted">
  Actualizado: {formatDate(indicator.fecha)}
</p>
```

### Changing the Grid Layout

The grid is defined in `IndicatorsList`:

```tsx
// Current: 2 columns on tablet+
<div className="grid gap-3 sm:grid-cols-2">

// Three columns on larger screens:
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
```

### Filtering Indicators

To show only specific indicators:

```tsx
const allowedCodes = ['dolar', 'euro', 'uf', 'utm'];

const filteredIndicators = indicatorValues.filter(
  indicator => allowedCodes.includes(indicator.codigo)
);
```

### Sorting Indicators

To sort alphabetically by name:

```tsx
const sortedIndicators = [...indicatorValues].sort(
  (a, b) => a.nombre.localeCompare(b.nombre, 'es-CL')
);
```

### Customizing Reorder Behavior

To change how favorites are reordered:

```tsx
// In lib/storage.ts, modify moveFavorite:
function moveFavorite(codigo: string, direction: 'up' | 'down') {
  const currentIndex = favorites.indexOf(codigo);
  const newIndex = direction === 'up'
    ? Math.max(0, currentIndex - 1)
    : Math.min(favorites.length - 1, currentIndex + 1);

  const newFavorites = [...favorites];
  newFavorites.splice(currentIndex, 1);
  newFavorites.splice(newIndex, 0, codigo);

  saveFavorites(newFavorites);
}
```

## Testing Considerations

When testing the home page:

1. **API data loads**: All indicators appear in the list
2. **Favorites persist**: Adding a favorite survives page refresh
3. **Reorder works**: Moving favorites up/down changes order
4. **Empty state shows**: When no favorites, the message appears
5. **Links work**: Clicking cards navigates to detail pages
6. **Number formatting**: Values use Chilean locale
7. **Heart icons**: Toggle between filled and outline states
