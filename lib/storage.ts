import { useSyncExternalStore, useCallback } from 'react';

const CONVERSION_STORAGE_KEY = 'divisapp_last_conversion';
const FAVORITES_STORAGE_KEY = 'divisapp_favorites';
const RECENTS_STORAGE_KEY = 'divisapp_recents';
const MAX_RECENTS = 5;

export interface ConversionResultSnapshot {
  amount: number;
  fromName: string;
  toName: string;
  toUnit: string;
  result: number;
  fromValue: number;
  toValue: number;
  referenceDate: string;
}

export interface ConversionState {
  amount: string;
  fromCode: string;
  toCode: string;
  result: ConversionResultSnapshot | null;
}

const defaultState: ConversionState = {
  amount: '',
  fromCode: 'uf',
  toCode: 'clp',
  result: null,
};

function getStoredState(): ConversionState {
  if (typeof window === 'undefined') return defaultState;

  try {
    const stored = localStorage.getItem(CONVERSION_STORAGE_KEY);
    if (!stored) return defaultState;

    const parsed = JSON.parse(stored);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.amount === 'string' &&
      typeof parsed.fromCode === 'string' &&
      typeof parsed.toCode === 'string'
    ) {
      // Validate result snapshot if present
      const result = parsed.result;
      const validResult =
        result === null ||
        result === undefined ||
        (typeof result === 'object' &&
          result !== null &&
          typeof result.amount === 'number' &&
          typeof result.fromName === 'string' &&
          typeof result.toName === 'string' &&
          typeof result.toUnit === 'string' &&
          typeof result.result === 'number' &&
          typeof result.fromValue === 'number' &&
          typeof result.toValue === 'number' &&
          typeof result.referenceDate === 'string');

      if (validResult) {
        return {
          amount: parsed.amount,
          fromCode: parsed.fromCode,
          toCode: parsed.toCode,
          result: result ?? null,
        };
      }
    }

    return defaultState;
  } catch {
    return defaultState;
  }
}

function setStoredState(state: ConversionState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONVERSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

let listeners: Array<() => void> = [];
let cachedState: ConversionState | null = null;

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): ConversionState {
  if (cachedState === null) {
    cachedState = getStoredState();
  }
  return cachedState;
}

function getServerSnapshot(): ConversionState {
  return defaultState;
}

function updateState(newState: ConversionState): void {
  cachedState = newState;
  setStoredState(newState);
  listeners.forEach((listener) => listener());
}

interface UsePersistedConversionReturn {
  amount: string;
  fromCode: string;
  toCode: string;
  result: ConversionResultSnapshot | null;
  setAmount: (value: string) => void;
  setFromCode: (value: string) => void;
  setToCode: (value: string) => void;
  setResult: (value: ConversionResultSnapshot | null) => void;
  swapCodes: () => void;
}

export function usePersistedConversion(): UsePersistedConversionReturn {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setAmount = useCallback((value: string) => {
    const current = getSnapshot();
    updateState({ ...current, amount: value });
  }, []);

  const setFromCode = useCallback((value: string) => {
    const current = getSnapshot();
    updateState({ ...current, fromCode: value });
  }, []);

  const setToCode = useCallback((value: string) => {
    const current = getSnapshot();
    updateState({ ...current, toCode: value });
  }, []);

  const setResult = useCallback((value: ConversionResultSnapshot | null) => {
    const current = getSnapshot();
    updateState({ ...current, result: value });
  }, []);

  const swapCodes = useCallback(() => {
    const current = getSnapshot();
    if (current.fromCode === current.toCode) return;
    updateState({
      ...current,
      fromCode: current.toCode,
      toCode: current.fromCode,
    });
  }, []);

  return {
    amount: state.amount,
    fromCode: state.fromCode,
    toCode: state.toCode,
    result: state.result,
    setAmount,
    setFromCode,
    setToCode,
    setResult,
    swapCodes,
  };
}

// Favorites storage

type FavoritesState = string[];

function getStoredFavorites(): FavoritesState {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
}

