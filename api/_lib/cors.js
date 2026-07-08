// ---------------------------------------------------------------------------
// CORS untuk Vercel Serverless Functions. Di produksi frontend & backend
// berada di domain Vercel yang sama (tidak perlu CORS), tapi header ini tetap
// dipasang untuk mendukung dev lokal (Vite di localhost:5173) & preview URL.
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
])

export function applyCors(req, res) {
  const origin = req.headers.origin
  if (origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// Return true kalau request sudah ditangani (preflight OPTIONS) — caller harus
// langsung `return` setelah memanggil ini.
export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    applyCors(req, res)
    res.status(204).end()
    return true
  }
  return false
}
