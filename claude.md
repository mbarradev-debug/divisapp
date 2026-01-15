# claude.md

> **Location:** Repository root (`/claude.md`)
> **Purpose:** Single, authoritative, and sufficient source of truth for DivisApp
> **Usage:** Every LLM must assume this context is complete before any intervention

---

## CRITICAL CONTEXT RULES

1. **This file is the single source of truth** - All information needed to understand and work on DivisApp is contained here
2. **Exploring the codebase is forbidden** unless explicitly requested by the user
3. **All future work must assume this context is complete** - Do not run discovery commands, inspect folders, or "understand the project first"
4. **Technical and product decisions can be made from this file alone** - No code inspection required

---

## What is DivisApp

Frontend-only web application that displays and converts Chilean economic indicators using the public mindicador.cl API.

### It IS

- Viewer for Chilean economic indicators (UF, dollar, euro, UTM, IPC, etc.)
- Currency/unit converter between indicators
- Static application with no backend or authentication
- Simple, fast, and functional tool for Chilean users

### It is NOT

- Transactional financial system
- Platform with users, sessions, or accounts
- Backend or custom API
- Complex enterprise dashboard
- Multi-country or multi-currency system beyond Chile

---

## Non-negotiable principles

1. **Simplicity over flexibility** - Less code, fewer abstractions
2. **No over-engineering** - Don't add features, validations, or configurations not explicitly requested
3. **Local-first** - State persists in localStorage only, no backend
4. **Server Components by default** - Client Components only when interactivity is required
5. **Visual consistency** - Use semantic tokens exclusively, never hardcoded values
6. **No unnecessary dependencies** - Prefer native solutions over libraries
7. **Minimal changes** - Only modify what's explicitly requested

---

## Technology stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript (strict mode) | 5.x |
| UI | React | 19.x |
| Styles | Tailwind CSS with CSS tokens | 4.x |
| Charts | Recharts | 3.x |
| Testing | Vitest | 4.x |
| Linting | ESLint | 9.x |
| Fonts | Geist Sans, Geist Mono | — |

---

## Rendering model

| Type | When to use |
|------|-------------|
| Server Components | Pages, layouts, data fetching, static content |
| Client Components | Forms, interactive state, localStorage, browser APIs |

**Rule:** Add `'use client'` directive only when using hooks (useState, useEffect, custom hooks), event handlers, or browser APIs (localStorage, window).

---

## Project structure

```
divisapp/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (header, fonts)
│   ├── page.tsx                  # Home page (/)
│   ├── not-found.tsx             # 404 page
│   ├── globals.css               # Design tokens and base styles
│   ├── convert/
│   │   ├── page.tsx              # Conversion page (Server Component)
│   │   └── convert-client.tsx    # Conversion form (Client Component)
│   └── [indicator]/
│       └── page.tsx              # Indicator detail page
├── components/
│   ├── home/                     # Home page components
│   │   ├── home-indicators.tsx   # Main indicators list
│   │   ├── indicator-item.tsx    # Individual indicator card
│   │   └── favorite-indicator-item.tsx
│   ├── detail/                   # Detail page components
│   │   ├── indicator-header.tsx  # Name, value, variation
│   │   ├── indicator-history.tsx # Chart, range selector, analytics
│   │   ├── indicator-series-list.tsx
│   │   ├── indicator-series-item.tsx
│   │   ├── range-selector.tsx    # 7/30/90 day toggle
│   │   └── trend-indicator.tsx   # Delta with color coding
│   ├── conversion/               # Conversion components
│   │   ├── conversion-form.tsx   # From/to selectors, amount input
│   │   └── conversion-result.tsx # Calculated result display
│   ├── navigation/
│   │   └── convert-link.tsx      # Contextual link with params
│   └── ui/                       # Reusable UI primitives
│       ├── button.tsx            # Primary/secondary variants
│       ├── input.tsx             # Text/number with label
│       ├── select.tsx            # Dropdown selector
│       ├── card.tsx              # Container with borders
│       ├── favorite-button.tsx   # Heart toggle
│       ├── line-chart-base.tsx   # Recharts wrapper
│       ├── tooltip.tsx           # Hover tooltips
│       └── index.ts              # Barrel exports
├── lib/
│   ├── api/
│   │   ├── mindicador.ts         # API client functions
│   │   └── __tests__/
│   │       └── mindicador.test.ts
│   ├── format.ts                 # Number/date formatting
│   ├── storage.ts                # localStorage hooks
│   └── __tests__/
│       └── storage.test.ts
├── docs/                         # Internal documentation
├── public/                       # Static assets
└── [config files]                # package.json, tsconfig.json, etc.
```

---

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home - All indicators with favorites section on top |
| `/convert` | `app/convert/page.tsx` | Converter between indicators (supports query params) |
| `/[indicator]` | `app/[indicator]/page.tsx` | Indicator detail with history, chart, analytics |

