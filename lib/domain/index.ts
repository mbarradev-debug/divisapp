/**
 * Domain Models
 *
 * Provider-agnostic types for User and UserSettings.
 * Local-first, Server Component compatible.
 */

export type { User, UserId } from './user';
export { createAnonymousUser } from './user';

export type {
  UserSettings,
  ThemePreference,
  HomeOrderingMode,
  IndicatorCode,
} from './user-settings';
export {
  DEFAULT_USER_SETTINGS,
  USER_SETTINGS_VERSION,
  createUserSettings,
} from './user-settings';
