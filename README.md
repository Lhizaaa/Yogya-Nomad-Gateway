# Yogya Nomad Gateway

Progressive Web App (PWA) untuk freelancer & digital nomad yang baru mendarat di **Yogyakarta International Airport (YIA)**. Membantu menemukan WiFi, workspace, transportasi, dan pengalaman terbaik di sekitar Kulon Progo.

Dibangun dengan **React (Vite) + Tailwind CSS**, tema *simple & minimalist* dengan aksen oranye dari logo, **Light/Dark Mode**, dan dua bahasa (**Bahasa Indonesia / English**).

## ✨ Fitur

- **Touchdown Mode** — onboarding 2 pertanyaan + rencana 48 jam (progress tersimpan, resume/restart)
- **Perimeter Map** — List View (filter tipe, open-now, budget best-match) + Map View (OpenStreetMap, geolocation, pencarian Google Maps tak terbatas)
- **Location Detail** — Get Directions, Report Issue, submit speed test
- **Nomad Starter Kit** — tips, cost guide, kontak darurat, transport (deep-link + copy alamat)
- **YIA Digital Arrival Twin** — globe animasi (ringan, tanpa Three.js) + dashboard analytics, fallback 2D saat offline
- **Travel Analytics** publik (recharts, lazy-loaded)
- **Artikel Kulon Progo** — grid + filter kategori + detail + share
- **Testimoni** carousel & **Tentang Kami**
- **Admin Dashboard** (`/admin`) — StatCard count-up, 4 grafik recharts, CRUD lokasi, upload CSV, Event Log
- Efek dekoratif: BatikBorder, FloatingShapes, AnimatedGradientBg, ParticleBackground (canvas), Glassmorphism
- PWA installable + offline caching, semua animasi menghormati `prefers-reduced-motion`

## 🚀 Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build produksi ke dist/
npm run preview  # preview hasil build
```

## 🔐 Admin
Buka `/admin` — password demo: **`admin123`** (statis, hanya untuk demo frontend).

## 🗺️ Google Maps (opsional)
Map View berjalan **tanpa API key** menggunakan OpenStreetMap embed gratis. Kotak pencarian membuka Google Maps di tab baru untuk pencarian lokasi tak terbatas.

Jika ingin integrasi Google Places penuh, salin `.env.example` → `.env`, aktifkan *Maps JavaScript API* + *Places API* di Google Cloud Console (perlu billing — cek kuota gratis terkini), lalu isi:

```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

## 📁 Struktur
```
src/
  components/  Layout, decorative, common, Home, ArrivalTwin, PerimeterMap, Articles, Testimonials, About, Admin
  pages/       Home, Touchdown, PerimeterMap, LocationDetail, StarterKit, ArticleDetail, Admin
  data/        locations, starterKit, articles, arrivalTwin, testimonials (mock JSON)
  locales/     id.json, en.json
  context/     AppContext, ThemeContext, LanguageContext
  utils/       eventLogger, distance, locationStore, useOnlineStatus
public/        logo.svg, favicon.svg
```

## 🎨 Brand
Warna utama `brand-500 = #FF7300` (oranye dari logo). Diatur di `tailwind.config.js`.

---
© 2026 Yogya Nomad Gateway · MVP. Informasi rekomendasi bersifat panduan — verifikasi sebelum perjalanan.
