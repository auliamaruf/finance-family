'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { TransactionModal } from '@/components/TransactionModal';
import { HealthScoreCard } from '@/components/HealthScoreCard';
import { CashflowChart } from '@/components/CashflowChart';
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { MonthlyComparisonChart } from '@/components/MonthlyComparisonChart';
import { Rule503020Card } from '@/components/Rule503020Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import {
  formatRupiah,
  formatTanggal,
  MONTH_NAMES_ID,
  ROLE_LABELS,
} from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function DashboardPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [activeProfile, setActiveProfile] = useState('ALL');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?month=${selectedMonth}&year=${selectedYear}`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleResetCurrentMonth = () => {
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  const summary = dashboardData?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netCashFlow: 0,
    savingsRate: 0,
  };

  const attribution = dashboardData?.attribution || {
    husbandExpense: 0,
    wifeExpense: 0,
    jointExpense: 0,
    husbandExpensePct: 0,
    wifeExpensePct: 0,
    jointExpensePct: 0,
    husbandIncome: 0,
    wifeIncome: 0,
    jointIncome: 0,
  };

  const filteredRecentTransactions = (dashboardData?.recentTransactions || []).filter(
    (tx: any) => activeProfile === 'ALL' || tx.performedBy === activeProfile
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 md:pb-16 font-sans">
      <Navbar
        onOpenTransactionModal={() => setIsModalOpen(true)}
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Period Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 sm:px-5 sm:py-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-0.5 text-center min-w-[130px]">
                <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  {MONTH_NAMES_ID[selectedMonth - 1]} {selectedYear}
                </span>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {(selectedMonth !== now.getMonth() + 1 || selectedYear !== now.getFullYear()) && (
              <button
                onClick={handleResetCurrentMonth}
                className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Bulan Ini
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/export?month=${selectedMonth}&year=${selectedYear}`}
              download
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.8} />
              <span>Export</span>
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Financial Insights Card */}
        <HealthScoreCard health={dashboardData?.health} />

        {/* 4 Key Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pemasukan */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500">Pemasukan</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                Masuk
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
              {formatRupiah(summary.totalIncome)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Total seluruh pendapatan</p>
          </div>

          {/* Pengeluaran */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500">Pengeluaran</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {summary.totalIncome > 0
                  ? `${((summary.totalExpense / summary.totalIncome) * 100).toFixed(0)}%`
                  : '-'}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
              {formatRupiah(summary.totalExpense)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Total belanja & pos rutin</p>
          </div>

          {/* Arus Kas Bersih */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500">Arus Kas Bersih</span>
              <span
                className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                  summary.netCashFlow >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                }`}
              >
                {summary.netCashFlow >= 0 ? 'Surplus' : 'Defisit'}
              </span>
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                summary.netCashFlow >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatRupiah(summary.netCashFlow)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Selisih pemasukan - belanja</p>
          </div>

          {/* Rasio Tabungan */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500">Rasio Tabungan</span>
              <span className="text-[10px] font-mono text-zinc-400">Target 20%</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
              {summary.savingsRate.toFixed(1)}%
            </div>
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.savingsRate >= 20 ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Attribution: Suami, Istri & Bersama */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Porsi Pengeluaran Pasangan
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transparansi alokasi belanja antara Suami, Istri, dan Kebutuhan Bersama
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-zinc-400">
              Total {formatRupiah(summary.totalExpense)}
            </span>
          </div>

          {/* Minimalist proportional bar */}
          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex mb-4">
            <div
              style={{ width: `${attribution.husbandExpensePct}%` }}
              className="bg-zinc-700 dark:bg-zinc-400 h-full transition-all duration-500"
            />
            <div
              style={{ width: `${attribution.wifeExpensePct}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
            />
            <div
              style={{ width: `${attribution.jointExpensePct}%` }}
              className="bg-emerald-600 h-full transition-all duration-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Suami */}
            <div className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-400" />
                  Suami
                </span>
                <span className="font-mono text-[11px] font-semibold text-zinc-500">
                  {attribution.husbandExpensePct.toFixed(0)}%
                </span>
              </div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {formatRupiah(attribution.husbandExpense)}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Pemasukan: {formatRupiah(attribution.husbandIncome || 0)}
              </p>
            </div>

            {/* Istri */}
            <div className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Istri
                </span>
                <span className="font-mono text-[11px] font-semibold text-zinc-500">
                  {attribution.wifeExpensePct.toFixed(0)}%
                </span>
              </div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {formatRupiah(attribution.wifeExpense)}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Pemasukan: {formatRupiah(attribution.wifeIncome || 0)}
              </p>
            </div>

            {/* Bersama */}
            <div className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Kebutuhan Bersama
                </span>
                <span className="font-mono text-[11px] font-semibold text-zinc-500">
                  {attribution.jointExpensePct.toFixed(0)}%
                </span>
              </div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {formatRupiah(attribution.jointExpense)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Operasional rumah tangga</p>
            </div>
          </div>
        </div>

        {/* 50/30/20 Rule + Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Rule503020Card
            ruleData={dashboardData?.rule50_30_20}
            totalIncome={summary.totalIncome}
          />

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Distribusi Kategori
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Pos pengeluaran teratas bulan ini
                </p>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {dashboardData?.categoryBreakdown?.length || 0} Pos
              </span>
            </div>

            <CategoryPieChart data={dashboardData?.categoryBreakdown || []} />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Arus Kas Harian
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Pemasukan vs Pengeluaran sepanjang {MONTH_NAMES_ID[selectedMonth - 1]}
            </p>
            <CashflowChart data={dashboardData?.dailyTrend || []} />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Tren 6 Bulan Terakhir
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Konsistensi rasio pemasukan dan pengeluaran historis
            </p>
            <MonthlyComparisonChart data={dashboardData?.monthlyComparison || []} />
          </div>
        </div>

        {/* Budget Status */}
        {dashboardData?.budgetStatus && dashboardData.budgetStatus.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Pemantauan Batas Anggaran
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Status realisasi belanja terhadap plafon anggaran yang ditetapkan
                </p>
              </div>
              <Link
                href="/anggaran"
                className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
              >
                <span>Kelola Anggaran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dashboardData.budgetStatus.map((b: any) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {b.categoryName}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                        b.isOverBudget
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : b.percentageUsed >= 80
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {b.percentageUsed.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.isOverBudget
                          ? 'bg-rose-500'
                          : b.percentageUsed >= 80
                          ? 'bg-amber-500'
                          : 'bg-zinc-900 dark:bg-zinc-100'
                      }`}
                      style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>{formatRupiah(b.spentAmount)}</span>
                    <span>Target: {formatRupiah(b.budgetAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions Feed */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Catatan Transaksi Terkini
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Aktivitas pengeluaran dan pemasukan terakhir
              </p>
            </div>
            <Link
              href="/transaksi"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
            >
              <span>Semua Transaksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredRecentTransactions.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-400">
              Belum ada transaksi pada periode ini.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {filteredRecentTransactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                      <CategoryIcon name={tx.category?.icon || 'Tag'} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {tx.title}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${
                            ROLE_LABELS[tx.performedBy]?.badge || 'bg-zinc-100'
                          }`}
                        >
                          {ROLE_LABELS[tx.performedBy]?.label || tx.performedBy}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{formatTanggal(tx.date, 'short')}</span>
                        <span>•</span>
                        <span>{tx.category?.name || 'Umum'}</span>
                        <span>•</span>
                        <span>{tx.account?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-semibold font-mono text-xs sm:text-sm ${
                        tx.type === 'INCOME'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : tx.type === 'EXPENSE'
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-500'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                      {formatRupiah(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchDashboard()}
      />
    </div>
  );
}
