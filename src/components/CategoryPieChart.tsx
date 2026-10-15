'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatRupiah } from '@/lib/utils';

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
  count: number;
}

interface CategoryPieChartProps {
  data: CategoryItem[];
}

const CLEAN_PALETTE = [
  '#09090b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#64748b', '#06b6d4', '#ec4899', '#84cc16', '#a855f7',
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-zinc-400 text-xs">
        <p>Belum ada pengeluaran tercatat untuk periode ini.</p>
      </div>
    );
  }

  const chartData = data.slice(0, 6).map((item, index) => ({
    name: item.name,
    value: item.amount,
    color: item.color || CLEAN_PALETTE[index % CLEAN_PALETTE.length],
    percentage: item.percentage,
    icon: item.icon,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-md border border-zinc-200/80 dark:border-zinc-800 text-xs">
          <p className="font-semibold text-zinc-800 dark:text-zinc-100">{item.name}</p>
          <p className="text-zinc-500 font-mono text-[11px] mt-0.5">
            {formatRupiah(item.value)} ({item.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut Chart */}
      <div className="w-44 h-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={68}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2">
        {data.slice(0, 5).map((item, idx) => (
          <div key={item.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color || CLEAN_PALETTE[idx % CLEAN_PALETTE.length] }}
              />
              <span className="text-zinc-700 dark:text-zinc-300 truncate font-medium">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px]">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {formatRupiah(item.amount)}
              </span>
              <span className="text-zinc-400 w-9 text-right">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
