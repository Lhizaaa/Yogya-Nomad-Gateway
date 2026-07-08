import { applyCors, handleOptions } from '../_lib/cors.js'
import { query } from '../_lib/db.js'
import { SELECT_FIELDS, toLocationShape } from '../_lib/destinationsShape.js'

// ---------------------------------------------------------------------------
// GET /api/destinations/filter?city=X&category=Y&rating=Z
// Filter destinasi. "category" dipetakan ke kolom "type" (coworking/cafe/wifi-spot).
// Semua parameter opsional; bisa dikombinasi.
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  const { city, category, rating } = req.query

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
    res.status(200).json({ destinations: rows.map(toLocationShape), total: rows.length })
  } catch (error) {
    console.error('[destinations/filter] error:', error.message)
    res.status(500).json({ error: 'Database error' })
  }
}
