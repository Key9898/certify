import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart"

export interface UsageChartPoint {
  template: string
  count: number
}

const chartConfig = {
  count: {
    label: "Usage",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

interface UsageChartProps {
  data: UsageChartPoint[]
}

export const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded border border-dashed border-base-200 text-sm font-medium text-base-content/50">
        No template usage data yet.
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          left: 48,
          right: 24,
          top: 10,
          bottom: 10
        }}
      >
        <CartesianGrid 
          horizontal={false} 
          vertical={false}
          className="stroke-base-300" 
        />
        <XAxis 
          type="number" 
          hide 
        />
        <YAxis
          dataKey="template"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          className="text-[10px] font-black uppercase tracking-widest fill-base-content/40"
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel indicator="line" />}
        />
        <Bar
          dataKey="count"
          fill="var(--color-primary)"
          radius={[0, 4, 4, 0]}
          barSize={24}
        />
      </BarChart>
    </ChartContainer>
  )
}
