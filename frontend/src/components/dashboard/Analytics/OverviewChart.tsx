import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/Chart';

export interface OverviewChartPoint {
  month: string;
  count: number;
}

const chartConfig = {
  count: {
    label: 'Certificates',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig;

interface OverviewChartProps {
  data: OverviewChartPoint[];
}

export const OverviewChart: React.FC<OverviewChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded border border-dashed border-base-200 text-sm font-medium text-base-content/50">
        No issuance trend data yet.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 20,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-primary)"
              stopOpacity={0.15}
            />
            <stop
              offset="95%"
              stopColor="var(--color-primary)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-base-300/50"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tickFormatter={(value) => value.slice(0, 3)}
          className="text-[10px] font-black uppercase tracking-widest fill-base-content/30"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          className="text-[10px] font-black uppercase tracking-widest fill-base-content/20"
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="count"
          type="natural"
          fill="url(#fillCount)"
          fillOpacity={1}
          stroke="var(--color-primary)"
          strokeWidth={3}
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
};
