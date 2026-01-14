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

  describe('moveFavorite', () => {
    function moveFavorite(favorites: string[], codigo: string, direction: 'up' | 'down'): string[] {
      const index = favorites.indexOf(codigo);
      if (index === -1) return favorites;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= favorites.length) return favorites;

      const newFavorites = [...favorites];
      [newFavorites[index], newFavorites[newIndex]] = [newFavorites[newIndex], newFavorites[index]];
      return newFavorites;
    }

    it('should move favorite up in the list', () => {
      const favorites = ['uf', 'dolar', 'euro'];
      const result = moveFavorite(favorites, 'dolar', 'up');
      expect(result).toEqual(['dolar', 'uf', 'euro']);
    });

    it('should move favorite down in the list', () => {
      const favorites = ['uf', 'dolar', 'euro'];
      const result = moveFavorite(favorites, 'dolar', 'down');
      expect(result).toEqual(['uf', 'euro', 'dolar']);
    });

    it('should not move first item up (boundary)', () => {
      const favorites = ['uf', 'dolar'];
      const result = moveFavorite(favorites, 'uf', 'up');
      expect(result).toEqual(['uf', 'dolar']);
    });

    it('should not move last item down (boundary)', () => {
      const favorites = ['uf', 'dolar'];
      const result = moveFavorite(favorites, 'dolar', 'down');
      expect(result).toEqual(['uf', 'dolar']);
    });

    it('should not move non-existent indicator', () => {
      const favorites = ['uf', 'dolar'];
      const result = moveFavorite(favorites, 'euro', 'up');
      expect(result).toEqual(['uf', 'dolar']);
    });

    it('should swap adjacent items correctly with multiple moves', () => {
      const favorites = ['a', 'b', 'c', 'd'];
      let result = moveFavorite(favorites, 'c', 'up');
      expect(result).toEqual(['a', 'c', 'b', 'd']);

      result = moveFavorite(result, 'c', 'up');
      expect(result).toEqual(['c', 'a', 'b', 'd']);
    });

    it('should move item to last position', () => {
      let favorites = ['uf', 'dolar', 'euro'];
      favorites = moveFavorite(favorites, 'uf', 'down');
      expect(favorites).toEqual(['dolar', 'uf', 'euro']);
      favorites = moveFavorite(favorites, 'uf', 'down');
      expect(favorites).toEqual(['dolar', 'euro', 'uf']);
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
