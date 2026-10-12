# Dicoding Jobs

Aplikasi lowongan pekerjaan untuk technical assessment Product Engineer Intern. Laravel menyediakan REST API, sedangkan Next.js mengonsumsi API menggunakan TanStack Query. UI mengacu pada desain assessment Dicoding Jobs.

## Fitur

- Daftar lowongan dengan pagination dan pencarian berdasarkan judul.
- Pencarian otomatis setelah jeda 300 ms, minimum tiga karakter. Input kosong atau kurang dari tiga karakter menampilkan daftar utama.
- Detail lowongan, informasi perusahaan, pengalaman, jumlah kandidat, dan gaji jika diizinkan untuk ditampilkan.
- Dashboard untuk membuat, mengubah, dan menghapus lowongan, dengan konfirmasi hapus dan notifikasi hasil tindakan.
- Form dengan combobox posisi/lokasi, input gaji Rupiah, editor rich text, dan upload gambar.
- Loading, error, hasil pencarian kosong, dan halaman tidak ditemukan.

Scope perusahaan saat ini adalah Dicoding Indonesia, dengan profil terpusat di `backend/config/company.php`. Login dan otorisasi recruiter belum diimplementasikan; endpoint pengelolaan dapat diakses langsung. `show_salary` mengatur nominal pada respons publik; endpoint edit tetap mengembalikan nominal tersimpan.

## Struktur proyek

```text
dicoding-jobs/
├── backend/
│   ├── app/                 # Model, controller, request, resource, enum, dan helper
│   ├── database/            # Migration, factory, seed, dan data lokasi
│   └── tests/               # Pest unit test dan integration test API
├── frontend/
│   ├── src/app/             # Route Next.js App Router
│   ├── src/components/      # Layout, komponen fitur, dan UI
│   ├── src/hooks/           # Hook TanStack Query
│   ├── src/lib/             # Client API dan utilitas
│   ├── src/types/           # Kontrak tipe API
│   └── tests/               # Vitest unit test dan Playwright E2E
└── README.md                # Setup, tes, API, dan troubleshooting
```

## Persyaratan

| Dependency  | Versi/kebutuhan                                                                    |
| ----------- | ---------------------------------------------------------------------------------- |
| PHP         | 8.4.1+ yang kompatibel dengan `backend/composer.lock`; proyek diuji dengan PHP 8.5 |
| Composer    | 2.x                                                                                |
| Node.js     | 22.22.2+ pada major 22, 24.15.0+ pada major 24, atau 26+                           |
| npm         | Tersedia bersama Node.js                                                           |
| MySQL       | 8.x untuk database aplikasi                                                        |
| Browser E2E | Chromium yang dipasang melalui Playwright                                          |

Minimum PHP mengikuti dependency dalam lockfile, termasuk Symfony dan Pest, walaupun `composer.json` mengizinkan PHP 8.3. Gunakan `composer install` dan `npm ci` untuk memakai versi dependency yang telah dikunci.

Aktifkan ekstensi PHP standar Laravel serta `pdo_mysql` untuk aplikasi, `pdo_sqlite` untuk tes, dan `fileinfo` untuk validasi gambar. Jalankan `composer check-platform-reqs` setelah instalasi untuk memeriksa kebutuhan dependency. Ekstensi `intl` diperlukan oleh diagnostik `php artisan db:show`, tetapi tidak diperlukan oleh alur API proyek ini. Periksa PHP CLI menggunakan `php --ini` dan `php -m`.

Instalasi dependency, browser Playwright, dan pengambilan font Inter melalui `next/font/google` membutuhkan internet. Pastikan `backend/storage` dan `backend/bootstrap/cache` dapat ditulis oleh proses PHP.

## Setup lokal

Unduh atau clone repository, lalu buka terminal pada folder `dicoding-jobs`. Perintah penyalinan environment di bawah untuk instalasi baru. Jika `.env` atau `.env.local` sudah ada, sesuaikan file tersebut agar konfigurasi lokal tidak tertimpa.

### 1. Siapkan database MySQL

Jalankan MySQL, kemudian gunakan MySQL CLI atau client database. Contoh berikut dijalankan oleh akun administrator untuk membuat database dan user aplikasi pada MySQL lokal:

```sql
CREATE DATABASE dicoding_jobs
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER 'dicoding_app'@'127.0.0.1'
    IDENTIFIED BY 'ganti_dengan_password_lokal';

GRANT ALL PRIVILEGES ON dicoding_jobs.*
    TO 'dicoding_app'@'127.0.0.1';
```

