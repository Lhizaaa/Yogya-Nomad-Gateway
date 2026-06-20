const KEY = 'nomad_events'

export function logEvent(type, detail = '') {
  try {
    const events = getEvents()
    events.push({ type, detail, ts: new Date().toISOString() })
    // keep last 500 to avoid unbounded growth
    localStorage.setItem(KEY, JSON.stringify(events.slice(-500)))
  } catch { /* ignore */ }
}

export function getEvents() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function clearEvents() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

// Group events count per day -> [{ date, count }]
export function eventsPerDay() {
  const map = {}
  for (const e of getEvents()) {
    const d = (e.ts || '').slice(0, 10)
    if (!d) continue
    map[d] = (map[d] || 0) + 1
  }
  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Top clicked "get_directions" by detail (location name)
export function topDirections(limit = 5) {
  const map = {}
  for (const e of getEvents()) {
    if (e.type !== 'get_directions') continue
    const name = e.detail || 'Unknown'
    map[name] = (map[name] || 0) + 1
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
