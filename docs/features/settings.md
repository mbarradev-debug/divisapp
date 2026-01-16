# Settings Page

The settings page allows users to manage their preferences and view account information. It provides a centralized location for customizing the app experience.

## What the Settings Page Does

When a user visits `/settings`, they see:

1. **Account section**: Shows current user status (anonymous or preview mode)
2. **Preferences section**: Controls for theme, default indicator, home ordering, and alerts
3. **Information section**: App version number
4. **Data management section**: Option to reset all local data

## Page Structure

The settings page follows the Server/Client Component pattern used throughout the app.

### Server Component (Page)

```tsx
// app/settings/page.tsx
import Link from 'next/link';
import { SettingsClient } from './settings-client';

export default function SettingsPage() {
  return (
    <div>
      <Link href="/">Volver</Link>
      <h1>Configuración</h1>
      <SettingsClient />
    </div>
  );
}
```

The Server Component provides:
- Back navigation link
- Page title
- Renders the Client Component for interactive content

### Client Component (Settings Form)

```tsx
// app/settings/settings-client.tsx
'use client';

export function SettingsClient() {
  const { settings, updateSettings, resetSettings } = useUserSettings();
  const { isAuthenticated, toggleAuthPreview } = useAuthState();
  // ...
}
```

The Client Component handles:
- Reading and updating user settings
- Managing preview authentication state
- Resetting local data

## User Settings Management

### The useUserSettings Hook

User settings are managed via a custom hook in `lib/storage.ts`:

```tsx
const { settings, updateSettings, resetSettings } = useUserSettings();
```

| Function | Purpose |
|----------|---------|
| `settings` | Current UserSettings object |
| `updateSettings(partial)` | Merge partial updates with current settings |
| `resetSettings()` | Restore all settings to defaults |

### Settings Data Structure

```typescript
interface UserSettings {
  version: number;           // Schema version for migrations
  userId?: string;           // Optional user ID
  theme: ThemePreference;    // 'system' | 'light' | 'dark'
  defaultIndicator: string;  // Indicator code (e.g., 'uf')
  homeOrderingMode: string;  // 'default' | 'favorites-first' | 'custom'
  alertsEnabled: boolean;    // Enable/disable alerts
}
```

### Default Values

```typescript
const DEFAULT_USER_SETTINGS: UserSettings = {
  version: 1,
  theme: 'system',
  defaultIndicator: 'uf',
  homeOrderingMode: 'favorites-first',
  alertsEnabled: false,
};
```

### Storage Details

- **Key**: `divisapp_user_settings`
- **Format**: JSON with version number
- **Persistence**: localStorage (survives page refreshes)

## Preference Controls

### Theme Preference

Users can choose between:
- **Sistema**: Follow system preference (default)
- **Claro**: Light mode
- **Oscuro**: Dark mode

```tsx
const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];
```

### Default Indicator

Sets which indicator is used as the default in conversions:

```tsx
const INDICATOR_OPTIONS = [
  { value: 'uf', label: 'UF' },
  { value: 'dolar', label: 'Dólar' },
  { value: 'euro', label: 'Euro' },
  // ... more indicators
];
```

### Home Ordering Mode

Controls how indicators are ordered on the home page:

```tsx
const ORDERING_OPTIONS = [
  { value: 'default', label: 'Por defecto' },
  { value: 'favorites-first', label: 'Favoritos primero' },
  { value: 'custom', label: 'Personalizado' },
];
```

### Alerts Toggle

A switch to enable/disable alerts (for future notification features):

```tsx
<button
  type="button"
  role="switch"
  aria-checked={settings.alertsEnabled}
  onClick={handleAlertsToggle}
>
  {/* Switch UI */}
</button>
```

## Account Section

### Anonymous State

When no authentication is active:
- Shows "Usuario anónimo" status
- Explains data is stored locally
- Shows callout about future sync features

### Preview Mode

For development testing, users can toggle a preview of authenticated state:

```tsx
const { isAuthenticated, toggleAuthPreview } = useAuthState();
```

When preview mode is active:
- Shows "Modo vista previa" with a badge
- Explains this is a simulation
- Toggle switch appears to return to anonymous mode

### Why Preview Mode Exists

Preview mode allows developers to:
- Test authenticated UX flows without real auth
- Verify UI states for both anonymous and authenticated users
- Develop auth-dependent features before backend is ready

## Reset Functionality

### What Gets Reset

The reset function clears all localStorage keys:

```tsx
const LOCAL_STORAGE_KEYS = [
  'divisapp_favorites',
  'divisapp_last_conversion',
  'divisapp_recents',
  'divisapp_user_settings',
  'divisapp_notification_preferences',
  'divisapp_auth_preview',
];
```

