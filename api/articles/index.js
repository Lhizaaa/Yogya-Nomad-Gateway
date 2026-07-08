import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS } from '../_lib/articlesShape.js'

// ---------------------------------------------------------------------------
// GET /api/articles — semua artikel.
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  try {
    const { rows } = await query(`SELECT ${SELECT_FIELDS} FROM articles ORDER BY id ASC`)
    res.status(200).json({ articles: rows, total: rows.length })
  } catch (error) {
    console.error('[articles] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
