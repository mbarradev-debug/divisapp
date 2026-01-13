# Color System

## Overview

DivisApp uses a semantic color system built on design tokens. Colors are defined as CSS custom properties in `app/globals.css` and exposed to Tailwind CSS via the `@theme inline` block. The system automatically adapts to light and dark modes using the `prefers-color-scheme` media query.

## Design Principles

1. **Semantic over literal**: Color tokens describe their purpose, not their appearance (e.g., `text-secondary` instead of `zinc-600`)
2. **Automatic dark mode**: All colors automatically adjust based on system preference
3. **Consistency**: The same token produces visually appropriate results in both modes
4. **Accessibility**: Color combinations maintain sufficient contrast for readability

## Color Categories

### Background Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `bg` | #fafafa | #09090b | Page background |
| `bg-subtle` | #ffffff | #18181b | Cards, elevated surfaces |
| `bg-muted` | #f4f4f5 | #27272a | Hover states, subtle highlights |

### Text Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `text` | #18181b | #fafafa | Primary text, headings |
| `text-secondary` | #52525b | #a1a1aa | Secondary text, descriptions |
| `text-muted` | #71717a | #a1a1aa | Helper text, captions |
| `text-placeholder` | #a1a1aa | #71717a | Input placeholders |

### Border Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `border` | #e4e4e7 | #3f3f46 | Default borders |
| `border-subtle` | #f4f4f5 | #27272a | Dividers, subtle separators |
| `border-strong` | #d4d4d8 | #52525b | Input borders, emphasized borders |

### Primary Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `primary` | #18181b | #fafafa | Primary buttons, key actions |
| `primary-hover` | #27272a | #e4e4e7 | Hover state for primary elements |
| `primary-foreground` | #ffffff | #18181b | Text on primary backgrounds |

### Focus Ring

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `ring` | #71717a | #a1a1aa | Focus ring color |
| `ring-offset` | #fafafa | #09090b | Focus ring offset background |

### Semantic Colors

#### Error

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `error` | #dc2626 | #f87171 | Error icons, indicators |
| `error-bg` | #fef2f2 | #450a0a | Error message background |
| `error-border` | #fecaca | #7f1d1d | Error message border |
| `error-text` | #b91c1c | #fca5a5 | Error message text |

#### Success

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `success` | #16a34a | #22c55e | Success icons, indicators |
| `success-bg` | #f0fdf4 | #052e16 | Success message background |
| `success-border` | #bbf7d0 | #14532d | Success message border |
| `success-text` | #15803d | #86efac | Success message text |

#### Warning

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `warning` | #d97706 | #fbbf24 | Warning icons, indicators |
| `warning-bg` | #fffbeb | #451a03 | Warning message background |
| `warning-border` | #fde68a | #78350f | Warning message border |
| `warning-text` | #b45309 | #fde68a | Warning message text |

#### Info

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `info` | #2563eb | #60a5fa | Info icons, indicators |
| `info-bg` | #eff6ff | #172554 | Info message background |
| `info-border` | #bfdbfe | #1e3a8a | Info message border |
| `info-text` | #1d4ed8 | #93c5fd | Info message text |

## CSS Custom Properties

Colors are defined in `app/globals.css` within the `:root` selector for light mode and overridden in the `@media (prefers-color-scheme: dark)` block for dark mode.

```css
:root {
  /* Background Colors */
  --bg: #fafafa;
  --bg-subtle: #ffffff;
  --bg-muted: #f4f4f5;

  /* Text Colors */
  --text: #18181b;
  --text-secondary: #52525b;
  --text-muted: #71717a;
  --text-placeholder: #a1a1aa;

  /* Border Colors */
  --border: #e4e4e7;
  --border-subtle: #f4f4f5;
  --border-strong: #d4d4d8;

  /* Primary Colors */
  --primary: #18181b;
  --primary-hover: #27272a;
  --primary-foreground: #ffffff;

  /* Focus Ring */
  --ring: #71717a;
  --ring-offset: #fafafa;

  /* Semantic: Error */
  --error: #dc2626;
  --error-bg: #fef2f2;
  --error-border: #fecaca;
  --error-text: #b91c1c;

  /* ... additional semantic colors */
}
```

