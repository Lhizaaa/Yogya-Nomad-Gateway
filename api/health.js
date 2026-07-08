import { applyCors, handleOptions } from './_lib/cors.js'
import { query } from './_lib/db.js'
import { MODEL } from './_lib/openai.js'

// Health check: cek status server AI + koneksi database (READ-ONLY).
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  let dbConnected = false
  try {
    await query('SELECT NOW()')
    dbConnected = true
  } catch (err) {
    console.error('[health] Gagal terhubung ke database:', err.message)
  }

  res.status(200).json({ ok: true, model: MODEL, database: dbConnected ? 'connected' : 'disconnected' })
}
