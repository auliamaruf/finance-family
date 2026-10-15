'use client';

import React from 'react';
import { FinancialHealthResult, Recommendation } from '@/lib/recommendations';
import { CheckCircle2, AlertCircle, Info, ArrowUpRight } from 'lucide-react';

interface HealthScoreCardProps {
  health?: FinancialHealthResult;
}

export function HealthScoreCard({ health }: HealthScoreCardProps) {
  if (!health) return null;

  const getStatusBadge = (variant: FinancialHealthResult['badgeVariant']) => {
    switch (variant) {
      case 'healthy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60';
      case 'moderate':
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60';
      case 'critical':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Evaluasi Finansial Bulan Ini
            </h3>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getStatusBadge(
                health.badgeVariant
              )}`}
            >
              {health.status}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {health.summary}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
              Indeks Kestabilan
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {health.score}
              <span className="text-xs text-zinc-400 font-normal"> / 100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Insights List */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {health.recommendations.map((rec) => {
          const isPositive = rec.type === 'positive';
          const isAttention = rec.type === 'attention';

          return (
            <div
              key={rec.id}
              className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 flex items-start gap-3 text-xs"
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  isPositive ? 'bg-emerald-500' : isAttention ? 'bg-amber-500' : 'bg-zinc-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {rec.title}
                  </h4>
                  {rec.metric && (
                    <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700 shrink-0">
                      {rec.metric}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                  {rec.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
