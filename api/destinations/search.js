import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS, toLocationShape } from '../_lib/destinationsShape.js'

// ---------------------------------------------------------------------------
// GET /api/destinations/search?q=keyword
// Cari destinasi berdasarkan nama atau deskripsi (case-insensitive).
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
       FROM destinations
       WHERE name ILIKE $1 OR description ILIKE $1 OR address ILIKE $1
       ORDER BY rating DESC NULLS LAST, name ASC`,
      [`%${keyword}%`]
    )
    res.status(200).json({ destinations: rows.map(toLocationShape), total: rows.length })
  } catch (error) {
    console.error('[destinations/search] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
