'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  x: string | number;
  y: number;
}

interface LineChartBaseProps {
  data: ChartDataPoint[];
  height?: number;
  className?: string;
}

export function LineChartBase({
  data,
  height = 200,
  className = '',
}: LineChartBaseProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--chart-grid)"
            vertical={false}
          />
          <XAxis dataKey="x" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Line
            type="monotone"
            dataKey="y"
            stroke="var(--chart-line)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
