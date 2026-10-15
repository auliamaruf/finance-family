'use client';

import React, { useState } from 'react';
import { X, Lock, KeyRound, Check } from 'lucide-react';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityPinModal({ isOpen, onClose }: SecurityPinModalProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError('PIN baru harus tepat 6 digit angka.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('PIN keamanan keluarga 6 digit berhasil diperbarui!');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Gagal mengubah PIN');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-4 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                Ganti PIN Keamanan (6 Digit)
              </h3>
              <p className="text-[10px] text-zinc-400">
                Proteksi akses via Cloudflare Tunnel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">
              PIN Saat Ini
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              maxLength={8}
              placeholder="Contoh: 123456 (atau 1234 jika lama)"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-zinc-500">
                PIN Baru (6 Angka)
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {newPin.length}/6
              </span>
            </div>
            <input
              type="password"
              inputMode="numeric"
              required
              maxLength={6}
              placeholder="Masukkan 6 digit angka"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-zinc-500">
                Konfirmasi PIN Baru (6 Angka)
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {confirmPin.length}/6
              </span>
            </div>
            <input
              type="password"
              inputMode="numeric"
              required
              maxLength={6}
              placeholder="Ulangi 6 digit angka"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || newPin.length !== 6 || confirmPin.length !== 6}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Perbarui PIN (6 Digit)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