### Confirmation Flow

To prevent accidental data loss:

1. User clicks "Restablecer datos locales"
2. Confirmation dialog appears with warning
3. User can cancel or confirm
4. On confirm: all keys are cleared, page reloads

```tsx
const handleResetData = () => {
  LOCAL_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
  resetSettings();
  window.location.reload();
};
```

## Navigation

### Accessing Settings

Settings page is accessible via:
- The user state indicator in the header
- Direct URL: `/settings`

### User State Indicator

The header includes a clickable user status:

```tsx
// components/navigation/user-state-indicator.tsx
'use client';

export function UserStateIndicator() {
  const { isAuthenticated } = useAuthState();

  return (
    <Link href="/settings">
      <UserIcon />
      <span>{isAuthenticated ? 'Vista previa' : 'Anónimo'}</span>
    </Link>
  );
}
```

## Visual Layout

```
+-----------------------------------------------------------+
|  DivisApp                    [Anónimo] [Inicio] [Convertir]|
+-----------------------------------------------------------+
|                                                           |
|  ← Volver                                                 |
|                                                           |
|  Configuración                                            |
|                                                           |
|  ┌─────────────────────────────────────────────────────┐  |
|  │ Cuenta                                               │  |
|  │                                                      │  |
|  │ [👤] Usuario anónimo                                 │  |
|  │     La app funciona completamente sin cuenta.        │  |
|  │     Tus datos se guardan localmente.                 │  |
|  │                                                      │  |
|  │ ┌──────────────────────────────────────────────┐     │  |
|  │ │ Próximamente: Con una cuenta podrás          │     │  |
|  │ │ sincronizar tus favoritos entre dispositivos.│     │  |
|  │ └──────────────────────────────────────────────┘     │  |
|  │                                                      │  |
|  │ Vista previa de cuenta          [Toggle Switch]      │  |
|  │ Simula el estado autenticado                         │  |
|  └─────────────────────────────────────────────────────┘  |
|                                                           |
|  Preferencias                                             |
|                                                           |
|  Tema                              [Sistema ▼]            |
|  Indicador por defecto             [UF ▼]                 |
|  Orden en inicio                   [Favoritos primero ▼]  |
|  Alertas                           [Toggle Switch]        |
|                                                           |
|  Información                                              |
|                                                           |
|  Versión de la aplicación                   0.1.0         |
|                                                           |
|  Datos locales                                            |
|                                                           |
|  [Restablecer datos locales]                              |
|                                                           |
+-----------------------------------------------------------+
```

## How to Modify Settings Safely

### Adding a New Setting

1. **Add to UserSettings type** in `lib/domain/user-settings.ts`:
   ```typescript
   interface UserSettings {
     // ... existing fields
     newSetting: NewSettingType;
   }
   ```

2. **Add default value** in `DEFAULT_USER_SETTINGS`:
   ```typescript
   const DEFAULT_USER_SETTINGS = {
     // ... existing defaults
     newSetting: defaultValue,
   };
   ```

3. **Update validation** in `lib/storage.ts`:
   ```typescript
   function isValidUserSettings(value: unknown): value is UserSettings {
     // ... add validation for new field
   }
   ```

4. **Add UI control** in `settings-client.tsx`:
   ```tsx
   const handleNewSettingChange = (value: NewSettingType) => {
     updateSettings({ newSetting: value });
   };
   ```

### Adding a New Storage Key

If adding a new localStorage key:

1. Add to `LOCAL_STORAGE_KEYS` array in `settings-client.tsx`
2. This ensures reset functionality clears the new key

### Migrating Settings

The settings schema includes a version number for future migrations:

```typescript
function migrateSettings(stored: UserSettings): UserSettings {
  if (stored.version === USER_SETTINGS_VERSION) {
    return stored;
  }
  // Add migration logic here when version changes
  return { ...DEFAULT_USER_SETTINGS, ...stored, version: USER_SETTINGS_VERSION };
}
```

## Testing Considerations

When testing the settings page:

1. **Settings persist**: Changes survive page refresh
2. **Reset works**: All keys are cleared on reset
3. **Preview toggle**: Auth state changes correctly
4. **Dropdowns work**: All options are selectable
5. **Alerts toggle**: Switch state updates correctly
6. **Navigation works**: Back link returns to home
7. **Header indicator**: Shows correct auth state

## Future Considerations

### When Authentication is Enabled

When `AUTH_ENABLED=true`:
- Preview toggle could be removed or hidden
- Account section would show real user info
- Settings could sync to backend
- Sign out option would appear

### Settings Sync

Future cloud sync would:
- Store settings on server after authentication
- Merge local and remote settings on sign-in
- Resolve conflicts (prefer newer timestamp)
