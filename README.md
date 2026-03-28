# 🅿️ PARKIN (Smart Parking System)

PARKIN adalah sistem cerdas manajemen lahan parkir yang dirancang untuk dapat di-scale ke level Enterprise dengan basis Arsitektur Terpisah (*Decoupled Architecture*). Aplikasi ini mampu melacak slot masuk dan keluar kendaraan secara *Real-Time*, memancarkan data melalui **WebSockets**, serta menerima tangkapan gambar dari sistem Kamera Eksternal menggunakan protokol berkecepatan tinggi **gRPC**.

Proyek ini dibangun menggunakan filosofi **Secure by Design** (via JWT in HttpOnly Cookies) dan **High Maintainability** (Modular, Serverless-ready) sehingga sangat efisien dalam pengeluaran biaya cloud host. Kami mengundang *Developer* di seluruh penjuru dunia untuk berkontribusi (*Open Source*)! 🚀

---

## 🛠️ Stack Teknologi

Proyek ini terbagi menjadi dua bagian utama: Arsitektur **FrontEnd** dan **BackEnd**.

### 🎨 FrontEnd (UI & PWA)
- **Framework:** Vue.js 3 (Composition API) + Vite.
- **State Management:** Pinia (Modular).
- **Styling:** Tailwind CSS + Desain Glassmorphism/Neumorphism ringan.
- **Icons:** FontAwesome Free (DRY SVG rendering).
- **Konektivitas:** Fetch API (Interceptors) & WebSocket Client Native.

### ⚙️ BackEnd (REST + Real-Time + gRPC)
- **Runtime:** Node.js (ES Modules).
- **Framework REST:** Express.js 5.
- **Real-Time Engine:** `ws` (Node WebSocket Native) dengan manajemen koneksi aman di memori (Anti *Memory Leak*).
- **Database:** Supabase (PostgreSQL managed cloud-SQL) dengan utilisasi `Supabase RPC` untuk performa *high-concurrency*.
- **Otentikasi:** JWT-based dengan rotasi token pada `HttpOnly Cookies`.
- **Eksternal I/O:** `grpc-js` murni untuk menerima pesan/data berat dari Model Machine Learning/Kamera IoT berbahasa Python/C++.

---

## 🏗️ Struktur Repositori

```text
Parkin/
├── BackEnd/               # API, WebSockets, dan Server gRPC Node.js
│   ├── proto/             # Skema Protocol Buffer (.proto)
│   ├── src/
│   │   ├── config/        # Koneksi Supabase & Environment
│   │   ├── controllers/   # Logika bisnis per titik API
│   │   ├── middlewares/   # Guards: Auth JWT & Rate Limiter
│   │   ├── routes/        # Rute Express HTTP
│   │   └── services/      # Layanan WebSocket & Supabase RPC Stats
│   └── app.js             # Entry point backend
│
└── FrontEnd/              # PWA Aplikasi Client
    ├── src/
    │   ├── assets/        # Gambar statis & Konfigurasi CSS Root
    │   ├── components/    # Komponen Reusable (UI, Notifikasi Install PWA)
    │   ├── router/        # Navigasi halaman (Vue Router)
    │   ├── stores/        # Manajemen State Global (Pinia)
    │   ├── utils/         # Wrapper fetch API dan helper fungsi
    │   └── views/         # Halaman penuh (Layout, Login, Dashboard, dll)
    └── index.html         # Entry point frontend
```

---

## 💻 Panduan Instalasi Lokal (Setup)

Bagi Anda yang ingin ikut membedah atau berkontribusi dalam pengembangan PARKIN, ikuti langkah-langkah instalasi berikut:

### Persyaratan Awal (Prerequisites)
1. **Node.js** v18+ atau versi lebih baru.
2. Manager paket `npm` atau `yarn`.
3. Akun/Proyek **Supabase** (Versi free-tier *Database* sudah sangat cukup).

### 1. Setup Database (Supabase)
Karena perhitungan parkir menggunakan sistem terpadu (Supabase RPC - Remote Procedure Call), buat tabel `users`, `vehicle_logs`, `settings` di Supabase dan tempelkan fungsi SQL *Stats* bawaan (cek berkas migrasi jika ada, atau buat manual tabel minimal).

### 2. Setup BackEnd
1. Masuk ke folder backend: `cd BackEnd`
2. Install dependensi: `npm install`
3. Gandakan file environtment contoh: `cp .env.example .env`
4. Isikan seluruh baris rahasia di dalam `.env`:
   - `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` dan `JWT_REFRESH_SECRET`
5. Jalankan server backend (termasuk WebSocket dan gRPC): `npm run dev`

### 3. Setup FrontEnd
1. Masuk ke folder frontend: `cd FrontEnd`
2. Install dependensi UI: `npm install`
3. Konfigurasikan environtment lokal di file `.env` FrontEnd (misal `VITE_API_URL=http://localhost:3000/api`).
4. Jalankan *Vite Dev Server*: `npm run dev`
5. Aplikasi klien akan menyala dalam mode HOT Reload (biasanya di `http://localhost:5173`).

---

## 🔒 Postur Keamanan (Security Feature)

Proyek ini telah disertifikasi ulang dan tidak mengizinkan _Bad Practices_. Jika Anda mengirim Pull Request (PR), perhatikan hal berikut:
- **Jangan gunakan *LocalStorage*** untuk menyimpan Session JWT karena rawan XSS. *Gunakan selalu mekanisme Cookie HttpOnly bawaan dari server.*
- **No N+1 Queries**: Saat mengambil data logs (`vehicle_logs`), gunakan `start` & `limit` langsung di Database *(Pagination)*, jangan me-*looping* dari javascript.
- Jangan menghapus perlindungan `helmet` dan `express-rate-limit` yang sudah ada di Backend API.

---

## 🤝 Mari Berkontribusi (Contributing Guide)

Proyek ini menyambut siapapun untuk berpartisipasi dan menambahkan ekstensi fitur (misal: *Telegram Bot Webhook*, *Integrasi Payment Gateway Parkir*, dsb).

1. Lakukan **Fork** pada repository ini.
2. Buat _Branch_ fitur baru (`git checkout -b feature/FiturKerenAnda`).
3. Lindungi kredibilitas *Clean Code*. Jauhkan kode *Controllers* dan komponen Vue dari duplikasi liar (*Dry Principle*).
4. **Commit** progres Anda (`git commit -m 'Menambahkan Fitur Keren'`).
5. Lakukan **Push** untuk melempar pembaruan ke cabang (`git push origin feature/FiturKerenAnda`).
6. Buka **Pull Request** ke *main branch* melalui laman *GitHub Repository*.

*Made with ❤️ for the Open Source Community.*
