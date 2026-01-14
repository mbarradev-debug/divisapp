import type { SerieItem } from './api/mindicador';

// Types

export type Trend = 'up' | 'down' | 'flat';
export type Volatility = 'low' | 'medium' | 'high';

export interface TrendSignals {
  trend: Trend;
  trendMagnitude: number;
  volatility: Volatility;
}

export interface TrendSignalsOptions {
  windowLength?: number;
}

// Thresholds

export const TREND_FLAT_THRESHOLD = 0.5;
export const VOLATILITY_LOW_THRESHOLD = 1.0;
export const VOLATILITY_HIGH_THRESHOLD = 5.0;
export const DEFAULT_WINDOW_LENGTH = 30;

// Internal helpers

function calculatePercentageChange(startValue: number, endValue: number): number {
  if (startValue === 0) {
    return 0;
  }
  return ((endValue - startValue) / Math.abs(startValue)) * 100;
}

function calculateCoefficientOfVariation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  if (mean === 0) {
    return 0;
  }

  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  return (standardDeviation / Math.abs(mean)) * 100;
}

function deriveTrend(percentageChange: number): Trend {
  if (percentageChange > TREND_FLAT_THRESHOLD) {
    return 'up';
  }
  if (percentageChange < -TREND_FLAT_THRESHOLD) {
    return 'down';
  }
  return 'flat';
}

function deriveVolatility(coefficientOfVariation: number): Volatility {
  if (coefficientOfVariation <= VOLATILITY_LOW_THRESHOLD) {
    return 'low';
  }
  if (coefficientOfVariation >= VOLATILITY_HIGH_THRESHOLD) {
    return 'high';
  }
  return 'medium';
}

function extractWindow(serie: SerieItem[], windowLength: number): SerieItem[] {
  const sorted = [...serie].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  return sorted.slice(-windowLength);
}

// Main function

export function deriveTrendSignals(
  serie: SerieItem[],
  options: TrendSignalsOptions = {}
): TrendSignals {
  const windowLength = options.windowLength ?? DEFAULT_WINDOW_LENGTH;

  if (serie.length === 0) {
    return {
      trend: 'flat',
      trendMagnitude: 0,
      volatility: 'low',
    };
  }

  const window = extractWindow(serie, windowLength);

  if (window.length < 2) {
    return {
      trend: 'flat',
      trendMagnitude: 0,
      volatility: 'low',
    };
  }

  const startValue = window[0].valor;
  const endValue = window[window.length - 1].valor;
  const values = window.map((item) => item.valor);

  const trendMagnitude = calculatePercentageChange(startValue, endValue);
  const coefficientOfVariation = calculateCoefficientOfVariation(values);

  return {
    trend: deriveTrend(trendMagnitude),
    trendMagnitude: Math.round(trendMagnitude * 100) / 100,
    volatility: deriveVolatility(coefficientOfVariation),
  };
}
