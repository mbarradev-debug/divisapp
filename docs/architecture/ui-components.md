# UI Components

Core reusable UI components for the design system. All components are purely presentational, use the typography system and semantic color tokens, and are accessible by default.

## Components

### Button

Primary action component for form submissions and user interactions.

**Props:**
- `variant`: `'primary'` | `'secondary'` (default: `'primary'`)
- `fullWidth`: `boolean` (default: `false`)
- `disabled`: `boolean`
- All standard button HTML attributes

**When to use:**
- Form submissions
- Primary actions (convert, submit, save)
- Secondary actions (cancel, reset)

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button type="submit">Convertir</Button>
<Button variant="secondary">Cancelar</Button>
<Button fullWidth disabled>Cargando...</Button>
```

---

### Input

Text input component with integrated label and error state.

**Props:**
- `label`: `string` (required)
- `id`: `string` (required)
- `error`: `boolean` (default: `false`)
- `disabled`: `boolean`
- All standard input HTML attributes

**When to use:**
- Text, number, email, or other single-line inputs
- Form fields requiring user text entry

**Usage:**
```tsx
import { Input } from '@/components/ui';

<Input
  id="amount"
  label="Monto"
  type="number"
  placeholder="Ingresa el monto"
/>

<Input
  id="email"
  label="Email"
  type="email"
  error={hasError}
/>
```

---

### Select

Dropdown select component with integrated label and custom arrow.

**Props:**
- `label`: `string` (required)
- `id`: `string` (required)
- `options`: `{ value: string; label: string }[]` (required)
- `placeholder`: `string`
- `disabled`: `boolean`
- All standard select HTML attributes

**When to use:**
- Choosing from a predefined list of options
- Form fields with discrete choices

**Usage:**
```tsx
import { Select } from '@/components/ui';

const options = [
  { value: 'usd', label: 'US Dollar' },
  { value: 'eur', label: 'Euro' },
];

<Select
  id="currency"
  label="Moneda"
  options={options}
  placeholder="Selecciona una moneda"
/>
```

---

### Card

Container component for grouping related content.

**Props:**
- `header`: `string` (optional)
- `children`: `ReactNode` (required)
- `className`: `string`

**When to use:**
- Displaying grouped information (results, summaries)
- Lists with headers
- Content containers

**Usage:**
```tsx
import { Card } from '@/components/ui';

<Card>
  <p>Simple content card</p>
</Card>

<Card header="Valores recientes">
  <div>Content with header</div>
</Card>
```

---

## Design Principles

1. **Presentational only**: No data fetching or business logic
2. **Accessible**: Labels, focus states, and ARIA attributes included
3. **Mobile-first**: Full-width inputs and buttons by default
4. **Consistent**: Uses typography and color tokens from the design system
5. **Composable**: Simple props for common patterns
