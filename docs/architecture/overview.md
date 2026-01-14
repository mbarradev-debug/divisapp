# Architecture Overview

This document explains the high-level architecture of DivisApp and the reasoning behind the technology choices.

## What is the Application?

DivisApp is a web application that:

1. Fetches economic indicator data from an external API (mindicador.cl)
2. Displays that data to users in a readable format with charts and analytics
3. Allows users to convert between different currencies
4. Stores user preferences (favorites) locally in the browser

The application runs in a web browser but also has code that runs on a server. Understanding this distinction is key to understanding how the application works.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | Web framework for React |
| React | 19.2.3 | User interface library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 4.x | Styling |
| Recharts | 3.6.0 | Chart library |
| Vitest | 4.0.17 | Testing |

## Why Next.js with App Router?

Next.js is a framework built on top of React that adds important features for building production web applications. We chose Next.js for several reasons:

### 1. Server-Side Rendering

When a user visits a page, the server can fetch data and generate the complete HTML before sending it to the browser. This means:

- **Faster initial page load**: Users see content immediately, not a loading spinner
- **Better for search engines**: Search engines can read the content
- **Data security**: API calls happen on the server, not exposed in the browser

### 2. File-Based Routing

Instead of writing code to define which URL shows which page, Next.js uses the file system. Create a file called `page.tsx` in a folder, and that folder becomes a URL:

```
app/
  page.tsx         → /
  convert/
    page.tsx       → /convert
  [indicator]/
    page.tsx       → /dolar, /uf, /bitcoin, etc.
```

This makes it obvious where to find the code for any page.

### 3. App Router (vs. Pages Router)

Next.js has two routing systems. We use the newer "App Router" because:

- It supports React Server Components (explained below)
- It has better data fetching patterns
- It's the recommended approach for new projects
- It handles layouts and loading states more elegantly

## What Are Server Components?

This is a fundamental concept in modern React. There are two types of components:

### Server Components (Default)

These components run **only on the server**. They:

- Can directly fetch data from databases or APIs
- Cannot use browser features (like `window` or `document`)
- Cannot use React hooks like `useState` or `useEffect`
- Send only the final HTML to the browser (smaller download)

In DivisApp, the page components are Server Components. They fetch data from mindicador.cl on the server:

```tsx
// This runs on the server
export default async function Home() {
  const data = await getAllIndicators();  // API call happens on server
  return <HomeIndicators indicators={data} />;
}
```

### Client Components

These components run **in the browser**. They:

- Can use browser features
- Can use React hooks for interactivity
- Must be marked with `'use client'` at the top of the file
- Are needed for forms, buttons, and anything interactive

In DivisApp, interactive features like the conversion form and favorites toggle are Client Components:

```tsx
'use client';  // This tells Next.js to run this in the browser

export function ConversionForm() {
  const [amount, setAmount] = useState(0);  // Hooks work here
  // ...
}
```

## What Runs Where?

Here's a breakdown of where different parts of the application execute:

### Server (Node.js)

- Page components (`app/page.tsx`, `app/[indicator]/page.tsx`, etc.)
- API client functions (`lib/api/mindicador.ts`)
- Initial HTML generation
- Data fetching from mindicador.cl

### Browser (User's Computer)

- Client Components (anything with `'use client'`)
- Form interactions (typing, selecting, clicking)
- State management for favorites and conversion
- Chart rendering (Recharts)
- localStorage access for persistence
- CSS and visual rendering

### The Flow

```
User requests /dolar
        ↓
[Server] app/[indicator]/page.tsx runs
        ↓
[Server] Fetches data from mindicador.cl
        ↓
[Server] Generates HTML with the data
        ↓
[Browser] Receives complete HTML
        ↓
[Browser] React "hydrates" (makes interactive)
        ↓
[Browser] User sees the page with charts
```

## How Pages Are Rendered

### Step 1: Request

When a user types a URL or clicks a link, their browser sends a request to the Next.js server.

### Step 2: Server Execution

The server finds the matching page file and runs it. Because our pages are `async` functions, they can `await` data:

```tsx
export default async function IndicatorPage({ params }) {
  const { indicator } = await params;
  const data = await getIndicatorByCode(indicator);
  // ...
}
```

### Step 3: HTML Generation

React converts the component tree into HTML. This includes:

- The layout (header, navigation)
- The page content with real data
- All the Tailwind CSS classes for styling

### Step 4: Response

The complete HTML is sent to the browser. The user sees the page immediately.

### Step 5: Hydration

React runs again in the browser to "hydrate" the page. This means:

- Attaching event listeners to buttons and forms
- Making Client Components interactive
- Setting up state management
- Initializing charts with Recharts

After hydration, the page is fully interactive.

## Data Caching

To avoid fetching the same data repeatedly, Next.js caches API responses:

```tsx
const response = await fetch(url, {
  next: { revalidate: 3600 }  // Cache for 1 hour (3600 seconds)
});
```

This means:

- The first request fetches fresh data from mindicador.cl
- Subsequent requests within 1 hour use the cached data
- After 1 hour, the next request fetches fresh data again

This improves performance and reduces load on the external API.

## Local State Management

DivisApp stores certain data in the browser's localStorage:

### Favorites

User's favorite indicators are stored locally so they persist across sessions:

```tsx
// Using useSyncExternalStore for SSR-safe localStorage access
const { favorites, toggleFavorite } = useFavorites();
```

### Conversion State

The last conversion (amount, indicators, result) is persisted:

```tsx
const { conversion, setConversion } = usePersistedConversion();
```

### Why useSyncExternalStore?

React's `useSyncExternalStore` hook provides:

- SSR-safe hydration (avoids mismatch between server and client)
- Automatic re-renders when localStorage changes
- Support for cross-tab synchronization

## Error Handling Strategy

The application handles errors at multiple levels:

### API Level

The `mindicador.ts` client throws descriptive errors with status codes:

```tsx
if (!response.ok) {
  throw new MindicadorApiError(
    `Failed to fetch indicators`,
    response.status
  );
}
```

### Page Level

Each page catches errors and displays user-friendly messages:

```tsx
try {
  const data = await getIndicatorByCode(indicator);
} catch (error) {
  if (error instanceof MindicadorApiError && error.status === 404) {
    notFound();  // Shows the 404 page
  }
  // Show error message to user
}
```

### Global Level

A `not-found.tsx` file handles any 404 errors across the application.

## Security Considerations

### API Calls on Server

All mindicador.cl API calls happen on the server. This means:

- The API endpoint is not exposed to users
- Request/response details are not visible in browser dev tools
- No API keys are needed (mindicador.cl is public), but if they were, they'd be safe

### Input Validation

The conversion form validates all inputs:

- Amount must be a positive number
- Both currencies must be selected
- Cannot convert a currency to itself

### No Sensitive Data

The application doesn't store or process any user data. All information displayed comes from the public mindicador.cl API.

## Summary

DivisApp uses Next.js with the App Router to create a server-rendered application. This architecture provides:

- Fast page loads (server renders complete HTML)
- Type safety (TypeScript throughout)
- Clean code organization (file-based routing)
- Good separation of concerns (server vs. client code)
- Built-in caching (1-hour data freshness)
- Local persistence (favorites and conversion state)
- Robust error handling (API, page, and global levels)

The key concept to understand is the difference between Server Components (run on the server, fetch data) and Client Components (run in the browser, handle interactivity).