Ganti password contoh dan gunakan nilainya hanya pada `.env` lokal. Jika database/user sudah tersedia, gunakan kredensial yang ada. Host akun MySQL harus sesuai dengan koneksi aplikasi; contoh ini menggunakan TCP `127.0.0.1`.

### 2. Pasang dan konfigurasi backend

Dari folder utama:

```bash
cd backend
composer install
npm ci
```

Dependency npm backend digunakan untuk format/lint dan tooling Blade. REST API tidak membutuhkan server Vite yang berjalan.

Salin environment untuk instalasi baru:

```bash
cp .env.example .env
```

Pada PowerShell:

```powershell
Copy-Item .env.example .env
```

Sesuaikan `backend/.env`:

```dotenv
APP_NAME="Dicoding Jobs"
APP_ENV=local
APP_DEBUG=false
APP_URL=http://127.0.0.1:8000
APP_TIMEZONE=UTC

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dicoding_jobs
DB_USERNAME=dicoding_app
DB_PASSWORD=ganti_dengan_password_lokal
```

`APP_KEY` dibuat pada langkah berikut, bukan disalin dari perangkat lain. `APP_DEBUG=true` dapat digunakan untuk debugging lokal. `APP_URL` harus sesuai dengan alamat Laravel yang dapat diakses browser karena digunakan untuk URL gambar upload. Pertahankan `APP_TIMEZONE=UTC`: timestamp disimpan dalam UTC, sedangkan tanggal batas lamaran diinterpretasikan sebagai pukul 23:59:59 Asia/Jakarta.

Jalankan:

```bash
php artisan key:generate
php artisan config:clear
php artisan migrate --seed
php artisan storage:link
composer check-platform-reqs
```

`migrate --seed` membuat tabel dan mengisi pilihan kota/kabupaten. Seed bawaan belum membuat lowongan demo. `storage:link` menghubungkan `public/storage` dengan `storage/app/public` agar gambar upload dapat diakses.

Jalankan API dan biarkan terminal tetap terbuka:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Pasang dan konfigurasi frontend

Buka terminal kedua pada folder utama:

```bash
cd frontend
npm ci
```

Salin environment untuk instalasi baru:

```bash
cp .env.example .env.local
```

Pada PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Isi `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Variabel ini adalah alamat API publik yang digunakan browser. Jangan isi dengan password atau token rahasia. Setelah mengubahnya, restart server Next.js. Build produksi perlu dibuat ulang jika alamat API berubah.

Jalankan frontend:

```bash
npm run dev
```

Buka `http://localhost:3000`. Route `/` mengarah ke `/list`.

### 4. Periksa setup dan buat lowongan pertama

1. Buka `http://127.0.0.1:8000/api/v1/vacancy-options`. Respons harus berupa JSON berisi pilihan posisi, tipe pekerjaan, pengalaman, dan lokasi.
2. Buka `http://localhost:3000/dashboard`, lalu pilih **Buat lowongan**.
3. Isi form dan simpan. Posisi/lokasi dipilih dari opsi API. Gunakan tanggal hari ini atau mendatang untuk lowongan baru.
4. Buka `/list`, ketik minimal tiga karakter judul, lalu klik card untuk melihat detail.
5. Uji edit dan hapus dari Dashboard. Penghapusan memerlukan konfirmasi.

| Route frontend                  | Fungsi                     |
| ------------------------------- | -------------------------- |
| `/list`                         | Daftar lowongan            |
| `/list?keyword=engineer`        | Pencarian judul            |
| `/list?page=2`                  | Halaman kedua              |
| `/list?keyword=engineer&page=2` | Pagination hasil pencarian |
| `/vacancies/{id}`               | Detail lowongan            |
| `/dashboard`                    | Pengelolaan lowongan       |
| `/vacancies/new`                | Buat lowongan              |
| `/vacancies/{id}/edit`          | Edit lowongan              |

## Menjalankan seluruh tes

Jalankan perintah pada subfolder yang disebutkan. Root tidak memiliki script npm/Composer.

### Backend: unit dan integration test

Dari `backend`:

```bash
php artisan config:clear
php artisan test --compact
```

Menjalankan suite secara terpisah:

```bash
php artisan test --compact --testsuite=Unit
php artisan test --compact --testsuite=Feature
```

Unit test menguji helper deadline. Feature tests adalah integration test API: menjalankan Laravel, mengirim request endpoint, memeriksa respons, dan memeriksa data pada database. Cakupan meliputi CRUD, pencarian judul, pagination, validasi 422, 404, gaji tersembunyi, sanitasi deskripsi, upload gambar, seed lokasi, dan edit lowongan kedaluwarsa.

