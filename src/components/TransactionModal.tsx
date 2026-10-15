'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { CategoryIcon } from './CategoryIcon';

interface Category {
  id: string;
  name: string;
  type: string;
  budgetRule: string;
  icon: string;
  color: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  owner: string;
  balance: number;
  color?: string;
  icon?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'EXPENSE',
}: TransactionModalProps) {
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [performedBy, setPerformedBy] = useState<'HUSBAND' | 'WIFE' | 'JOINT'>('JOINT');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchAccounts();
      setType(initialType);
      setAmountStr('');
      setTitle('');
      setNotes('');
      setErrorMsg('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialType]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAccounts(data.data);
        const defaultAcc = data.data.find((a: Account) => (a as any).isDefault) || data.data[0];
        setAccountId(defaultAcc.id);
        if (data.data.length > 1) {
          setToAccountId(data.data[1].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (type === 'TRANSFER') return false;
    return c.type === type;
  });

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, categories]);

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + addValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = parseFloat(amountStr);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('Masukkan nominal transaksi yang valid.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Keterangan transaksi harus diisi.');
      return;
    }

    if (!accountId) {
      setErrorMsg('Pilih rekening / dompet sumber.');
      return;
    }

    if (type === 'TRANSFER' && accountId === toAccountId) {
      setErrorMsg('Rekening asal dan tujuan tidak boleh sama.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          title: title.trim(),
          notes: notes.trim() || undefined,
          performedBy,
          categoryId: type !== 'TRANSFER' ? categoryId : undefined,
          accountId,
          toAccountId: type === 'TRANSFER' ? toAccountId : undefined,
          date,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(resData.error || 'Terjadi kesalahan saat menyimpan transaksi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal menghubungkan ke server.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden my-8 animate-in fade-in zoom-in-98 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            Catat Transaksi
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Type Selector (Segmented Tab) */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                type === 'EXPENSE'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                type === 'INCOME'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('TRANSFER')}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                type === 'TRANSFER'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Transfer
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">
              Nominal
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-medium text-zinc-400 text-sm font-mono">
                Rp
              </span>
              <input
                type="number"
                step="any"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold text-lg font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            {/* Quick addition chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {[50000, 100000, 250000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-0.5 text-[11px] font-mono rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Performer Selector (Clean Pills) */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">
              Penanggung Jawab Transaksi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPerformedBy('HUSBAND')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  performedBy === 'HUSBAND'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                Suami
              </button>
              <button
                type="button"
                onClick={() => setPerformedBy('WIFE')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  performedBy === 'WIFE'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                Istri
              </button>
              <button
                type="button"
                onClick={() => setPerformedBy('JOINT')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  performedBy === 'JOINT'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                Bersama
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Belanja Mingguan Pasar, Token Listrik, Bensin"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Category */}
          {type !== 'TRANSFER' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.budgetRule ? `(${c.budgetRule})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                {type === 'TRANSFER' ? 'Dari Rekening' : 'Rekening / Sumber'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatRupiah(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'TRANSFER' ? (
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Ke Rekening Tujuan
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatRupiah(a.balance)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>
            )}
          </div>

          {type === 'TRANSFER' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                Tanggal Transfer
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
