// ---------------------------------------------------------------------------
// Route destinasi (READ-ONLY) — hanya endpoint GET, tidak ada POST/PUT/DELETE.
// Semua query memakai parameterized query ($1, $2, ...) agar aman dari SQL injection.
//
// Bentuk respons dibuat PERSIS seperti src/data/locations.json supaya frontend
// bisa memakainya tanpa perubahan (id "loc-1", type, address, lat, lng, dst).
// ---------------------------------------------------------------------------
import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// Kolom yang dipilih. last_updated di-format ke 'YYYY-MM-DD' seperti di JSON.
const SELECT_FIELDS = `
  id, name, type, address, lat, lng, distance_km, wifi_speed_mbps,
  has_power_outlet, price_range, open_now, rating,
  to_char(last_updated, 'YYYY-MM-DD') AS last_updated,
  description, city, province, image_url, opening_hours
`

// PostgreSQL mengembalikan kolom DECIMAL sebagai string (mis. "-7.9075").
// Frontend butuh angka asli, jadi kita konversi field numerik di sini.
const toNum = (v) => (v === null || v === undefined ? null : Number(v))

function toLocationShape(row) {
  return {
    ...row,
    lat: toNum(row.lat),
    lng: toNum(row.lng),
    distance_km: toNum(row.distance_km),
    rating: toNum(row.rating),
    // wifi_speed_mbps sudah number/null dari kolom INTEGER; open_now &
    // has_power_outlet sudah boolean dari kolom BOOLEAN.
  }
}

// ---------------------------------------------------------------------------
// GET /api/destinations/search?q=keyword
// Cari destinasi berdasarkan nama atau deskripsi (case-insensitive).
// PENTING: didaftarkan SEBELUM "/:id" agar tidak tertangkap sebagai id.
// ---------------------------------------------------------------------------
router.get('/search', async (req, res) => {
  const keyword = (req.query.q || '').trim()

  if (!keyword) {
    return res.status(400).json({ error: 'Parameter "q" wajib diisi.' })
  }

  try {
    // ILIKE = pencocokan case-insensitive; %keyword% = mengandung kata tsb.
    const { rows } = await query(
      `SELECT ${SELECT_FIELDS}
       FROM destinations
       WHERE name ILIKE $1 OR description ILIKE $1 OR address ILIKE $1
       ORDER BY rating DESC NULLS LAST, name ASC`,
      [`%${keyword}%`]
    )
    res.json({ destinations: rows.map(toLocationShape), total: rows.length })
  } catch (error) {
    console.error('[destinations/search] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/destinations/filter?city=X&category=Y&rating=Z
// Filter destinasi. "category" dipetakan ke kolom "type" (coworking/cafe/wifi-spot).
// Semua parameter opsional; bisa dikombinasi. PENTING: sebelum "/:id".
// ---------------------------------------------------------------------------
router.get('/filter', async (req, res) => {
  const { city, category, rating } = req.query

  // Bangun WHERE secara dinamis, tetap parameterized ($1, $2, ...).
  const conditions = []
  const values = []

  if (city && city.trim()) {
    values.push(city.trim())
    conditions.push(`city ILIKE $${values.length}`)
  }
  if (category && category.trim()) {
    values.push(category.trim())
    conditions.push(`type ILIKE $${values.length}`)
  }
  if (rating && !Number.isNaN(parseFloat(rating))) {
    values.push(parseFloat(rating))
    conditions.push(`rating >= $${values.length}`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const { rows } = await query(
      `SELECT ${SELECT_FIELDS}
       FROM destinations
       ${whereClause}
       ORDER BY rating DESC NULLS LAST, name ASC`,
      values
    )
    res.json({ destinations: rows.map(toLocationShape), total: rows.length })
  } catch (error) {
    console.error('[destinations/filter] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/destinations
// Ambil semua destinasi.
// ---------------------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT ${SELECT_FIELDS}
       FROM destinations
       ORDER BY rating DESC NULLS LAST, name ASC`
    )
    res.json({ destinations: rows.map(toLocationShape), total: rows.length })
  } catch (error) {
    console.error('[destinations] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/destinations/:id
// Ambil detail satu destinasi berdasarkan id (mis. "loc-1").
// Didaftarkan TERAKHIR agar tidak menabrak /search dan /filter.
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { rows } = await query(
      `SELECT ${SELECT_FIELDS} FROM destinations WHERE id = $1`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Destinasi tidak ditemukan' })
    }

    res.json({ destination: toLocationShape(rows[0]) })
  } catch (error) {
    console.error('[destinations/:id] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router
