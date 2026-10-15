'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TransactionModal } from '@/components/TransactionModal';
import { formatRupiah, formatTanggal, ROLE_LABELS } from '@/lib/utils';
import {
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Edit2,
  Coins,
  Minus,
  ArrowRight,
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  owner: string;
  notes?: string | null;
  isCompleted: boolean;
}

export default function TargetPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);

  // Deposit/Adjust Custom Modal State
  const [activeDepositGoal, setActiveDepositGoal] = useState<Goal | null>(null);
  const [depositMode, setDepositMode] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');

  // Edit Goal Modal State
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // New goal state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [owner, setOwner] = useState('JOINT');
  const [notes, setNotes] = useState('');

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      if (data.success) {
        setGoals(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount) || 0,
          deadline: deadline || undefined,
          owner,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddGoalModalOpen(false);
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('');
        setDeadline('');
        setNotes('');
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCurrentAmount = async (id: string, newCurrent: number) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount: Math.max(0, newCurrent) }),
      });
      const data = await res.json();
      if (data.success) {
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDepositModal = (goal: Goal) => {
    setActiveDepositGoal(goal);
    setDepositMode('ADD');
    setCustomAmountStr('');
    setDepositError('');
  };

  const handleQuickChipAdd = (val: number) => {
    const current = parseFloat(customAmountStr) || 0;
    setCustomAmountStr(String(current + val));
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositGoal) return;
    setDepositError('');

    const numericAmount = parseFloat(customAmountStr);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setDepositError('Masukkan angka nominal yang valid.');
      return;
    }

    let nextBalance = activeDepositGoal.currentAmount;
    if (depositMode === 'ADD') {
      nextBalance += numericAmount;
    } else if (depositMode === 'SUBTRACT') {
      nextBalance = Math.max(0, nextBalance - numericAmount);
    } else {
      nextBalance = numericAmount;
    }

    setDepositLoading(true);
    try {
      const res = await fetch(`/api/goals/${activeDepositGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount: nextBalance }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveDepositGoal(null);
        fetchGoals();
      } else {
        setDepositError(data.error || 'Gagal memperbarui saldo target.');
      }
    } catch (err) {
      console.error(err);
      setDepositError('Terjadi kesalahan koneksi.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleOpenEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
    setOwner(goal.owner);
    setNotes(goal.notes || '');
  };

  const handleSaveEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !title.trim() || !targetAmount) return;

    try {
      const res = await fetch(`/api/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount) || 0,
          deadline: deadline || null,
          owner,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingGoal(null);
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Hapus target tabungan ini?')) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 md:pb-16 font-sans">
      <Navbar onOpenTransactionModal={() => setIsTransactionModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Target Tabungan & Pos Dana
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pelacakan akumulasi Dana Darurat, tabungan impian, dan tujuan masa depan
            </p>
          </div>

          <button
            onClick={() => setIsAddGoalModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Target Baru</span>
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g.id}
                className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3.5 relative overflow-hidden"
              >
                {g.isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Tercapai</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 pr-6">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {g.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                          ROLE_LABELS[g.owner]?.badge || 'bg-zinc-100'
                        }`}
                      >
                        {ROLE_LABELS[g.owner]?.label || g.owner}
                      </span>
                      {g.deadline && (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          Tenggat: {formatTanggal(g.deadline, 'short')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditGoal(g)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Edit Target"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono">
                      Terkumpul: <strong className="text-zinc-900 dark:text-zinc-100">{formatRupiah(g.currentAmount)}</strong>
                    </span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Target: {formatRupiah(g.targetAmount)}</span>
                    <span>Sisa: {formatRupiah(remaining)}</span>
                  </div>
                </div>

                {/* Quick Add Funds Toolbar with Custom Button */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[500000, 1000000].map((addVal) => (
                      <button
                        key={addVal}
                        onClick={() => handleUpdateCurrentAmount(g.id, g.currentAmount + addVal)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title={`Tambah langsung ${formatRupiah(addVal)}`}
                      >
                        +{addVal >= 1000000 ? `${addVal / 1000000}jt` : `${addVal / 1000}rb`}
                      </button>
                    ))}

                    {/* Custom Amount Button */}
                    <button
                      onClick={() => handleOpenDepositModal(g)}
                      className="text-[11px] font-medium px-2 py-0.5 rounded border border-zinc-900/40 dark:border-zinc-600 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Coins className="w-3 h-3" />
                      <span>+ Custom</span>
                    </button>
                  </div>

                  {g.notes && (
                    <span className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                      {g.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Deposit / Custom Amount Modal */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4 animate-in fade-in zoom-in-98">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                  Update Saldo Tabungan
                </h3>
                <p className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                  {activeDepositGoal.title}
                </p>
              </div>
              <button
                onClick={() => setActiveDepositGoal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeposit} className="space-y-3 text-xs">
              {depositError && (
                <div className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded text-[11px]">
                  {depositError}
                </div>
              )}

              {/* Current balance indicator */}
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center text-zinc-500 font-mono text-[11px]">
                <span>Saldo saat ini:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {formatRupiah(activeDepositGoal.currentAmount)}
                </span>
              </div>

              {/* Mode selector (Tambah / Kurang / Set) */}
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDepositMode('ADD')}
                  className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                    depositMode === 'ADD'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  + Tambah
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMode('SUBTRACT')}
                  className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                    depositMode === 'SUBTRACT'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  - Tarik Dana
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDepositMode('SET');
                    setCustomAmountStr(String(activeDepositGoal.currentAmount));
                  }}
                  className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                    depositMode === 'SET'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Set Total
                </button>
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  {depositMode === 'ADD'
                    ? 'Nominal Tambahan (Rp)'
                    : depositMode === 'SUBTRACT'
                    ? 'Nominal Penarikan (Rp)'
                    : 'Saldo Baru Keseluruhan (Rp)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-400 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={customAmountStr}
                    onChange={(e) => setCustomAmountStr(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Chip Buttons to fill or increment */}
              {depositMode !== 'SET' && (
                <div className="flex flex-wrap gap-1">
                  {[100000, 250000, 500000, 1000000, 2500000, 5000000].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleQuickChipAdd(chip)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      +{chip >= 1000000 ? `${chip / 1000000}jt` : `${chip / 1000}rb`}
                    </button>
                  ))}
                </div>
              )}

              {/* Preview calculation */}
              {parseFloat(customAmountStr) > 0 && (
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-zinc-500">Estimasi Saldo Akhir:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {formatRupiah(
                      depositMode === 'ADD'
                        ? activeDepositGoal.currentAmount + (parseFloat(customAmountStr) || 0)
                        : depositMode === 'SUBTRACT'
                        ? Math.max(0, activeDepositGoal.currentAmount - (parseFloat(customAmountStr) || 0))
                        : parseFloat(customAmountStr) || 0
                    )}
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDepositGoal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {depositLoading ? 'Menyimpan...' : 'Terapkan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                Edit Target Tabungan
              </h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Target Nominal (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Saldo Saat Ini (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Kepemilikan
                  </label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="JOINT">Bersama</option>
                    <option value="HUSBAND">Suami</option>
                    <option value="WIFE">Istri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Tenggat (Opsional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                Buat Target Baru
              </h3>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dana Darurat, Liburan Akhir Tahun"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Target Nominal (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Saldo Saat Ini (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Kepemilikan
                  </label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="JOINT">Bersama</option>
                    <option value="HUSBAND">Suami</option>
                    <option value="WIFE">Istri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Tenggat (Opsional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Catatan tambahan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs shadow-xs"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={() => fetchGoals()}
      />
    </div>
  );
}
