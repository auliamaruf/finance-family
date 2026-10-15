'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TransactionModal } from '@/components/TransactionModal';
import { SecurityPinModal } from '@/components/SecurityPinModal';
import { formatRupiah, ROLE_LABELS } from '@/lib/utils';
import {
  Wallet,
  Landmark,
  Smartphone,
  TrendingUp,
  Plus,
  Trash2,
  X,
  Edit2,
  SlidersHorizontal,
  Check,
  Building2,
  Sparkles,
  KeyRound,
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
  owner: string;
  balance: number;
  accountNumber?: string | null;
  color?: string | null;
  icon?: string | null;
  isDefault?: boolean;
}

const PRESET_OPTIONS = [
  { name: 'BCA Tabungan', type: 'BANK', icon: 'Building2', owner: 'JOINT' },
  { name: 'Mandiri Livin', type: 'BANK', icon: 'Landmark', owner: 'JOINT' },
  { name: 'BRI Britama', type: 'BANK', icon: 'Landmark', owner: 'JOINT' },
  { name: 'BNI Taplus', type: 'BANK', icon: 'Landmark', owner: 'JOINT' },
  { name: 'Bank Jago', type: 'BANK', icon: 'Landmark', owner: 'JOINT' },
  { name: 'SeaBank', type: 'BANK', icon: 'Landmark', owner: 'JOINT' },
  { name: 'BSI Hasanah', type: 'BANK', icon: 'Landmark', owner: 'JOINT' },
  { name: 'GoPay', type: 'EWALLET', icon: 'Smartphone', owner: 'HUSBAND' },
  { name: 'ShopeePay', type: 'EWALLET', icon: 'Smartphone', owner: 'WIFE' },
  { name: 'OVO', type: 'EWALLET', icon: 'Smartphone', owner: 'HUSBAND' },
  { name: 'DANA', type: 'EWALLET', icon: 'Smartphone', owner: 'WIFE' },
  { name: 'Dompet Tunai Suami', type: 'CASH', icon: 'Wallet', owner: 'HUSBAND' },
  { name: 'Dompet Tunai Istri', type: 'CASH', icon: 'Wallet', owner: 'WIFE' },
];