`backend/phpunit.xml` menggunakan SQLite `:memory:` khusus tes. Database MySQL aplikasi tidak dipakai selama konfigurasi ini dipertahankan. Tes SQLite tidak membuktikan seluruh perilaku spesifik MySQL. Server Laravel development tidak perlu berjalan untuk suite backend.

### Frontend: unit test

Dari `frontend`:

```bash
npm test
```

Perintah tambahan:

```bash
npm run test:watch
npm run test:coverage
```

Vitest dan React Testing Library menggunakan jsdom serta mock API. Tes mencakup komponen, hook data, pencarian, pagination, form, combobox, gaji, rich text editor, navigasi, dan notifikasi. Laravel dan MySQL tidak perlu berjalan. Laporan coverage HTML berada di `frontend/coverage/index.html`.

### Playwright: end-to-end

Pastikan dependency backend/frontend tersedia dan PHP CLI memiliki `pdo_sqlite`. Dari `frontend`:

```bash
npx playwright install chromium
npm run test:e2e
```

Pada Linux, jika dependency sistem browser belum tersedia, gunakan `npx playwright install --with-deps chromium` sesuai kebutuhan mesin.

Playwright otomatis menjalankan Laravel pada `127.0.0.1:8010` dan Next.js pada `127.0.0.1:3010`. Kedua port harus kosong. Runner membuat database SQLite di direktori temporer, menjalankan migration dan seed lokasi, membuat data pengujian, lalu membersihkan lowongan antar tes. Server development pada port 8000/3000 dapat tetap berjalan. Output Next.js E2E menggunakan `.next-e2e`, terpisah dari `.next` development.

Suite mencakup alur wajib **list → search judul → detail** serta reset/hasil kosong, batas tiga karakter, pagination, refresh dan Back/Forward, Dashboard mobile/kosong, buat/edit/batal hapus/hapus dengan notifikasi, serta 404. Request E2E menggunakan API Laravel dan database sebenarnya, bukan mock.

Jika PHP tidak tersedia di PATH, tetapkan executable-nya sebelum menjalankan tes. Contoh PowerShell, sesuaikan path:

```powershell
$env:PLAYWRIGHT_PHP_BINARY = 'C:\path\to\php.exe'
npm run test:e2e
```

Mode interaktif dan laporan:

```bash
npm run test:e2e:ui
npm run test:e2e:report
```

Laporan berada di `frontend/playwright-report`; screenshot dan trace kegagalan berada di `frontend/test-results`. Runner menggunakan satu worker karena suite berbagi database E2E. Laporan tes dan coverage diabaikan Git.

## Format, lint, dan build

Dari `backend`, untuk memeriksa gaya PHP/Blade, format file pendukung, dan ESLint:

```bash
composer check
```

Untuk merapikan backend:

```bash
composer format
npm run lint:fix
```

Dari `frontend`, untuk memeriksa Prettier, ESLint tanpa warning, dan TypeScript:

```bash
npm run check
```

Untuk merapikan frontend:

```bash
npm run format
npm run lint:fix
```

Untuk build produksi frontend dan menjalankannya:

```bash
npm run build
npm run start
```

Hentikan `npm run dev` dahulu jika memakai port 3000 yang sama. Laravel tetap perlu berjalan. `npm run start` menggunakan hasil build terakhir.

Backend dan frontend memiliki `.editorconfig` masing-masing. Konfigurasi editor pribadi di `.vscode` diabaikan Git; aturan format proyek berada pada konfigurasi Pint, Prettier, dan ESLint yang disertakan.

## Ringkasan API

Base URL lokal: `http://127.0.0.1:8000/api/v1`. Kirim header `Accept: application/json`; request JSON juga memakai `Content-Type: application/json`.

| Method | Endpoint               | Fungsi                                             |
| ------ | ---------------------- | -------------------------------------------------- |
| GET    | `/vacancies`           | Daftar dengan `search`, `page`, dan `per_page`     |
| POST   | `/vacancies`           | Membuat lowongan, respons 201                      |
| GET    | `/vacancies/{id}`      | Detail publik                                      |
| GET    | `/vacancies/{id}/edit` | Data edit, termasuk nominal gaji tersimpan         |
| PUT    | `/vacancies/{id}`      | Memperbarui lowongan                               |
| DELETE | `/vacancies/{id}`      | Menghapus lowongan, respons 204                    |
| GET    | `/vacancy-options`     | Pilihan enum dan lokasi                            |
| POST   | `/vacancy-images`      | Upload multipart dengan field `image`, respons 201 |

