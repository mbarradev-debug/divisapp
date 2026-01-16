/**
 * Supabase Client
 *
 * Browser-side Supabase client for push subscription persistence.
 * Uses anonymous auth - subscriptions are linked to device, not user accounts.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

/**
 * Returns whether Supabase is properly configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Gets the Supabase client singleton.
 * Returns null if Supabase is not configured (graceful degradation).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}
