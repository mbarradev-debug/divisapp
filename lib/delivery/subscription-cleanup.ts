/**
 * Subscription Cleanup
 *
 * Handles cleanup of invalid, expired, or failed subscriptions.
 * Called after delivery attempts to maintain subscription health.
 *
 * GRACEFUL HANDLING:
 * - Invalid subscriptions are removed silently
 * - Cleanup errors are logged but don't fail the delivery flow
 * - Batch operations for efficiency
 */

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { DeliveryResult } from '@/lib/domain/delivery-port';

/**
 * Result of a cleanup operation.
 */
export interface CleanupResult {
  /** Number of subscriptions successfully removed */
  removed: number;

  /** IDs of subscriptions that failed to remove */
  failedIds: string[];

  /** Error message if cleanup failed entirely */
  error?: string;
}

/**
 * Cleans up subscriptions marked for removal in delivery results.
 *
 * Call this after delivery to remove subscriptions that returned
 * 404/410 from push services, indicating they're no longer valid.
 *
 * @param result - Delivery result containing subscriptionsToRemove
 * @returns Cleanup result with counts
 */
export async function cleanupInvalidSubscriptions(
  result: DeliveryResult
): Promise<CleanupResult> {
  if (result.subscriptionsToRemove.length === 0) {
    return { removed: 0, failedIds: [] };
  }

  if (!isSupabaseConfigured()) {
    return {
      removed: 0,
      failedIds: result.subscriptionsToRemove as string[],
      error: 'Supabase not configured',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      removed: 0,
      failedIds: result.subscriptionsToRemove as string[],
      error: 'Supabase client unavailable',
    };
  }

  try {
    const { error } = await client
      .from('push_subscriptions')
      .delete()
      .in('id', result.subscriptionsToRemove as string[]);

    if (error) {
      console.error('[Cleanup] Failed to remove subscriptions:', error);
      return {
        removed: 0,
        failedIds: result.subscriptionsToRemove as string[],
        error: error.message,
      };
    }

    return {
      removed: result.subscriptionsToRemove.length,
      failedIds: [],
    };
  } catch (error) {
    console.error('[Cleanup] Unexpected error:', error);
    return {
      removed: 0,
      failedIds: result.subscriptionsToRemove as string[],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cleans up subscriptions that have passed their expiration time.
 *
 * Browser push subscriptions may have an expirationTime set.
 * This function removes subscriptions that are past their expiry.
 *
 * @returns Cleanup result with count of removed subscriptions
 */
export async function cleanupExpiredSubscriptions(): Promise<CleanupResult> {
  if (!isSupabaseConfigured()) {
    return {
      removed: 0,
      failedIds: [],
      error: 'Supabase not configured',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      removed: 0,
      failedIds: [],
      error: 'Supabase client unavailable',
    };
  }

  try {
    const now = Date.now();

    // First, find expired subscriptions
    const { data: expired, error: selectError } = await client
      .from('push_subscriptions')
      .select('id')
      .not('expiration_time', 'is', null)
      .lt('expiration_time', now);

    if (selectError) {
      console.error('[Cleanup] Failed to find expired subscriptions:', selectError);
      return {
        removed: 0,
        failedIds: [],
        error: selectError.message,
      };
    }

    if (!expired || expired.length === 0) {
      return { removed: 0, failedIds: [] };
    }

    const expiredIds = expired.map((row) => row.id);

    // Delete expired subscriptions
    const { error: deleteError } = await client
      .from('push_subscriptions')
      .delete()
      .in('id', expiredIds);

    if (deleteError) {
      console.error('[Cleanup] Failed to delete expired subscriptions:', deleteError);
      return {
        removed: 0,
        failedIds: expiredIds,
        error: deleteError.message,
      };
    }

    return {
      removed: expiredIds.length,
      failedIds: [],
    };
  } catch (error) {
    console.error('[Cleanup] Unexpected error:', error);
    return {
      removed: 0,
      failedIds: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cleans up subscriptions by specific IDs.
 *
 * Utility function for explicit cleanup when subscription IDs are known.
 *
 * @param subscriptionIds - IDs to remove
 * @returns Cleanup result
 */
export async function cleanupSubscriptionsById(
  subscriptionIds: readonly string[]
): Promise<CleanupResult> {
  if (subscriptionIds.length === 0) {
    return { removed: 0, failedIds: [] };
  }

  if (!isSupabaseConfigured()) {
    return {
      removed: 0,
      failedIds: subscriptionIds as string[],
      error: 'Supabase not configured',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      removed: 0,
      failedIds: subscriptionIds as string[],
      error: 'Supabase client unavailable',
    };
  }

  try {
    const { error } = await client
      .from('push_subscriptions')
      .delete()
      .in('id', subscriptionIds as string[]);

    if (error) {
      console.error('[Cleanup] Failed to remove subscriptions:', error);
      return {
        removed: 0,
        failedIds: subscriptionIds as string[],
        error: error.message,
      };
    }

    return {
      removed: subscriptionIds.length,
      failedIds: [],
    };
  } catch (error) {
    console.error('[Cleanup] Unexpected error:', error);
    return {
      removed: 0,
      failedIds: subscriptionIds as string[],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
