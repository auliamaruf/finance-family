import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactRupiah(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  }
  return formatRupiah(amount);
}

export function formatTanggal(date: Date | string, formatType: 'short' | 'long' | 'day-date' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (formatType === 'day-date') {
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  
  if (formatType === 'long') {
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const ROLE_LABELS: Record<string, { label: string; short: string; badge: string; color: string }> = {
  HUSBAND: {
    label: 'Suami',
    short: 'S',
    badge: 'bg-slate-100 text-slate-800 border-slate-300/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    color: '#334155',
  },
  WIFE: {
    label: 'Istri',
    short: 'I',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
    color: '#e11d48',
  },
  JOINT: {
    label: 'Bersama',
    short: 'B',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
    color: '#059669',
  },
};

export const BUDGET_RULE_LABELS: Record<string, { label: string; short: string; desc: string; targetPct: number; color: string }> = {
  NEEDS: {
    label: 'Kebutuhan Pokok',
    short: 'Needs',
    desc: 'Sembako, cicilan, tagihan, transportasi',
    targetPct: 50,
    color: '#2563eb',
  },
  WANTS: {
    label: 'Keinginan & Gaya Hidup',
    short: 'Wants',
    desc: 'Makan luar, jajan, hiburan, belanja',
    targetPct: 30,
    color: '#d97706',
  },
  SAVINGS: {
    label: 'Tabungan & Investasi',
    short: 'Savings',
    desc: 'Dana darurat, investasi, pelunasan utang',
    targetPct: 20,
    color: '#059669',
  },
  OTHER: {
    label: 'Lainnya',
    short: 'Other',
    desc: 'Pengeluaran umum',
    targetPct: 0,
    color: '#64748b',
  },
};
