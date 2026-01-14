import type { IndicatorInsight } from '@/lib/indicator-insight';
import type { Trend, Volatility } from '@/lib/trend-signals';
import { INSIGHT_SECTION_ID } from './insight-anchor';

interface IndicatorInsightProps {
  insight: IndicatorInsight;
}

function getTrendText(trend: Trend, magnitude: number): string {
  const absM = Math.abs(magnitude);
  const magnitudeText = absM >= 1 ? ` (${absM.toFixed(1)}%)` : '';

  switch (trend) {
    case 'up':
      return `muestra una tendencia al alza${magnitudeText}`;
    case 'down':
      return `muestra una tendencia a la baja${magnitudeText}`;
    case 'flat':
      return 'se mantiene relativamente estable';
  }
}

function getVolatilityText(volatility: Volatility): string {
  switch (volatility) {
    case 'low':
      return 'Los valores han sido consistentes con mínima fluctuación.';
    case 'medium':
      return 'Los valores han mostrado fluctuación moderada.';
    case 'high':
      return 'Los valores han fluctuado significativamente.';
  }
}

function getImplicationText(
  trend: Trend,
  implications: { upward: string; downward: string }
): string | null {
  switch (trend) {
    case 'up':
      return implications.upward;
    case 'down':
      return implications.downward;
    case 'flat':
      return null;
  }
}

export function IndicatorInsight({ insight }: IndicatorInsightProps) {
  const trendText = getTrendText(insight.trend, insight.trendMagnitude);
  const volatilityText = getVolatilityText(insight.volatility);
  const implicationText = getImplicationText(
    insight.trend,
    insight.implications
  );

  return (
    <section
      id={INSIGHT_SECTION_ID}
      aria-labelledby="insight-heading"
      className="mt-6 rounded-lg border border-border-subtle bg-bg-subtle p-4 scroll-mt-4"
    >
      <h2
        id="insight-heading"
        className="text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text"
      >
        Qué significa este indicador
      </h2>

      <p className="mt-3 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
        {insight.contextualSummary.description}
      </p>

      <p className="mt-2 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
        {insight.contextualSummary.represents}
      </p>

      <div className="mt-4 border-t border-border-subtle pt-4">
        <h3 className="text-[length:var(--text-small)] font-medium uppercase tracking-wide leading-[var(--leading-small)] text-text-muted">
          Comportamiento reciente
        </h3>

        <p className="mt-2 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
          Este indicador {trendText}. {volatilityText}
        </p>

        {implicationText && (
          <p className="mt-2 text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
            {implicationText}
          </p>
        )}
      </div>
    </section>
  );
}
