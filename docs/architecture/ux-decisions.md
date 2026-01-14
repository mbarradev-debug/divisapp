# UX Decisions

This document explains the user experience design decisions made in DivisApp, including why certain approaches were chosen and what trade-offs were accepted.

## Core UX Principles

DivisApp follows these guiding principles:

1. **Data First**: The primary purpose is showing indicator values. Everything else supports this goal.
2. **Immediate Feedback**: Actions should feel instant. No unnecessary loading states.
3. **Mobile Primary**: Most users check indicators on their phones.
4. **Simplicity Over Features**: Better to do fewer things well than many things poorly.
5. **Local First**: User preferences work without accounts or sign-up.

## Why the App is Mobile-First

### The Decision

DivisApp is designed for mobile screens first, then scaled up for tablets and desktops. This means:

- Touch targets are large enough for fingers (minimum 44px)
- Text is readable without zooming
- Single-column layouts by default
- Maximum content width of 896px (2xl in Tailwind)

### The Reasoning

1. **Usage patterns**: People check economic indicators throughout the day, often on mobile devices
2. **Quick reference**: Checking "what's the dollar today?" is a quick mobile task
3. **Progressive enhancement**: It's easier to scale up a mobile design than to squeeze down a desktop design

### The Implementation

```css
/* Mobile-first responsive pattern */
.grid { grid-template-columns: 1fr; }           /* Mobile: single column */
@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); } /* Tablet+: two columns */
}
```

The container is centered and constrained:

```tsx
<div className="mx-auto min-h-screen max-w-2xl">
```

## Why Conversion Recalculates in Real Time

### The Decision

When you type in the conversion form, the result updates immediately. There's no "Convert" button that you have to click.

### The Reasoning

1. **Exploration**: Users often try different amounts to understand relative values
2. **Fewer clicks**: Removing a button reduces friction
3. **Instant feedback**: Seeing the result change as you type feels responsive
4. **Error prevention**: You see issues immediately rather than after clicking

### The Trade-offs Accepted

- **More computation**: Every keystroke triggers a calculation (mitigated by keeping calculations simple)
- **Visual noise**: The result updates frequently during typing (mitigated by smooth transitions)

### The Implementation

```tsx
// Real-time calculation on input change
useEffect(() => {
  performConversion();
}, [amount, fromCode, toCode]);
```

## Why Favorites Are Separated from the Main List

### The Decision

Favorite indicators appear in their own section at the top of the home page, separate from the "All Indicators" list below.

### The Reasoning

1. **Quick access**: The most important indicators are immediately visible
2. **Scan patterns**: Users scan from top to bottom; favorites at top means less scrolling
3. **Visual hierarchy**: Clear separation makes it obvious which indicators are favorited
4. **Customization**: Users control what appears first without affecting the complete list

### Alternative Considered

We considered highlighting favorites within the main list (with a star icon) rather than separating them. This was rejected because:

- It doesn't reduce scrolling for users with many favorites
- The visual distinction is subtle and easy to miss
- It complicates the sorting logic

### The Implementation

```tsx
// Split indicators into two lists
const favoriteIndicators = favorites
  .map(code => indicators.find(i => i.codigo === code))
  .filter(Boolean);

const otherIndicators = indicators
  .filter(i => !favorites.includes(i.codigo));
```

## Why Some Data Is Intentionally Not Persisted

### What's Persisted

- **Favorites list**: Which indicators are favorited and their order
- **Last conversion**: The most recent conversion inputs and result

### What's Not Persisted

- **Selected range on detail page**: Always defaults to 7 days
- **Scroll position**: Pages start at the top
- **Form validation errors**: Cleared on page refresh

### The Reasoning

1. **Fresh start**: Each visit should show current data by default
2. **Simplicity**: Less state to manage means fewer edge cases
3. **Storage limits**: localStorage has limited space; we save it for what matters
4. **Privacy**: Minimal data storage means minimal privacy concerns

### The Trade-offs

- **Minor annoyance**: Users who always want 30-day ranges have to click each time
- **Lost context**: Leaving and returning to conversion page loses the form state

We accepted these trade-offs because:
- Range selection is a quick click
- Conversion state is restored for the most common case (returning to finish a conversion)

## Why the Chart Uses a Line Instead of Bars

### The Decision

Historical data is displayed as a line chart rather than a bar chart.

