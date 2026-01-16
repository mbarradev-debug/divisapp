/**
 * UserSettings Domain Model
 *
 * Local-first, versioned settings for user preferences.
 * Designed for future migrations via version field.
 * No persistence logic - pure type definitions and defaults.
 */

import type { UserId } from './user';

/** Current schema version for migration support */
export const USER_SETTINGS_VERSION = 1;

/** Theme preference options */
export type ThemePreference = 'system' | 'light' | 'dark';

/** Home page indicator ordering mode */
export type HomeOrderingMode = 'default' | 'favorites-first' | 'custom';

/**
 * Valid indicator codes from mindicador.cl API.
 * Used for defaultIndicator field validation.
 */
export type IndicatorCode =
  | 'uf'
  | 'ivp'
  | 'dolar'
  | 'dolar_intercambio'
  | 'euro'
  | 'ipc'
  | 'utm'
  | 'imacec'
  | 'tpm'
  | 'libra_cobre'
  | 'tasa_desempleo'
  | 'bitcoin';

/**
 * User settings model.
 * All fields have explicit defaults defined in DEFAULT_USER_SETTINGS.
 */
export interface UserSettings {
  /** Schema version for future migrations */
  readonly version: number;

  /** Associated user ID (optional for backwards compatibility) */
  readonly userId?: UserId;

  /** UI theme preference */
  readonly theme: ThemePreference;

  /** Default indicator shown on home or used in conversions */
  readonly defaultIndicator: IndicatorCode;

  /** How indicators are ordered on the home page */
  readonly homeOrderingMode: HomeOrderingMode;

  /** Whether push notifications/alerts are enabled (future feature) */
  readonly alertsEnabled: boolean;
}

/**
 * Default settings for new users.
 * Matches current app behavior: system theme, favorites-first ordering.
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  version: USER_SETTINGS_VERSION,
  theme: 'system',
  defaultIndicator: 'uf',
  homeOrderingMode: 'favorites-first',
  alertsEnabled: false,
};

/**
 * Creates settings with defaults, allowing partial overrides.
 * Does not persist - caller is responsible for storage.
 */
export function createUserSettings(
  overrides?: Partial<Omit<UserSettings, 'version'>>
): UserSettings {
  return {
    ...DEFAULT_USER_SETTINGS,
    ...overrides,
    version: USER_SETTINGS_VERSION,
  };
}
