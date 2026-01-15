import type { IndicatorInsight } from '@/lib/indicator-insight';

interface IndicatorInsightBlockProps {
  insight: IndicatorInsight;
}

export function IndicatorInsightBlock({ insight }: IndicatorInsightBlockProps) {
  return (
    <div
      className="mb-4 rounded-lg border border-border-subtle bg-bg-subtle p-3"
      role="region"
      aria-label="Significado del indicador"
    >
      <p className="text-[length:var(--text-label)] leading-[var(--leading-label)] text-text-secondary">
        {insight.contextualSummary.description}
      </p>
    </div>
  );
}
