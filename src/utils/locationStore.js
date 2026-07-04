import seed from '../data/locations.json'

const KEY = 'nomad_locations'
const REVIEWS_KEY = 'nomad_reviews'

export function getLocations() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return seed
}

// Ambil data lokasi dari API database (READ-ONLY) lalu simpan ke localStorage,
// supaya getLocations() berikutnya otomatis memakai data dari database.
// Jika server mati / offline, fungsi ini fallback ke data yang sudah ada
// (localStorage atau seed locations.json), jadi aplikasi tetap jalan.
export async function fetchLocations() {
  try {
    // Timeout 3 detik agar startup tidak menggantung saat server tidak aktif.
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('/api/destinations', { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()

    if (Array.isArray(data.destinations) && data.destinations.length) {
      saveLocations(data.destinations)
      return data.destinations
    }
    throw new Error('data kosong')
  } catch {
    // Fallback: pakai data lokal yang sudah ada (offline-friendly / PWA).
    return getLocations()
  }
}

export function saveLocations(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

export function resetLocations() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  return seed
}

function loadReviewsMap() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveReviewsMap(map) {
  try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(map)) } catch { /* ignore */ }
}

export function getReviews(locationId) {
  const map = loadReviewsMap()
  const list = map[locationId] || []
  const average = list.length
    ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10
    : null
  return { list, average, count: list.length }
}

export function addReview(locationId, { rating, comment }) {
  const map = loadReviewsMap()
  const list = map[locationId] || []
  const next = [...list, { rating, comment, ts: new Date().toISOString() }]
  map[locationId] = next
  saveReviewsMap(map)
  return getReviews(locationId)
}

// Very small CSV parser: header row defines fields.
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = splitCsvLine(lines[0]).map((h) => h.trim())
  return lines.slice(1).map((line, i) => {
    const cells = splitCsvLine(line)
    const obj = {}
    headers.forEach((h, idx) => { obj[h] = (cells[idx] ?? '').trim() })
    return normalizeRow(obj, i)
  })
}

function splitCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { out.push(cur); cur = ''; continue }
    cur += ch
  }
  out.push(cur)
  return out
}

function normalizeRow(obj, i) {
  const num = (v) => (v === '' || v == null ? null : Number(v))
  const bool = (v) => String(v).toLowerCase() === 'true' || v === '1'
  return {
    id: obj.id || `csv-${Date.now()}-${i}`,
    name: obj.name || 'Untitled',
    type: obj.type || 'cafe',
    address: obj.address || '',
    lat: num(obj.lat),
    lng: num(obj.lng),
    distance_km: num(obj.distance_km) ?? 0,
    wifi_speed_mbps: obj.wifi_speed_mbps ? num(obj.wifi_speed_mbps) : null,
    has_power_outlet: bool(obj.has_power_outlet),
    price_range: obj.price_range || 'low',
    open_now: bool(obj.open_now),
    rating: obj.rating ? num(obj.rating) : null,
    last_updated: obj.last_updated || new Date().toISOString().slice(0, 10)
  }
}
