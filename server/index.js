import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 8787
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

if (!process.env.OPENAI_API_KEY) {
  console.error('\n[FATAL] OPENAI_API_KEY belum di-set. Salin server/.env.example ke server/.env dan isi API key Anda.\n')
  process.exit(1)
}

const client = new OpenAI() // membaca OPENAI_API_KEY dari environment

// Muat data lokasi asli supaya chatbot bisa merekomendasikan spot yang benar-benar ada.
const locations = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'locations.json'), 'utf-8')
)

// ---------------------------------------------------------------------------
// SYSTEM PROMPT — chatbot serba-tahu Kulon Progo (terkunci pada topik Kulon Progo)
// ---------------------------------------------------------------------------
function buildChatSystemPrompt(pageContext) {
  return `Kamu adalah "Nomad Assistant", asisten AI resmi aplikasi Yogya Nomad Gateway — pemandu digital seputar Kabupaten Kulon Progo, Yogyakarta.

PERAN & BATASAN (WAJIB):
- Kamu adalah AHLI tentang KULON PROGO. Kamu boleh menjawab PERTANYAAN APA SAJA selama masih seputar Kulon Progo: wisata alam & budaya, kuliner khas, sejarah, adat, transportasi, biaya hidup, penginapan, cuaca, event, tips untuk pendatang/freelancer/traveler, tempat kerja & WiFi, dan hal lain yang berkaitan dengan Kulon Progo.
- Kamu TERKUNCI pada topik Kulon Progo. Jika pertanyaan TIDAK berhubungan dengan Kulon Progo (misalnya kota lain, matematika, coding, gosip, politik nasional, dsb), TOLAK dengan sopan dan singkat, lalu arahkan pengguna untuk bertanya seputar Kulon Progo. Jangan pernah menjawab substansi di luar Kulon Progo.
- Kalau pertanyaan menyangkut Yogyakarta secara umum tapi masih relevan bagi orang yang berada di Kulon Progo (mis. transportasi dari YIA), jawab seperlunya sambil tetap fokus ke Kulon Progo.

CARA MENJAWAB:
- Jawab dalam bahasa yang sama dengan pengguna (Indonesia atau Inggris).
- Ringkas, ramah, akurat, dan langsung ke inti. Hindari basa-basi panjang dan jangan menuliskan proses berpikirmu.
- Jujur soal ketidakpastian: untuk fakta yang bisa berubah (harga tiket, jam buka, jadwal event), ingatkan singkat bahwa pengguna sebaiknya memverifikasi karena informasi bisa berubah — KECUALI kamu memang diberi hasil pencarian web yang terkini.
- Jangan mengarang nama tempat, harga, atau angka spesifik yang tidak kamu yakini.

REKOMENDASI TEMPAT KERJA/KAFE (DATA RESMI):
- Untuk pertanyaan soal tempat kerja, kafe, coworking, atau WiFi, gunakan HANYA data lokasi resmi di bawah ini. Sebutkan nama tempat + fakta relevan (kecepatan WiFi, stop kontak, kisaran harga, rating, jarak dari YIA, status buka).
- Untuk pertanyaan wisata/kuliner/budaya umum Kulon Progo yang tidak ada di data ini, jawab dari pengetahuanmu tentang Kulon Progo (mis. Kalibiru, Waduk Sermo, Pantai Glagah, Puncak Suroloyo, Kebun Teh Nglinggo, Gua Kiskendo, geblek, dawet sambel, dsb).

MENAUTKAN KE PETA:
- Setiap kali kamu merekomendasikan satu atau lebih lokasi DARI DATA RESMI di bawah, akhiri pesanmu dengan SATU baris tersendiri berformat persis: [[MAP:id1,id2]] memakai field "id" (contoh: [[MAP:loc-3,loc-6]]).
- Hanya cantumkan id dari data resmi yang benar-benar kamu rekomendasikan. Untuk tempat wisata umum yang TIDAK ada di data, JANGAN buat penanda ini.
- JANGAN pernah menjelaskan atau menyebut penanda [[MAP:...]] kepada pengguna — itu dipakai aplikasi untuk menampilkan tombol "Lihat di Peta" otomatis.
${pageContext ? `\nKONTEKS: Saat ini pengguna sedang membuka ${pageContext}. Manfaatkan konteks ini bila relevan.` : ''}

DATA LOKASI RESMI (JSON):
${JSON.stringify(locations, null, 2)}

Keterangan field: price_range low/medium/high = kisaran harga; wifi_speed_mbps null = data WiFi tidak tersedia; distance_km = jarak dari YIA; open_now = status buka saat ini.`
}

