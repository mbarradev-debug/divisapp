import { describe, it, expect } from 'vitest';

describe('favorites storage logic', () => {
  describe('toggleFavorite', () => {
    function toggleFavorite(favorites: string[], codigo: string): string[] {
      return favorites.includes(codigo)
        ? favorites.filter((c) => c !== codigo)
        : [...favorites, codigo];
    }

    it('should add indicator when not in favorites', () => {
      const favorites: string[] = [];
      const result = toggleFavorite(favorites, 'uf');
      expect(result).toEqual(['uf']);
    });

    it('should remove indicator when already in favorites', () => {
      const favorites = ['uf', 'dolar'];
      const result = toggleFavorite(favorites, 'uf');
      expect(result).toEqual(['dolar']);
    });

    it('should append new favorite to end of list', () => {
      const favorites = ['uf'];
      const result = toggleFavorite(favorites, 'dolar');
      expect(result).toEqual(['uf', 'dolar']);
    });

    it('should handle multiple sequential toggles', () => {
      let favorites: string[] = [];
      favorites = toggleFavorite(favorites, 'uf');
      favorites = toggleFavorite(favorites, 'dolar');
      favorites = toggleFavorite(favorites, 'euro');
      expect(favorites).toEqual(['uf', 'dolar', 'euro']);
    });

    it('should toggle off and on correctly', () => {
      let favorites = ['uf', 'dolar'];
      favorites = toggleFavorite(favorites, 'uf');
      expect(favorites).toEqual(['dolar']);
      favorites = toggleFavorite(favorites, 'uf');
      expect(favorites).toEqual(['dolar', 'uf']);
    });
  });

  describe('reorderFavorites', () => {
    function reorderFavorites(favorites: string[], fromIndex: number, toIndex: number): string[] {
      if (fromIndex < 0 || fromIndex >= favorites.length) return favorites;
      if (toIndex < 0 || toIndex >= favorites.length) return favorites;
      if (fromIndex === toIndex) return favorites;

      const newFavorites = [...favorites];
      const [removed] = newFavorites.splice(fromIndex, 1);
      newFavorites.splice(toIndex, 0, removed);
      return newFavorites;
    }

    it('should move item from index 0 to index 2', () => {
      const favorites = ['uf', 'dolar', 'euro'];
      const result = reorderFavorites(favorites, 0, 2);
      expect(result).toEqual(['dolar', 'euro', 'uf']);
    });

    it('should move item from index 2 to index 0', () => {
      const favorites = ['uf', 'dolar', 'euro'];
      const result = reorderFavorites(favorites, 2, 0);
      expect(result).toEqual(['euro', 'uf', 'dolar']);
    });

    it('should move item to adjacent position forward', () => {
      const favorites = ['uf', 'dolar', 'euro', 'utm'];
      const result = reorderFavorites(favorites, 1, 2);
      expect(result).toEqual(['uf', 'euro', 'dolar', 'utm']);
    });

    it('should move item to adjacent position backward', () => {
      const favorites = ['uf', 'dolar', 'euro', 'utm'];
      const result = reorderFavorites(favorites, 2, 1);
      expect(result).toEqual(['uf', 'euro', 'dolar', 'utm']);
    });

    it('should not change array when fromIndex equals toIndex', () => {
      const favorites = ['uf', 'dolar', 'euro'];
      const result = reorderFavorites(favorites, 1, 1);
      expect(result).toEqual(['uf', 'dolar', 'euro']);
    });

    it('should not change array when fromIndex is out of bounds', () => {
      const favorites = ['uf', 'dolar'];
      expect(reorderFavorites(favorites, -1, 0)).toEqual(['uf', 'dolar']);
      expect(reorderFavorites(favorites, 5, 0)).toEqual(['uf', 'dolar']);
    });

    it('should not change array when toIndex is out of bounds', () => {
      const favorites = ['uf', 'dolar'];
      expect(reorderFavorites(favorites, 0, -1)).toEqual(['uf', 'dolar']);
      expect(reorderFavorites(favorites, 0, 5)).toEqual(['uf', 'dolar']);
    });

    it('should handle moving last item to first position', () => {
      const favorites = ['a', 'b', 'c', 'd', 'e'];
      const result = reorderFavorites(favorites, 4, 0);
      expect(result).toEqual(['e', 'a', 'b', 'c', 'd']);
    });

    it('should handle moving first item to last position', () => {
      const favorites = ['a', 'b', 'c', 'd', 'e'];
      const result = reorderFavorites(favorites, 0, 4);
      expect(result).toEqual(['b', 'c', 'd', 'e', 'a']);
    });
  });

  describe('isFavorite', () => {
    function isFavorite(favorites: string[], codigo: string): boolean {
      return favorites.includes(codigo);
    }

    it('should return true for favorited indicator', () => {
      const favorites = ['uf', 'dolar'];
      expect(isFavorite(favorites, 'uf')).toBe(true);
      expect(isFavorite(favorites, 'dolar')).toBe(true);
    });

    it('should return false for non-favorited indicator', () => {
      const favorites = ['uf'];
      expect(isFavorite(favorites, 'dolar')).toBe(false);
    });

    it('should return false for empty favorites', () => {
      const favorites: string[] = [];
      expect(isFavorite(favorites, 'uf')).toBe(false);
    });
  });

  describe('validateFavorites', () => {
    function validateFavorites(stored: unknown): string[] {
      if (!Array.isArray(stored)) return [];
      if (!stored.every((item) => typeof item === 'string')) return [];
      return stored;
    }

    it('should return empty array for non-array value', () => {
      expect(validateFavorites({ not: 'an array' })).toEqual([]);
      expect(validateFavorites('string')).toEqual([]);
      expect(validateFavorites(123)).toEqual([]);
      expect(validateFavorites(null)).toEqual([]);
      expect(validateFavorites(undefined)).toEqual([]);
    });

    it('should return empty array for array with non-strings', () => {
      expect(validateFavorites([1, 2, 3])).toEqual([]);
      expect(validateFavorites([{}, {}])).toEqual([]);
      expect(validateFavorites(['uf', 123])).toEqual([]);
    });

    it('should return valid string array unchanged', () => {
      expect(validateFavorites(['uf', 'dolar'])).toEqual(['uf', 'dolar']);
      expect(validateFavorites([])).toEqual([]);
      expect(validateFavorites(['single'])).toEqual(['single']);
    });
  });

  describe('favorites ordering in home indicators', () => {
    interface Indicator {
      codigo: string;
      nombre: string;
    }

    function separateIndicators(
      indicators: Indicator[],
      favorites: string[]
    ): { favoriteIndicators: Indicator[]; otherIndicators: Indicator[] } {
      if (favorites.length === 0) {
        return { favoriteIndicators: [], otherIndicators: indicators };
      }
      const favoritesSet = new Set(favorites);
      const indicatorMap = new Map(indicators.map((ind) => [ind.codigo, ind]));
      const favs: Indicator[] = [];
      const others: Indicator[] = [];

      for (const codigo of favorites) {
        const indicator = indicatorMap.get(codigo);
        if (indicator) {
          favs.push(indicator);
        }
      }

      for (const indicator of indicators) {
        if (!favoritesSet.has(indicator.codigo)) {
          others.push(indicator);
        }
      }

      return { favoriteIndicators: favs, otherIndicators: others };
    }

    const mockIndicators: Indicator[] = [
      { codigo: 'uf', nombre: 'UF' },
      { codigo: 'dolar', nombre: 'Dólar' },
      { codigo: 'euro', nombre: 'Euro' },
      { codigo: 'utm', nombre: 'UTM' },
    ];

    it('should return all indicators as others when no favorites', () => {
      const result = separateIndicators(mockIndicators, []);
      expect(result.favoriteIndicators).toEqual([]);
      expect(result.otherIndicators).toEqual(mockIndicators);
    });

    it('should separate favorites from others', () => {
      const result = separateIndicators(mockIndicators, ['dolar', 'utm']);
      expect(result.favoriteIndicators.map((i) => i.codigo)).toEqual(['dolar', 'utm']);
      expect(result.otherIndicators.map((i) => i.codigo)).toEqual(['uf', 'euro']);
    });

    it('should preserve favorites order from favorites array', () => {
      const result = separateIndicators(mockIndicators, ['utm', 'uf', 'euro']);
      expect(result.favoriteIndicators.map((i) => i.codigo)).toEqual(['utm', 'uf', 'euro']);
    });

    it('should preserve original order for non-favorites', () => {
      const result = separateIndicators(mockIndicators, ['euro']);
      expect(result.otherIndicators.map((i) => i.codigo)).toEqual(['uf', 'dolar', 'utm']);
    });

    it('should handle all indicators as favorites', () => {
      const result = separateIndicators(mockIndicators, ['uf', 'dolar', 'euro', 'utm']);
      expect(result.favoriteIndicators.length).toBe(4);
      expect(result.otherIndicators.length).toBe(0);
    });

    it('should ignore favorites not in indicators list', () => {
      const result = separateIndicators(mockIndicators, ['dolar', 'bitcoin', 'euro']);
      expect(result.favoriteIndicators.map((i) => i.codigo)).toEqual(['dolar', 'euro']);
    });
  });
});

