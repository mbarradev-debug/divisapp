# Home Page

The home page is the main entry point of DivisApp. It displays all available Chilean economic indicators with favorites prominently shown at the top.

## What the Home Page Does

When a user visits the root URL (`/`), they see:

1. A header with the application name and navigation links
2. A **Favorites section** (if any favorites exist) with drag-and-drop reorderable cards
3. A **Recently viewed section** (if any indicators were recently visited)
4. An **All Indicators section** showing remaining indicators
5. Each card displays the indicator name, current value, and unit
6. Cards are clickable and navigate to the indicator's detail page

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

This is the main orchestrator that handles favorites state, drag and drop, and splits indicators into sections.

```tsx
// components/home/home-indicators.tsx
'use client';

export function HomeIndicators({ indicators }) {
  const { favorites, reorderFavorites } = useFavorites();
  const { recents } = useRecentIndicators();

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [settledCodigo, setSettledCodigo] = useState<string | null>(null);

  // Split indicators into favorites, recents, and others
  const { favoriteIndicators, recentIndicators, otherIndicators } = useMemo(() => {
    // ... separation logic
  }, [indicators, favorites, recents]);

  return (
    <>
      {hasFavorites && (
        <section>
          <h2>Favoritos</h2>
          {favoriteIndicators.map((indicator, index) => (
            <FavoriteIndicatorItem
              key={indicator.codigo}
              indicator={indicator}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              isDragging={dragIndex === index}
              isDragOver={dragOverIndex === index && dragIndex !== index}
              isSettling={settledCodigo === indicator.codigo}
            />
          ))}
        </section>
      )}

      {hasRecents && (
        <section>
          <h2>Vistos recientemente</h2>
          {/* Recent indicators as compact chips */}
        </section>
      )}

      <section>
        <h2>Todos los indicadores</h2>
        {otherIndicators.map((indicator) => (
          <IndicatorItem key={indicator.codigo} indicator={indicator} />
        ))}
      </section>
    </>
  );
}
```

### FavoriteIndicatorItem

Displays a favorite indicator card with drag and drop support:

```tsx
// components/home/favorite-indicator-item.tsx
export function FavoriteIndicatorItem({
  indicator,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isDragging,
  isDragOver,
  isSettling,
}) {
  return (
    <div
      data-favorite-index={index}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(index)}
      onTouchStart={() => onTouchStart(index)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={/* Dynamic classes based on drag state */}
    >
      <Link href={`/${indicator.codigo}`}>
        <p>{indicator.nombre}</p>
        <p>{formatValue(indicator.valor, indicator.unidad_medida)}</p>
      </Link>

      <FavoriteButton codigo={indicator.codigo} nombre={indicator.nombre} />
    </div>
  );
}
```

### IndicatorItem

Displays a regular (non-favorite) indicator card:

```tsx
// components/home/indicator-item.tsx
export function IndicatorItem({ indicator }) {
  return (
    <div className="...">
      <Link href={`/${indicator.codigo}`}>
        <p>{indicator.nombre}</p>
        <p>{formatValue(indicator.valor, indicator.unidad_medida)}</p>
      </Link>

      <FavoriteButton codigo={indicator.codigo} nombre={indicator.nombre} />
    </div>
  );
}
```

## How Favorites Are Handled

### The useFavorites Hook

Favorites are managed by a custom hook in `lib/storage.ts`:

```tsx
const { favorites, isFavorite, toggleFavorite, reorderFavorites } = useFavorites();
```

| Function | Purpose |
|----------|---------|
| `favorites` | Array of favorite indicator codes in order |
| `isFavorite(code)` | Check if an indicator is favorited |
| `toggleFavorite(code)` | Add or remove from favorites |
| `reorderFavorites(fromIndex, toIndex)` | Move a favorite from one position to another |

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

## Drag and Drop Reordering

Favorites can be reordered using drag and drop gestures on both desktop and mobile.

### Desktop (Mouse/Pointer)

Uses the native HTML5 Drag and Drop API:

```tsx
// Start dragging
const handleDragStart = useCallback((index: number) => {
  dragIndexRef.current = index;
  setDragIndex(index);
}, []);

// Hovering over a potential drop target
const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
  e.preventDefault();
  setDragOverIndex(index);
}, []);

// Drop completed
const handleDrop = useCallback((toIndex: number) => {
  const fromIndex = dragIndexRef.current;
  if (fromIndex !== null && fromIndex !== toIndex) {
    reorderFavorites(fromIndex, toIndex);
    // Show settling animation
    setSettledCodigo(favorites[fromIndex]);
    setTimeout(() => setSettledCodigo(null), 300);
  }
  // Reset drag state
  setDragIndex(null);
  setDragOverIndex(null);
}, [reorderFavorites, favorites]);
```

### Mobile (Touch)

Uses touch events with element detection:

