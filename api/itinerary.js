import { applyCors, handleOptions } from './_lib/cors.js'
import { client, MODEL } from './_lib/openai.js'
import { getLocations } from './_lib/locations.js'

export const config = {
  maxDuration: 30,
}

// ---------------------------------------------------------------------------
// POST /api/itinerary — AI Trip Planner: susun rencana per-hari untuk Kulon Progo
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { days, interests, budget, lang } = req.body || {}
  const nDays = Math.min(Math.max(parseInt(days, 10) || 2, 1), 5)
  const interestStr = Array.isArray(interests) && interests.length ? interests.join(', ') : 'umum'
  const budgetStr = ['low', 'medium', 'high'].includes(budget) ? budget : 'medium'
  const outLang = lang === 'en' ? 'English' : 'Bahasa Indonesia'
  const locations = await getLocations()

  const system = `Kamu perencana perjalanan ahli Kulon Progo, Yogyakarta. Buat rencana perjalanan ${nDays} hari HANYA di Kulon Progo, sesuai minat: "${interestStr}" dan anggaran "${budgetStr}".

Gunakan tempat NYATA di Kulon Progo (mis. Kalibiru, Waduk Sermo, Pantai Glagah, Puncak Suroloyo, Kebun Teh Nglinggo, Gua Kiskendo, Hutan Mangrove, kuliner geblek/dawet sambel), dan bila cocok untuk tempat kerja/kafe pakai data lokasi resmi ini: ${JSON.stringify(locations)}.

Balas HANYA dalam JSON valid (tanpa markdown, tanpa teks lain) dengan struktur:
{
  "title": "judul rencana (dalam ${outLang})",
  "days": [
    { "day": 1, "theme": "tema hari (dalam ${outLang})", "items": [
      { "time": "Pagi/Siang/Sore/Malam", "title": "nama tempat/aktivitas", "desc": "1-2 kalimat", "locationId": "id lokasi resmi jika dari data, atau null" }
    ] }
  ],
  "tips": "1-2 tips singkat (dalam ${outLang})"
}
Tulis semua teks dalam ${outLang}. locationId HANYA diisi jika tempatnya ada di data lokasi resmi, selain itu null.`

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Buatkan rencana ${nDays} hari, minat ${interestStr}, anggaran ${budgetStr}.` },
      ],
    })
    const plan = JSON.parse(completion.choices[0].message.content)
    res.status(200).json({ plan })
  } catch (err) {
    console.error('[itinerary] error:', err?.message || err)
    res.status(500).json({ error: 'Gagal membuat rencana. Coba lagi ya.' })
  }
}
