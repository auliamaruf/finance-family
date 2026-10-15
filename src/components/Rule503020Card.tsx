'use client';

import React from 'react';
import { formatRupiah } from '@/lib/utils';

interface RuleItem {
  amount: number;
  pct: number;
  targetPct: number;
}

interface Rule503020CardProps {
  ruleData?: {
    needs: RuleItem;
    wants: RuleItem;
    savings: RuleItem;
  };
  totalIncome: number;
}

export function Rule503020Card({ ruleData, totalIncome }: Rule503020CardProps) {
  if (!ruleData) return null;

  const { needs, wants, savings } = ruleData;

  const items = [
    {
      title: 'Kebutuhan Pokok',
      short: 'Needs',
      desc: 'Sembako, tagihan, cicilan & transportasi',
      color: 'bg-blue-600',
      dotColor: 'bg-blue-600',
      amount: needs.amount,
      pct: needs.pct,
      targetPct: 50,
      status: needs.pct <= 50 ? 'Sesuai Target' : needs.pct <= 60 ? 'Wajar' : 'Tinggi',
    },
    {
      title: 'Keinginan & Gaya Hidup',
      short: 'Wants',
      desc: 'Makan luar, jajan, hiburan, belanja',
      color: 'bg-amber-500',
      dotColor: 'bg-amber-500',
      amount: wants.amount,
      pct: wants.pct,
      targetPct: 30,
      status: wants.pct <= 30 ? 'Terkontrol' : wants.pct <= 35 ? 'Mendekati Batas' : 'Perlu Dikurangi',
    },
    {
      title: 'Tabungan & Investasi',
      short: 'Savings',
      desc: 'Dana darurat, investasi & tabungan',
      color: 'bg-emerald-600',
      dotColor: 'bg-emerald-600',
      amount: savings.amount,
      pct: savings.pct,
      targetPct: 20,
      status: savings.pct >= 20 ? 'Optimal' : savings.pct >= 10 ? 'Cukup' : 'Rendah',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Alokasi Anggaran 50 / 30 / 20
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Perbandingan pengeluaran riil terhadap formula alokasi ideal
          </p>
        </div>
        <span className="text-[11px] font-mono font-medium text-zinc-400">
          Target: 50/30/20
        </span>
      </div>

      {/* Combined proportional allocation bar */}
      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 flex overflow-hidden mb-5">
        <div
          style={{ width: `${Math.min(100, needs.pct)}%` }}
          className="bg-blue-600 h-full transition-all duration-500"
          title={`Needs: ${needs.pct.toFixed(1)}%`}
        />
        <div
          style={{ width: `${Math.min(100, wants.pct)}%` }}
          className="bg-amber-500 h-full transition-all duration-500"
          title={`Wants: ${wants.pct.toFixed(1)}%`}
        />
        <div
          style={{ width: `${Math.min(100, savings.pct)}%` }}
          className="bg-emerald-600 h-full transition-all duration-500"
          title={`Savings: ${savings.pct.toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-between space-y-2 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                  {item.short} ({item.targetPct}%)
                </span>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    item.pct > item.targetPct && item.targetPct !== 20
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {item.pct.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                {formatRupiah(item.amount)}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="truncate">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
