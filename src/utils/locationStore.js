import seed from '../data/locations.json'

const KEY = 'nomad_locations'

export function getLocations() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return seed
}

export function saveLocations(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

export function resetLocations() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  return seed
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
