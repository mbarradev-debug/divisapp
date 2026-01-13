# Typography System

## Font Choice

DivisApp uses **Geist** as its primary font family. Geist is a modern, neutral sans-serif typeface designed by Vercel specifically for interfaces and data-heavy applications.

### Why Geist?

- **Clarity**: Optimized for screen readability at all sizes
- **Neutral**: Does not draw attention to itself, letting data stand out
- **Tabular numerals**: Includes monospace number variants for aligned data columns
- **Variable weight**: Supports multiple weights for hierarchy without loading multiple font files
- **Native integration**: Ships with Next.js, requiring no additional dependencies

The font is loaded via `next/font/google` in `app/layout.tsx` and exposed through CSS custom properties.

## Typography Scale

The typography system defines seven semantic levels, each with a specific font size and line height:

| Level | Size | Line Height | Usage |
|-------|------|-------------|-------|
| Display | 60px (3.75rem) | 1 | Special headings (404 page) |
| Title | 24px (1.5rem) | 32px (2rem) | Page titles, h1 elements |
| Section | 18px (1.125rem) | 28px (1.75rem) | Section headers, h2 elements |
| Body | 16px (1rem) | 24px (1.5rem) | Default text, inputs, buttons |
| Label | 14px (0.875rem) | 20px (1.25rem) | Form labels, navigation, secondary text |
| Small | 12px (0.75rem) | 16px (1rem) | Helper text, units, captions |
| Value | 24px (1.5rem) | 32px (2rem) | Large numeric displays |

## Font Weights

Three font weights are used throughout the application:

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Body text, descriptions |
| Medium | 500 | Labels, buttons, secondary headings |
| Semibold | 600 | Titles, large values |
| Bold | 700 | Display text only (404) |

## CSS Custom Properties

Typography values are defined in `app/globals.css` within the `@theme inline` block:

```css
@theme inline {
  /* Page Title: 24px / 32px */
  --text-title: 1.5rem;
  --leading-title: 2rem;

  /* Section Title: 18px / 28px */
  --text-section: 1.125rem;
  --leading-section: 1.75rem;

  /* Body: 16px / 24px */
  --text-body: 1rem;
  --leading-body: 1.5rem;

  /* Label: 14px / 20px */
  --text-label: 0.875rem;
  --leading-label: 1.25rem;

  /* Small: 12px / 16px */
  --text-small: 0.75rem;
  --leading-small: 1rem;

  /* Display: 60px / 64px */
  --text-display: 3.75rem;
  --leading-display: 1;

  /* Large Value: 24px / 32px */
  --text-value: 1.5rem;
  --leading-value: 2rem;
}
```

## Usage in Components

Apply typography styles using Tailwind's arbitrary value syntax with CSS custom properties:

### Page Titles (h1)

```tsx
<h1 className="text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)]">
  Page Title
</h1>
```

### Section Headers (h2)

```tsx
<h2 className="text-[length:var(--text-section)] font-medium leading-[var(--leading-section)]">
  Section Header
</h2>
```

### Body Text

```tsx
<p className="text-[length:var(--text-body)] leading-[var(--leading-body)]">
  Body text content
</p>
```

### Labels

```tsx
<label className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)]">
  Form Label
</label>
```

### Small/Helper Text

```tsx
<span className="text-[length:var(--text-small)] leading-[var(--leading-small)]">
  Helper text
</span>
```

### Large Values

```tsx
<span className="text-[length:var(--text-value)] font-semibold leading-[var(--leading-value)] tabular-nums">
  1,234.56
</span>
```

## Special Utilities

### Tabular Numerals

For numeric values that need to align vertically, add `tabular-nums`:

```tsx
<span className="tabular-nums">1,234.56</span>
```

This ensures digits have consistent widths for alignment in tables and lists.

### Antialiasing

Font smoothing is applied globally in `globals.css`:

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## Typography by Context

### Home Page

- Page title: Title level
- Indicator names: Label level, medium weight
- Indicator values: Value level, semibold weight
- Units: Small level

### Indicator Detail

- Page title: Title level
- Unit description: Label level
- Section header: Label level, medium weight
- Dates: Label level
- Values: Body level, medium weight

### Conversion Page

- Page title: Title level
- Form labels: Label level, medium weight
- Input text: Body level
- Button text: Body level, medium weight
- Result value: Value level, semibold weight
- Result description: Label level

### Navigation

- Logo: Section level, semibold weight
- Nav links: Label level, medium weight
- Back links: Label level

### Error States

- Error messages: Label level
