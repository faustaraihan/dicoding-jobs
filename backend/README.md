# Dicoding Jobs Backend

REST API Laravel untuk daftar, detail, pencarian judul, pembuatan, perubahan, penghapusan lowongan, serta upload gambar deskripsi. Database aplikasi menggunakan MySQL; tes menggunakan SQLite terpisah.

Panduan setup lengkap, SQL pembuatan database, konfigurasi environment, kontrak API, dan troubleshooting tersedia di [README utama](../README.md).

## Setup

Jalankan dari folder `backend` dengan PHP 8.4.1+ yang kompatibel dengan lockfile, Composer 2, Node.js, dan MySQL aktif:

```bash
composer install
npm ci
```

Untuk instalasi baru, salin `.env.example` menjadi `.env`. Pada PowerShell:

```powershell
Copy-Item .env.example .env
```

Pada Bash, gunakan `cp .env.example .env`. Sesuaikan `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` dengan database lokal. Tetapkan `APP_URL=http://127.0.0.1:8000` dan pertahankan `APP_TIMEZONE=UTC`.

```bash
php artisan key:generate
php artisan config:clear
php artisan migrate --seed
php artisan storage:link
composer check-platform-reqs
php artisan serve --host=127.0.0.1 --port=8000
```

Seed awal mengisi kota/kabupaten; buat lowongan pertama melalui Dashboard frontend. Storage link diperlukan untuk gambar upload. Dependency npm backend digunakan oleh tooling format/lint; REST API tidak membutuhkan Vite development server.

## Tes

```bash
php artisan config:clear
php artisan test --compact
```

Menjalankan suite secara terpisah:

```bash
php artisan test --compact --testsuite=Unit
php artisan test --compact --testsuite=Feature
```

Suite Unit menguji helper deadline. Suite Feature menguji integrasi request API, validasi respons, dan persistensi database. `phpunit.xml` memakai SQLite `:memory:`; aktifkan `pdo_sqlite`. Suite ini tidak memakai database MySQL aplikasi atau server development yang sedang berjalan.

Tes Playwright yang mengintegrasikan backend dengan frontend dijalankan dari folder `frontend`; lihat [panduan seluruh tes](../README.md#menjalankan-seluruh-tes).

## Format dan lint

```bash
composer check
```

Pemeriksaan mencakup Laravel Pint untuk PHP/Blade, Prettier untuk file pendukung, dan ESLint untuk JavaScript. Untuk merapikan file:

```bash
composer format
npm run lint:fix
```

## API

Semua endpoint memiliki prefix `/api/v1`. Lihat daftar route dengan:

```bash
php artisan route:list --path=api --except-vendor
```

Endpoint tersedia untuk `vacancies`, `vacancies/{id}`, `vacancies/{id}/edit`, `vacancy-options`, dan `vacancy-images`. Detail method, payload, pagination, serta kode respons tersedia di [ringkasan API](../README.md#ringkasan-api).

Profil perusahaan berasal dari `config/company.php`. Endpoint pengelolaan belum memakai autentikasi. Timestamp disimpan dalam UTC; batas tanggal lamaran dikonversi dari akhir hari Asia/Jakarta. `show_salary=false` menyembunyikan nominal pada respons publik, sedangkan endpoint edit tetap mengembalikannya.
