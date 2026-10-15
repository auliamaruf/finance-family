'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Delete, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

function UnlockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('from') || '/';
  const { theme, toggleTheme } = useTheme();

  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Hidden input ref for desktop keyboard focus
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus keyboard input on mount
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (digit: string) => {
    if (loading) return;
    setErrorMsg('');
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      // Auto submit if reached 6 digits
      if (nextPin.length === 6) {
        submitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (loading) return;
    setErrorMsg('');
    setPin('');
  };

  const submitPin = async (pinToSubmit: string) => {
    if (!pinToSubmit || loading) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToSubmit, rememberMe }),
      });

      const data = await res.json();
      if (data.success) {
        try {
          sessionStorage.setItem('keuangan_kita_unlocked', 'true');
        } catch (e) {}
        // Successfully unlocked, redirect
        router.push(redirectPath);
        router.refresh();
      } else {
        triggerError(data.error || 'PIN tidak sesuai');
      }
    } catch (err) {
      triggerError('Gagal memverifikasi PIN. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setPin('');
    setTimeout(() => setIsShaking(false), 500);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between items-center p-4 sm:p-6 text-zinc-900 dark:text-zinc-100 select-none font-sans">
      {/* Top Bar with theme toggle */}
      <div className="w-full max-w-sm flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Cloudflare Tunnel Protected</span>
        </div>

        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>
      </div>

      {/* Center Lock Screen Form */}
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6 my-auto">
        {/* App Icon */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-lg">
          <Lock className="w-6 h-6" strokeWidth={2.2} />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Keuangan Kita
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Masukkan PIN keamanan untuk mengakses data kas keluarga
          </p>
        </div>

        {/* Hidden keyboard input for physical typing on PC */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setPin(val);
            if (val.length === 6) {
              submitPin(val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submitPin(pin);
            }
          }}
          className="opacity-0 absolute pointer-events-none w-0 h-0"
          autoFocus
        />

        {/* PIN Dots Indicator (6 digits) */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`flex items-center justify-center gap-3 py-2 cursor-pointer ${
            isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
          }`}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                  isFilled
                    ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 scale-110'
                    : 'border-zinc-300 dark:border-zinc-700 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {errorMsg}
          </p>
        ) : (
          <p className="text-[11px] text-zinc-400">
            Klik nomor di bawah atau ketik langsung di keyboard
          </p>
        )}

        {/* Keypad */}
        <div className="w-full grid grid-cols-3 gap-2.5 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(String(num))}
              disabled={loading}
              className="h-13 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 border border-zinc-200/80 dark:border-zinc-800 text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || pin.length === 0}
            className="h-13 rounded-xl bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            Hapus
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={loading}
            className="h-13 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 border border-zinc-200/80 dark:border-zinc-800 text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-13 rounded-xl bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-300 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
            aria-label="Hapus satu angka"
          >
            <Delete className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Submit button for >4 digits or manual trigger */}
        {pin.length > 4 && (
          <button
            type="button"
            onClick={() => submitPin(pin)}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <span>Buka Akses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Remember me toggle */}
        <label className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900"
          />
          <span>Ingat sesi di perangkat ini (30 hari)</span>
        </label>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-sm text-center py-2">
        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
          PIN bawaan server: <code className="font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded font-bold">123456</code>
        </p>
      </div>
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-xs text-zinc-400">
          Memuat kunci keamanan...
        </div>
      }
    >
      <UnlockContent />
    </Suspense>
  );
}