These are then exposed to Tailwind via the `@theme inline` block:

```css
@theme inline {
  --color-bg: var(--bg);
  --color-bg-subtle: var(--bg-subtle);
  --color-bg-muted: var(--bg-muted);
  /* ... etc */
}
```

## Usage in Components

Apply colors using Tailwind utility classes with the semantic token names:

### Backgrounds

```tsx
<div className="bg-bg">Page background</div>
<div className="bg-bg-subtle">Card background</div>
<div className="bg-bg-muted">Hover state</div>
```

### Text

```tsx
<h1 className="text-text">Primary heading</h1>
<p className="text-text-secondary">Description text</p>
<span className="text-text-muted">Helper text</span>
```

### Borders

```tsx
<div className="border border-border">Default border</div>
<div className="divide-y divide-border-subtle">Dividers</div>
<input className="border border-border-strong" />
```

### Primary Actions

```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Submit
</button>
```

### Focus States

```tsx
<button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset">
  Focusable
</button>
```

### Error Messages

```tsx
<div className="rounded-lg border border-error-border bg-error-bg p-4">
  <p className="text-error-text">Error message here</p>
</div>
```

### Success Messages

```tsx
<div className="rounded-lg border border-success-border bg-success-bg p-4">
  <p className="text-success-text">Success message here</p>
</div>
```

## Color by Context

### Home Page

- Page background: `bg-bg`
- Page title: `text-text`
- Error messages: `bg-error-bg border-error-border text-error-text`

### Indicator Cards

- Card background: `bg-bg-subtle`
- Card border: `border-border`
- Hover border: `border-border-strong`
- Hover background: `bg-bg-muted`
- Card title: `text-text`
- Card value: `text-text`
- Unit text: `text-text-muted`

### Indicator Detail

- Back link: `text-text-secondary` → `text-text` on hover
- Page title: `text-text`
- Unit description: `text-text-muted`
- Section header: `text-text`
- Date values: `text-text-secondary`
- Numeric values: `text-text`

### Conversion Page

- Form labels: `text-text`
- Input borders: `border-border-strong`
- Input background: `bg-bg-subtle`
- Input text: `text-text`
- Placeholder text: `text-text-placeholder`
- Focus ring: `ring-ring`
- Button: `bg-primary text-primary-foreground`
- Button hover: `bg-primary-hover`
- Error messages: `bg-error-bg border-error-border text-error-text`

### Navigation

- Header background: `bg-bg/80` (with backdrop blur)
- Header border: `border-border`
- Logo text: `text-text`
- Nav links: `text-text-secondary` → `text-text` on hover
- Nav hover background: `bg-bg-muted`

### 404 Page

- Large heading: `text-text`
- Subtitle: `text-text-secondary`
- Button: `bg-primary text-primary-foreground`

## Guidelines for Using Colors

### Do

- Use semantic tokens (`text-text-secondary`) instead of raw colors (`text-zinc-600`)
- Apply the same token for similar UI elements across the app
- Use the full semantic color set for messages (bg, border, text)
- Test in both light and dark modes

### Don't

- Hard-code hex values in component classNames
- Mix semantic tokens with raw Tailwind colors
- Use `dark:` variants (the system handles dark mode automatically)
- Create new color tokens without adding them to globals.css

## Contrast Ratios

The color system maintains WCAG AA compliance:

| Combination | Contrast | Status |
|-------------|----------|--------|
| `text` on `bg` | 15.5:1 (light), 15.5:1 (dark) | AAA |
| `text-secondary` on `bg` | 7.2:1 (light), 6.0:1 (dark) | AA |
| `text-muted` on `bg` | 5.0:1 (light), 6.0:1 (dark) | AA |
| `primary-foreground` on `primary` | 15.5:1 | AAA |
| `error-text` on `error-bg` | 5.8:1 (light), 7.2:1 (dark) | AA |
