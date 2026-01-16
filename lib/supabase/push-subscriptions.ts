/**
 * Push Subscriptions Repository
 *
 * Supabase persistence layer for Web Push subscriptions.
 * Maps to the push_subscriptions table with exact column names.
 *
 * Table schema (DO NOT MODIFY):
 * - endpoint (text, NOT NULL, UNIQUE)
 * - p256dh (text, NOT NULL)
 * - auth (text, NOT NULL)
 * - user_id (uuid, NULLABLE)
 * - expiration_time (bigint, NULLABLE)
 * - user_agent (text, NULLABLE)
 */

import { getSupabaseClient, isSupabaseConfigured } from './client';
import type { WebPushSubscription } from '@/lib/domain/web-push-subscription';

/**
 * Database row type matching actual push_subscriptions table.
 */
interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string | null;
  expiration_time: number | null;
  user_agent: string | null;
}

/**
 * Converts a database row to domain model.
 */
function rowToSubscription(row: PushSubscriptionRow): WebPushSubscription {
  return {
    id: row.endpoint, // Use endpoint as ID since table has no separate id column
    userId: row.user_id ?? 'anonymous',
    subscription: {
      endpoint: row.endpoint,
      expirationTime: row.expiration_time,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    },
    userAgent: row.user_agent ?? undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Result type for repository operations.
 */
export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Saves a Web Push subscription to Supabase.
 * Uses upsert with endpoint as conflict target.
 */
export async function saveSubscription(
  subscription: WebPushSubscription
): Promise<RepositoryResult<WebPushSubscription>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' };
  }

  // Build insert data matching exact table columns
  const insertData: Record<string, unknown> = {
    endpoint: subscription.subscription.endpoint,
    p256dh: subscription.subscription.keys.p256dh,
    auth: subscription.subscription.keys.auth,
  };

  // Only include optional fields if they have values
  if (subscription.subscription.expirationTime != null) {
    insertData.expiration_time = subscription.subscription.expirationTime;
  }

  if (typeof window !== 'undefined') {
    insertData.user_agent = navigator.userAgent;
  }

  const { data, error } = await client
    .from('push_subscriptions')
    .upsert(insertData, { onConflict: 'endpoint' })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: rowToSubscription(data) };
}

/**
 * Finds a subscription by its endpoint URL.
 * Used to check if a browser subscription already exists.
 */
export async function findSubscriptionByEndpoint(
  endpoint: string
): Promise<RepositoryResult<WebPushSubscription | null>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' };
  }

  const { data, error } = await client
    .from('push_subscriptions')
    .select()
    .eq('endpoint', endpoint)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ? rowToSubscription(data) : null };
}

/**
 * Deletes a subscription by its endpoint URL.
 * Used when unsubscribing from the browser.
 */
export async function deleteSubscriptionByEndpoint(
  endpoint: string
): Promise<RepositoryResult<void>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' };
  }

  const { error } = await client
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
