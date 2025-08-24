"use client";

import type { FC } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import type { AnalysisResult } from '@/lib/types';

interface SentimentChartProps {
  data: AnalysisResult[];
}

const chartConfig = {
  positive: {
    label: 'Positive',
    color: 'hsl(var(--chart-2))',
  },
  negative: {
    label: 'Negative',
    color: 'hsl(var(--destructive))',
  },
  neutral: {
    label: 'Neutral',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

const SentimentChart: FC<SentimentChartProps> = ({ data }) => {
  const sentimentCounts = data.reduce(
    (acc, curr) => {
      acc[curr.sentimentLabel]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  const chartData = [
    { label: 'Positive', value: sentimentCounts.positive, fill: 'var(--color-positive)' },
    { label: 'Negative', value: sentimentCounts.negative, fill: 'var(--color-negative)' },
    { label: 'Neutral', value: sentimentCounts.neutral, fill: 'var(--color-neutral)' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>
          A breakdown of tweet sentiments for the current keyword.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} accessibilityLayer>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
               <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="value" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
