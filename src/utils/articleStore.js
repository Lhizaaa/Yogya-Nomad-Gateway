import seed from '../data/articles.json'

const KEY = 'nomad_articles'

// Ambil artikel: pakai data dari localStorage (hasil sinkron dari database)
// bila ada, kalau tidak fallback ke seed articles.json.
export function getArticles() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return seed
}

function saveArticles(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

// Ambil artikel dari API database (READ-ONLY) lalu simpan ke localStorage,
// supaya getArticles() berikutnya otomatis memakai data dari database.
// Jika server mati / offline, fallback ke data lokal (offline-friendly / PWA).
export async function fetchArticles() {
  try {
    // Default '' (relatif) karena frontend & backend (Vercel Functions) satu domain.
    const apiUrl = import.meta.env.VITE_API_URL || ''
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${apiUrl}/api/articles`, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()

    if (Array.isArray(data.articles) && data.articles.length) {
      saveArticles(data.articles)
      return data.articles
    }
    throw new Error('data kosong')
  } catch {
    return getArticles()
  }
}
