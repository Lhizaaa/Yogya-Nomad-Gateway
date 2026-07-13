<div align="center">

<img src="public/logo-new.png" alt="Yogya Nomad Gateway" width="120" />

# 🛬 Yogya Nomad Gateway

### *Gerbang cerdas bagi freelancer & digital nomad yang baru mendarat di Yogyakarta International Airport (YIA)*

**Temukan WiFi, workspace, transportasi, kuliner, dan pengalaman terbaik di sekitar Kulon Progo — dipandu AI, dalam satu Progressive Web App.**

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?logo=vercel&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white)

**🌐 [Live Demo](https://yogya-nomad.vercel.app) · 📂 [Repository](https://github.com/Lhizaaa/Yogya-Nomad-Gateway)**

<br/>

> 🎓 **Dipamerkan pada Informatics EXPO UII 2026** — Mata Kuliah *Pengembangan Sistem Informasi (PSI)*, Universitas Islam Indonesia.

</div>

---

## 📖 Tentang Proyek

Bayangkan Anda seorang *digital nomad* yang baru saja turun dari pesawat di **Yogyakarta International Airport (YIA)**. Baterai tinggal 20%, belum punya SIM lokal, butuh WiFi kencang untuk *meeting* dalam 2 jam, dan sama sekali buta arah di Kulon Progo.

**Yogya Nomad Gateway** hadir untuk momen itu. Aplikasi ini mengubah 48 jam pertama yang membingungkan menjadi pengalaman mendarat yang mulus — dari rekomendasi *coworking space* & kafe ber-WiFi cepat, panduan transportasi, kalkulator budget, hingga **asisten AI** yang menjawab pertanyaan dan menyusun *itinerary* secara otomatis.

Semuanya dikemas dalam **Progressive Web App** yang ringan, bisa di-*install* seperti aplikasi native, tetap berfungsi saat *offline*, dan tersedia dalam **Bahasa Indonesia & English** dengan **Light/Dark Mode**.

### 🎯 Masalah yang Dipecahkan
| Tantangan Nomad Baru | Solusi Yogya Nomad Gateway |
|---|---|
| Bingung cari tempat kerja ber-WiFi | **Perimeter Map** dengan filter WiFi, budget, & colokan |
| Tidak tahu harus mulai dari mana | **Touchdown Mode** — briefing AI untuk 48 jam pertama |
| Sulit atur budget & transport | **Nomad Starter Kit** — cost guide, transport deep-link, kontak darurat |
| Butuh rencana jalan-jalan cepat | **AI Trip Planner** — itinerary multi-hari otomatis |
| Pertanyaan spesifik soal Kulon Progo | **Chatbot AI** yang terkunci pada konteks lokal |

---

## ✨ Fitur Unggulan

- 🛬 **Touchdown Mode** — onboarding singkat + briefing 48 jam yang dipersonalisasi AI (progress tersimpan, bisa *resume*/*restart*).
- 🗺️ **Perimeter Map** — *List View* (filter tipe, *open-now*, *best-match* budget) & *Map View* (OpenStreetMap, geolokasi, pencarian tanpa API key).
- 🤖 **AI Chatbot** — asisten *streaming* (Server-Sent Events) yang paham konteks halaman & terkunci pada topik Kulon Progo.
- 🧭 **AI Trip Planner** — susun *itinerary* multi-hari berdasarkan minat, jumlah hari, dan budget.
- 📍 **Location Detail** — *Get Directions*, *Report Issue*, submit *speed test* WiFi.
- 🎒 **Nomad Starter Kit** — tips, *cost guide*, *currency converter*, perbandingan SIM, *arrival checklist*, kontak darurat.
- 🌍 **YIA Digital Arrival Twin** — globe animasi ringan (tanpa Three.js) + dashboard analytics, dengan *fallback* 2D saat offline.
- 📊 **Travel Analytics** publik (Recharts, *lazy-loaded*).
- 📰 **Artikel Kulon Progo** — grid + filter kategori + detail + *share*.
- 💬 **Testimoni** carousel & halaman **Tentang Kami**.
- 🛠️ **Admin Dashboard** (`/admin`) — StatCard *count-up*, grafik Recharts, CRUD lokasi, upload CSV, *Event Log*.
- 🎨 **Estetika kaya** — BatikBorder, FloatingShapes, AnimatedGradientBg, ParticleBackground (canvas), Glassmorphism.
- 📲 **PWA** — *installable*, *offline caching*, dan seluruh animasi menghormati `prefers-reduced-motion`.
- 🌗 **Light/Dark Mode** & 🌐 **Dwibahasa** (ID / EN) di seluruh aplikasi.

---

## 🏗️ Arsitektur Sistem

Aplikasi memakai arsitektur **serverless modern**: frontend statis + *Serverless Functions* di Vercel, database terkelola di Supabase, dan AI dari OpenAI.

```
                          ┌──────────────────────────────┐
                          │          PENGGUNA            │
                          │   (Browser / PWA installed)  │
                          └───────────────┬──────────────┘
                                          │  HTTPS
                                          ▼
        ┌───────────────────────────────────────────────────────────┐
        │                        VERCEL                             │
        │                                                           │
        │   ┌───────────────────┐        ┌───────────────────────┐  │
        │   │   FRONTEND (SPA)  │  fetch │  SERVERLESS FUNCTIONS  │  │
        │   │  React + Vite +   │───────▶│        /api/*         │  │
        │   │  Tailwind (PWA)   │◀───────│  Node.js (ESM)        │  │
        │   └───────────────────┘        └───────────┬───────────┘  │
        └────────────────────────────────────────────┼──────────────┘
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                     ┌──────────────────────────┐          ┌─────────────────────────┐
                     │   SUPABASE PostgreSQL     │          │        OpenAI API        │
                     │  (destinations, articles) │          │      (gpt-4o-mini)       │
                     │  via PgBouncer pooler     │          │  chat · itinerary · brief │
                     └──────────────────────────┘          └─────────────────────────┘
```

**Alur singkat:** Frontend memanggil endpoint `/api/*` → *Serverless Function* memvalidasi request → *query* ke Supabase (parameterized, aman dari SQL injection) dan/atau memanggil OpenAI → hasil dikembalikan ke frontend (JSON untuk data, *SSE stream* untuk chat).

> 🗂️ Folder `server/` berisi implementasi **Express.js** versi awal (Docker/Railway) yang dipertahankan sebagai referensi & materi presentasi. Versi produksi kini berjalan di **Vercel Serverless Functions** pada folder `api/`.

---

## 🧰 Tech Stack

| Lapisan | Teknologi |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 6, Tailwind CSS 3 |
| **UI / Motion** | Framer Motion, Lucide Icons, Recharts, i18next |
| **PWA** | vite-plugin-pwa (Workbox), Service Worker, offline caching |
| **Backend** | Vercel Serverless Functions (Node.js, ESM) |
| **Database** | Supabase — PostgreSQL + PgBouncer connection pooler |
| **AI** | OpenAI `gpt-4o-mini` (chat streaming, itinerary, briefing) |
| **Peta** | OpenStreetMap embed (tanpa API key) + deep-link Google Maps |
| **Deployment** | Vercel (frontend + serverless) |

---

## 🔌 API Endpoints

Semua endpoint di-*host* sebagai *Serverless Functions* pada folder `api/`.

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/health` | Health check (status DB & model AI) |
| `POST` | `/api/chat` | Chatbot AI — respons **streaming** (SSE), *context-aware* |
| `POST` | `/api/itinerary` | Generate *itinerary* multi-hari (JSON terstruktur) |
| `POST` | `/api/touchdown` | Briefing personal 48 jam pertama |
| `GET` | `/api/destinations` | List seluruh destinasi |
| `GET` | `/api/destinations/search?q=` | Cari destinasi (nama/deskripsi/alamat) |
| `GET` | `/api/destinations/filter?city=&category=&rating=` | Filter destinasi |
| `GET` | `/api/destinations/:id` | Detail satu destinasi |
| `GET` | `/api/articles` | List seluruh artikel |
| `GET` | `/api/articles/search?q=` | Cari artikel |
| `GET` | `/api/articles/filter?category=` | Filter artikel per kategori |
| `GET` | `/api/articles/:id` | Detail satu artikel |

> 🔒 **Keamanan:** endpoint data bersifat *read-only* (hanya `SELECT`), memakai *parameterized query* (anti SQL-injection), dan *system prompt* AI dikunci agar chatbot tidak keluar topik Kulon Progo.

---

## 🚀 Menjalankan Secara Lokal

**Prasyarat:** Node.js 18+ dan npm.

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev          # ➜ http://localhost:5173

# Build & preview produksi
npm run build        # output ke dist/
npm run preview      # preview hasil build
```

### 🔑 Environment Variables (untuk fitur AI & database)
Salin `.env.example` → `.env`, lalu isi:

```env
DATABASE_URL=postgresql://...     # koneksi Supabase (mode Transaction / port 6543)
OPENAI_API_KEY=sk-...             # untuk chat, itinerary, & briefing
```

> Frontend & Map View tetap berjalan **tanpa** environment variable ini — hanya fitur AI dan data dinamis yang membutuhkannya. Map View memakai OpenStreetMap gratis tanpa API key.

### 🔐 Admin Dashboard
Buka `/admin` — password demo: **`admin123`** *(statis, hanya untuk demo frontend)*.

---

## 📁 Struktur Proyek

```
Yogya-Nomad-Gateway/
├── api/                      # ⚡ Vercel Serverless Functions (backend produksi)
│   ├── _lib/                 #    db (Supabase), cors, openai, systemPrompt, shapes
│   ├── chat.js               #    chatbot AI (SSE streaming)
│   ├── itinerary.js          #    AI trip planner
│   ├── touchdown.js          #    briefing 48 jam
│   ├── health.js             #    health check
│   ├── destinations/         #    index · [id] · search · filter
│   └── articles/             #    index · [id] · search · filter
│
├── src/                      # ⚛️ Frontend React
│   ├── components/           #    Layout, decorative, common, Home, ArrivalTwin,
│   │                         #    PerimeterMap, Chatbot, Itinerary, StarterKit,
│   │                         #    Articles, Testimonials, Touchdown, Admin
│   ├── pages/                #    Home, Touchdown, PerimeterMap, LocationDetail,
│   │                         #    StarterKit, ArticleDetail, MySpots, Itinerary, Admin
│   ├── context/              #    AppContext, ThemeContext, LanguageContext
│   ├── data/                 #    mock JSON (locations, articles, starterKit, dll)
│   ├── locales/              #    id.json, en.json (i18n)
│   └── utils/                #    eventLogger, distance, search, budget, store, dll
│
├── server/                   # 🗄️ Express.js versi awal (referensi/presentasi)
├── public/                   # 🖼️ logo, favicon, gambar destinasi
├── BACKEND_PRESENTASI.md     # 🎤 materi presentasi teknis backend
├── vercel.json               # ⚙️ konfigurasi rewrites, headers, cache
└── vite.config.js            # ⚙️ konfigurasi Vite + PWA
```

---

## 🎨 Brand & Desain

- **Warna utama:** `brand-500 = #FF7300` (oranye khas logo), dikonfigurasi di `tailwind.config.js`.
- **Tema:** *simple, minimalist,* dengan aksen dekoratif batik & glassmorphism.
- **Aksesibilitas:** kontras terjaga di Light/Dark Mode, animasi menghormati `prefers-reduced-motion`.

---

<div align="center">

### 🎓 Informatics EXPO UII 2026
**Pengembangan Sistem Informasi (PSI) · Universitas Islam Indonesia**

Dibuat dengan ☕, 🧡

<br/>

© 2026 Yogya Nomad Gateway · MVP
*Informasi rekomendasi bersifat panduan — verifikasi kembali sebelum perjalanan.*

</div>
