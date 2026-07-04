# Nomad Assistant — Backend Proxy

Server kecil (Express) yang menjadi perantara antara widget chatbot di frontend dan OpenAI API.
API key disimpan di sini (server), **tidak pernah** dikirim ke browser.

```
Widget Chat (browser)  →  server ini (/api/chat)  →  OpenAI API
```

## Cara menjalankan (development)

Butuh **2 terminal**: satu untuk server, satu untuk frontend.

### 1. Siapkan API key (sekali saja)

```bash
cd server
cp .env.example .env       # Windows: copy .env.example .env
```

Buka `server/.env`, isi `OPENAI_API_KEY` dengan key dari
https://platform.openai.com/api-keys

### 2. Terminal A — jalankan server

```bash
cd server
npm install      # sekali saja
npm run dev
```

Server berjalan di `http://localhost:8787`.

### 3. Terminal B — jalankan frontend

```bash
npm run dev
```

Buka aplikasi di `http://localhost:5173`. Tombol bulat chat muncul di kanan bawah
tiap halaman. Vite otomatis meneruskan request `/api` ke server (lihat `vite.config.js`).

## Ganti model

Di `server/.env`:

- `OPENAI_MODEL=gpt-4o-mini` — cepat & murah, cocok untuk chatbot ini (default)
- `OPENAI_MODEL=gpt-4o` — lebih pintar, lebih mahal

## Deploy produksi

Deploy folder `server/` ke host Node (Railway, Render, VPS, dll.), set env `OPENAI_API_KEY`.
Lalu di build frontend, set `VITE_CHAT_API=https://url-server-anda/api` agar widget menunjuk
ke server produksi (bukan `/api` lokal).

## Endpoint

- `GET /api/health` → cek status & model
- `POST /api/chat` → body `{ "messages": [{ "role": "user", "content": "..." }] }`, balasan streaming (SSE)
