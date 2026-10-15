'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Wallet,
  Target,
  Server,
  Plus,
  Menu,
  X,
  CreditCard,
  Download,
  Lock,
  KeyRound,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SecurityPinModal } from './SecurityPinModal';

interface NavbarProps {
  onOpenTransactionModal?: () => void;
  activeProfile?: string;
  setActiveProfile?: (profile: string) => void;
}

export function Navbar({ onOpenTransactionModal, activeProfile = 'ALL', setActiveProfile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const navItems = [
    { label: 'Ringkasan', href: '/', icon: LayoutDashboard },
    { label: 'Transaksi', href: '/transaksi', icon: Receipt },
    { label: 'Anggaran', href: '/anggaran', icon: PiggyBank },
    { label: 'Rekening', href: '/rekening', icon: Wallet },
    { label: 'Target', href: '/target', icon: Target },
    { label: 'Server & Cloudflare', href: '/panduan-server', icon: Server },
  ];

  const handleLockScreen = async () => {
    try {
      sessionStorage.removeItem('keuangan_kita_unlocked');
      await fetch('/api/auth/pin', { method: 'DELETE' });
    } catch (e) {}
    router.replace('/unlock');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-xs transition-transform group-hover:scale-102">
                  <CreditCard className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Keuangan Kita
                  </span>
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium tracking-wide">
                    Kas Keluarga
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Profile Segmented Switcher */}
              {setActiveProfile && (
                <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs font-medium border border-zinc-200/60 dark:border-zinc-800/60">
                  <button
                    onClick={() => setActiveProfile('ALL')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                      activeProfile === 'ALL'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setActiveProfile('HUSBAND')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                      activeProfile === 'HUSBAND'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Suami
                  </button>
                  <button
                    onClick={() => setActiveProfile('WIFE')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                      activeProfile === 'WIFE'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Istri
                  </button>
                  <button
                    onClick={() => setActiveProfile('JOINT')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                      activeProfile === 'JOINT'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Bersama
                  </button>
                </div>
              )}

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Change PIN Button */}
              <button
                onClick={() => setIsPinModalOpen(true)}
                type="button"
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-2xs"
                title="Ganti PIN Keamanan (6 Digit)"
                aria-label="Ganti PIN"
              >
                <KeyRound className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>

              {/* Quick Lock Button */}
              <button
                onClick={handleLockScreen}
                type="button"
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-2xs"
                title="Kunci Akses / Layar"
                aria-label="Kunci Akses"
              >
                <Lock className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>

              {/* Quick Add Button */}
              {onOpenTransactionModal && (
                <button
                  onClick={onOpenTransactionModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
                  <span>Catat</span>
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPinModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" strokeWidth={1.8} />
                <span>Ganti PIN Keamanan</span>
              </button>

              <button
                onClick={handleLockScreen}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <Lock className="w-4 h-4" strokeWidth={1.8} />
                <span>Kunci Akses / Layar</span>
              </button>

              <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-500">
                <span>Tema Tampilan</span>
                <ThemeToggle showLabel />
              </div>

              <a
                href="/api/backup"
                download
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <Download className="w-4 h-4" strokeWidth={1.8} />
                <span>Download Backup SQLite (.db)</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Security PIN Change Modal */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1.5 flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname === '/' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" strokeWidth={pathname === '/' ? 2.2 : 1.7} />
          Ringkasan
        </Link>
        <Link
          href="/transaksi"
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname === '/transaksi' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400'
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" strokeWidth={pathname === '/transaksi' ? 2.2 : 1.7} />
          Transaksi
        </Link>

        {/* Center Minimalist Plus Button */}
        {onOpenTransactionModal && (
          <button
            onClick={onOpenTransactionModal}
            className="-mt-4 w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-md active:scale-95 transition-transform"
            aria-label="Catat Transaksi"
          >
            <Plus className="w-5 h-5" strokeWidth={2.2} />
          </button>
        )}

        <Link
          href="/anggaran"
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname === '/anggaran' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400'
          }`}
        >
          <PiggyBank className="w-4 h-4 mb-0.5" strokeWidth={pathname === '/anggaran' ? 2.2 : 1.7} />
          Anggaran
        </Link>
        <Link
          href="/rekening"
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname === '/rekening' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400'
          }`}
        >
          <Wallet className="w-4 h-4 mb-0.5" strokeWidth={pathname === '/rekening' ? 2.2 : 1.7} />
          Rekening
        </Link>
      </div>
    </>
  );
}
