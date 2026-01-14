import { describe, it, expect } from 'vitest';
import {
  deriveTrendSignals,
  TREND_FLAT_THRESHOLD,
  VOLATILITY_LOW_THRESHOLD,
  VOLATILITY_HIGH_THRESHOLD,
  DEFAULT_WINDOW_LENGTH,
} from '../trend-signals';
import type { SerieItem } from '../api/mindicador';

function createSerie(values: number[], startDate = '2024-01-01'): SerieItem[] {
  return values.map((valor, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    return {
      fecha: date.toISOString(),
      valor,
    };
  });
}

describe('deriveTrendSignals', () => {
  describe('trend derivation', () => {
    it('returns up trend when percentage change exceeds positive threshold', () => {
      const serie = createSerie([100, 101, 102, 103, 104, 105]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('up');
      expect(result.trendMagnitude).toBe(5);
    });

    it('returns down trend when percentage change exceeds negative threshold', () => {
      const serie = createSerie([100, 99, 98, 97, 96, 95]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('down');
      expect(result.trendMagnitude).toBe(-5);
    });

    it('returns flat trend when percentage change is within threshold', () => {
      const serie = createSerie([100, 100.1, 100.2, 100.3, 100.4, 100.5]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('flat');
      expect(Math.abs(result.trendMagnitude)).toBeLessThanOrEqual(TREND_FLAT_THRESHOLD);
    });

    it('correctly handles flat trend at exact threshold boundary', () => {
      const serie = createSerie([100, 100.5]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('flat');
    });

    it('returns up trend when just above threshold', () => {
      const serie = createSerie([100, 100.51]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('up');
    });

    it('returns down trend when just below negative threshold', () => {
      const serie = createSerie([100, 99.49]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('down');
    });
  });

  describe('trend magnitude', () => {
    it('calculates correct percentage change', () => {
      const serie = createSerie([100, 110]);
      const result = deriveTrendSignals(serie);
      expect(result.trendMagnitude).toBe(10);
    });

    it('handles negative percentage change', () => {
      const serie = createSerie([100, 90]);
      const result = deriveTrendSignals(serie);
      expect(result.trendMagnitude).toBe(-10);
    });

    it('rounds to two decimal places', () => {
      const serie = createSerie([100, 100.333]);
      const result = deriveTrendSignals(serie);
      expect(result.trendMagnitude).toBe(0.33);
    });

    it('handles large percentage changes', () => {
      const serie = createSerie([100, 200]);
      const result = deriveTrendSignals(serie);
      expect(result.trendMagnitude).toBe(100);
    });
  });

  describe('volatility derivation', () => {
    it('returns low volatility for stable values', () => {
      const serie = createSerie([100, 100, 100, 100, 100]);
      const result = deriveTrendSignals(serie);
      expect(result.volatility).toBe('low');
    });

    it('returns high volatility for widely varying values', () => {
      const serie = createSerie([100, 150, 80, 160, 70, 140]);
      const result = deriveTrendSignals(serie);
      expect(result.volatility).toBe('high');
    });

    it('returns medium volatility for moderate variation', () => {
      const serie = createSerie([100, 102, 98, 103, 97, 101]);
      const result = deriveTrendSignals(serie);
      expect(result.volatility).toBe('medium');
    });
  });

  describe('window length', () => {
    it('uses default window length of 30', () => {
      expect(DEFAULT_WINDOW_LENGTH).toBe(30);
    });

    it('respects custom window length', () => {
      const serie = createSerie([100, 105, 110, 115, 120, 125]);
      const result5 = deriveTrendSignals(serie, { windowLength: 2 });
      expect(result5.trendMagnitude).toBe(4.17);
    });

    it('handles window larger than series', () => {
      const serie = createSerie([100, 110]);
      const result = deriveTrendSignals(serie, { windowLength: 100 });
      expect(result.trendMagnitude).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('returns neutral signals for empty series', () => {
      const result = deriveTrendSignals([]);
      expect(result.trend).toBe('flat');
      expect(result.trendMagnitude).toBe(0);
      expect(result.volatility).toBe('low');
    });

    it('returns neutral signals for single item series', () => {
      const serie = createSerie([100]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('flat');
      expect(result.trendMagnitude).toBe(0);
      expect(result.volatility).toBe('low');
    });

    it('handles zero start value', () => {
      const serie = createSerie([0, 100]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('flat');
      expect(result.trendMagnitude).toBe(0);
    });

    it('handles negative values', () => {
      const serie = createSerie([-100, -90]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('up');
      expect(result.trendMagnitude).toBe(10);
    });

    it('handles zero end value', () => {
      const serie = createSerie([100, 0]);
      const result = deriveTrendSignals(serie);
      expect(result.trend).toBe('down');
      expect(result.trendMagnitude).toBe(-100);
    });
  });

  describe('determinism', () => {
    it('produces identical output for identical input', () => {
      const serie = createSerie([100, 105, 103, 108, 106, 110]);
      const result1 = deriveTrendSignals(serie);
      const result2 = deriveTrendSignals(serie);
      expect(result1).toEqual(result2);
    });

    it('produces identical output regardless of input order', () => {
      const serieOrdered = createSerie([100, 105, 110]);
      const serieUnordered: SerieItem[] = [
        { fecha: '2024-01-03T00:00:00.000Z', valor: 110 },
        { fecha: '2024-01-01T00:00:00.000Z', valor: 100 },
        { fecha: '2024-01-02T00:00:00.000Z', valor: 105 },
      ];
      const result1 = deriveTrendSignals(serieOrdered);
      const result2 = deriveTrendSignals(serieUnordered);
      expect(result1).toEqual(result2);
    });
  });

  describe('threshold constants', () => {
    it('has correct trend flat threshold', () => {
      expect(TREND_FLAT_THRESHOLD).toBe(0.5);
    });

    it('has correct volatility low threshold', () => {
      expect(VOLATILITY_LOW_THRESHOLD).toBe(1.0);
    });

    it('has correct volatility high threshold', () => {
      expect(VOLATILITY_HIGH_THRESHOLD).toBe(5.0);
    });
  });
});
