/**
 * Authentication Module
 *
 * Structural scaffold for future authentication integration.
 * All functionality is disabled by default via AUTH_ENABLED flag.
 *
 * Status: SCAFFOLD - Structure exists but auth is not active
 *
 * Future integration points:
 * - Auth.js (NextAuth v5) provider configuration
 * - Session management hooks
 * - Protected route utilities
 *
 * Current behavior:
 * - Exports types for future use
 * - Provides no-op defaults
 * - Zero runtime impact when AUTH_ENABLED=false
 */

export { AUTH_ENABLED } from '@/lib/feature-flags';

export type { AuthSession, AuthState, AuthProvider } from './types';
export { DEFAULT_AUTH_STATE } from './types';

/**
 * Placeholder for future auth configuration.
 * Will contain provider setup when auth is enabled.
 *
 * Future structure (Auth.js):
 * ```
 * export const authConfig = {
 *   providers: [...],
 *   callbacks: {...},
 *   pages: {...},
 * }
 * ```
 */
// Auth configuration will be added here when AUTH_ENABLED=true
