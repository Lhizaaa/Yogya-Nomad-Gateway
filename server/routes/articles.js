// ---------------------------------------------------------------------------
// Route artikel "Jelajahi Kulon Progo" (READ-ONLY) — hanya endpoint GET.
// Bentuk respons dibuat PERSIS seperti src/data/articles.json supaya frontend
// bisa memakainya tanpa perubahan (id "art-1", title, title_en, dst).
// Semua query parameterized ($1, ...) agar aman dari SQL injection.
// ---------------------------------------------------------------------------
import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

const SELECT_FIELDS = `
  id, title, title_en, category, category_en, excerpt, excerpt_en,
  image, read_time_minutes, content, content_en
`

// ---------------------------------------------------------------------------
// GET /api/articles/search?q=keyword
// Cari artikel berdasarkan judul/kategori/ringkasan (ID & EN, case-insensitive).
// PENTING: didaftarkan SEBELUM "/:id".
// ---------------------------------------------------------------------------
router.get('/search', async (req, res) => {
  const keyword = (req.query.q || '').trim()
  if (!keyword) {
    return res.status(400).json({ error: 'Parameter "q" wajib diisi.' })
  }

  try {
    const { rows } = await query(
      `SELECT ${SELECT_FIELDS}
       FROM articles
       WHERE title ILIKE $1 OR title_en ILIKE $1
          OR category ILIKE $1 OR category_en ILIKE $1
          OR excerpt ILIKE $1 OR excerpt_en ILIKE $1
       ORDER BY id ASC`,
      [`%${keyword}%`]
    )
    res.json({ articles: rows, total: rows.length })
  } catch (error) {
    console.error('[articles/search] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/articles/filter?category=X
// Filter artikel berdasarkan kategori (Wisata Alam / Kuliner / Budaya / Tips Nomad).
// PENTING: sebelum "/:id".
// ---------------------------------------------------------------------------
router.get('/filter', async (req, res) => {
  const category = (req.query.category || '').trim()

  try {
    const { rows } = category
      ? await query(
          `SELECT ${SELECT_FIELDS} FROM articles
           WHERE category ILIKE $1 OR category_en ILIKE $1
           ORDER BY id ASC`,
          [category]
        )
      : await query(`SELECT ${SELECT_FIELDS} FROM articles ORDER BY id ASC`)
    res.json({ articles: rows, total: rows.length })
  } catch (error) {
    console.error('[articles/filter] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/articles — semua artikel.
// ---------------------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(`SELECT ${SELECT_FIELDS} FROM articles ORDER BY id ASC`)
    res.json({ articles: rows, total: rows.length })
  } catch (error) {
    console.error('[articles] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/articles/:id — detail satu artikel (mis. "art-1").
// Didaftarkan TERAKHIR agar tidak menabrak /search dan /filter.
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await query(
      `SELECT ${SELECT_FIELDS} FROM articles WHERE id = $1`,
      [id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' })
    }
    res.json({ article: rows[0] })
  } catch (error) {
    console.error('[articles/:id] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
})

export default router
