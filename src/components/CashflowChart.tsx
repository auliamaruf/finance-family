'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCompactRupiah, formatRupiah } from '@/lib/utils';

interface CashflowChartProps {
  data: Array<{
    day: number;
    label: string;
    income: number;
    expense: number;
  }>;
}

export function CashflowChart({ data }: CashflowChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-md border border-zinc-200/80 dark:border-zinc-800 text-xs">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 font-mono">
            Tgl {label}
          </p>
          <div className="space-y-0.5 font-mono text-[11px]">
            <p className="text-emerald-700 dark:text-emerald-400">
              Masuk: {formatRupiah(payload[0]?.value || 0)}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              Keluar: {formatRupiah(payload[1]?.value || 0)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e4e4e7" opacity={0.5} />
          <XAxis
            dataKey="label"
            tickLine={false}
            tick={{ fontSize: 10, fill: '#71717a' }}
            axisLine={{ stroke: '#e4e4e7' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: '#71717a' }}
            tickFormatter={(value) => formatCompactRupiah(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
          />
          <Bar
            name="Pemasukan"
            dataKey="income"
            fill="#059669"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
          />
          <Bar
            name="Pengeluaran"
            dataKey="expense"
            fill="#71717a"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
