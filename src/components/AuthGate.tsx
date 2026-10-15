'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If on unlock page, no check needed
    if (pathname === '/unlock') {
      setChecking(false);
      return;
    }

    // Check if session flag is set in this browser session
    const isUnlocked = sessionStorage.getItem('keuangan_kita_unlocked') === 'true';

    if (!isUnlocked) {
      // Also verify with server API
      fetch('/api/auth/pin')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            sessionStorage.setItem('keuangan_kita_unlocked', 'true');
            setChecking(false);
          } else {
            router.replace('/unlock');
          }
        })
        .catch(() => {
          router.replace('/unlock');
        });
    } else {
      setChecking(false);
    }
  }, [pathname, router]);

  if (pathname === '/unlock') {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-3 font-sans">
        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-zinc-400 font-medium">Memverifikasi keamanan...</span>
      </div>
    );
  }

  return <>{children}</>;
}
