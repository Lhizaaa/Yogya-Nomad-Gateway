import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS, toLocationShape } from '../_lib/destinationsShape.js'

// ---------------------------------------------------------------------------
// GET /api/destinations/:id — ambil detail satu destinasi (mis. "loc-1").
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  const { id } = req.query

  try {
    const { rows } = await query(`SELECT ${SELECT_FIELDS} FROM destinations WHERE id = $1`, [id])

    if (rows.length === 0) {
      res.status(404).json({ error: 'Destinasi tidak ditemukan' })
      return
    }

    res.status(200).json({ destination: toLocationShape(rows[0]) })
  } catch (error) {
    console.error('[destinations/:id] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
