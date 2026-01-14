import { describe, it, expect } from 'vitest';
import { composeInsight, type ComposeInsightInput } from '../indicator-insight';
import type { IndicatorContext } from '../indicator-context';
import type { TrendSignals } from '../trend-signals';

describe('composeInsight', () => {
  const mockContext: IndicatorContext = {
    code: 'dolar',
    description: 'Official observed US dollar exchange rate in Chilean pesos.',
    represents:
      'The average interbank exchange rate for the US dollar, published daily by the Central Bank of Chile.',
    implications: {
      upward:
        'The Chilean peso weakens relative to the US dollar. Imports become more expensive; exports become more competitive.',
      downward:
        'The Chilean peso strengthens relative to the US dollar. Imports become cheaper; exports become less competitive.',
    },
  };

  const mockSignals: TrendSignals = {
    trend: 'up',
    trendMagnitude: 2.5,
    volatility: 'medium',
  };

  it('should compose insight with all required fields', () => {
    const input: ComposeInsightInput = {
      context: mockContext,
      signals: mockSignals,
    };

    const insight = composeInsight(input);

    expect(insight).toEqual({
      indicatorCode: 'dolar',
      trend: 'up',
      trendMagnitude: 2.5,
      volatility: 'medium',
      contextualSummary: {
        description: 'Official observed US dollar exchange rate in Chilean pesos.',
        represents:
          'The average interbank exchange rate for the US dollar, published daily by the Central Bank of Chile.',
      },
      implications: {
        upward:
          'The Chilean peso weakens relative to the US dollar. Imports become more expensive; exports become more competitive.',
        downward:
          'The Chilean peso strengthens relative to the US dollar. Imports become cheaper; exports become less competitive.',
      },
    });
  });

  it('should preserve exact trend value from signals', () => {
    const testCases: Array<{ trend: TrendSignals['trend'] }> = [
      { trend: 'up' },
      { trend: 'down' },
      { trend: 'flat' },
    ];

    testCases.forEach(({ trend }) => {
      const insight = composeInsight({
        context: mockContext,
        signals: { ...mockSignals, trend },
      });

      expect(insight.trend).toBe(trend);
    });
  });

  it('should preserve exact volatility value from signals', () => {
    const testCases: Array<{ volatility: TrendSignals['volatility'] }> = [
      { volatility: 'low' },
      { volatility: 'medium' },
      { volatility: 'high' },
    ];

    testCases.forEach(({ volatility }) => {
      const insight = composeInsight({
        context: mockContext,
        signals: { ...mockSignals, volatility },
      });

      expect(insight.volatility).toBe(volatility);
    });
  });

  it('should preserve exact trendMagnitude from signals', () => {
    const testCases = [0, 0.5, 2.5, 10.75, -3.25];

    testCases.forEach((trendMagnitude) => {
      const insight = composeInsight({
        context: mockContext,
        signals: { ...mockSignals, trendMagnitude },
      });

      expect(insight.trendMagnitude).toBe(trendMagnitude);
    });
  });

  it('should produce identical output for identical inputs', () => {
    const input: ComposeInsightInput = {
      context: mockContext,
      signals: mockSignals,
    };

    const insight1 = composeInsight(input);
    const insight2 = composeInsight(input);

    expect(insight1).toEqual(insight2);
  });

  it('should work with different indicator codes', () => {
    const ufContext: IndicatorContext = {
      code: 'uf',
      description: 'Unidad de Fomento',
      represents: 'A standardized measure',
      implications: {
        upward: 'Reflects accumulated inflation.',
        downward: 'Indicates deflation.',
      },
    };

    const insight = composeInsight({
      context: ufContext,
      signals: { trend: 'down', trendMagnitude: -1.2, volatility: 'low' },
    });

    expect(insight.indicatorCode).toBe('uf');
    expect(insight.trend).toBe('down');
    expect(insight.trendMagnitude).toBe(-1.2);
    expect(insight.volatility).toBe('low');
    expect(insight.contextualSummary.description).toBe('Unidad de Fomento');
  });

  it('should not modify input objects', () => {
    const input: ComposeInsightInput = {
      context: { ...mockContext },
      signals: { ...mockSignals },
    };

    const originalContext = { ...input.context };
    const originalSignals = { ...input.signals };

    composeInsight(input);

    expect(input.context).toEqual(originalContext);
    expect(input.signals).toEqual(originalSignals);
  });
});
