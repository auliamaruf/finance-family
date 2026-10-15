'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { SecurityPinModal } from '@/components/SecurityPinModal';
import {
  Server,
  Copy,
  Check,
  Download,
  Smartphone,
  KeyRound,
} from 'lucide-react';

export default function PanduanServerPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 md:pb-16 font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono mb-2 border border-zinc-200/60 dark:border-zinc-700/60">
            <Server className="w-3.5 h-3.5" />
            <span>Deployment Guide</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Panduan Ubuntu Server & Cloudflare Tunnel
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Langkah setup hosting mandiri di server rumah dan menghubungkannya ke domain pribadi via Cloudflare Tunnel tanpa perlu port forwarding.
          </p>
        </div>

        {/* Step 1: Ubuntu Server Setup */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
              1
            </span>
            <div>
              <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Menjalankan Aplikasi di Ubuntu Server
              </h2>
              <p className="text-xs text-zinc-400">
                Gunakan Node.js + PM2 untuk manajemen proses otomatis
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="relative group">
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800">
{`# 1. Pindah ke direktori proyek di server
cd /var/www/finance-app

# 2. Pasang dependensi & sinkronkan database
npm install
npx prisma db push
npm run build

# 3. Jalankan aplikasi di latar belakang dengan PM2
sudo npm install -g pm2
pm2 start npm --name "finance-app" -- start
pm2 save
pm2 startup`}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(
                    `cd /var/www/finance-app\nnpm install\nnpx prisma db push\nnpm run build\nsudo npm install -g pm2\npm2 start npm --name "finance-app" -- start\npm2 save\npm2 startup`,
                    'step1'
                  )
                }
                className="absolute top-2.5 right-2.5 p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                title="Salin Perintah"
              >
                {copiedId === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </section>

        {/* Step 2: Cloudflare Tunnel */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
              2
            </span>
            <div>
              <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Setup Cloudflare Tunnel (Tanpa Port Forwarding)
              </h2>
              <p className="text-xs text-zinc-400">
                Akses aman melalui domain pribadi dengan enkripsi HTTPS
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <div>
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                A. Instalasi `cloudflared` di Ubuntu
              </h4>
              <div className="relative">
                <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto border border-zinc-800">
{`curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb`}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb\nsudo dpkg -i cloudflared.deb`,
                      'cf-install'
                    )
                  }
                  className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  {copiedId === 'cf-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                B. Otorisasi & Buat Tunnel
              </h4>
              <div className="relative">
                <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto border border-zinc-800">
{`cloudflared tunnel login
cloudflared tunnel create finance-tunnel`}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `cloudflared tunnel login\ncloudflared tunnel create finance-tunnel`,
                      'cf-create'
                    )
                  }
                  className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  {copiedId === 'cf-create' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                C. Buat File Konfigurasi (~/.cloudflared/config.yml)
              </h4>
              <div className="relative">
                <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto border border-zinc-800">
{`tunnel: <UUID-TUNNEL-ANDA>
credentials-file: /home/ubuntu/.cloudflared/<UUID-TUNNEL-ANDA>.json

ingress:
  - hostname: keuangan.domainanda.com
    service: http://localhost:3000
  - service: http_status:404`}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `tunnel: <UUID-TUNNEL-ANDA>\ncredentials-file: /home/ubuntu/.cloudflared/<UUID-TUNNEL-ANDA>.json\n\ningress:\n  - hostname: keuangan.domainanda.com\n    service: http://localhost:3000\n  - service: http_status:404`,
                      'cf-config'
                    )
                  }
                  className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  {copiedId === 'cf-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                D. Hubungkan Domain & Aktifkan Service
              </h4>
              <div className="relative">
                <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto border border-zinc-800">
{`cloudflared tunnel route dns finance-tunnel keuangan.domainanda.com
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared`}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `cloudflared tunnel route dns finance-tunnel keuangan.domainanda.com\nsudo cloudflared service install\nsudo systemctl enable cloudflared\nsudo systemctl start cloudflared`,
                      'cf-route'
                    )
                  }
                  className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  {copiedId === 'cf-route' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: PWA on Phone */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
              3
            </span>
            <div>
              <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Pasang di Layar Utama HP (PWA)
              </h2>
              <p className="text-xs text-zinc-400">
                Akses cepat dari HP tanpa instalasi App Store / Play Store
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1.5">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                iOS (Safari)
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Buka domain di Safari &rarr; Tap ikon <strong>Share</strong> di bawah layar &rarr; Pilih <strong>"Add to Home Screen"</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1.5">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                Android (Chrome)
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Buka domain di Chrome &rarr; Tap menu titik tiga di kanan atas &rarr; Pilih <strong>"Install app"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Step 4: Backup */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                4
              </span>
              <div>
                <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Cadangan Database SQLite
                </h2>
                <p className="text-xs text-zinc-400">
                  Data tersimpan lokal di server rumah Anda
                </p>
              </div>
            </div>

            <a
              href="/api/backup"
              download
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup (.db)</span>
            </a>
          </div>
        </section>

        {/* Step 5: PIN Security */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                5
              </span>
              <div>
                <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Proteksi Akses PIN & Kunci Sesi
                </h2>
                <p className="text-xs text-zinc-400">
                  Melindungi akses aplikasi saat dipublikasikan ke internet via Cloudflare Tunnel
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Aplikasi secara otomatis diproteksi oleh PIN keamanan. Setiap pengguna yang mengakses domain Anda diwajibkan memasukkan PIN sebelum dapat melihat atau mengubah catatan keuangan keluarga.
          </p>

          <div className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                PIN Bawaan Awal:
              </span>
              <code className="font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2.5 py-0.5 rounded font-bold">
                123456
              </code>
            </div>
            <p className="text-[11px] text-zinc-400">
              PIN wajib berupa 6 digit angka untuk keamanan optimal saat diakses melalui Cloudflare Tunnel.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Ganti PIN Keamanan (6 Digit)</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
}
