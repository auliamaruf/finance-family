# 💚 Keuangan Kita - Aplikasi Finansial Suami & Istri (Self-Hosted)

Aplikasi web modern, responsif, dan mudah digunakan yang dirancang khusus untuk membantu pasangan suami istri mengelola arus kas bulanan, menganalisa pengeluaran, membagi pos anggaran berdasarkan aturan **50/30/20**, serta mendapatkan evaluasi dan rekomendasi keuangan cerdas secara real-time.

Aplikasi ini dapat di-host sendiri (**self-hosted**) di server rumah (Ubuntu Server) Anda dan diakses aman dari mana saja melalui domain pribadi menggunakan **Cloudflare Tunnel** tanpa perlu membuka port (*no port forwarding*).

---

## ✨ Fitur Utama

1. **Dashboard Ringkasan & Analitik Visual Real-Time**:
   - Total Pemasukan, Total Pengeluaran, Arus Kas Bersih (*Net Cashflow*), dan Rasio Tabungan (*Saving Rate*).
   - Indikator kesehatan finansial bulanan (*Financial Health Score 0–100* & Grade A–F).
   - Rekomendasi pintar otomatis (evaluasi pemborosan, gaya hidup berlebih, laju belanja harian, benteng dana darurat).

2. **Atribusi Transparan: Suami vs Istri vs Bersama**:
   - Label penanggung jawab di setiap transaksi: **👨 Suami**, **👩 Istri**, atau **👨‍👩‍👧 Bersama**.
   - Grafik perbandingan porsi belanja berdua untuk transparansi tanpa rasa saling curiga.

3. **Perencanaan Anggaran Aturan 50 / 30 / 20**:
   - **50% Kebutuhan Pokok (*Needs*)**: Belanja sembako, cicilan/sewa rumah, listrik, air, internet, bensin/transportasi, sekolah anak, obat.
   - **30% Keinginan & Gaya Hidup (*Wants*)**: Makan di luar, jajan/kopi, belanja online, bioskop/hiburan, perawatan diri.
   - **20% Tabungan & Investasi (*Savings*)**: Dana darurat, reksadana, emas, investasi, pelunasan utang.
   - Bar pemantau anggaran kategori dengan peringatan warna (Hijau, Kuning 80%, Merah jika over-budget).

4. **Multi-Rekening & Dompet Digital**:
   - Rekening Bank (BCA, Mandiri, BRI, BNI, dll).
   - Dompet Tunai Suami & Istri.
   - E-Wallet (GoPay, OVO, ShopeePay, DANA).
   - Saldo rekening otomatis bertambah/berkurang saat transaksi dicatat atau transfer antar rekening.

5. **Target Tabungan & Impian Bersama (*Financial Goals*)**:
   - Tracking progres Dana Darurat, Liburan Keluarga, Tabungan Rumah, dll.
   - Tombol tambah dana instan (+500rb, +1jt, +2jt).

6. **Pencatatan Cepat & Mobile-First**:
   - Tampilan responsif optimal di layar HP dengan *Bottom Navigation Bar*.
   - Modal input cepat dengan tombol chip nominal instan (+50rb, +100rb, +500rb, +1jt).

7. **Export & Backup 1-Klik**:
   - Download seluruh riwayat transaksi ke format **Excel (.xlsx)**.
   - 1-Klik Download file database **SQLite (.db)** untuk kemudahan backup berkala.

8. **PWA (Progressive Web App)**:
   - Bisa dipasang (*Add to Home Screen*) di iOS (Safari) dan Android (Chrome) layaknya aplikasi native dari App Store / Play Store.

---

## 🚀 Panduan Menjalankan di Komputer Lokal

```bash
# 1. Masuk ke direktori
cd finance-app

# 2. Pasang dependensi
npm install

# 3. Sinkronkan database SQLite & isi data awal contoh
npx prisma db push
npx tsx prisma/seed.ts

# 4. Jalankan server lokal
npm run dev
```

Buka browser Anda di `http://localhost:3000`.

---

## 🌐 Panduan Deployment di Ubuntu Server (Home Server)

### Opsi A: Menggunakan PM2 (Rekomendasi - Sangat Ringan)

1. Salin folder proyek ke Ubuntu Server Anda (misal di `/var/www/finance-app`).
2. Masuk ke server via SSH dan jalankan:
   ```bash
   cd /var/www/finance-app
   npm install
   npx prisma db push
   npm run build

   # Pasang PM2 untuk auto-restart saat server reboot
   sudo npm install -g pm2
   pm2 start npm --name "finance-app" -- start
   pm2 save
   pm2 startup
   ```

Aplikasi kini aktif berjalan di `http://localhost:3000` di Ubuntu Server Anda.

---

### Opsi B: Menggunakan Docker Compose

Jika server Anda menggunakan Docker:
```bash
docker compose up -d --build
```

---

## 🔒 Menghubungkan ke Domain via Cloudflare Tunnel (Tanpa Port Forwarding)

Dengan Cloudflare Tunnel, Anda **TIDAK PERLU** membuka port router rumah, tidak perlu IP publik statis, dan langsung mendapatkan enkripsi HTTPS SSL gratis serta proteksi DDoS dari Cloudflare.

1. **Install Cloudflared di Ubuntu Server**:
   ```bash
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   ```

2. **Login ke Cloudflare**:
   ```bash
   cloudflared tunnel login
   ```
   Klik tautan yang muncul di terminal untuk otorisasi domain Anda di Cloudflare.

3. **Buat Tunnel Baru**:
   ```bash
   cloudflared tunnel create finance-tunnel
   ```
   *Catat Tunnel UUID yang ditampilkan.*

4. **Buat File Konfigurasi Tunnel (`~/.cloudflared/config.yml`)**:
   ```yaml
   tunnel: <UUID-TUNNEL-ANDA>
   credentials-file: /home/ubuntu/.cloudflared/<UUID-TUNNEL-ANDA>.json

   ingress:
     - hostname: keuangan.domainanda.com
       service: http://localhost:3000
     - service: http_status:404
   ```

5. **Hubungkan Domain & Jalankan sebagai Service**:
   ```bash
   # Route DNS ke domain Anda
   cloudflared tunnel route dns finance-tunnel keuangan.domainanda.com

   # Pasang sebagai background service Ubuntu
   sudo cloudflared service install
   sudo systemctl enable cloudflared
   sudo systemctl start cloudflared
   ```

Sekarang Anda dan Istri dapat mengakses aplikasi keuangan keluarga Anda dari mana saja di seluruh dunia melalui `https://keuangan.domainanda.com`!

---

## 📱 Memasang di Layar Utama HP (PWA)

- **iPhone (iOS Safari)**: Kunjungi `https://keuangan.domainanda.com` > Tekan ikon **Share** (kotak panah ke atas) > Pilih **"Add to Home Screen"**.
- **Android (Google Chrome)**: Kunjungi tautan > Tekan menu titik tiga di kanan atas > Pilih **"Install app"** atau **"Tambahkan ke Layar Utama"**.
