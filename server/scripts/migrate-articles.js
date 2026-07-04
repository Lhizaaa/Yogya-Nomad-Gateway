// ---------------------------------------------------------------------------
// Skrip migrasi data: articles.json  ->  tabel "articles" (PostgreSQL).
// Untuk fitur "Jelajahi Kulon Progo". Jalankan MANUAL:
//   node scripts/migrate-articles.js   (dari folder server/)
//
// Skema kompatibel dengan frontend: memakai nama & id asli ("art-1") serta
// field dwibahasa (ID/EN) supaya komponen artikel tetap jalan tanpa diubah.
//
// Insert idempotent (ON CONFLICT (id) DO NOTHING). Aplikasi tetap READ-ONLY;
// artikel dikelola admin manual via pgAdmin4.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pool, { testConnection } from '../config/database.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS articles (
    id                VARCHAR(50) PRIMARY KEY,   -- id asli, mis. "art-1"
    title             VARCHAR(255) NOT NULL,
    title_en          VARCHAR(255),
    category          VARCHAR(100),              -- Wisata Alam / Kuliner / Budaya / Tips Nomad
    category_en       VARCHAR(100),
    excerpt           TEXT,                      -- ringkasan singkat
    excerpt_en        TEXT,
    image             TEXT,                      -- path/URL gambar
    read_time_minutes INTEGER,                   -- estimasi waktu baca
    content           TEXT,                      -- isi artikel (ID)
    content_en        TEXT,                      -- isi artikel (EN)
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
  )
`

async function migrate() {
  const ok = await testConnection()
  if (!ok) {
    console.error('❌ Migrasi dibatalkan: koneksi database gagal. Cek server/.env.')
    process.exit(1)
  }

  await pool.query(CREATE_TABLE_SQL)
  console.log('[migrate] Tabel "articles" siap.')

  const articles = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'src', 'data', 'articles.json'), 'utf-8')
  )
  console.log(`[migrate] Membaca ${articles.length} artikel dari articles.json.`)

  let inserted = 0
  let skipped = 0

  for (const a of articles) {
    const result = await pool.query(
      `INSERT INTO articles
         (id, title, title_en, category, category_en, excerpt, excerpt_en,
          image, read_time_minutes, content, content_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        a.title,
        a.title_en,
        a.category,
        a.category_en,
        a.excerpt,
        a.excerpt_en,
        a.image,
        a.read_time_minutes,
        a.content,
        a.content_en,
      ]
    )
    if (result.rowCount > 0) inserted++
    else skipped++
  }

  console.log(`\n✅ Migrated ${inserted} articles` + (skipped ? ` (${skipped} dilewati karena sudah ada)` : ''))

  await pool.end()
  process.exit(0)
}

migrate().catch(async (err) => {
  console.error('❌ Migrasi gagal:', err.message)
  await pool.end()
  process.exit(1)
})
