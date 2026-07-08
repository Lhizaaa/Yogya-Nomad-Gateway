import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS, toLocationShape } from '../_lib/destinationsShape.js'

// ---------------------------------------------------------------------------
// GET /api/destinations — ambil semua destinasi.
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  try {
    const { rows } = await query(
      `SELECT ${SELECT_FIELDS}
       FROM destinations
       ORDER BY rating DESC NULLS LAST, name ASC`
    )
    res.status(200).json({ destinations: rows.map(toLocationShape), total: rows.length })
  } catch (error) {
    console.error('[destinations] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
