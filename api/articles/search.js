import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS } from '../_lib/articlesShape.js'

// ---------------------------------------------------------------------------
// GET /api/articles/search?q=keyword
// Cari artikel berdasarkan judul/kategori/ringkasan (ID & EN, case-insensitive).
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  const keyword = (req.query.q || '').trim()
  if (!keyword) {
    res.status(400).json({ error: 'Parameter "q" wajib diisi.' })
    return
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
    res.status(200).json({ articles: rows, total: rows.length })
  } catch (error) {
    console.error('[articles/search] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
