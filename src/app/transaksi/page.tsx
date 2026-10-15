'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TransactionModal } from '@/components/TransactionModal';
import { CategoryIcon } from '@/components/CategoryIcon';
import {
  formatRupiah,
  formatTanggal,
  ROLE_LABELS,
  MONTH_NAMES_ID,
} from '@/lib/utils';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Filter,
  X,
} from 'lucide-react';

export default function TransaksiPage() {
  const now = new Date();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPerformer, setSelectedPerformer] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMonth && selectedMonth !== 'ALL') params.set('month', selectedMonth);
      if (selectedYear) params.set('year', selectedYear);
      if (selectedType !== 'ALL') params.set('type', selectedType);
      if (selectedPerformer !== 'ALL') params.set('performedBy', selectedPerformer);
      if (selectedCategoryId !== 'ALL') params.set('categoryId', selectedCategoryId);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/accounts'),
      ]);
      const catData = await catRes.json();
      const accData = await accRes.json();
      if (catData.success) setCategories(catData.data);
      if (accData.success) setAccounts(accData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    selectedMonth,
    selectedYear,
    selectedType,
    selectedPerformer,
    selectedCategoryId,
  ]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini? Saldo rekening terkait akan otomatis disesuaikan kembali.')) {
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTransactions();
      } else {
        alert(data.error || 'Gagal menghapus transaksi');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const totalFilteredIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 md:pb-16 font-sans">
      <Navbar onOpenTransactionModal={() => setIsModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Daftar Transaksi
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Riwayat mutasi pengeluaran, pemasukan, dan transfer kas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/export?month=${selectedMonth === 'ALL' ? '' : selectedMonth}&year=${selectedYear}`}
              download
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 transition-colors"
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

        {/* Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari transaksi berdasarkan judul..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Month & Year */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="ALL">Semua Bulan</option>
                {MONTH_NAMES_ID.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none max-w-[150px] truncate"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Pills */}
              <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                {['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedType === t
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {t === 'ALL'
                      ? 'Semua'
                      : t === 'EXPENSE'
                      ? 'Pengeluaran'
                      : t === 'INCOME'
                      ? 'Pemasukan'
                      : 'Transfer'}
                  </button>
                ))}
              </div>

              {/* Performer Pills */}
              <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                {[
                  { key: 'ALL', label: 'Semua Pelaku' },
                  { key: 'HUSBAND', label: 'Suami' },
                  { key: 'WIFE', label: 'Istri' },
                  { key: 'JOINT', label: 'Bersama' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPerformer(p.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedPerformer === p.key
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter totals */}
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-zinc-400">
                {transactions.length} mutasi
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                +{formatRupiah(totalFilteredIncome)}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                -{formatRupiah(totalFilteredExpense)}
              </span>
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-zinc-400">
              Memuat data...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400">
              Tidak ada transaksi yang cocok dengan kriteria filter.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                      <CategoryIcon name={tx.category?.icon || 'Tag'} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                          {tx.title}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                            ROLE_LABELS[tx.performedBy]?.badge || 'bg-zinc-100'
                          }`}
                        >
                          {ROLE_LABELS[tx.performedBy]?.label || tx.performedBy}
                        </span>
                        {tx.category?.budgetRule && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                            {tx.category.budgetRule}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{formatTanggal(tx.date, 'day-date')}</span>
                        <span>•</span>
                        <span>{tx.category?.name || 'Umum'}</span>
                        <span>•</span>
                        <span className="text-zinc-600 dark:text-zinc-300">
                          {tx.account?.name}
                          {tx.toAccount ? ` ➔ ${tx.toAccount.name}` : ''}
                        </span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-zinc-400">"{tx.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
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

                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
        onSuccess={() => fetchTransactions()}
      />
    </div>
  );
}
