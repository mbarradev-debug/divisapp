# Notification Rules & UX Specification

> **Version:** 1.0.0
> **Task:** SCRUM-73
> **Status:** Draft
> **Scope:** Push notifications for economic indicator changes

---

## Overview

This document defines the mental model for push notifications in DivisApp. The goal is to provide users with timely, relevant updates about economic indicators without overwhelming them.

**Core principle:** Notifications should be predictable, valuable, and user-controlled.

---

## 1. Notification Triggers

### 1.1 What CAN Trigger a Notification

| Trigger Type | Description | Example |
|--------------|-------------|---------|
| **Daily value change** | The indicator value changed from the previous day | UF changed from $38.000 to $38.050 |
| **Threshold crossing** | Value crosses a user-defined limit | Dollar crossed $950 |
| **Significant variation** | Change exceeds a configured percentage | IPC increased by more than 0.5% |

### 1.2 Trigger Definitions

#### Daily Value Change
- Compares today's value with yesterday's value
- Only triggers if there is an actual change (not same value)
- Triggered once per day per indicator, after the API updates (typically morning)

#### Threshold Crossing
- User sets a numeric threshold (above or below)
- Triggers only on the first crossing event
- Resets when value moves back across threshold (allows re-triggering)
- Example: "Alert me when dollar goes above $950"

#### Significant Variation
- Based on percentage change, not absolute value
- Default threshold: 1% change from previous day
- User can configure sensitivity (0.5%, 1%, 2%, 5%)

### 1.3 What Should NOT Trigger Notifications

| Non-trigger | Reason |
|-------------|--------|
| No change in value | No new information to communicate |
| Indicator added to favorites | User action, not market event |
| App opened or closed | Irrelevant to indicator data |
| Conversion performed | User-initiated action, not alert-worthy |
| Same threshold crossed twice consecutively | Prevents spam on volatile indicators |
| Historical data loaded | Only current values are notification-worthy |
| API errors or unavailability | Technical issues should not generate user notifications |

---

## 2. Grouping Rules

### 2.1 Grouping Strategy

Multiple indicator changes are grouped into a single notification when:

1. **Time window:** All changes occur within the same update cycle (typically daily)
2. **Maximum indicators per notification:** Up to 3 indicators shown individually
3. **Overflow handling:** If more than 3 indicators changed, show top 3 by relevance + "y X mas"

**Relevance ranking:**
1. Threshold crossings (highest priority)
2. Largest percentage change
3. User's favorite order (first favorites have higher priority)

### 2.2 Anti-Spam Rules

| Rule | Limit |
|------|-------|
| Maximum notifications per day | 3 |
| Minimum time between notifications | 4 hours |
| Quiet hours | None by default (user can configure) |
| Duplicate content suppression | Same indicator cannot appear in consecutive notifications |

### 2.3 Batching Behavior

```
If multiple triggers occur within 15 minutes:
  → Combine into single notification
  → Use grouped format
  → Show most significant change first
```

---

## 3. Notification Content

### 3.1 Required Fields

| Field | Description | Always present |
|-------|-------------|----------------|
| Indicator name | Human-readable name (e.g., "Dolar observado") | Yes |
| Current value | Formatted according to unit type | Yes |
| Direction | Arrow or text indicating up/down | Yes |
| Magnitude | Absolute or percentage change | Yes |
| Timestamp | When the change was detected | No (optional) |

### 3.2 Tone and Language

- **Language:** Spanish (es-CL)
- **Tone:** Neutral, informative, factual
- **No interpretation:** Never say "good" or "bad", just state facts
- **No predictions:** Never imply future behavior
- **No urgency:** Never use exclamation marks or alarming words

### 3.3 Notification Format

**Title (max 50 characters):**
```
{Indicator name}: {direction} {magnitude}
```

**Body (max 100 characters):**
```
Valor actual: {formatted_value}. Variacion: {formatted_change}
```

### 3.4 Examples

#### Good Notification Text

| Title | Body |
|-------|------|
| `Dolar observado: subio $12` | `Valor actual: $962,50. Variacion: +1,26%` |
| `UF: bajo $45` | `Valor actual: $38.012,34. Variacion: -0,12%` |
| `3 indicadores cambiaron` | `Dolar +1,2%, Euro +0,8%, UF +0,1%` |

#### Bad Notification Text (DO NOT USE)

| Bad Example | Problem |
|-------------|---------|
| `El dolar SUBIO!` | Alarming tone, unnecessary emphasis |
| `Buena noticia: UF bajo` | Interpretation, subjective judgment |
| `Dolar podria seguir subiendo` | Prediction, speculation |
| `Cambio importante en euro` | Vague, no useful information |
| `$962.50` | No context, missing indicator name |

### 3.5 Formatting Rules

- Use Chilean formatting for all numbers (period as thousand separator, comma as decimal)
- Currency symbols: `$` for CLP-based values
- Percentages: Always include `%` symbol
- Direction: Use `subio`/`bajo` in title, `+`/`-` in body
- Never use emoji

---

## 4. User Control Rules

### 4.1 What Users Can Configure

