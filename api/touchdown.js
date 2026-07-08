import { applyCors, handleOptions } from './_lib/cors.js'
import { client, MODEL } from './_lib/openai.js'
import { getLocations } from './_lib/locations.js'

export const config = {
  maxDuration: 30,
}

// ---------------------------------------------------------------------------
// POST /api/touchdown — briefing 48 jam yang dipersonalisasi (Touchdown Mode)
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { budget, workspace, lang } = req.body || {}
  const budgetStr = ['low', 'medium', 'high'].includes(budget) ? budget : 'medium'
  const workspaceStr = ['cafe', 'coworking'].includes(workspace) ? workspace : 'cafe'
  const outLang = lang === 'en' ? 'English' : 'Bahasa Indonesia'
  const locations = await getLocations()

  // Beri tempat kerja NYATA yang cocok dengan preferensi agar tidak mengarang nama.
  const matchingSpots = locations.filter(
    (l) => l.type === (workspaceStr === 'coworking' ? 'coworking' : 'cafe')
  )

  const system = `Kamu Nomad Assistant, pemandu kedatangan di Kulon Progo (dekat Yogyakarta International Airport). Seorang digital nomad baru mendarat dengan preferensi: anggaran "${budgetStr}", gaya kerja "${workspaceStr === 'coworking' ? 'coworking / meja khusus' : 'kafe tenang'}".

Tulis briefing 48 jam pertama yang HANGAT, PERSONAL, dan PRAKTIS (maksimal ~120 kata) dalam ${outLang}. Fokus: koneksi internet/SIM, memilih tempat kerja sesuai preferensi, transport dari YIA, satu rekomendasi kuliner khas Kulon Progo (mis. geblek, dawet sambel, growol), dan satu spot santai/alam terdekat (mis. Pantai Glagah, Waduk Sermo, Kalibiru). Jangan pakai heading markdown, cukup 1-2 paragraf mengalir. Semua konteks HARUS seputar Kulon Progo.

Untuk rekomendasi tempat kerja, gunakan HANYA nama dari data ini (jangan mengarang nama tempat): ${JSON.stringify(matchingSpots.map((l) => ({ name: l.name, wifi_speed_mbps: l.wifi_speed_mbps, price_range: l.price_range, distance_km: l.distance_km })))}.`

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: 'Tuliskan briefing kedatangan saya.' },
      ],
    })
    res.status(200).json({ text: completion.choices[0].message.content.trim() })
  } catch (err) {
    console.error('[touchdown] error:', err?.message || err)
    res.status(500).json({ error: 'Gagal membuat briefing. Coba lagi ya.' })
  }
}