export default function RekeningPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [filterOwner, setFilterOwner] = useState<string>('ALL');

  // Add Account Modal
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('BANK');
  const [owner, setOwner] = useState('JOINT');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Edit Account Modal
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('BANK');
  const [editOwner, setEditOwner] = useState('JOINT');
  const [editBalance, setEditBalance] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');

  // Bulk Initial Balance Wizard Modal
  const [isBulkBalanceModalOpen, setIsBulkBalanceModalOpen] = useState(false);
  const [bulkBalances, setBulkBalances] = useState<{ [id: string]: string }>({});
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenBulkModal = () => {
    const initialMap: { [id: string]: string } = {};
    accounts.forEach((acc) => {
      initialMap[acc.id] = String(acc.balance);
    });
    setBulkBalances(initialMap);
    setIsBulkBalanceModalOpen(true);
  };

  const handleSaveBulkBalances = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBulk(true);
    setBulkSuccessMsg('');

    try {
      const updates = accounts.map((acc) => ({
        id: acc.id,
        balance: parseFloat(bulkBalances[acc.id]) || 0,
      }));

      const res = await fetch('/api/accounts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();
      if (data.success) {
        setBulkSuccessMsg('Seluruh saldo awal berhasil disesuaikan!');
        fetchAccounts();
        setTimeout(() => {
          setIsBulkBalanceModalOpen(false);
          setBulkSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBulk(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_OPTIONS[0]) => {
    setName(preset.name);
    setType(preset.type);
    setOwner(preset.owner);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          owner,
          balance: parseFloat(balance) || 0,
          accountNumber: accountNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddAccountModalOpen(false);
        setName('');
        setBalance('');
        setAccountNumber('');
        fetchAccounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditType(acc.type);
    setEditOwner(acc.owner);
    setEditBalance(String(acc.balance));
    setEditAccountNumber(acc.accountNumber || '');
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editName.trim()) return;

    try {
      const res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          type: editType,
          owner: editOwner,
          balance: parseFloat(editBalance) || 0,
          accountNumber: editAccountNumber.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingAccount(null);
        fetchAccounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async (id: string, accName: string) => {
    if (!confirm(`Hapus rekening "${accName}"? Riwayat transaksi sebelumnya tetap akan tersimpan.`)) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAccounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAccounts = accounts.filter(
    (acc) => filterOwner === 'ALL' || acc.owner === filterOwner
  );

  const totalLiquidWealth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const husbandTotal = accounts.filter((a) => a.owner === 'HUSBAND').reduce((sum, a) => sum + a.balance, 0);
  const wifeTotal = accounts.filter((a) => a.owner === 'WIFE').reduce((sum, a) => sum + a.balance, 0);
  const jointTotal = accounts.filter((a) => a.owner === 'JOINT').reduce((sum, a) => sum + a.balance, 0);

  const getAccountIcon = (accType: string) => {
    switch (accType) {
      case 'BANK':
        return <Landmark className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.8} />;
      case 'EWALLET':
        return <Smartphone className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.8} />;
      case 'INVESTMENT':
        return <TrendingUp className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.8} />;
      default:
        return <Wallet className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.8} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 md:pb-16 font-sans">
      <Navbar onOpenTransactionModal={() => setIsModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Rekening & Dompet
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Kelola daftar bank, akun e-wallet, dan saldo awal untuk suami, istri, dan kas bersama
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Change PIN Button */}
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>Ganti PIN (6 Digit)</span>
            </button>

            {/* Quick Balance Adjustment Button */}
            <button
              onClick={handleOpenBulkModal}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>Sesuaikan Saldo Awal</span>
            </button>

            {/* Add Account Button */}
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>Tambah Rekening</span>
            </button>
          </div>
        </div>

        {/* Wealth Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
              Total Seluruh Kas Likuid
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 mb-0.5">
              {formatRupiah(totalLiquidWealth)}
            </div>
            <p className="text-[11px] text-zinc-400">
              {accounts.length} rekening aktif
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Saldo Milik Suami
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                Suami
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 mb-0.5">
              {formatRupiah(husbandTotal)}
            </div>
            <p className="text-[11px] text-zinc-400">
              {accounts.filter((a) => a.owner === 'HUSBAND').length} akun terdaftar
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Saldo Milik Istri
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                Istri
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 mb-0.5">
              {formatRupiah(wifeTotal)}
            </div>
            <p className="text-[11px] text-zinc-400">
              {accounts.filter((a) => a.owner === 'WIFE').length} akun terdaftar
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Saldo Kas Bersama
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Bersama
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 mb-0.5">
              {formatRupiah(jointTotal)}
            </div>
            <p className="text-[11px] text-zinc-400">
              {accounts.filter((a) => a.owner === 'JOINT').length} akun terdaftar
            </p>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg w-fit border border-zinc-200/60 dark:border-zinc-800">
          {[
            { id: 'ALL', label: 'Semua Rekening' },
            { id: 'HUSBAND', label: 'Milik Suami' },
            { id: 'WIFE', label: 'Milik Istri' },
            { id: 'JOINT', label: 'Kas Bersama' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterOwner(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filterOwner === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex flex-col justify-between space-y-4 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {acc.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-400 capitalize">
                        {acc.type.toLowerCase()}
                      </span>
                      {acc.accountNumber && (
                        <>
                          <span className="text-[10px] text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {acc.accountNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                    ROLE_LABELS[acc.owner]?.badge || 'bg-zinc-100'
                  }`}
                >
                  {ROLE_LABELS[acc.owner]?.label || acc.owner}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  Saldo Saat Ini
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {formatRupiah(acc.balance)}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEditModal(acc)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah / Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteAccount(acc.id, acc.name)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Hapus Rekening"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL 1: Bulk Initial Balance Wizard */}
      {isBulkBalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Sesuaikan Saldo Awal Keluarga
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Ubah saldo seluruh rekening bank, e-wallet, dan kas tunai sekaligus
                </p>
              </div>
              <button
                onClick={() => setIsBulkBalanceModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bulkSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveBulkBalances} className="space-y-4 flex-1 overflow-y-auto pr-1">
              {['HUSBAND', 'WIFE', 'JOINT'].map((groupOwner) => {
                const groupAccounts = accounts.filter((a) => a.owner === groupOwner);
                if (groupAccounts.length === 0) return null;

                const groupLabel =
                  groupOwner === 'HUSBAND'
                    ? 'Rekening & Dompet Suami'
                    : groupOwner === 'WIFE'
                    ? 'Rekening & Dompet Istri'
                    : 'Rekening & Kas Bersama';

                return (
                  <div key={groupOwner} className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                      {groupLabel}
                    </span>
                    <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                      {groupAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                              {acc.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 capitalize">
                              {acc.type.toLowerCase()}
                            </span>
                          </div>

                          <div className="w-44 flex items-center gap-1.5">
                            <span className="text-zinc-400 font-mono text-[11px]">Rp</span>
                            <input
                              type="number"
                              step="any"
                              value={bulkBalances[acc.id] ?? ''}
                              onChange={(e) =>
                                setBulkBalances({
                                  ...bulkBalances,
                                  [acc.id]: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-medium text-right text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkBalanceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingBulk}
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingBulk ? 'Menyimpan...' : 'Simpan Semua Saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Account Modal with Fast Presets */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Tambah Rekening / Dompet
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Pilih preset instan atau isi secara manual
                </p>
              </div>
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="block text-[11px] font-medium text-zinc-500 mb-1.5">
                Pilihan Cepat (Preset)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_OPTIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Nama Rekening / Dompet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Gaji, GoPay Suami, Dompet Tunai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Jenis
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="BANK">Bank</option>
                    <option value="CASH">Dompet Tunai</option>
                    <option value="EWALLET">E-Wallet</option>
                    <option value="INVESTMENT">Investasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Kepemilikan
                  </label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="JOINT">Kas Bersama</option>
                    <option value="HUSBAND">Milik Suami</option>
                    <option value="WIFE">Milik Istri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Nomor Rekening / No. HP (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 8830192811 atau 08123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs shadow-xs cursor-pointer"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Ubah Rekening / Sesuaikan Saldo
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Perbarui nama, kepemilikan, atau saldo rekening
                </p>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Nama Rekening
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Jenis
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="BANK">Bank</option>
                    <option value="CASH">Dompet Tunai</option>
                    <option value="EWALLET">E-Wallet</option>
                    <option value="INVESTMENT">Investasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Kepemilikan
                  </label>
                  <select
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="JOINT">Kas Bersama</option>
                    <option value="HUSBAND">Milik Suami</option>
                    <option value="WIFE">Milik Istri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Saldo Saat Ini (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Nomor Rekening / No. HP
                </label>
                <input
                  type="text"
                  value={editAccountNumber}
                  onChange={(e) => setEditAccountNumber(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs shadow-xs cursor-pointer"
                >
                  Perbarui Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchAccounts()}
      />

      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
}
