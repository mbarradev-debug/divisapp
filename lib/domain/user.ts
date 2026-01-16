/**
 * User Domain Model
 *
 * Provider-agnostic user representation supporting both anonymous
 * and authenticated users. No persistence logic - pure type definitions.
 */

/**
 * Unique identifier for a user.
 * For anonymous users: locally generated UUID stored in localStorage.
 * For authenticated users: provider-assigned ID (future).
 */
export type UserId = string;

/**
 * Core user model.
 * Designed to work with anonymous-first approach while supporting
 * future authentication providers without breaking changes.
 */
export interface User {
  /** Unique user identifier */
  readonly id: UserId;

  /** True for local-only users, false for authenticated users */
  readonly isAnonymous: boolean;

  /** Timestamp when the user record was created (ISO 8601) */
  readonly createdAt: string;
}

/**
 * Creates a new anonymous user representation.
 * Does not persist - caller is responsible for storage.
 */
export function createAnonymousUser(id: UserId): User {
  return {
    id,
    isAnonymous: true,
    createdAt: new Date().toISOString(),
  };
}
