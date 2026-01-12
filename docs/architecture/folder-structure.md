# Folder Structure

This document explains the purpose of each folder and file in the project. Understanding this structure is essential for adding new features or finding existing code.

## Complete Project Structure

```
divisapp/
├── app/                          # Next.js App Router (pages and layouts)
│   ├── [indicator]/              # Dynamic route for indicator details
│   │   └── page.tsx
│   ├── convert/                  # Conversion feature
│   │   ├── page.tsx
│   │   └── conversion-client.tsx
│   ├── globals.css               # Global styles (Tailwind CSS)
│   ├── layout.tsx                # Root layout (header, navigation)
│   ├── not-found.tsx             # 404 error page
│   ├── page.tsx                  # Home page
│   └── favicon.ico               # Browser tab icon
│
├── components/                   # Reusable React components
│   ├── conversion/               # Conversion feature components
│   │   ├── conversion-form.tsx
│   │   └── conversion-result.tsx
│   ├── detail/                   # Indicator detail components
│   │   ├── indicator-header.tsx
│   │   ├── indicator-series-item.tsx
│   │   └── indicator-series-list.tsx
│   └── home/                     # Home page components
│       ├── indicator-item.tsx
│       └── indicators-list.tsx
│
├── lib/                          # Shared logic and utilities
│   └── api/                      # API clients
│       ├── mindicador.ts         # mindicador.cl API client
│       └── __tests__/            # API tests
│           └── mindicador.test.ts
│
├── public/                       # Static files (served as-is)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── docs/                         # Project documentation
│   └── ...
│
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── vitest.config.ts              # Test configuration
├── eslint.config.mjs             # Linting configuration
└── README.md                     # Project readme
```

## The `app/` Folder

This is where Next.js App Router pages live. The folder structure directly maps to URLs.

### How Routing Works

| File Location | URL | Purpose |
|---------------|-----|---------|
| `app/page.tsx` | `/` | Home page |
| `app/convert/page.tsx` | `/convert` | Conversion page |
| `app/[indicator]/page.tsx` | `/dolar`, `/uf`, etc. | Dynamic indicator pages |
| `app/not-found.tsx` | Any invalid URL | 404 error page |
| `app/layout.tsx` | All pages | Shared layout (header) |

### Special Files

- **`page.tsx`**: Defines a route. Every folder with a `page.tsx` becomes a URL.
- **`layout.tsx`**: Wraps pages. The root layout wraps all pages.
- **`not-found.tsx`**: Shown when a page doesn't exist.
- **`globals.css`**: Imported by the layout, applies to all pages.

### Dynamic Routes

The `[indicator]` folder name with square brackets creates a dynamic route. This means:

- `/dolar` → `page.tsx` receives `{ indicator: 'dolar' }`
- `/uf` → `page.tsx` receives `{ indicator: 'uf' }`
- `/bitcoin` → `page.tsx` receives `{ indicator: 'bitcoin' }`

The actual indicator code is passed as a parameter to the page component.

### Co-located Client Components

Notice that `conversion-client.tsx` lives inside the `convert/` folder but is not called `page.tsx`. This is intentional:

- Only `page.tsx` files become routes
- Other `.tsx` files in `app/` are helper components
- The `page.tsx` (Server Component) imports and uses `conversion-client.tsx` (Client Component)

This pattern keeps related code together while maintaining the server/client separation.

## The `components/` Folder

This folder contains reusable React components, organized by feature.

### Organization by Feature

```
components/
├── conversion/     # Components used by /convert
├── detail/         # Components used by /[indicator]
└── home/           # Components used by /
```

This organization makes it easy to find components: look in the folder matching the feature you're working on.

### Naming Convention

Components use kebab-case filenames with descriptive names:

- `indicator-item.tsx` - A single indicator card
- `indicator-series-list.tsx` - A list of historical values
- `conversion-form.tsx` - The conversion input form

Each file exports a single component with a PascalCase name:

```tsx
// components/home/indicator-item.tsx
export function IndicatorItem({ indicator }) {
  // ...
}
```

### When to Create New Components

Create a new component when:

1. **Code is reused**: The same UI appears in multiple places
2. **Code is complex**: A section has its own logic worth isolating
3. **Testing is needed**: Smaller components are easier to test
4. **Readability suffers**: Breaking up a large component improves clarity

## The `lib/` Folder

This folder contains shared logic that isn't React components.

### Current Structure

