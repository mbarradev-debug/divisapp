'use client';

/**
 * usePushSubscription Hook
 *
 * React hook for managing Web Push subscription state.
 * Provides subscription status, permission state, and actions.
 *
 * Note: Always starts in 'loading' state to avoid hydration mismatches.
 * Browser capability is only checked after mount.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from '@/lib/storage';
import {
  isPushSupported,
  getPushPermission,
  getCurrentSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  type PushPermissionState,
  type PushSubscriptionState,
} from './web-push';

export interface UsePushSubscriptionReturn {
  /** Current subscription state for UI display */
  state: PushSubscriptionState;

  /** Current permission state */
  permission: PushPermissionState;

  /** Whether the device supports push notifications */
  isSupported: boolean;

  /** Whether the user is currently subscribed */
  isSubscribed: boolean;

  /** Error message if any */
  error: string | null;

  /** Subscribe to push notifications */
  subscribe: () => Promise<void>;

  /** Unsubscribe from push notifications */
  unsubscribe: () => Promise<void>;

  /** Refresh the subscription state */
  refresh: () => Promise<void>;
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  const { user } = useAuthState();
  // Start with loading state to ensure consistent SSR/client rendering
  const [state, setState] = useState<PushSubscriptionState>('loading');
  const [permission, setPermission] = useState<PushPermissionState>('unsupported');
  const [error, setError] = useState<string | null>(null);
  // Track support as state to avoid hydration mismatch
  const [isSupported, setIsSupported] = useState(false);

  const isSubscribed = state === 'subscribed';

  const refresh = useCallback(async () => {
    const supported = isPushSupported();
    setIsSupported(supported);

    if (!supported) {
      setState('unsupported');
      setPermission('unsupported');
      return;
    }

    const currentPermission = getPushPermission();
    setPermission(currentPermission);

    if (currentPermission === 'denied') {
      setState('denied');
      return;
    }

    try {
      const subscription = await getCurrentSubscription();
      if (subscription) {
        setState('subscribed');
      } else if (currentPermission === 'prompt') {
        setState('prompt');
      } else {
        setState('unsubscribed');
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Error checking subscription');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      const supported = isPushSupported();
      if (!cancelled) setIsSupported(supported);

      if (!supported) {
        if (!cancelled) {
          setState('unsupported');
          setPermission('unsupported');
        }
        return;
      }

      const currentPermission = getPushPermission();
      if (!cancelled) setPermission(currentPermission);

      if (currentPermission === 'denied') {
        if (!cancelled) setState('denied');
        return;
      }

      try {
        const subscription = await getCurrentSubscription();
        if (cancelled) return;
        if (subscription) {
          setState('subscribed');
        } else if (currentPermission === 'prompt') {
          setState('prompt');
        } else {
          setState('unsubscribed');
        }
      } catch (err) {
        if (!cancelled) {
          setState('error');
          setError(err instanceof Error ? err.message : 'Error checking subscription');
        }
      }
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return;
    }

    setState('loading');
    setError(null);

    const result = await subscribeToPush(user.id);

    if (result.success) {
      setState('subscribed');
    } else {
      setError(result.error);
      await refresh();
    }
  }, [isSupported, user.id, refresh]);

  const unsubscribe = useCallback(async () => {
    setState('loading');
    setError(null);

    const result = await unsubscribeFromPush();

    if (result.success) {
      setState('unsubscribed');
    } else {
      setError(result.error);
      await refresh();
    }
  }, [refresh]);

  return {
    state,
    permission,
    isSupported,
    isSubscribed,
    error,
    subscribe,
    unsubscribe,
    refresh,
  };
}