```tsx
// Start touch drag
const handleTouchStart = useCallback((index: number) => {
  dragIndexRef.current = index;
  setDragIndex(index);
}, []);

// Track finger position and find element under touch
const handleTouchMove = useCallback((e: React.TouchEvent) => {
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const target = element?.closest('[data-favorite-index]');
  if (target) {
    const idx = parseInt(target.getAttribute('data-favorite-index') || '', 10);
    if (!isNaN(idx) && idx !== dragIndexRef.current) {
      setDragOverIndex(idx);
    }
  }
}, []);

// Complete the reorder on touch end
const handleTouchEnd = useCallback((e: React.TouchEvent) => {
  const touch = e.changedTouches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const target = element?.closest('[data-favorite-index]');
  if (target) {
    const toIndex = parseInt(target.getAttribute('data-favorite-index') || '', 10);
    const fromIndex = dragIndexRef.current;
    if (!isNaN(toIndex) && fromIndex !== null && fromIndex !== toIndex) {
      reorderFavorites(fromIndex, toIndex);
      // Show settling animation
    }
  }
  // Reset drag state
}, [reorderFavorites, favorites]);
```

### Visual States

Each favorite card responds to drag states with CSS classes:

| State | Visual Feedback |
|-------|----------------|
| Normal | Subtle border, standard background |
| Dragging (`isDragging`) | Elevated with shadow, slight scale increase (102%), reduced opacity |
| Drop target (`isDragOver`) | Highlighted border, muted background |
| Settling (`isSettling`) | Medium shadow, emphasized border (brief animation) |
| Pressed (`active`) | Slight scale reduction (98%), shadow, prominent border |

```tsx
className={`
  ${isDragging ? 'scale-[1.02] shadow-lg border-border opacity-90' : ''}
  ${isDragOver ? 'border-primary bg-bg-muted' : ''}
  ${isSettling ? 'shadow-md border-border' : ''}
  ${/* Default styles */}
`}
```

### Touch Handling Details

The `touch-none` CSS class prevents default touch behaviors (scrolling, zooming) during drag:

```tsx
<div className="touch-none ...">
```

The `data-favorite-index` attribute enables finding the drop target during touch drag:

```tsx
<div data-favorite-index={index} ...>
```

## Visual Layout

```
+-----------------------------------------------------------+
|  DivisApp                            [Inicio] [Convertir] |
+-----------------------------------------------------------+
|                                                           |
|  Favoritos                          [Configurar alertas]  |
|                                                           |
|  +-------------------------+  +-------------------------+ |
|  | Dolar observado    [x]  |  | UF               [x]    | |
|  | 895,23                  |  | 36.789,45              | |
|  | Pesos                   |  | Pesos                   | |
|  +-------------------------+  +-------------------------+ |
|  (drag to reorder)                                        |
|                                                           |
|  Vistos recientemente                                     |
|                                                           |
|  [Euro 975,18] [Bitcoin 42.500.000]                       |
|                                                           |
|  Todos los indicadores                                    |
|                                                           |
|  +-------------------+    +-------------------+           |
|  | UTM         [+]   |    | IPC         [+]   |           |
|  | 65.182            |    | 0,2%              |           |
|  | Pesos             |    | Porcentaje        |           |
|  +-------------------+    +-------------------+           |
|                                                           |
|  ... more indicators ...                                  |
|                                                           |
+-----------------------------------------------------------+
```

## Empty State for Favorites

When no favorites are saved, the notification link appears at the top right, but no favorites section is shown:

```tsx
{!hasFavorites && (
  <div className="mb-6 flex items-center justify-end">
    {notificationLink}
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
  nombre: string;        // "Dolar observado"
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

The grid is defined in the component:

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

### Customizing Drag and Drop

To modify the reorder behavior, edit the `reorderFavorites` function in `lib/storage.ts`:

```tsx
const reorderFavorites = useCallback((fromIndex: number, toIndex: number) => {
  const current = getFavoritesSnapshot();
  if (fromIndex < 0 || fromIndex >= current.length) return;
  if (toIndex < 0 || toIndex >= current.length) return;
  if (fromIndex === toIndex) return;

  const newFavorites = [...current];
  const [removed] = newFavorites.splice(fromIndex, 1);
  newFavorites.splice(toIndex, 0, removed);
  updateFavorites(newFavorites);
}, []);
```

### Adjusting Visual Feedback

To change drag visual feedback, modify the className logic in `FavoriteIndicatorItem`:

```tsx
// Current drag styling
isDragging ? 'scale-[1.02] shadow-lg border-border opacity-90' : ''

// Example: More dramatic elevation
isDragging ? 'scale-[1.05] shadow-xl border-primary opacity-80' : ''
```

## Testing Considerations

When testing the home page:

1. **API data loads**: All indicators appear in the list
2. **Favorites persist**: Adding a favorite survives page refresh
3. **Drag and drop works**: On desktop, drag a favorite to reorder
4. **Touch drag works**: On mobile, touch and drag to reorder
5. **Visual feedback**: Dragging shows elevation, drop target highlights
6. **Settling animation**: After drop, brief visual feedback appears
7. **Empty state shows**: When no favorites, appropriate layout appears
8. **Links work**: Clicking cards navigates to detail pages
9. **Number formatting**: Values use Chilean locale
10. **Heart icons**: Toggle between filled and outline states