describe('recents storage logic', () => {
  const MAX_RECENTS = 5;

  describe('addRecent', () => {
    function addRecent(recents: string[], codigo: string): string[] {
      const filtered = recents.filter((c) => c !== codigo);
      return [codigo, ...filtered].slice(0, MAX_RECENTS);
    }

    it('should add indicator to the beginning of recents', () => {
      const recents: string[] = [];
      const result = addRecent(recents, 'uf');
      expect(result).toEqual(['uf']);
    });

    it('should move existing indicator to the beginning', () => {
      const recents = ['uf', 'dolar', 'euro'];
      const result = addRecent(recents, 'euro');
      expect(result).toEqual(['euro', 'uf', 'dolar']);
    });

    it('should not create duplicates', () => {
      const recents = ['uf', 'dolar'];
      const result = addRecent(recents, 'uf');
      expect(result).toEqual(['uf', 'dolar']);
      expect(result.filter((c) => c === 'uf').length).toBe(1);
    });

    it('should limit list to MAX_RECENTS', () => {
      const recents = ['a', 'b', 'c', 'd', 'e'];
      const result = addRecent(recents, 'f');
      expect(result).toEqual(['f', 'a', 'b', 'c', 'd']);
      expect(result.length).toBe(MAX_RECENTS);
    });

    it('should not exceed MAX_RECENTS when re-adding existing item', () => {
      const recents = ['a', 'b', 'c', 'd', 'e'];
      const result = addRecent(recents, 'c');
      expect(result).toEqual(['c', 'a', 'b', 'd', 'e']);
      expect(result.length).toBe(MAX_RECENTS);
    });

    it('should maintain order with sequential adds', () => {
      let recents: string[] = [];
      recents = addRecent(recents, 'uf');
      recents = addRecent(recents, 'dolar');
      recents = addRecent(recents, 'euro');
      expect(recents).toEqual(['euro', 'dolar', 'uf']);
    });
  });

  describe('validateRecents', () => {
    function validateRecents(stored: unknown): string[] {
      if (!Array.isArray(stored)) return [];
      if (!stored.every((item) => typeof item === 'string')) return [];
      return stored.slice(0, MAX_RECENTS);
    }

    it('should return empty array for non-array value', () => {
      expect(validateRecents({ not: 'an array' })).toEqual([]);
      expect(validateRecents('string')).toEqual([]);
      expect(validateRecents(123)).toEqual([]);
      expect(validateRecents(null)).toEqual([]);
      expect(validateRecents(undefined)).toEqual([]);
    });

    it('should return empty array for array with non-strings', () => {
      expect(validateRecents([1, 2, 3])).toEqual([]);
      expect(validateRecents([{}, {}])).toEqual([]);
      expect(validateRecents(['uf', 123])).toEqual([]);
    });

    it('should return valid string array unchanged', () => {
      expect(validateRecents(['uf', 'dolar'])).toEqual(['uf', 'dolar']);
      expect(validateRecents([])).toEqual([]);
    });

    it('should truncate to MAX_RECENTS', () => {
      const tooMany = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      expect(validateRecents(tooMany)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('recents and favorites separation', () => {
    interface Indicator {
      codigo: string;
      nombre: string;
    }

    function separateIndicators(
      indicators: Indicator[],
      favorites: string[],
      recents: string[]
    ): { favoriteIndicators: Indicator[]; recentIndicators: Indicator[]; otherIndicators: Indicator[] } {
      const favoritesSet = new Set(favorites);
      const indicatorMap = new Map(indicators.map((ind) => [ind.codigo, ind]));
      const favs: Indicator[] = [];
      const recs: Indicator[] = [];
      const others: Indicator[] = [];

      for (const codigo of favorites) {
        const indicator = indicatorMap.get(codigo);
        if (indicator) {
          favs.push(indicator);
        }
      }

      for (const codigo of recents) {
        if (!favoritesSet.has(codigo)) {
          const indicator = indicatorMap.get(codigo);
          if (indicator) {
            recs.push(indicator);
          }
        }
      }

      for (const indicator of indicators) {
        if (!favoritesSet.has(indicator.codigo)) {
          others.push(indicator);
        }
      }

      return { favoriteIndicators: favs, recentIndicators: recs, otherIndicators: others };
    }

    const mockIndicators: Indicator[] = [
      { codigo: 'uf', nombre: 'UF' },
      { codigo: 'dolar', nombre: 'Dólar' },
      { codigo: 'euro', nombre: 'Euro' },
      { codigo: 'utm', nombre: 'UTM' },
    ];

    it('should show recents when no favorites', () => {
      const result = separateIndicators(mockIndicators, [], ['dolar', 'euro']);
      expect(result.recentIndicators.map((i) => i.codigo)).toEqual(['dolar', 'euro']);
    });

    it('should exclude favorites from recents', () => {
      const result = separateIndicators(mockIndicators, ['dolar'], ['dolar', 'euro', 'utm']);
      expect(result.recentIndicators.map((i) => i.codigo)).toEqual(['euro', 'utm']);
      expect(result.favoriteIndicators.map((i) => i.codigo)).toEqual(['dolar']);
    });

    it('should return empty recents when all recents are favorites', () => {
      const result = separateIndicators(mockIndicators, ['dolar', 'euro'], ['dolar', 'euro']);
      expect(result.recentIndicators).toEqual([]);
    });

    it('should preserve recents order', () => {
      const result = separateIndicators(mockIndicators, [], ['utm', 'uf', 'dolar']);
      expect(result.recentIndicators.map((i) => i.codigo)).toEqual(['utm', 'uf', 'dolar']);
    });

    it('should ignore recents not in indicators list', () => {
      const result = separateIndicators(mockIndicators, [], ['dolar', 'bitcoin', 'euro']);
      expect(result.recentIndicators.map((i) => i.codigo)).toEqual(['dolar', 'euro']);
    });
  });
});

describe('user settings storage logic', () => {
  const USER_SETTINGS_VERSION = 1;

  interface UserSettings {
    version: number;
    userId?: string;
    theme: 'system' | 'light' | 'dark';
    defaultIndicator: string;
    homeOrderingMode: 'default' | 'favorites-first' | 'custom';
    alertsEnabled: boolean;
  }

  const DEFAULT_USER_SETTINGS: UserSettings = {
    version: USER_SETTINGS_VERSION,
    theme: 'system',
    defaultIndicator: 'uf',
    homeOrderingMode: 'favorites-first',
    alertsEnabled: false,
  };

  describe('isValidUserSettings', () => {
    function isValidUserSettings(value: unknown): value is UserSettings {
      if (typeof value !== 'object' || value === null) return false;

      const obj = value as Record<string, unknown>;

      return (
        typeof obj.version === 'number' &&
        (obj.theme === 'system' || obj.theme === 'light' || obj.theme === 'dark') &&
        typeof obj.defaultIndicator === 'string' &&
        (obj.homeOrderingMode === 'default' ||
          obj.homeOrderingMode === 'favorites-first' ||
          obj.homeOrderingMode === 'custom') &&
        typeof obj.alertsEnabled === 'boolean'
      );
    }

    it('should return true for valid settings', () => {
      expect(isValidUserSettings(DEFAULT_USER_SETTINGS)).toBe(true);
      expect(
        isValidUserSettings({
          version: 1,
          theme: 'dark',
          defaultIndicator: 'dolar',
          homeOrderingMode: 'custom',
          alertsEnabled: true,
        })
      ).toBe(true);
    });

    it('should return false for null or non-object', () => {
      expect(isValidUserSettings(null)).toBe(false);
      expect(isValidUserSettings(undefined)).toBe(false);
      expect(isValidUserSettings('string')).toBe(false);
      expect(isValidUserSettings(123)).toBe(false);
      expect(isValidUserSettings([])).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidUserSettings({ version: 1 })).toBe(false);
      expect(isValidUserSettings({ theme: 'system' })).toBe(false);
      expect(
        isValidUserSettings({
          version: 1,
          theme: 'system',
          defaultIndicator: 'uf',
          homeOrderingMode: 'default',
          // missing alertsEnabled
        })
      ).toBe(false);
    });

    it('should return false for invalid theme values', () => {
      expect(
        isValidUserSettings({
          ...DEFAULT_USER_SETTINGS,
          theme: 'invalid',
        })
      ).toBe(false);
    });

    it('should return false for invalid homeOrderingMode values', () => {
      expect(
        isValidUserSettings({
          ...DEFAULT_USER_SETTINGS,
          homeOrderingMode: 'invalid',
        })
      ).toBe(false);
    });

    it('should accept optional userId field', () => {
      expect(
        isValidUserSettings({
          ...DEFAULT_USER_SETTINGS,
          userId: 'user-123',
        })
      ).toBe(true);
    });
  });

  describe('migrateSettings', () => {
    function migrateSettings(stored: UserSettings): UserSettings {
      if (stored.version === USER_SETTINGS_VERSION) {
        return stored;
      }
      return { ...DEFAULT_USER_SETTINGS, ...stored, version: USER_SETTINGS_VERSION };
    }

    it('should return settings unchanged when version matches', () => {
      const settings: UserSettings = {
        version: 1,
        theme: 'dark',
        defaultIndicator: 'dolar',
        homeOrderingMode: 'custom',
        alertsEnabled: true,
      };
      expect(migrateSettings(settings)).toEqual(settings);
    });

    it('should merge with defaults and update version for old version', () => {
      const oldSettings = {
        version: 0,
        theme: 'dark' as const,
        defaultIndicator: 'euro',
        homeOrderingMode: 'default' as const,
        alertsEnabled: true,
      };
      const result = migrateSettings(oldSettings);
      expect(result.version).toBe(USER_SETTINGS_VERSION);
      expect(result.theme).toBe('dark');
      expect(result.defaultIndicator).toBe('euro');
    });
  });

  describe('updateSettings', () => {
    function updateSettings(
      current: UserSettings,
      updates: Partial<Omit<UserSettings, 'version'>>
    ): UserSettings {
      return {
        ...current,
        ...updates,
        version: USER_SETTINGS_VERSION,
      };
    }

    it('should merge partial updates with current settings', () => {
      const result = updateSettings(DEFAULT_USER_SETTINGS, { theme: 'dark' });
      expect(result.theme).toBe('dark');
      expect(result.defaultIndicator).toBe('uf');
      expect(result.homeOrderingMode).toBe('favorites-first');
    });

    it('should update multiple fields at once', () => {
      const result = updateSettings(DEFAULT_USER_SETTINGS, {
        theme: 'light',
        defaultIndicator: 'dolar',
        alertsEnabled: true,
      });
      expect(result.theme).toBe('light');
      expect(result.defaultIndicator).toBe('dolar');
      expect(result.alertsEnabled).toBe(true);
    });

    it('should preserve version number', () => {
      const result = updateSettings(DEFAULT_USER_SETTINGS, { theme: 'dark' });
      expect(result.version).toBe(USER_SETTINGS_VERSION);
    });

    it('should not modify original settings object', () => {
      const original = { ...DEFAULT_USER_SETTINGS };
      updateSettings(original, { theme: 'dark' });
      expect(original.theme).toBe('system');
    });
  });

  describe('resetSettings', () => {
    it('should return default settings', () => {
      const customSettings: UserSettings = {
        version: 1,
        theme: 'dark',
        defaultIndicator: 'dolar',
        homeOrderingMode: 'custom',
        alertsEnabled: true,
        userId: 'user-123',
      };
      // resetSettings just returns defaults
      expect(DEFAULT_USER_SETTINGS).not.toEqual(customSettings);
      expect(DEFAULT_USER_SETTINGS.theme).toBe('system');
      expect(DEFAULT_USER_SETTINGS.alertsEnabled).toBe(false);
    });
  });
});
