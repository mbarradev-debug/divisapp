'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface ChartDataPoint {
  x: string | number;
  y: number;
}

interface LineChartBaseProps {
  data: ChartDataPoint[];
  height?: number;
  className?: string;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
}

function CustomTooltip({
  active,
  payload,
  label,
  formatValue,
  formatDate,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const value = payload[0].value;
  const displayValue = formatValue ? formatValue(value) : value.toLocaleString('es-CL');
  const displayDate = formatDate && label ? formatDate(label) : label;

  return (
    <div
      role="tooltip"
      className="rounded bg-text px-2 py-1.5 shadow-md"
    >
      <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-bg font-medium tabular-nums">
        {displayValue}
      </p>
      {displayDate && (
        <p className="text-[length:var(--text-small)] leading-[var(--leading-small)] text-bg/70">
          {displayDate}
        </p>
      )}
    </div>
  );
}

export function LineChartBase({
  data,
  height = 160,
  className = '',
  formatValue,
  formatDate,
}: LineChartBaseProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div
      className={className}
      style={{ height }}
      role="img"
      aria-label="Gráfico de tendencia histórica. Toca o haz clic para ver valores."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--chart-grid)"
            vertical={false}
          />
          <XAxis dataKey="x" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            content={
              <CustomTooltip formatValue={formatValue} formatDate={formatDate} />
            }
            cursor={{ stroke: 'var(--chart-line)', strokeOpacity: 0.3 }}
            isAnimationActive={false}
            trigger="click"
            wrapperStyle={{ zIndex: 100, pointerEvents: 'none', outline: 'none' }}
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke="var(--chart-line)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: 'var(--chart-line)',
              stroke: 'var(--bg)',
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
