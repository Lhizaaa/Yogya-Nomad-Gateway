import { applyCors, handleOptions } from './_lib/cors.js'
import { client, MODEL } from './_lib/openai.js'
import { getLocations } from './_lib/locations.js'
import { buildChatSystemPrompt } from './_lib/systemPrompt.js'

// Beri waktu lebih untuk streaming jawaban panjang (detik).
export const config = {
  maxDuration: 60,
}

// Bersihkan & batasi input agar aman (hanya role user/assistant, konten string).
function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
}

// ---------------------------------------------------------------------------
// POST /api/chat — chatbot serba-tahu, dengan toggle web search (grounding)
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  applyCors(req, res)

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { messages, webSearch, pageContext } = req.body || {}
  const safeMessages = sanitizeMessages(messages)

  if (safeMessages.length === 0 || safeMessages[safeMessages.length - 1].role !== 'user') {
    res.status(400).json({ error: 'Pesan terakhir harus dari role "user".' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`)
  const locations = await getLocations()
  const systemPrompt = buildChatSystemPrompt(locations, typeof pageContext === 'string' ? pageContext : '')

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
}