```
lib/
└── api/
    ├── mindicador.ts          # API client functions and types
    └── __tests__/
        └── mindicador.test.ts  # Tests for the API client
```

### The API Client

`mindicador.ts` contains:

- **TypeScript interfaces**: Define the shape of API responses
- **API functions**: `getAllIndicators()` and `getIndicatorByCode()`
- **Error handling**: Custom `MindicadorApiError` class
- **Validation**: Functions to verify API response format

This file is imported by page components to fetch data:

```tsx
import { getAllIndicators } from '@/lib/api/mindicador';
```

### Future Expansion

As the project grows, you might add:

```
lib/
├── api/
│   └── mindicador.ts
├── utils/              # Utility functions
│   └── formatting.ts   # Date/number formatting
└── constants/          # Application constants
    └── indicators.ts   # List of known indicators
```

## The `public/` Folder

Files in `public/` are served directly without processing. They're accessible at the root URL:

- `public/globe.svg` → `https://yoursite.com/globe.svg`

Currently contains SVG icons from the Next.js starter template. These can be removed or replaced as needed.

## Configuration Files

### `package.json`

Defines project dependencies and npm scripts:

```json
{
  "scripts": {
    "dev": "next dev",        // Start development server
    "build": "next build",    // Create production build
    "start": "next start",    // Run production server
    "lint": "eslint",         // Check code style
    "test": "vitest",         // Run tests in watch mode
    "test:run": "vitest run"  // Run tests once
  }
}
```

### `tsconfig.json`

TypeScript configuration. Notable settings:

- **Path alias**: `@/*` maps to the project root, so you can write `import { X } from '@/lib/api/mindicador'` instead of relative paths
- **Strict mode**: Enabled for maximum type safety
- **JSX**: Configured for React

### `next.config.ts`

Next.js configuration. Currently minimal (uses defaults). This is where you'd add:

- Environment variables
- Image optimization settings
- Redirects or rewrites
- Build customizations

### `postcss.config.mjs`

Required for Tailwind CSS. Tells PostCSS to process Tailwind directives.

### `vitest.config.ts`

Test runner configuration:

- **Environment**: Node (not browser)
- **Globals**: Enables `describe`, `it`, `expect` without imports
- **Path alias**: Same `@` alias as TypeScript

### `eslint.config.mjs`

Code linting rules. Uses Next.js recommended settings plus TypeScript rules.

## How to Add New Features Safely

### Adding a New Page

1. Create a folder in `app/` matching the URL you want
2. Create a `page.tsx` file inside it
3. Export a default component (can be `async` for data fetching)

Example: Adding a `/settings` page:

```
app/
└── settings/
    └── page.tsx
```

```tsx
// app/settings/page.tsx
export default function SettingsPage() {
  return <h1>Settings</h1>;
}
```

### Adding Components for a New Feature

1. Create a folder in `components/` named after the feature
2. Create component files inside
3. Import them into your page

Example: Adding settings components:

```
components/
└── settings/
    ├── settings-form.tsx
    └── settings-toggle.tsx
```

### Adding a New API Client

1. Create a new file in `lib/api/`
2. Define TypeScript interfaces for the API responses
3. Create functions to call the API
4. Add tests in `lib/api/__tests__/`

### Adding Utilities

1. Create a file in `lib/` (or `lib/utils/`)
2. Export pure functions (no React)
3. Import where needed

## Common Mistakes to Avoid

### Putting Components in `app/`

While technically possible, avoid creating non-page components directly in `app/`. Use `components/` instead for better organization.

**Don't:**
```
app/
└── convert/
    ├── page.tsx
    ├── form.tsx        # Avoid this
    └── result.tsx      # Avoid this
```

**Do:**
```
app/
└── convert/
    └── page.tsx

components/
└── conversion/
    ├── conversion-form.tsx
    └── conversion-result.tsx
```

Exception: A Client Component that's only used by one page (like `conversion-client.tsx`) can live next to that page.

### Forgetting `'use client'`

If you add interactivity (hooks, event handlers) to a component and forget `'use client'`, you'll get an error. Remember:

- Server Components: No hooks, no browser APIs
- Client Components: Must have `'use client'` at the top

### Circular Imports

Be careful not to create circular dependencies:

**Bad:**
```
// lib/api/helpers.ts
import { MindicadorApiError } from './mindicador';

// lib/api/mindicador.ts
import { formatError } from './helpers';  // Circular!
```

Keep dependencies flowing in one direction.
