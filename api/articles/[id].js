import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS } from '../_lib/articlesShape.js'

// ---------------------------------------------------------------------------
// GET /api/articles/:id — detail satu artikel (mis. "art-1").
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  const { id } = req.query

  try {
    const { rows } = await query(`SELECT ${SELECT_FIELDS} FROM articles WHERE id = $1`, [id])
    if (rows.length === 0) {
      res.status(404).json({ error: 'Artikel tidak ditemukan' })
      return
    }
    res.status(200).json({ article: rows[0] })
  } catch (error) {
    console.error('[articles/:id] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
