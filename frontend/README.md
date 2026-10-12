# Dicoding Jobs

Frontend Next.js untuk daftar, pencarian, detail, dan pengelolaan lowongan kerja. API Laravel berada di folder `backend`.

Panduan setup kedua aplikasi, konfigurasi MySQL, kontrak API, serta troubleshooting tersedia di [README utama](../README.md). Semua perintah dalam dokumen ini dijalankan dari folder `frontend`.

## Menjalankan frontend

Gunakan Node.js 22.22.2+ pada major 22, 24.15.0+ pada major 24, atau 26+. Pasang dependency, salin `.env.example` menjadi `.env.local` untuk instalasi baru, lalu pastikan `NEXT_PUBLIC_API_BASE_URL` menunjuk ke alamat API Laravel dan berakhiran `/api/v1`. Jika environment lokal sudah ada, sesuaikan file tersebut tanpa menimpanya.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Di PowerShell, gunakan `Copy-Item .env.example .env.local` sebagai pengganti `cp`. `NEXT_PUBLIC_API_BASE_URL` adalah alamat API publik yang dipakai browser, bukan tempat menyimpan secret. Setelah mengubahnya, restart server Next.js.

Contoh konfigurasi lokal:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Jalankan Laravel sesuai README utama, kemudian buka `http://localhost:3000`. Route `/` mengarah ke `/list`. Dari `/dashboard`, pilih **Buat lowongan** untuk mengisi daftar awal; seed backend hanya membuat pilihan lokasi. Pencarian judul berjalan otomatis setelah jeda 300 ms dan minimum tiga karakter.

## Build produksi

Pastikan environment sudah dikonfigurasi sebelum build:

```bash
npm run build
npm run start
```

Hentikan server development jika memakai port 3000 yang sama. Laravel tetap perlu berjalan. Perubahan `NEXT_PUBLIC_API_BASE_URL` memerlukan build ulang. Pengambilan font Inter melalui `next/font/google` membutuhkan akses internet.

## Format dan lint

Pasang dependency dengan `npm ci`. Prettier merapikan TypeScript, JSX, CSS, dan file pendukung, sekaligus mengurutkan class Tailwind. ESLint memakai aturan Next.js dan TypeScript; aturan format yang bertabrakan dengan Prettier dinonaktifkan.

```bash
npm run format
npm run lint:fix
npm run check
```

`format` dan `lint:fix` mengubah file. `check` hanya memeriksa format, lint (tanpa warning), dan tipe TypeScript. Untuk build produksi, jalankan `npm run build`. File hasil build, laporan tes, lockfile, dan environment tidak ikut diformat.

Untuk format saat menyimpan di VS Code, pasang ekstensi Prettier dan ESLint lalu pilih Prettier sebagai formatter frontend. Pengaturan editor pribadi di `.vscode` diabaikan Git; konfigurasi format/lint proyek tetap disertakan.

## Unit test frontend

Vitest dan React Testing Library menguji komponen secara terisolasi dengan jsdom. Jalankan dari folder `frontend` menggunakan Node.js 22.22.2+, 24.15.0+, atau 26+ setelah `npm ci`.

```bash
npm test
npm run test:watch
npm run test:coverage
```

Unit test mencakup normalisasi keyword, batas tiga karakter dan debounce pencarian, pagination, input nominal gaji, combobox keyboard/pilihan, serta penanganan sukses/error client API. Permintaan API dimock; tes ini tidak memakai Laravel, database, atau server yang sedang berjalan. Playwright tetap memeriksa integrasi aplikasi yang sebenarnya.

Laporan coverage HTML tersimpan di `coverage/index.html` dan diabaikan Git. Laporan mencakup komponen, hook, dan utilitas frontend, termasuk file yang belum diuji; persentasenya bukan ukuran keberhasilan alur E2E.

## Tes E2E Playwright

Jalankan dari folder `frontend`, setelah dependency frontend (`npm ci`) dan backend (`composer install` di folder `backend`) tersedia. PHP harus ada di PATH, dengan ekstensi SQLite (`pdo_sqlite`) aktif.

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright menyalakan Laravel di `127.0.0.1:8010` dan Next.js di `127.0.0.1:3010` secara otomatis. Kedua port harus kosong. Server tes tidak memakai server pengembangan yang sudah berjalan. Database SQLite baru dibuat di direktori temporer untuk setiap run, lokasi di-seed otomatis, dan data lowongan dibersihkan antar tes. Database MySQL aplikasi tidak digunakan.

Jika PHP tidak ada di PATH, tetapkan `PLAYWRIGHT_PHP_BINARY` ke path executable PHP sebelum menjalankan tes.

Suite Chromium mencakup list → pencarian otomatis → detail melalui card, pencarian kosong/reset, pagination/reset halaman pencarian, Dashboard kosong, buat/edit/batal hapus/hapus dan toast, serta halaman 404. Tes CRUD memakai API Laravel asli.

```bash
npm run test:e2e:ui
npm run test:e2e:report
```

Laporan tersimpan di `playwright-report`; trace dan screenshot kegagalan tersimpan di `test-results`. Keduanya diabaikan Git. Build server tes memakai `.next-e2e` yang terpisah dari `.next` aplikasi biasa. Runner memakai satu worker karena tes berbagi satu database E2E.