**Valid indicator codes:**
`uf`, `ivp`, `dolar`, `dolar_intercambio`, `euro`, `ipc`, `utm`, `imacec`, `tpm`, `libra_cobre`, `tasa_desempleo`, `bitcoin`

**Query parameter support:**
- `/convert?from=dolar` - Pre-fills the "from" indicator
- `/convert?from=uf&to=clp` - Pre-fills both indicators

---

## Data source

**API:** `https://mindicador.cl/api`

| Endpoint | Returns |
|----------|---------|
| `GET /api` | All current indicator values |
| `GET /api/{code}` | Specific indicator with historical series |

**API client location:** `lib/api/mindicador.ts`

**Functions:**
- `getAllIndicators()` → `IndicatorValue[]`
- `getIndicatorByCode(codigo)` → `IndicatorDetailResponse`

**Fetch configuration:**
```typescript
fetch(url, { next: { revalidate: 3600 } }) // 1-hour cache
```

**Constraints:**
- Public API, no authentication required
- Chile data only
- All indicator values expressed in CLP (Chilean Peso)
- No rate limiting documented

**Response types:**
```typescript
interface IndicatorValue {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

interface SerieItem {
  fecha: string;
  valor: number;
}

interface IndicatorDetailResponse {
  version: string;
  autor: string;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: SerieItem[];
}
```

---

## Formatting and localization

**Locale:** `es-CL` (Chilean Spanish)

| Type | Format | Example |
|------|--------|---------|
| CLP currency | 2 decimals, thousand separators | `$36.123,45` |
| USD/EUR | 4 decimals | `36.123,4500` |
| Percentage | 2-4 decimals with % | `3,45%` |
| Variation | Signed value | `+$123,45` or `−$123,45` |

**Functions in `lib/format.ts`:**
- `formatValue(value, unit)` - Context-aware formatting based on unit
- `formatAmount(value)` - Simple number formatting
- `formatVariation(value, unit)` - With +/− sign
- `isPercentageUnit(unit)` - Unit type detection

**Unit detection rules:**
- Contains "porcentaje" → percentage format
- Contains "pesos" or "clp" → CLP currency
- Contains "dólar" or "dolar" → USD format
- Contains "euro" → EUR format
- Default → decimal format

---

## Component architecture

### Conventions

- **One component per file**
- **Filename:** `kebab-case.tsx`
- **Export:** `export function PascalCase`
- **Props:** Typed with interface (e.g., `interface ButtonProps`)
- **Tests:** Co-located in `__tests__` folders

### UI primitives (`components/ui/`)

| Component | Purpose |
|-----------|---------|
| `Button` | Primary/secondary variants, fullWidth option |
| `Input` | Text/number input with label, error state |
| `Select` | Dropdown selector with custom styling |
| `Card` | Container with optional header |
| `FavoriteButton` | Heart icon toggle |
| `LineChartBase` | Recharts wrapper with formatting |
| `Tooltip` | Hover/focus tooltips |

---

## Styling system

**Tokens defined in:** `app/globals.css`

### Color tokens

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | #fafafa | #09090b | Page background |
| `--bg-subtle` | #ffffff | #18181b | Card/elevated surfaces |
| `--bg-muted` | #f4f4f5 | #27272a | Hover states |
| `--text` | #18181b | #fafafa | Primary text |
| `--text-secondary` | #52525b | #a1a1aa | Secondary text |
| `--text-muted` | #71717a | #a1a1aa | Auxiliary text |
| `--border` | #d4d4d8 | #52525b | Standard borders |
| `--border-subtle` | #e4e4e7 | #3f3f46 | Subtle dividers |
| `--primary` | #18181b | #fafafa | Primary button bg |
| `--primary-foreground` | #ffffff | #18181b | Primary button text |
| `--ring` | #71717a | #a1a1aa | Focus ring |
| `--error` | #dc2626 | #f87171 | Error states |
| `--success` | #16a34a | #22c55e | Positive values |
| `--chart-line` | #2563eb | #60a5fa | Chart line color |

### Typography tokens

| Token | Size |
|-------|------|
| `--text-title` | 24px (1.5rem) |
| `--text-section` | 18px (1.125rem) |
| `--text-body` | 16px (1rem) |
| `--text-label` | 14px (0.875rem) |
| `--text-small` | 12px (0.75rem) |
| `--text-value` | 24px (1.5rem) |

**Dark mode:** Automatic via `@media (prefers-color-scheme: dark)` - no toggle

**Styling rules:**
- Always use tokens: `text-text`, `bg-bg-subtle`, `border-border`
- Typography: `text-[length:var(--text-label)]`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Never hardcode colors like `text-gray-500` or `#ffffff`

---

## State and persistence

**Mechanism:** localStorage + React `useSyncExternalStore` hook

| Storage key | Content |
|-------------|---------|
| `divisapp_favorites` | Array of indicator codes in display order |
| `divisapp_last_conversion` | Form state (amount, from, to) + result |

