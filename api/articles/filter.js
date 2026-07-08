import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS } from '../_lib/articlesShape.js'

// ---------------------------------------------------------------------------
// GET /api/articles/filter?category=X
// Filter artikel berdasarkan kategori (Wisata Alam / Kuliner / Budaya / Tips Nomad).
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

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
    res.status(200).json({ articles: rows, total: rows.length })
  } catch (error) {
    console.error('[articles/filter] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
