'use client';

import { IndicatorValue } from '@/lib/api/mindicador';
import { NotificationPreferences } from '@/lib/storage';
import { formatValue } from '@/lib/format';
import { Card } from '@/components/ui';

interface NotificationPreviewProps {
  preferences: NotificationPreferences;
  indicators: IndicatorValue[];
}

interface MockNotification {
  title: string;
  body: string;
}

function generateMockVariation(value: number): { amount: number; percentage: number } {
  const percentChange = (Math.random() * 2 - 0.5) * 1.5;
  const amount = value * (percentChange / 100);
  return { amount, percentage: percentChange };
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2).replace('.', ',')}%`;
}

function formatChangeAmount(value: number, unit: string): string {
  const formatted = formatValue(Math.abs(value), unit);
  return formatted;
}

function generateSingleIndicatorPreview(
  indicator: IndicatorValue,
  triggerType: NotificationPreferences['triggerType'],
  threshold?: { type: 'above' | 'below'; value: number }
): MockNotification {
  const variation = generateMockVariation(indicator.valor);
  const direction = variation.percentage >= 0 ? 'subio' : 'bajo';
  const formattedValue = formatValue(indicator.valor, indicator.unidad_medida);
  const formattedChange = formatChangeAmount(variation.amount, indicator.unidad_medida);

  if (triggerType === 'threshold' && threshold) {
    const thresholdFormatted = formatValue(threshold.value, indicator.unidad_medida);
    return {
      title: `${indicator.nombre} cruzo ${thresholdFormatted}`,
      body: `Valor actual: ${formattedValue}. Tu alerta: ${threshold.type === 'above' ? 'por encima de' : 'por debajo de'} ${thresholdFormatted}`,
    };
  }

  return {
    title: `${indicator.nombre}: ${direction} ${formattedChange}`,
    body: `Valor actual: ${formattedValue}. Variacion: ${formatPercentage(variation.percentage)}`,
  };
}

function generateGroupedPreview(
  selectedIndicators: IndicatorValue[],
  maxToShow: number = 3
): MockNotification {
  const count = selectedIndicators.length;

  if (count === 0) {
    return { title: '', body: '' };
  }

  if (count === 1) {
    return generateSingleIndicatorPreview(selectedIndicators[0], 'daily');
  }

  const variations = selectedIndicators.map((ind) => ({
    indicator: ind,
    variation: generateMockVariation(ind.valor),
  }));

  const sortedByMagnitude = variations.sort(
    (a, b) => Math.abs(b.variation.percentage) - Math.abs(a.variation.percentage)
  );

  const toShow = sortedByMagnitude.slice(0, maxToShow);
  const remaining = count - maxToShow;

  const bodyParts = toShow.map(({ indicator, variation }) => {
    const shortName = indicator.nombre.split(' ')[0];
    const sign = variation.percentage >= 0 ? '+' : '';
    return `${shortName} ${sign}${variation.percentage.toFixed(1).replace('.', ',')}%`;
  });

  let body: string;
  if (remaining > 0) {
    const shownParts = bodyParts.slice(0, 2).join(', ');
    body = `${shownParts} y ${remaining + (maxToShow - 2)} mas`;
  } else {
    body = bodyParts.join(', ');
  }

  return {
    title: `${count} indicadores cambiaron`,
    body,
  };
}

function NotificationCard({ notification }: { notification: MockNotification }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-muted">
          <svg
            className="h-5 w-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[length:var(--text-label)] font-medium leading-[var(--leading-label)] text-text">
            {notification.title}
          </p>
          <p className="mt-0.5 text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
            {notification.body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationPreview({ preferences, indicators }: NotificationPreviewProps) {
  const selectedIndicators = indicators.filter((ind) =>
    preferences.indicators.includes(ind.codigo)
  );

  if (selectedIndicators.length === 0) {
    return null;
  }

  const previews: { type: string; notification: MockNotification }[] = [];

  if (preferences.triggerType === 'threshold') {
    const indicatorWithThreshold = selectedIndicators.find(
      (ind) => preferences.thresholds[ind.codigo]
    );
    if (indicatorWithThreshold) {
      previews.push({
        type: 'Notificacion de umbral',
        notification: generateSingleIndicatorPreview(
          indicatorWithThreshold,
          'threshold',
          preferences.thresholds[indicatorWithThreshold.codigo]
        ),
      });
    } else if (selectedIndicators[0]) {
      previews.push({
        type: 'Notificacion de umbral',
        notification: generateSingleIndicatorPreview(
          selectedIndicators[0],
          'threshold',
          { type: 'above', value: selectedIndicators[0].valor * 1.05 }
        ),
      });
    }
  } else {
    if (selectedIndicators[0]) {
      previews.push({
        type: 'Indicador individual',
        notification: generateSingleIndicatorPreview(
          selectedIndicators[0],
          preferences.triggerType
        ),
      });
    }
  }

  if (selectedIndicators.length >= 2) {
    previews.push({
      type: 'Indicadores agrupados',
      notification: generateGroupedPreview(selectedIndicators),
    });
  }

  return (
    <Card header="Vista previa">
      <div className="p-4">
        <div className="mb-3 rounded-lg border border-border-subtle bg-bg-muted/50 px-3 py-2">
          <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-text-secondary">
            Estos son ejemplos de como se veran tus notificaciones. No son alertas reales.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {previews.map((preview, index) => (
            <div key={index}>
              <p className="mb-2 text-[length:var(--text-small)] font-medium leading-[var(--leading-small)] text-text-muted">
                {preview.type}
              </p>
              <NotificationCard notification={preview.notification} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
