/**
 * Push Subscriptions Repository
 *
 * Supabase persistence layer for Web Push subscriptions.
 * Handles CRUD operations for subscription storage.
 */

import { getSupabaseClient, isSupabaseConfigured } from './client';
import type { WebPushSubscription } from '@/lib/domain/web-push-subscription';
import type { UserId } from '@/lib/domain/user';

/**
 * Database row type for push_subscriptions table.
 */
interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  expiration_time: number | null;
  p256dh_key: string;
  auth_key: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Converts a database row to domain model.
 */
function rowToSubscription(row: PushSubscriptionRow): WebPushSubscription {
  return {
    id: row.id,
    userId: row.user_id,
    subscription: {
      endpoint: row.endpoint,
      expirationTime: row.expiration_time,
      keys: {
        p256dh: row.p256dh_key,
        auth: row.auth_key,
      },
    },
    userAgent: row.user_agent ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Result type for repository operations.
 */
export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Saves a new Web Push subscription to Supabase.
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

  const { data, error } = await client
    .from('push_subscriptions')
    .upsert(
      {
        id: subscription.id,
        user_id: subscription.userId,
        endpoint: subscription.subscription.endpoint,
        expiration_time: subscription.subscription.expirationTime,
        p256dh_key: subscription.subscription.keys.p256dh,
        auth_key: subscription.subscription.keys.auth,
        user_agent: subscription.userAgent ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: rowToSubscription(data) };
}

/**
 * Retrieves a subscription by its ID.
 */
export async function getSubscription(
  subscriptionId: string
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
    .eq('id', subscriptionId)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ? rowToSubscription(data) : null };
}

/**
 * Retrieves all subscriptions for a user.
 */
export async function getSubscriptionsByUser(
  userId: UserId
): Promise<RepositoryResult<WebPushSubscription[]>> {
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data.map(rowToSubscription) };
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
 * Deletes a subscription by its ID.
 */
export async function deleteSubscription(
  subscriptionId: string
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
    .eq('id', subscriptionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
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
