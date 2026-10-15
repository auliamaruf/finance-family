'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex items-center gap-2 px-2 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-2xs group active:scale-95"
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
    >
      <div className="relative w-4 h-4 overflow-hidden flex items-center justify-center">
        <Sun
          className={`w-4 h-4 absolute transition-all duration-300 transform ${
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`}
          strokeWidth={1.8}
        />
        <Moon
          className={`w-4 h-4 absolute transition-all duration-300 transform ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-sky-400'
              : '-rotate-90 scale-0 opacity-0'
          }`}
          strokeWidth={1.8}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Mode Gelap' : 'Mode Terang'}
        </span>
      )}
    </button>
  );
}
