# AleraSight HomeGuard - Laravel 12 + Bootstrap 5 Full-Stack Implementation

Proyek ini adalah implementasi backend full-stack menggunakan **Laravel 12 (PHP 8.2+)**, **MySQL**, dan **Bootstrap 5** untuk aplikasi **AleraSight HomeGuard**. Proyek ini dirancang agar siap di-download, di-export, dan dijalankan langsung di lingkungan lokal Anda.

Seluruh file kode sumber Laravel lengkap telah dibuat di dalam folder `/laravel-homeguard` pada workspace ini. Anda dapat mengunduh seluruh isi proyek ini melalui menu Settings di pojok kanan atas -> **Export to ZIP** atau menghubungkannya ke **GitHub**.

---

## 🚀 Fitur Utama Laravel 12 HomeGuard
1. **Multi-Role Authentication**: Login khusus untuk **Administrator** dan **Operator** dengan hak akses yang terproteksi (Middleware).
2. **Dashboard Real-Time**: Ringkasan data kebakaran, status perangkat, confidence score rata-rata, dan peta interaktif GIS dengan penanda dinamis.
3. **Interactive IoT Simulator & Calibration**: Panel simulator langsung pada dashboard untuk memicu simulasi kondisi AMAN, WASPADA, atau BAHAYA secara instan serta mengubah confidence score dan sumber sensor.
4. **SHT20 & MQ-2 Telemetry Chart**: Visualisasi riwayat telemetri berupa grafik interaktif interaksi Suhu (°C) dan Level Gas (ppm) yang didesain modern menggunakan Chart.js.
5. **Master Data Perangkat (CRUD)**: Create, Read, Update, Delete untuk perangkat IoT, tipe, lokasi latitude/longitude, dan status keaktifan kamera.
6. **Master Data Anggota Tim (CRUD)**: Kelola pengguna, telepon, email, password, dan pembagian hak akses (eksklusif Admin).
7. **Master Data Deteksi Api (Fire Logs & Raw Data)**: Riwayat klasifikasi visual, confidence score, snapshot URL, dan status mitigasi.
8. **Sistem Notifikasi & Alarm**: Integrasi status buzzer sirine dan simulasi pengiriman notifikasi Telegram Bot.
9. **Database Seeding**: Otomatis membuat akun admin, operator, dan contoh perangkat awal untuk demo langsung.

---

## 📂 Struktur Folder Proyek Laravel yang Disediakan
Berikut adalah struktur file penting yang telah kami susun secara modular dan rapi di dalam `/laravel-homeguard`:
- `app/Models/` -> `User.php`, `Device.php`, `FireLog.php`
- `app/Http/Controllers/` -> `AuthController.php`, `DashboardController.php`, `DeviceController.php`, `FireLogController.php`
- `app/Http/Middleware/` -> `RoleMiddleware.php`
- `database/migrations/` -> Migrasi tabel `users`, `devices`, `fire_logs`
- `database/seeders/` -> `DatabaseSeeder.php` (Seeding default Admin & Operator)
- `routes/` -> `web.php` (Routing terproteksi)
- `resources/views/` -> Blade templates terintegrasi Bootstrap 5 (Responsive Layout, Dashboard, CRUD, Logs)
- `.env.example` -> Konfigurasi database MySQL

---

## 🛠️ Langkah-Langkah Instalasi di Komputer Lokal

Ikuti panduan berikut untuk menjalankan proyek ini di komputer Anda:

### 1. Prasyarat (Prerequisites)
Pastikan komputer Anda sudah terinstall software berikut:
- **PHP >= 8.2**
- **Composer** (Dependency Manager untuk PHP)
- **Node.js & npm** (Untuk compiling Bootstrap/Vite asset)
- **MySQL Database Server** (XAMPP / Laragon / Docker)

### 2. Ekstrak Proyek dan Masuk ke Folder
Jika Anda mengunduh file ZIP dari AI Studio, ekstrak file tersebut, buka Terminal / Command Prompt, lalu navigasikan ke folder proyek:
```bash
cd laravel-homeguard
```

### 3. Install Dependensi PHP dan Node.js
Jalankan perintah berikut untuk mengunduh library PHP (Laravel) dan aset CSS/JS:
```bash
# Install PHP Dependencies
composer install

# Install Frontend Dependencies (Bootstrap 5)
npm install
```

### 4. Konfigurasi Environment File
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` menggunakan teks editor (VS Code, Notepad, dll), lalu sesuaikan konfigurasi database MySQL Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=homeguard_db
DB_USERNAME=root
DB_PASSWORD=
```
*Catatan: Pastikan Anda telah membuat database kosong bernama `homeguard_db` di phpMyAdmin atau aplikasi DBMS Anda.*

### 5. Generate Application Key & Jalankan Migrasi Database
Jalankan perintah ini untuk mengamankan enkripsi aplikasi dan membangun struktur tabel MySQL beserta data contoh awal (Seeder):
```bash
# Generate Key
php artisan key:generate

# Run Migrations & Seeders
php artisan migrate --seed
```

### 6. Jalankan Dev Server
Sekarang, Anda siap menjalankan server lokal Laravel dan compiler Vite:
```bash
# Jalankan server PHP (Default: http://127.0.0.1:8000)
php artisan serve
```
Di terminal terpisah, jalankan asset compiler untuk memuat Bootstrap 5 secara optimal:
```bash
npm run dev
```

---

## 🔑 Akun Login Bawaan (Default Credentials)
Gunakan akun berikut setelah menjalankan perintah `php artisan migrate --seed`:

| Role | Email | Password | Hak Akses / Otorisasi |
|---|---|---|---|
| **Administrator** | `admin@homeguard.com` | `password123` | Full akses CRUD, Pengaturan AI, Riwayat Log, & Laporan |
| **Operator** | `operator@homeguard.com` | `password123` | Monitoring Real-time, Menangani Alarm, & Lihat Logs |

---

*Selamat menggunakan AleraSight HomeGuard berbasis Laravel 12! Proyek ini siap dikembangkan lebih lanjut untuk diintegrasikan dengan hardware IoT riil dan model deteksi api.*
