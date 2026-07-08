// ---------------------------------------------------------------------------
// Cache lokasi (destinations) di memori module-scope, dipakai untuk konteks
// AI (chat/itinerary/touchdown). Cache bertahan selama function instance
// masih "warm" (dipakai ulang Vercel antar-request), dengan TTL 5 menit
// supaya data baru yang ditambahkan ke Supabase ikut muncul tanpa perlu
// redeploy manual.
// ---------------------------------------------------------------------------
import { query } from './db.js'

const TTL_MS = 5 * 60 * 1000
let cache = { data: [], ts: 0 }

export async function getLocations() {
  const now = Date.now()
  if (cache.data.length && now - cache.ts < TTL_MS) {
    return cache.data
  }
  try {
    const { rows } = await query('SELECT * FROM destinations ORDER BY id')
    cache = { data: rows, ts: now }
    return rows
  } catch (err) {
    console.error('[locations] error:', err?.message || err)
    return cache.data
  }
}
