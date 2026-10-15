'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TransactionModal } from '@/components/TransactionModal';
import { CategoryIcon } from '@/components/CategoryIcon';
import {
  formatRupiah,
  MONTH_NAMES_ID,
  BUDGET_RULE_LABELS,
} from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Copy,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Save,
  Calculator,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
  budgetRule: string;
  icon: string;
  color: string;
}

export default function AnggaranPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});
  const [totalIncome, setTotalIncome] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [saveAllSuccess, setSaveAllSuccess] = useState(false);
  const [savingCatId, setSavingCatId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAutoCalcModalOpen, setIsAutoCalcModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states for Category Modal
  const [catName, setCatName] = useState('');
  const [catRule, setCatRule] = useState('NEEDS');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catError, setCatError] = useState('');

  // Auto calculate total target state
  const [autoTargetIncome, setAutoTargetIncome] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, budgetRes, dashRes] = await Promise.all([
        fetch('/api/categories?type=EXPENSE'),
        fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`/api/dashboard?month=${selectedMonth}&year=${selectedYear}`),
      ]);

      const catData = await catRes.json();
      const budgetData = await budgetRes.json();
      const dashData = await dashRes.json();

      if (catData.success) {
        setCategories(catData.data);
      }

      if (budgetData.success) {
        const bMap: Record<string, number> = {};
        budgetData.data.forEach((b: any) => {
          bMap[b.categoryId] = b.amount;
        });
        setBudgets(bMap);
      }

      if (dashData.success) {
        const sMap: Record<string, number> = {};
        (dashData.data.categoryBreakdown || []).forEach((c: any) => {
          sMap[c.id] = c.amount;
        });
        setSpentMap(sMap);
        setTotalIncome(dashData.data.summary?.totalIncome || 0);
      }
    } catch (err) {
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleBudgetChange = (catId: string, val: string) => {
    const numeric = parseFloat(val) || 0;
    setBudgets((prev) => ({ ...prev, [catId]: numeric }));
  };

  const handleSaveBudget = async (categoryId: string) => {
    setSavingCatId(categoryId);
    try {
      const amount = budgets[categoryId] || 0;
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          month: selectedMonth,
          year: selectedYear,
          amount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccessId(categoryId);
        setTimeout(() => setSavedSuccessId(null), 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan anggaran.');
    } finally {
      setSavingCatId(null);
    }
  };

  const handleBulkSave = async () => {
    setIsBulkSaving(true);
    try {
      const items = categories.map((c) => ({
        categoryId: c.id,
        amount: budgets[c.id] || 0,
      }));

      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_save',
          month: selectedMonth,
          year: selectedYear,
          items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveAllSuccess(true);
        setTimeout(() => setSaveAllSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan semua anggaran.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleCopyFromPreviousMonth = async () => {
    const fromMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const fromYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

    const fromLabel = `${MONTH_NAMES_ID[fromMonth - 1]} ${fromYear}`;
    if (!confirm(`Salin seluruh alokasi anggaran dari ${fromLabel} ke ${MONTH_NAMES_ID[selectedMonth - 1]} ${selectedYear}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'copy_from',
          fromMonth,
          fromYear,
          toMonth: selectedMonth,
          toYear: selectedYear,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
        alert('Anggaran berhasil disalin dari bulan sebelumnya!');
      } else {
        alert(data.error || 'Gagal menyalin anggaran.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyalin anggaran.');
    }
  };

  const handleApplyAuto503020 = () => {
    const baseIncome = parseFloat(autoTargetIncome) || totalIncome || 10000000;
    if (baseIncome <= 0) {
      alert('Masukkan nominal estimasi pemasukan terlebih dahulu.');
      return;
    }

    const needsPool = baseIncome * 0.5;
    const wantsPool = baseIncome * 0.3;
    const savingsPool = baseIncome * 0.2;

    const needsCats = categories.filter((c) => c.budgetRule === 'NEEDS');
    const wantsCats = categories.filter((c) => c.budgetRule === 'WANTS');
    const savingsCats = categories.filter((c) => c.budgetRule === 'SAVINGS');

    const newBudgets = { ...budgets };

    if (needsCats.length > 0) {
      const perCat = Math.round(needsPool / needsCats.length / 50000) * 50000;
      needsCats.forEach((c) => {
        newBudgets[c.id] = perCat;
      });
    }

    if (wantsCats.length > 0) {
      const perCat = Math.round(wantsPool / wantsCats.length / 50000) * 50000;
      wantsCats.forEach((c) => {
        newBudgets[c.id] = perCat;
      });
    }

    if (savingsCats.length > 0) {
      const perCat = Math.round(savingsPool / savingsCats.length / 50000) * 50000;
      savingsCats.forEach((c) => {
        newBudgets[c.id] = perCat;
      });
    }

    setBudgets(newBudgets);
    setIsAutoCalcModalOpen(false);
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatRule('NEEDS');
    setCatIcon('Tag');
    setCatError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatRule(cat.budgetRule);
    setCatIcon(cat.icon);
    setCatError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Nama kategori wajib diisi.');
      return;
    }

    try {
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: catName.trim(),
            budgetRule: catRule,
            icon: catIcon,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsCategoryModalOpen(false);
          fetchData();
        } else {
          setCatError(data.error || 'Gagal memperbarui kategori.');
        }
      } else {
        // Create new
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: catName.trim(),
            type: 'EXPENSE',
            budgetRule: catRule,
            icon: catIcon,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsCategoryModalOpen(false);
          fetchData();
        } else {
          setCatError(data.error || 'Gagal membuat kategori.');
        }
      }
    } catch (err) {
      console.error(err);
      setCatError('Terjadi kesalahan koneksi.');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Kategori tidak dapat dihapus.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const groupedCategories = {
    NEEDS: categories.filter((c) => c.budgetRule === 'NEEDS'),
    WANTS: categories.filter((c) => c.budgetRule === 'WANTS'),
    SAVINGS: categories.filter((c) => c.budgetRule === 'SAVINGS'),
    OTHER: categories.filter((c) => c.budgetRule === 'OTHER' || !c.budgetRule),
  };

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
  const totalSpent = Object.values(spentMap).reduce((a, b) => a + b, 0);
  const budgetVsIncomePct = totalIncome > 0 ? (totalBudget / totalIncome) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 md:pb-16 font-sans">
      <Navbar onOpenTransactionModal={() => setIsTransactionModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header Title & Period Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Plafon Anggaran Dinamis
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sesuaikan target anggaran per bulan sesuai kebutuhan keluarga yang dinamis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
              <button
                onClick={() =>
                  selectedMonth === 1
                    ? (setSelectedMonth(12), setSelectedYear((y) => y - 1))
                    : setSelectedMonth((m) => m - 1)
                }
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-0.5 text-center font-semibold text-xs sm:text-sm min-w-[120px]">
                {MONTH_NAMES_ID[selectedMonth - 1]} {selectedYear}
              </span>
              <button
                onClick={() =>
                  selectedMonth === 12
                    ? (setSelectedMonth(1), setSelectedYear((y) => y + 1))
                    : setSelectedMonth((m) => m + 1)
                }
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Salin dari Bulan Lalu */}
            <button
              onClick={handleCopyFromPreviousMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Salin alokasi bulan lalu ke bulan ini"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
              <span>Salin dari Bulan Lalu</span>
            </button>

            {/* Quick 50/30/20 Calculator */}
            <button
              onClick={() => {
                setAutoTargetIncome(totalIncome > 0 ? String(totalIncome) : '15000000');
                setIsAutoCalcModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Formula 50/30/20 Otomatis</span>
            </button>

            {/* Tambah Kategori Kustom */}
            <button
              onClick={handleOpenAddCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tambah Kategori Baru</span>
            </button>
          </div>

          {/* Bulk Save Button */}
          <button
            onClick={handleBulkSave}
            disabled={isBulkSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {saveAllSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                <span>Semua Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isBulkSaving ? 'Menyimpan...' : 'Simpan Semua Anggaran'}</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500">
                Total Plafon Anggaran
              </span>
              {totalIncome > 0 && (
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {budgetVsIncomePct.toFixed(0)}% dari Pemasukan
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
              {formatRupiah(totalBudget)}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <span className="text-[11px] font-medium text-zinc-500">
              Realisasi Pengeluaran
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
              {formatRupiah(totalSpent)}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
              {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% terpakai` : '-'}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <span className="text-[11px] font-medium text-zinc-500">
              Sisa Kuota Belanja
            </span>
            <div
              className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${
                totalBudget - totalSpent >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
              }`}
            >
              {formatRupiah(totalBudget - totalSpent)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {totalBudget - totalSpent >= 0 ? 'Masih dalam batas aman' : 'Melebihi target anggaran'}
            </div>
          </div>
        </div>

        {/* Categories Grouped by 50/30/20 */}
        {(['NEEDS', 'WANTS', 'SAVINGS', 'OTHER'] as const).map((ruleKey) => {
          const ruleMeta = BUDGET_RULE_LABELS[ruleKey];
          const catList = groupedCategories[ruleKey] || [];
          if (catList.length === 0) return null;

          return (
            <div
              key={ruleKey}
              className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ruleMeta.color }}
                  />
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {ruleMeta.label}
                  </h3>
                  {ruleMeta.targetPct > 0 && (
                    <span className="text-[11px] font-mono text-zinc-400">
                      (Target: {ruleMeta.targetPct}%)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {ruleMeta.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catList.map((cat) => {
                  const budgetAmount = budgets[cat.id] || 0;
                  const spentAmount = spentMap[cat.id] || 0;
                  const pct = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                  const isSaving = savingCatId === cat.id;
                  const isSaved = savedSuccessId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                            <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {cat.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-mono text-[11px] font-semibold px-1.5 py-0.2 rounded ${
                              pct > 100
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : pct >= 80
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {pct.toFixed(0)}%
                          </span>

                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct > 100
                              ? 'bg-rose-500'
                              : pct >= 80
                              ? 'bg-amber-500'
                              : 'bg-zinc-900 dark:bg-zinc-100'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>

                      {/* Inputs & Stats */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>Realisasi: {formatRupiah(spentAmount)}</span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-zinc-400">
                            Rp
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={budgets[cat.id] ?? ''}
                            onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                            placeholder="0"
                            className="w-full pl-8 pr-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveBudget(cat.id)}
                          disabled={isSaving}
                          className="px-2.5 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : 'Set'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* Auto 50/30/20 Calculator Modal */}
      {isAutoCalcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Formula Alokasi 50 / 30 / 20</span>
              </h3>
              <button
                onClick={() => setIsAutoCalcModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Masukkan total estimasi pemasukan bulan ini. Sistem akan otomatis mendistribusikan nominal ke tiap pos kategori (50% Kebutuhan, 30% Keinginan, 20% Tabungan):
              </p>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Estimasi Pemasukan (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  value={autoTargetIncome}
                  onChange={(e) => setAutoTargetIncome(e.target.value)}
                  placeholder="Contoh: 15000000"
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {parseFloat(autoTargetIncome) > 0 && (
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>50% Kebutuhan (Needs):</span>
                    <span>{formatRupiah((parseFloat(autoTargetIncome) || 0) * 0.5)}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>30% Keinginan (Wants):</span>
                    <span>{formatRupiah((parseFloat(autoTargetIncome) || 0) * 0.3)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>20% Tabungan (Savings):</span>
                    <span>{formatRupiah((parseFloat(autoTargetIncome) || 0) * 0.2)}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoCalcModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyAuto503020}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs shadow-xs cursor-pointer"
                >
                  Terapkan Anggaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              {catError && (
                <div className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded text-[11px]">
                  {catError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Renovasi Rumah, Qurban, Kursus"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Kelompok Alokasi (Formula 50/30/20)
                </label>
                <select
                  value={catRule}
                  onChange={(e) => setCatRule(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="NEEDS">Kebutuhan Pokok (Needs - 50%)</option>
                  <option value="WANTS">Keinginan & Lifestyle (Wants - 30%)</option>
                  <option value="SAVINGS">Tabungan & Investasi (Savings - 20%)</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg max-h-32 overflow-y-auto">
                  {[
                    'ShoppingCart', 'Home', 'Zap', 'Car', 'Baby', 'HeartPulse',
                    'Utensils', 'ShoppingBag', 'Film', 'Sparkles', 'Shield',
                    'TrendingUp', 'Briefcase', 'Coins', 'Wallet', 'Tag', 'Landmark', 'CreditCard'
                  ].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setCatIcon(ic)}
                      className={`p-2 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        catIcon === ic
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                          : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {editingCategory ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategory)}
                    className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Kategori</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs shadow-xs cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
