import { useSyncExternalStore, useCallback } from 'react';

const CONVERSION_STORAGE_KEY = 'divisapp_last_conversion';

export interface ConversionResultSnapshot {
  amount: number;
  fromName: string;
  toName: string;
  toUnit: string;
  result: number;
}

export interface ConversionState {
  amount: string;
  fromCode: string;
  toCode: string;
  result: ConversionResultSnapshot | null;
}

const defaultState: ConversionState = {
  amount: '',
  fromCode: '',
  toCode: '',
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
          typeof result.result === 'number');

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

  return {
    amount: state.amount,
    fromCode: state.fromCode,
    toCode: state.toCode,
    result: state.result,
    setAmount,
    setFromCode,
    setToCode,
    setResult,
  };
}