### Hooks (`lib/storage.ts`)

**`useFavorites()`**
```typescript
const {
  favorites,        // string[] - ordered codes
  isFavorite,       // (codigo: string) => boolean
  toggleFavorite,   // (codigo: string) => void
  reorderFavorites  // (fromIndex: number, toIndex: number) => void
} = useFavorites();
```

**`usePersistedConversion()`**
```typescript
const {
  amount,           // string
  fromCode,         // string
  toCode,           // string
  result,           // ConversionResultSnapshot | null
  setAmount,
  setFromCode,
  setToCode,
  setResult,
  swapCodes         // Atomic swap of from/to
} = usePersistedConversion();
```

**Why `useSyncExternalStore`:** SSR-safe hydration, automatic re-renders, cross-tab sync

---

## Business logic

### Conversion algorithm

All indicators express value in CLP (Chilean Peso). Conversion uses CLP as intermediary:

```
result = (amount × sourceIndicatorValue) ÷ targetIndicatorValue
```

**Virtual CLP indicator:**
```typescript
const CLP_INDICATOR: IndicatorValue = {
  codigo: 'clp',
  nombre: 'Peso Chileno',
  unidad_medida: 'Pesos',
  fecha: '',
  valor: 1,
};
```

### Smart defaults

- If user selects `from=clp` → auto-set `to=uf`
- If user selects `from≠clp` → auto-set `to=clp`

### Analytics calculations

| Calculation | Formula |
|-------------|---------|
| Variation | `currentValue - yesterdayValue` |
| Period delta | `firstValue - lastValue` (in selected range) |
| Min/Max | Calculated from 7, 30, or 90 day range |
| Trend | Up/down arrow based on delta direction |

**Color coding:**
- Positive variation → green (`--success`)
- Negative variation → red (`--error`)

---

## UX principles

1. **Immediate feedback** - Real-time calculation on input
2. **State persistence** - Form state survives page refresh and sessions
3. **Contextual navigation** - ConvertLink includes query parameters
4. **Informative empty states** - Clear messages when no favorites
5. **Tooltips for analytics** - Explain min/max/delta values on hover
6. **No modals** - All interactions inline, no interruptions
7. **Mobile-first** - Responsive design with `sm:` breakpoints

---

## Git workflow

### Branch naming

```
feature/SCRUM-XX-short-description
fix/SCRUM-XX-short-description
refactor/name
test/SCRUM-XX-description
docs/name
chore/description
```

### Commit format

```
type(scope): short description

Optional body explaining why the change was made.
```

**Types:** `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`
**Scope:** SCRUM ticket number (e.g., `SCRUM-57`) or feature area (e.g., `conversion`, `home`, `api`)

### Rules

- All feature commits linked to SCRUM tickets
- Main branch = production only
- Develop branch = integration branch
- Feature branches deleted after merge
- No force pushes to main
- No direct commits to main

---

## Testing

**Framework:** Vitest 4.x

**Scripts:**
- `npm run test` - Watch mode
- `npm run test:run` - Single run

**Test locations:**
- `lib/api/__tests__/mindicador.test.ts` - API client tests
- `lib/__tests__/storage.test.ts` - Storage/favorites logic tests

**Patterns:**
- Mock fetch with Vitest
- Test success and error paths
- Validate error class properties
- Test boundary conditions

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

---

## Rules for future prompts

### MANDATORY behaviors

1. **Read before modifying** - Never propose changes to code you haven't read
2. **Respect existing patterns** - Follow the conventions documented here
3. **Minimum necessary change** - Only modify what's explicitly requested
4. **No extras** - Don't add docstrings, comments, or types where they don't exist
5. **No backwards-compat hacks** - Delete dead code completely, don't comment out
6. **Tokens, not values** - Use CSS variables exclusively, never hardcoded colors
7. **Server Components first** - Client only when interactivity is required
8. **Test new code** - Add tests for new functionality
9. **Chilean format** - Always use `es-CL` locale for numbers and dates
10. **No hidden features** - Don't add functionality not explicitly requested

### FORBIDDEN behaviors

1. **Do not explore the codebase** unless explicitly requested
2. **Do not add dependencies** without explicit approval
3. **Do not refactor** code outside the scope of the request
4. **Do not create new files** unless absolutely necessary
5. **Do not add error handling** for impossible scenarios
6. **Do not over-engineer** - Simple solutions only
7. **Do not add configuration options** unless requested
8. **Do not add comments** to explain obvious code

---

## Version history

| Version | Description |
|---------|-------------|
| 1.0.0 | Initial release with indicators, conversion, detail pages |
| 1.1.0 | Favorites system, charts, analytics, smart defaults |
| 1.4.0 | Drag and drop reordering for favorites |

---

## Current status

- **Branch:** develop
- **Status:** Clean (no uncommitted changes)
- **Workflow:** SCRUM-based with 57+ tickets completed