### The Reasoning

1. **Trends over values**: The primary insight is "is it going up or down?" not "what was the exact value on January 3rd?"
2. **Continuous data**: Economic indicators are continuous measurements, not discrete events
3. **Space efficiency**: Line charts show more data points in less space
4. **Visual clarity**: With 30+ data points, bars become too thin to be useful

### The Implementation

Using Recharts `LineChart` with these settings:

```tsx
<LineChart data={chartData}>
  <Line
    type="monotone"
    dot={false}        // No dots for cleaner appearance
    strokeWidth={2}    // Visible but not heavy
  />
</LineChart>
```

## Why the Range Selector Has 7/30/90 Days

### The Decision

Users can view 7, 30, or 90 days of history. Not more, not fewer options.

### The Reasoning

- **7 days**: "What happened this week?" - Most common use case
- **30 days**: "What's the monthly trend?" - Standard analysis period
- **90 days**: "What's the quarterly trend?" - Longer-term perspective

### Why Not Daily or Custom Ranges?

1. **API limitations**: The mindicador.cl API returns around 30-40 historical values
2. **Analysis paralysis**: Too many options slows down the user
3. **Implementation simplicity**: Three options is easy to understand and implement

### Why Not Yearly Data?

The API doesn't provide year-long historical data efficiently. Adding this would require:
- Multiple API calls
- Different caching strategy
- More complex chart rendering

This was deemed out of scope for the current version.

## Why Tooltips Appear on Hover, Not Click

### The Decision

Analytics values (min, max, delta) have tooltips that appear on hover (desktop) or focus (mobile/accessibility).

### The Reasoning

1. **Discoverability**: Hover hints that more information is available
2. **Non-blocking**: Tooltips don't take over the interface
3. **Contextual**: Information appears exactly where you're looking
4. **Accessibility**: Focus-triggered tooltips work with keyboard navigation

### Mobile Considerations

On touch devices, tooltips appear on tap (via focus). This is slightly less discoverable but maintains consistency with the desktop experience.

## What UX Decisions Are Intentional vs Temporary

### Intentional (Will Keep)

| Decision | Reason |
|----------|--------|
| Mobile-first layout | Core design principle |
| Favorites at top | Proven useful in testing |
| Real-time conversion | Better user experience |
| Simple range selector | Matches API capabilities |
| Local-only storage | No backend needed for MVP |

### Temporary (May Change)

| Decision | Current State | Possible Future |
|----------|--------------|-----------------|
| No dark mode toggle | System preference only | Manual toggle option |
| No export | View only | Export to CSV/PDF |
| Spanish only | Hardcoded strings | i18n support |
| No push notifications | Check manually | Alerts for thresholds |

## Trade-offs Made to Keep the MVP Simple

### No User Accounts

**Decision**: All data is stored locally in the browser.

**Trade-off**: Users can't sync favorites across devices.

**Reasoning**:
- Accounts require backend infrastructure
- Authentication adds complexity
- Privacy is simpler without user data
- 90% of users only use one device regularly

### No Historical Comparison

**Decision**: View one indicator at a time.

**Trade-off**: Can't overlay USD and EUR on the same chart.

**Reasoning**:
- Different scales make comparison charts misleading
- Implementation complexity is high
- Users can open two browser tabs for comparison

### No Alerts or Notifications

**Decision**: Users must manually check for updates.

**Trade-off**: Miss important value changes.

**Reasoning**:
- Push notifications require service worker setup
- Email notifications require accounts
- SMS notifications require phone verification
- Economic indicators don't change frequently enough to justify alerts for most users

### Limited Decimal Precision

**Decision**: Values shown with 2-4 decimal places.

**Trade-off**: Some precision lost for financial calculations.

**Reasoning**:
- Most users need approximate values, not exact
- Display is cleaner with fewer digits
- The API itself has precision limits

## Summary

DivisApp's UX is designed around these core ideas:

1. **Show indicators clearly**: That's the primary job
2. **Respect mobile users**: Most checks happen on phones
3. **Keep it simple**: Fewer features, done well
4. **Be responsive**: Actions should feel instant
5. **Store locally**: No accounts needed for core functionality

These decisions trade off some features (cross-device sync, historical comparisons, notifications) for simplicity, speed, and privacy. As the product matures, some temporary decisions may change, but the core principles will remain.