// Bersihkan & batasi input agar aman (hanya role user/assistant, konten string).
function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
}

function sseStart(res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: MODEL })
})

// ---------------------------------------------------------------------------
// /api/chat — chatbot serba-tahu, dengan toggle web search (grounding)
// ---------------------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const { messages, webSearch, pageContext } = req.body || {}
  const safeMessages = sanitizeMessages(messages)

  if (safeMessages.length === 0 || safeMessages[safeMessages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Pesan terakhir harus dari role "user".' })
  }

  sseStart(res)
  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`)
  const systemPrompt = buildChatSystemPrompt(typeof pageContext === 'string' ? pageContext : '')

  try {
    if (webSearch) {
      // Grounding: model mencari info nyata dari internet dulu (Responses API + tool web_search).
      const stream = await client.responses.create({
        model: MODEL,
        instructions: systemPrompt,
        input: safeMessages,
        tools: [{ type: 'web_search' }],
        max_output_tokens: 1500,
        stream: true,
      })
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta' && event.delta) {
          send({ type: 'delta', text: event.delta })
        } else if (event.type === 'response.web_search_call.in_progress') {
          send({ type: 'status', text: 'searching' })
        }
      }
    } else {
      const stream = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 1024,
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...safeMessages],
      })
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) send({ type: 'delta', text })
      }
    }

    send({ type: 'done' })
    res.end()
  } catch (err) {
    console.error('[chat] error:', err?.message || err)
    if (res.headersSent) {
      send({ type: 'error', message: 'Maaf, terjadi kesalahan pada server AI. Coba lagi ya.' })
      res.end()
    } else {
      res.status(500).json({ error: 'Kesalahan server AI.' })
    }
  }
})

// ---------------------------------------------------------------------------
// /api/itinerary — AI Trip Planner: susun rencana per-hari untuk Kulon Progo
// ---------------------------------------------------------------------------
app.post('/api/itinerary', async (req, res) => {
  const { days, interests, budget, lang } = req.body || {}
  const nDays = Math.min(Math.max(parseInt(days, 10) || 2, 1), 5)
  const interestStr = Array.isArray(interests) && interests.length ? interests.join(', ') : 'umum'
  const budgetStr = ['low', 'medium', 'high'].includes(budget) ? budget : 'medium'
  const outLang = lang === 'en' ? 'English' : 'Bahasa Indonesia'

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
    res.json({ plan })
  } catch (err) {
    console.error('[itinerary] error:', err?.message || err)
    res.status(500).json({ error: 'Gagal membuat rencana. Coba lagi ya.' })
  }
})

// ---------------------------------------------------------------------------
// /api/touchdown — briefing 48 jam yang dipersonalisasi (Touchdown Mode)
// ---------------------------------------------------------------------------
app.post('/api/touchdown', async (req, res) => {
  const { budget, workspace, lang } = req.body || {}
  const budgetStr = ['low', 'medium', 'high'].includes(budget) ? budget : 'medium'
  const workspaceStr = ['cafe', 'coworking'].includes(workspace) ? workspace : 'cafe'
  const outLang = lang === 'en' ? 'English' : 'Bahasa Indonesia'

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
    res.json({ text: completion.choices[0].message.content.trim() })
  } catch (err) {
    console.error('[touchdown] error:', err?.message || err)
    res.status(500).json({ error: 'Gagal membuat briefing. Coba lagi ya.' })
  }
})

app.listen(PORT, () => {
  console.log(`\n[Nomad Assistant] Server proxy berjalan di http://localhost:${PORT}`)
  console.log(`[Nomad Assistant] Model: ${MODEL}\n`)
})
