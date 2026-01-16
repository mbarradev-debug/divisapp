/**
 * Supabase Module
 *
 * Exports for Supabase client and repositories.
 */

export { getSupabaseClient, isSupabaseConfigured } from './client';

export {
  saveSubscription,
  getSubscription,
  getSubscriptionsByUser,
  findSubscriptionByEndpoint,
  deleteSubscription,
  deleteSubscriptionByEndpoint,
  type RepositoryResult,
} from './push-subscriptions';
