/**
 * Feature Flags
 *
 * Centralized feature toggles for gradual rollout of new functionality.
 * All flags default to disabled (false) for safety.
 *
 * Future: These could be driven by environment variables or a remote config.
 */

/**
 * Authentication feature flag.
 *
 * When false (default):
 * - All auth-related code paths are skipped
 * - App behaves as fully anonymous/local-first
 * - No auth providers are initialized
 *
 * When true (future):
 * - Auth providers become active
 * - Session management is enabled
 * - User sync features are available
 *
 * To enable in future: set NEXT_PUBLIC_AUTH_ENABLED=true in environment
 */
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
