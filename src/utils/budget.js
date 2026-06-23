// Parses strings like "Rp 50.000 – 120.000" into [50000, 120000]
export function parseCostRange(value) {
  const cleaned = value.replace(/Rp/gi, '').trim()
  const parts = cleaned.split(/[–-]/).map((p) => Number(p.replace(/\./g, '').trim()))
  if (parts.length < 2 || parts.some(Number.isNaN)) {
    const single = Number(cleaned.replace(/\./g, '').trim())
    return Number.isNaN(single) ? [0, 0] : [single, single]
  }
  return [parts[0], parts[1]]
}

const TIER_POINT = { low: 0, medium: 0.5, high: 1 }

export function estimateBudget(costGuideItems, tier, days) {
  const point = TIER_POINT[tier] ?? 0.5
  const breakdown = costGuideItems.map((item) => {
    const [low, high] = parseCostRange(item.value)
    const perDay = Math.round(low + (high - low) * point)
    return { label_id: item.label_id, label_en: item.label_en, perDay, total: perDay * days }
  })
  const total = breakdown.reduce((sum, b) => sum + b.total, 0)
  return { breakdown, total, days, tier }
}
