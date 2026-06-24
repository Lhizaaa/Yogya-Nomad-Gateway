import kit from '../data/starterKit.json'

// Builds a plain-text version of the starter kit in the current language.
export function buildStarterKitText(lang = 'id') {
  const L = (obj) => (lang === 'en' ? obj.en : obj.id) || obj.id
  const lines = []
  lines.push('YOGYA NOMAD GATEWAY — NOMAD STARTER KIT')
  lines.push('========================================')
  lines.push('')

  // Checklist
  lines.push(`# ${L(kit.checklist)}`)
  const checked = (() => {
    try { return JSON.parse(localStorage.getItem('nomad_checklist') || '{}') } catch { return {} }
  })()
  ;['preDeparture', 'onArrival'].forEach((group) => {
    kit.checklist[group].forEach((it, i) => {
      const mark = checked[`${group}:${i}`] ? '[x]' : '[ ]'
      lines.push(`  ${mark} ${it[lang] || it.id}`)
    })
  })
  lines.push('')

  // Cost guide
  lines.push(`# ${L(kit.costGuide)}`)
  kit.costGuide.items.forEach((it) => {
    lines.push(`  - ${lang === 'en' ? it.label_en : it.label_id}: ${it.value}`)
  })
  lines.push('')

  // SIM
  lines.push(`# ${L(kit.sim)}`)
  kit.sim.items.forEach((s) => {
    const best = s.bestValue ? ' (★ best value)' : ''
    lines.push(`  - ${s.name}${best}: ${s.price} · ${s.quota}`)
  })
  lines.push('')

  // Emergency
  lines.push(`# ${L(kit.emergency)}`)
  kit.emergency.items.forEach((it) => {
    lines.push(`  - ${lang === 'en' ? it.label_en : it.label_id}: ${it.value}`)
  })
  lines.push('')

  // Quiz result
  try {
    const type = localStorage.getItem('nomad_quiz_type')
    if (type) lines.push(`Nomad type: ${type}`)
  } catch { /* ignore */ }

  return lines.join('\n')
}

export function downloadStarterKit(lang = 'id') {
  const text = buildStarterKitText(lang)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'nomad-starter-kit.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