| Setting | Options | Default |
|---------|---------|---------|
| Enable/disable notifications | On/Off | Off |
| Indicators to track | Multi-select from favorites | All favorites |
| Trigger type | Daily change, Threshold, Significant variation | Daily change |
| Threshold value (per indicator) | Numeric input | None |
| Sensitivity (significant variation) | 0.5%, 1%, 2%, 5% | 1% |
| Quiet hours | Start/end time | Disabled |
| Maximum daily notifications | 1, 2, 3, 5, Unlimited | 3 |

### 4.2 Default Behavior

When a user enables notifications for the first time:

1. **Enabled indicators:** None (user must explicitly select)
2. **Trigger type:** Daily value change
3. **Sensitivity:** 1% for significant variation
4. **Maximum notifications:** 3 per day
5. **Quiet hours:** Disabled
6. **Grouping:** Automatic

### 4.3 Handling Many Indicators

If user selects more than 5 indicators:

1. Show informational message: "Seleccionaste muchos indicadores. Las notificaciones se agruparan automaticamente."
2. Apply stricter grouping (top 3 only in each notification)
3. Increase minimum time between notifications to 6 hours
4. Suggest reducing selection if user complains about too many notifications

### 4.4 Permission Flow

```
1. User navigates to notification settings
2. App checks if browser/device permission granted
3. If not granted: Show explanation + system permission prompt
4. If denied: Show instructions to enable in system settings
5. If granted: Show indicator selection UI
```

---

## 5. Non-Goals

The following are explicitly **out of scope** for this notification system:

| Non-goal | Reason |
|----------|--------|
| Real-time streaming notifications | mindicador.cl updates daily, not real-time |
| Backend service for push delivery | DivisApp is frontend-only |
| Rich media notifications (images, charts) | Keep simple, fast to read |
| Actionable notifications (buttons) | Mobile-first, simple tap to open |
| Notification history/log | Adds complexity, low value |
| Email or SMS notifications | Out of scope for web app |
| AI-generated summaries or insights | Explicitly prohibited per constraints |
| Personalized notification timing based on user behavior | Over-engineering |
| A/B testing notification formats | No analytics infrastructure |
| Notification sounds or vibration patterns | Use system defaults |
| Snooze functionality | Adds complexity |
| Per-indicator notification schedules | Use global settings only |
| Social sharing from notifications | Not relevant to use case |

---

## 6. Technical Constraints

These constraints inform implementation but are not part of the UX specification:

| Constraint | Implication |
|------------|-------------|
| No backend | Use Web Push API / Service Workers |
| No external services | Cannot use Firebase, OneSignal, etc. |
| No animations | Static notification content only |
| Mobile-first | Test primarily on mobile devices |
| Offline support | Queue notifications if offline, deliver when online |
| localStorage only | Store notification preferences locally |

---

## 7. Edge Cases

### 7.1 API Unavailable

- Do not show error notifications
- Skip notification cycle for that day
- Resume normally when API recovers

### 7.2 Indicator Discontinued

- If mindicador.cl removes an indicator, silently remove from user's notification preferences
- Do not notify user of removal

### 7.3 User Clears Browser Data

- Notification preferences are lost
- User must re-enable and reconfigure
- No recovery mechanism (local-first principle)

### 7.4 Multiple Tabs/Devices

- Notifications are device-specific
- Each device has independent preferences
- No cross-device sync (no backend)

---

## 8. Success Criteria

A successful notification system will:

1. **Be predictable:** Users know exactly when and why they receive notifications
2. **Be valuable:** Every notification contains actionable information
3. **Be respectful:** Never spam, never alarm, never manipulate
4. **Be simple:** Configuration takes less than 1 minute
5. **Be optional:** Disabled by default, easy to turn off

---

## 9. Future Considerations

These items may be considered for future iterations but are not part of this specification:

- Notification preferences sync (would require backend)
- Smart scheduling based on user timezone
- Indicator correlation alerts (e.g., "Dollar and Euro both rose")
- Weekly summary notifications

---

## Appendix A: Notification Copy Templates

### Single Indicator - Daily Change
```
Title: {nombre}: {subio|bajo} {variacion_formateada}
Body: Valor actual: {valor_formateado}. Variacion: {porcentaje}
```

### Single Indicator - Threshold Crossed
```
Title: {nombre} cruzo {umbral_formateado}
Body: Valor actual: {valor_formateado}. Tu alerta: {tipo} {umbral}
```

### Multiple Indicators - Grouped
```
Title: {count} indicadores cambiaron
Body: {ind1} {dir1}{pct1}, {ind2} {dir2}{pct2}, {ind3} {dir3}{pct3}
```

### Overflow (more than 3)
```
Title: {count} indicadores cambiaron
Body: {ind1} {dir1}{pct1}, {ind2} {dir2}{pct2} y {remaining} mas
```

---

## Appendix B: Preference Storage Schema

```typescript
interface NotificationPreferences {
  enabled: boolean;
  indicators: string[];              // Array of indicator codes
  triggerType: 'daily' | 'threshold' | 'significant';
  thresholds: Record<string, {       // Per-indicator thresholds
    type: 'above' | 'below';
    value: number;
  }>;
  sensitivity: 0.5 | 1 | 2 | 5;      // Percentage for significant variation
  quietHours: {
    enabled: boolean;
    start: string;                   // "HH:MM" format
    end: string;
  };
  maxDaily: 1 | 2 | 3 | 5 | null;   // null = unlimited
}
```

**Storage key:** `divisapp_notification_preferences`

---

*End of specification*
