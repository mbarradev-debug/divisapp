/**
 * Supabase Module
 *
 * Exports for Supabase client and repositories.
 */

export { getSupabaseClient, isSupabaseConfigured } from './client';

export {
  saveSubscription,
  findSubscriptionByEndpoint,
  deleteSubscriptionByEndpoint,
  type RepositoryResult,
} from './push-subscriptions';
