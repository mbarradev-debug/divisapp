/**
 * Authentication Types
 *
 * Provider-agnostic type definitions for future authentication.
 * These types are designed to be compatible with Auth.js (NextAuth v5)
 * without importing or depending on it.
 *
 * Status: SCAFFOLD - Types defined but not used until AUTH_ENABLED=true
 */

import type { User } from '@/lib/domain/user';

/**
 * Authentication session representation.
 * Compatible with Auth.js Session type structure.
 */
export interface AuthSession {
  /** Authenticated user data */
  readonly user: User;

  /** Session expiration timestamp (ISO 8601) */
  readonly expires: string;
}

/**
 * Authentication state for UI components.
 * Provides a unified interface regardless of auth provider.
 */
export interface AuthState {
  /** Current session, null if not authenticated */
  readonly session: AuthSession | null;

  /** True while auth state is being determined */
  readonly isLoading: boolean;

  /** True if user has an active session */
  readonly isAuthenticated: boolean;
}

/**
 * Supported authentication providers.
 * Extensible for future OAuth integrations.
 */
export type AuthProvider = 'google' | 'github' | 'email';

/**
 * Default auth state for anonymous users.
 * Used when AUTH_ENABLED=false or no session exists.
 */
export const DEFAULT_AUTH_STATE: AuthState = {
  session: null,
  isLoading: false,
  isAuthenticated: false,
};
