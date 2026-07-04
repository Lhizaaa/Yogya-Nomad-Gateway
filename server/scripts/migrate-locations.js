// ---------------------------------------------------------------------------
// Skrip migrasi data: locations.json  ->  tabel "destinations" (PostgreSQL).
// Jalankan MANUAL: node scripts/migrate-locations.js  (dari folder server/)
//
// Skema dibuat KOMPATIBEL dengan frontend: memakai nama field asli
// (type, address, lat, lng, distance_km, wifi_speed_mbps, has_power_outlet,
//  open_now, last_updated) dan id string asli ("loc-1") supaya peta chatbot,
// routing, favorit, dan itinerary tetap berfungsi tanpa mengubah komponen.
//
// Ada juga kolom deskriptif tambahan (description, city, province, image_url,
// opening_hours) yang boleh diisi admin manual via pgAdmin4.
//
// Catatan:
// - Insert idempotent: id yang sama TIDAK diduplikasi (ON CONFLICT DO NOTHING).
// - Ini SATU-SATUNYA skrip yang menulis ke DB, dijalankan manual oleh admin.
//   Aplikasi/website tetap READ-ONLY.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pool, { testConnection } from '../config/database.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Nilai default: semua lokasi berada di Kulon Progo, DI Yogyakarta.
const DEFAULT_CITY = 'Kulon Progo'
const DEFAULT_PROVINCE = 'DI Yogyakarta'

// SQL untuk membuat tabel sesuai skema kompatibel-frontend.
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS destinations (
    id              VARCHAR(50) PRIMARY KEY,     -- id asli, mis. "loc-1"
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50),                 -- coworking / cafe / wifi-spot
    address         VARCHAR(255),
    lat             DECIMAL(10, 7),
    lng             DECIMAL(10, 7),
    distance_km     DECIMAL(6, 2),
    wifi_speed_mbps INTEGER,                      -- boleh NULL
    has_power_outlet BOOLEAN,
    price_range     VARCHAR(20),                 -- low / medium / high
    open_now        BOOLEAN,
    rating          DECIMAL(2, 1),
    last_updated    DATE,
    -- Kolom deskriptif tambahan (opsional, diisi manual via pgAdmin4):
    description     TEXT,
    city            VARCHAR(100),
    province        VARCHAR(100),
    image_url       TEXT,
    opening_hours   VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
  )
`

async function migrate() {
  // Pastikan koneksi database sehat sebelum mulai.
  const ok = await testConnection()
  if (!ok) {
    console.error('❌ Migrasi dibatalkan: koneksi database gagal. Cek server/.env.')
    process.exit(1)
  }

  // Buang tabel lama (skema minimal sebelumnya) supaya skema baru dipakai.
  // Aman: data awal hanya berasal dari locations.json dan akan diisi ulang.
  await pool.query('DROP TABLE IF EXISTS destinations')
  console.log('[migrate] Tabel lama dibuang (jika ada), membuat skema baru...')

  // 1) Buat tabel dengan skema kompatibel-frontend.
  await pool.query(CREATE_TABLE_SQL)
  console.log('[migrate] Tabel "destinations" siap.')

  // 2) Baca data sumber dari locations.json.
  const locations = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'src', 'data', 'locations.json'), 'utf-8')
  )
  console.log(`[migrate] Membaca ${locations.length} lokasi dari locations.json.`)

  // 3) Insert satu per satu, mempertahankan id dan seluruh field asli.
  //    ON CONFLICT (id) DO NOTHING => idempotent, aman dijalankan berulang.
  let inserted = 0
  let skipped = 0

  for (const loc of locations) {
    const result = await pool.query(
      `INSERT INTO destinations
         (id, name, type, address, lat, lng, distance_km, wifi_speed_mbps,
          has_power_outlet, price_range, open_now, rating, last_updated,
          city, province)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO NOTHING`,
      [
        loc.id,
        loc.name,
        loc.type,
        loc.address,
        loc.lat,
        loc.lng,
        loc.distance_km,
        loc.wifi_speed_mbps,   // bisa null
        loc.has_power_outlet,
        loc.price_range,
        loc.open_now,
        loc.rating,            // bisa null
        loc.last_updated,
        DEFAULT_CITY,
        DEFAULT_PROVINCE,
      ]
    )

    if (result.rowCount > 0) inserted++
    else skipped++
  }

  console.log(`\n✅ Migrated ${inserted} destinations` + (skipped ? ` (${skipped} dilewati karena sudah ada)` : ''))

  await pool.end()
  process.exit(0)
}

migrate().catch(async (err) => {
  console.error('❌ Migrasi gagal:', err.message)
  await pool.end()
  process.exit(1)
})
