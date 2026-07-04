import { getLocations } from './locationStore'
import { getArticles } from './articleStore'
import starterKit from '../data/starterKit.json'

function matches(query, ...fields) {
  const q = query.toLowerCase()
  return fields.some((f) => f && String(f).toLowerCase().includes(q))
}

export function searchAll(query) {
  if (!query || query.trim().length < 2) return { locations: [], articles: [], starterKit: [] }
  const q = query.trim()

  const locations = getLocations()
    .filter((l) => matches(q, l.name, l.address, l.type))
    .slice(0, 5)

  const matchedArticles = getArticles()
    .filter((a) => matches(q, a.title, a.title_en, a.category, a.category_en, a.excerpt, a.excerpt_en))
    .slice(0, 5)

  const matchedKit = []
  for (const [section, data] of Object.entries(starterKit)) {
    for (const item of data.items) {
      const label = item.id || item.label_id || item.name
      const labelEn = item.en || item.label_en
      if (matches(q, label, labelEn)) {
        matchedKit.push({ section, label: labelEn || label })
        if (matchedKit.length >= 5) break
      }
    }
  }

  return { locations, articles: matchedArticles, starterKit: matchedKit }
}