Pagination API memakai default 10 item dan maksimum 50 item per halaman. Pencarian backend menggunakan `search`; frontend memetakan parameter URL `keyword` ke parameter tersebut. Respons daftar memakai `data`, `links`, dan `meta`. Validasi gagal mengembalikan 422; ID yang tidak tersedia mengembalikan 404.

| Field create/update | Aturan                                                          |
| ------------------- | --------------------------------------------------------------- |
| `title`             | Teks wajib, maksimum 255 karakter                               |
| `position`          | Nilai enum dari `/vacancy-options`                              |
| `employment_type`   | `full_time`, `part_time`, `contract`, atau `internship`         |
| `candidate_count`   | Integer 1–99                                                    |
| `expires_at`        | `YYYY-MM-DD`; lowongan baru minimal hari ini di Asia/Jakarta    |
| `location_id`       | ID lokasi yang tersedia                                         |
| `is_remote`         | Boolean opsional, default false                                 |
| `description`       | HTML dengan teks bermakna, disanitasi; maksimum 50.000 karakter |
| `salary_min`        | Integer Rupiah minimal 0, wajib                                 |
| `salary_max`        | Integer opsional/null, minimal sebesar `salary_min`             |
| `show_salary`       | Boolean opsional, default false                                 |
| `experience_level`  | Nilai enum dari `/vacancy-options`                              |

Nominal frontend seperti `5.000.000` dikirim sebagai integer `5000000`. Edit lowongan kedaluwarsa dapat mempertahankan tanggal lamanya; tanggal baru harus hari ini atau mendatang. Daftar saat ini memuat seluruh lowongan tersimpan, termasuk yang kedaluwarsa.

Gambar deskripsi mendukung JPG/JPEG, PNG, dan WebP, maksimal 2 MB serta dimensi 4096 × 4096. File disimpan di disk `public`. Logo perusahaan berada di `backend/public/images`.

## Troubleshooting

| Gejala                                       | Pemeriksaan/perbaikan                                                                                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Alamat API belum dikonfigurasi`             | Pastikan `.env.local` berada di `frontend`, berisi `NEXT_PUBLIC_API_BASE_URL`, lalu restart Next.js.                                                                                                   |
| Gagal mengambil lowongan / `Failed to fetch` | Pastikan Laravel berjalan pada alamat env. Periksa `/vacancy-options` dan Network/Console browser. Laravel memakai CORS bawaan untuk `api/*`; proxy/domain berbeda perlu konfigurasi sesuai kebutuhan. |
| MySQL `Access denied`                        | Cocokkan user, password, dan host dengan `.env`, lalu jalankan `php artisan config:clear`.                                                                                                             |
| `could not find driver`                      | Aktifkan `pdo_mysql` untuk aplikasi atau `pdo_sqlite` untuk tes pada PHP CLI yang ditunjukkan oleh `php --ini`.                                                                                        |
| Pilihan lokasi kosong                        | Jalankan `php artisan db:seed --class=LocationSeeder` dari backend.                                                                                                                                    |
| Gambar upload tidak tampil                   | Periksa `APP_URL`, jalankan `php artisan config:clear`, pastikan storage link tersedia dan Laravel berjalan.                                                                                           |
| `storage:link` gagal di Windows              | Aktifkan Developer Mode atau jalankan pembuatan link dengan hak akses yang mendukung symbolic link.                                                                                                    |
| Port E2E sedang dipakai                      | Hentikan proses pada port 8010/3010 sebelum menjalankan Playwright.                                                                                                                                    |
| Executable Chromium belum tersedia           | Jalankan `npx playwright install chromium` dari frontend.                                                                                                                                              |
| Build gagal mengambil font Inter             | Pastikan mesin dapat mengakses Google Fonts yang digunakan `next/font/google`.                                                                                                                         |
| `db:show` gagal terkait `intl`               | Aktifkan `intl` pada PHP CLI dan verifikasi dengan `php -m`; diagnostik ini bukan bagian dari suite tes.                                                                                               |

## Catatan assessment

Proyek mencakup create/list/detail, pencarian judul, Job Card reusable, unit/integration test Laravel, dan Playwright. Update/delete serta unit test frontend adalah tambahan. Referensi desain adalah [Figma assessment](https://www.figma.com/file/ZUliCZ1ohi8uQrJxihg9fm/Product-Engineer-Technical-Exercise?type=design&node-id=0%3A1). Snapshot desain, screenshot audit, dan catatan pengerjaan lokal diabaikan Git.

Untuk submission, sertakan backend, frontend, tes, dan README ini dalam repository GitHub publik. Pertahankan lockfile dan `.env.example`; jangan commit `.env`, `.env.local`, dependency, database lokal, atau file upload pengguna. Kirim URL repository melalui form recruitment yang diberikan.
