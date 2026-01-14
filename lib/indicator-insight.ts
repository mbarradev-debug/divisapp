import type { IndicatorCode } from './api/mindicador';
import type { IndicatorContext, TrendImplication } from './indicator-context';
import type { Trend, Volatility, TrendSignals } from './trend-signals';

// Types

export interface ContextualSummary {
  description: string;
  represents: string;
}

export interface IndicatorInsight {
  indicatorCode: IndicatorCode;
  trend: Trend;
  trendMagnitude: number;
  volatility: Volatility;
  contextualSummary: ContextualSummary;
  implications: TrendImplication;
}

export interface ComposeInsightInput {
  context: IndicatorContext;
  signals: TrendSignals;
}

// Composition function

export function composeInsight(input: ComposeInsightInput): IndicatorInsight {
  const { context, signals } = input;

  return {
    indicatorCode: context.code,
    trend: signals.trend,
    trendMagnitude: signals.trendMagnitude,
    volatility: signals.volatility,
    contextualSummary: {
      description: context.description,
      represents: context.represents,
    },
    implications: context.implications,
  };
}
