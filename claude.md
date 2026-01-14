# claude.md

> **Location:** Repository root (`/claude.md`)
> **Purpose:** Single authoritative source of truth for the project
> **Usage:** Every LLM must assume this context before any intervention

---

## What is DivisApp

Frontend-only web application that displays and converts Chilean economic indicators using the public mindicador.cl API.

### It is

- Viewer for Chilean economic indicators
- Currency/unit converter between indicators
- Static application with no backend or authentication
- Simple, fast, and functional tool

### It is not

- Transactional financial system
- Platform with users or sessions
- Backend or custom API
- Complex enterprise dashboard

---

## Non-negotiable principles

1. **Simplicity over flexibility** - Less code, fewer abstractions
2. **No over-engineering** - Don't add unnecessary features, validations, or configurations
3. **Local-first** - State persists in localStorage, no backend
4. **Server Components by default** - Client Components only when interactivity is needed
5. **Visual consistency** - Use semantic tokens, never hardcoded values
6. **No unnecessary dependencies** - Prefer native solutions

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript (strict mode) |
| UI | React 19+ |
| Styles | Tailwind CSS 4+ with CSS tokens |
| Charts | Recharts |
| Testing | Vitest |
| Linting | ESLint 9 |

---

## Rendering model

| Type | Use |
|------|-----|
| Server Components | Pages, layouts, data fetching |
| Client Components | Forms, interactive state, localStorage |

**Rule:** Add `'use client'` only when using hooks, events, or browser APIs.

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home - Indicator list with favorites on top |
| `/[indicator]` | Detail - History, chart, analytics |
| `/convert` | Conversion between indicators |

**Valid indicator codes:**
`uf`, `ivp`, `dolar`, `dolar_intercambio`, `euro`, `ipc`, `utm`, `imacec`, `tpm`, `libra_cobre`, `tasa_desempleo`, `bitcoin`

---

## Data source

**API:** `https://mindicador.cl/api`

| Endpoint | Response |
|----------|----------|
| `GET /api` | All current indicators |
| `GET /api/{code}` | Indicator with historical series |

**Fetch configuration:**
```typescript
fetch(url, { next: { revalidate: 3600 } }) // 1-hour cache
```

**Constraints:**
- Public API without authentication
- Chile data only
- Values expressed in CLP (Chilean peso)

---

## Formatting and localization

**Locale:** `es-CL`

| Type | Format |
|------|--------|
| CLP | `$36.123,45` |
| USD/EUR | `36,123.4500` (4 decimals) |
| Percentage | `3,45%` |
| Variation | `+$123,45` or `−$123,45` (with sign) |

**File:** `lib/format.ts`

---

## Component architecture

```
components/
├── home/           # Indicators, favorites
├── detail/         # Header, history, chart
├── conversion/     # Form, result
├── navigation/     # Contextual links
└── ui/             # Button, Input, Select, Card, Tooltip
```

**Conventions:**
- One component per file
- Filename: `kebab-case.tsx`
- Export: `PascalCase`
- Props typed with interface

---

## Styling system

**Tokens defined in:** `app/globals.css`

### Semantic colors

| Token | Use |
|-------|-----|
| `--bg` | Page background |
| `--bg-subtle` | Card background |
| `--bg-muted` | Hover states |
| `--text` | Primary text |
| `--text-secondary` | Secondary text |
| `--text-muted` | Auxiliary text |
| `--border` | Borders |
| `--primary` | Primary buttons |
| `--chart-line` | Chart line |

### Typography

| Token | Size |
|-------|------|
| `--text-title` | 24px |
| `--text-section` | 18px |
| `--text-body` | 16px |
| `--text-label` | 14px |
| `--text-small` | 12px |
| `--text-value` | 24px |

**Dark mode:** Automatic via `prefers-color-scheme: dark`

---

## UX principles

1. Immediate feedback on conversions (real-time calculation)
2. State persistence across sessions
3. Contextual navigation (ConvertLink includes parameters)
4. Informative empty states
5. Tooltips for analytical values
6. No modals or interruptions

---

## Persistence and state

**Mechanism:** localStorage + `useSyncExternalStore`

| Key | Content |
|-----|---------|
| `divisapp_favorites` | Array of ordered codes |
| `divisapp_last_conversion` | Form state + result |

**Hooks:**
- `useFavorites()` - Favorites management
- `usePersistedConversion()` - Conversion state

---

## Business logic

### Conversion

All indicators express value in CLP. Conversion uses CLP as intermediary:

```
result = (amount × sourceValue) ÷ targetValue
```

**Virtual CLP indicator:**
```typescript
{ codigo: 'clp', nombre: 'Peso Chileno', valor: 1 }
```

### Smart defaults

- If `from=clp` → `to=uf`
- If `from≠clp` → `to=clp`

### Analytics calculations

- **Variation:** `currentValue - yesterdayValue`
- **Period delta:** `firstValue - lastValue`
- **Range:** 7, 30, or 90 days

---

## Git and workflow

### Branches

```
feature/SCRUM-XX-description
fix/SCRUM-XX-description
refactor/name
docs/name
```

### Commits

```
type(scope): short description

Optional body
```

**Types:** `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`

### Rules

- Commits linked to SCRUM-XX tickets
- Merge to `develop` for features
- No direct push to `main`
- Branches deleted post-merge

---

## Rules for future prompts

1. **Read before modifying** - Never propose changes without reading the file
2. **Respect existing patterns** - Follow current code conventions
3. **Minimum necessary change** - Don't refactor unrelated code
4. **No extras** - Don't add docstrings, comments, or types where they don't exist
5. **No backwards-compat hacks** - Delete dead code, don't comment it out
6. **Tokens, not values** - Use CSS variables, never hardcoded colors
7. **Server Components first** - Client only if there's interactivity
8. **Test coverage** - Maintain existing tests, add for new code
9. **Chilean format** - Always `es-CL` for numbers and dates
10. **No hidden features** - Don't add functionality not requested
