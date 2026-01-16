'use client';

/**
 * usePushSubscription Hook
 *
 * React hook for managing Web Push subscription state.
 * Provides subscription status, permission state, and actions.
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
  const [state, setState] = useState<PushSubscriptionState>('loading');
  const [permission, setPermission] = useState<PushPermissionState>('unsupported');
  const [error, setError] = useState<string | null>(null);

  const isSupported = isPushSupported();
  const isSubscribed = state === 'subscribed';

  const refresh = useCallback(async () => {
    if (!isSupported) {
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
  }, [isSupported]);

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      if (!isSupported) {
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
  }, [isSupported]);

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