function setStoredFavorites(favorites: FavoritesState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

let favoritesListeners: Array<() => void> = [];
let cachedFavorites: FavoritesState | null = null;

function subscribeFavorites(listener: () => void): () => void {
  favoritesListeners = [...favoritesListeners, listener];
  return () => {
    favoritesListeners = favoritesListeners.filter((l) => l !== listener);
  };
}

function getFavoritesSnapshot(): FavoritesState {
  if (cachedFavorites === null) {
    cachedFavorites = getStoredFavorites();
  }
  return cachedFavorites;
}

const emptyFavorites: FavoritesState = [];

function getFavoritesServerSnapshot(): FavoritesState {
  return emptyFavorites;
}

function updateFavorites(newFavorites: FavoritesState): void {
  cachedFavorites = newFavorites;
  setStoredFavorites(newFavorites);
  favoritesListeners.forEach((listener) => listener());
}

interface UseFavoritesReturn {
  favorites: FavoritesState;
  isFavorite: (codigo: string) => boolean;
  toggleFavorite: (codigo: string) => void;
  moveFavorite: (codigo: string, direction: 'up' | 'down') => void;
}

export function useFavorites(): UseFavoritesReturn {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot
  );

  const isFavorite = useCallback(
    (codigo: string) => favorites.includes(codigo),
    [favorites]
  );

  const toggleFavorite = useCallback((codigo: string) => {
    const current = getFavoritesSnapshot();
    const newFavorites = current.includes(codigo)
      ? current.filter((c) => c !== codigo)
      : [...current, codigo];
    updateFavorites(newFavorites);
  }, []);

  const moveFavorite = useCallback((codigo: string, direction: 'up' | 'down') => {
    const current = getFavoritesSnapshot();
    const index = current.indexOf(codigo);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= current.length) return;

    const newFavorites = [...current];
    [newFavorites[index], newFavorites[newIndex]] = [newFavorites[newIndex], newFavorites[index]];
    updateFavorites(newFavorites);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    moveFavorite,
  };
}

// Recent indicators storage

type RecentsState = string[];

function getStoredRecents(): RecentsState {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENTS_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed.slice(0, MAX_RECENTS);
    }

    return [];
  } catch {
    return [];
  }
}

function setStoredRecents(recents: RecentsState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(recents));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

let recentsListeners: Array<() => void> = [];
let cachedRecents: RecentsState | null = null;

function subscribeRecents(listener: () => void): () => void {
  recentsListeners = [...recentsListeners, listener];
  return () => {
    recentsListeners = recentsListeners.filter((l) => l !== listener);
  };
}

function getRecentsSnapshot(): RecentsState {
  if (cachedRecents === null) {
    cachedRecents = getStoredRecents();
  }
  return cachedRecents;
}

const emptyRecents: RecentsState = [];

function getRecentsServerSnapshot(): RecentsState {
  return emptyRecents;
}

function updateRecents(newRecents: RecentsState): void {
  cachedRecents = newRecents;
  setStoredRecents(newRecents);
  recentsListeners.forEach((listener) => listener());
}

interface UseRecentIndicatorsReturn {
  recents: RecentsState;
  addRecent: (codigo: string) => void;
}

export function useRecentIndicators(): UseRecentIndicatorsReturn {
  const recents = useSyncExternalStore(
    subscribeRecents,
    getRecentsSnapshot,
    getRecentsServerSnapshot
  );

  const addRecent = useCallback((codigo: string) => {
    const current = getRecentsSnapshot();
    const filtered = current.filter((c) => c !== codigo);
    const newRecents = [codigo, ...filtered].slice(0, MAX_RECENTS);
    updateRecents(newRecents);
  }, []);

  return {
    recents,
    addRecent,
  };
}

// Notification preferences storage

const NOTIFICATION_STORAGE_KEY = 'divisapp_notification_preferences';

export interface NotificationPreferences {
  enabled: boolean;
  indicators: string[];
  triggerType: 'daily' | 'threshold' | 'significant';
  thresholds: Record<string, { type: 'above' | 'below'; value: number }>;
  sensitivity: 0.5 | 1 | 2 | 5;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  maxDaily: 1 | 2 | 3 | 5 | null;
}

const defaultNotificationPreferences: NotificationPreferences = {
  enabled: false,
  indicators: [],
  triggerType: 'daily',
  thresholds: {},
  sensitivity: 1,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  maxDaily: 3,
};

function getStoredNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return defaultNotificationPreferences;

  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return defaultNotificationPreferences;

    const parsed = JSON.parse(stored);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.enabled === 'boolean' &&
      Array.isArray(parsed.indicators) &&
      ['daily', 'threshold', 'significant'].includes(parsed.triggerType) &&
      typeof parsed.thresholds === 'object' &&
      [0.5, 1, 2, 5].includes(parsed.sensitivity) &&
      typeof parsed.quietHours === 'object' &&
      typeof parsed.quietHours.enabled === 'boolean' &&
      typeof parsed.quietHours.start === 'string' &&
      typeof parsed.quietHours.end === 'string' &&
      (parsed.maxDaily === null || [1, 2, 3, 5].includes(parsed.maxDaily))
    ) {
      return parsed as NotificationPreferences;
    }

    return defaultNotificationPreferences;
  } catch {
    return defaultNotificationPreferences;
  }
}

function setStoredNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

let notificationListeners: Array<() => void> = [];
let cachedNotificationPreferences: NotificationPreferences | null = null;

function subscribeNotifications(listener: () => void): () => void {
  notificationListeners = [...notificationListeners, listener];
  return () => {
    notificationListeners = notificationListeners.filter((l) => l !== listener);
  };
}

function getNotificationPreferencesSnapshot(): NotificationPreferences {
  if (cachedNotificationPreferences === null) {
    cachedNotificationPreferences = getStoredNotificationPreferences();
  }
  return cachedNotificationPreferences;
}

function getNotificationPreferencesServerSnapshot(): NotificationPreferences {
  return defaultNotificationPreferences;
}

function updateNotificationPreferences(newPrefs: NotificationPreferences): void {
  cachedNotificationPreferences = newPrefs;
  setStoredNotificationPreferences(newPrefs);
  notificationListeners.forEach((listener) => listener());
}

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences;
  setEnabled: (enabled: boolean) => void;
  setIndicators: (indicators: string[]) => void;
  toggleIndicator: (codigo: string) => void;
  setTriggerType: (type: 'daily' | 'threshold' | 'significant') => void;
  setThreshold: (codigo: string, threshold: { type: 'above' | 'below'; value: number } | null) => void;
  setSensitivity: (value: 0.5 | 1 | 2 | 5) => void;
  setQuietHours: (quietHours: { enabled: boolean; start: string; end: string }) => void;
  setMaxDaily: (value: 1 | 2 | 3 | 5 | null) => void;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const preferences = useSyncExternalStore(
    subscribeNotifications,
    getNotificationPreferencesSnapshot,
    getNotificationPreferencesServerSnapshot
  );

  const setEnabled = useCallback((enabled: boolean) => {
    const current = getNotificationPreferencesSnapshot();
    updateNotificationPreferences({ ...current, enabled });
  }, []);

  const setIndicators = useCallback((indicators: string[]) => {
    const current = getNotificationPreferencesSnapshot();
    updateNotificationPreferences({ ...current, indicators });
  }, []);

  const toggleIndicator = useCallback((codigo: string) => {
    const current = getNotificationPreferencesSnapshot();
    const newIndicators = current.indicators.includes(codigo)
      ? current.indicators.filter((c) => c !== codigo)
      : [...current.indicators, codigo];
    updateNotificationPreferences({ ...current, indicators: newIndicators });
  }, []);

  const setTriggerType = useCallback((triggerType: 'daily' | 'threshold' | 'significant') => {
    const current = getNotificationPreferencesSnapshot();
    updateNotificationPreferences({ ...current, triggerType });
  }, []);

  const setThreshold = useCallback(
    (codigo: string, threshold: { type: 'above' | 'below'; value: number } | null) => {
      const current = getNotificationPreferencesSnapshot();
      const newThresholds = { ...current.thresholds };
      if (threshold === null) {
        delete newThresholds[codigo];
      } else {
        newThresholds[codigo] = threshold;
      }
      updateNotificationPreferences({ ...current, thresholds: newThresholds });
    },
    []
  );

  const setSensitivity = useCallback((sensitivity: 0.5 | 1 | 2 | 5) => {
    const current = getNotificationPreferencesSnapshot();
    updateNotificationPreferences({ ...current, sensitivity });
  }, []);

  const setQuietHours = useCallback(
    (quietHours: { enabled: boolean; start: string; end: string }) => {
      const current = getNotificationPreferencesSnapshot();
      updateNotificationPreferences({ ...current, quietHours });
    },
    []
  );

  const setMaxDaily = useCallback((maxDaily: 1 | 2 | 3 | 5 | null) => {
    const current = getNotificationPreferencesSnapshot();
    updateNotificationPreferences({ ...current, maxDaily });
  }, []);

  return {
    preferences,
    setEnabled,
    setIndicators,
    toggleIndicator,
    setTriggerType,
    setThreshold,
    setSensitivity,
    setQuietHours,
    setMaxDaily,
  };
}
