import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send, Bot, Loader2, MapPin, Globe } from 'lucide-react'

const API_BASE = import.meta.env.VITE_CHAT_API || '/api'

// Ambil id lokasi dari penanda [[MAP:...]] dan bersihkan teks yang ditampilkan.
// Juga membuang penanda setengah jadi saat streaming (mis. "[[MAP:loc-3" tanpa penutup).
function parseAssistant(content) {
  const ids = []
  const re = /\[\[MAP:([^\]]+)\]\]/g
  let m
  while ((m = re.exec(content)) !== null) {
    m[1].split(',').forEach((id) => {
      const trimmed = id.trim()
      if (trimmed && !ids.includes(trimmed)) ids.push(trimmed)
    })
  }
  const text = content
    .replace(/\[\[MAP:[^\]]*\]\]/g, '')
    .replace(/\[\[MAP:[^\]]*$/g, '')
    .trim()
  return { text, mapIds: ids }
}

// Deskripsi halaman yang sedang dibuka, dikirim ke AI sebagai konteks (selalu Bahasa Indonesia).
function pageContextFor(pathname) {
  if (pathname === '/') return 'halaman utama aplikasi'
  if (pathname.startsWith('/touchdown')) return 'halaman Touchdown Mode (rencana 48 jam kedatangan)'
  if (pathname.startsWith('/map/')) return 'halaman detail sebuah lokasi tempat kerja'
  if (pathname.startsWith('/map')) return 'halaman Peta lokasi tempat kerja'
  if (pathname.startsWith('/starter-kit')) return 'halaman Nomad Starter Kit (tips, biaya, transport)'
  if (pathname.startsWith('/articles')) return 'halaman artikel tentang Kulon Progo'
  if (pathname.startsWith('/my-spots')) return 'halaman lokasi favorit pengguna'
  if (pathname.startsWith('/itinerary')) return 'halaman Itinerary (rencana perjalanan)'
  if (pathname.startsWith('/admin')) return 'halaman admin'
  return ''
}

const STRINGS = {
  id: {
    title: 'Nomad Assistant',
    subtitle: 'Tanya apa saja soal Kulon Progo',
    open: 'Buka chat asisten',
    close: 'Tutup chat',
    placeholder: 'Tulis pertanyaanmu…',
    greeting:
      'Halo! 👋 Aku Nomad Assistant. Tanya aku apa saja seputar Kulon Progo — wisata, kuliner, budaya, transport, tempat kerja, sampai tips buat pendatang. Aktifkan 🌐 kalau mau aku cari info terkini dari internet.',
    error: 'Maaf, koneksi ke asisten bermasalah. Pastikan server berjalan lalu coba lagi.',
    viewOnMap: 'Lihat rekomendasi di Peta',
    viewDetail: 'Lihat detail lokasi',
    search: 'Cari internet',
    searchHintOn: '🌐 Mode cari internet aktif — jawaban memakai info terkini',
    searching: 'Mencari di internet…',
    suggestions: [
      'Wisata alam wajib di Kulon Progo?',
      'Kuliner khas yang harus dicoba?',
      'Cara ke Kalibiru dari YIA?',
      'Cafe dengan WiFi cepat buat kerja?'
    ]
  },
  en: {
    title: 'Nomad Assistant',
    subtitle: 'Ask anything about Kulon Progo',
    open: 'Open assistant chat',
    close: 'Close chat',
    placeholder: 'Type your question…',
    greeting:
      "Hi! 👋 I'm Nomad Assistant. Ask me anything about Kulon Progo — nature, food, culture, transport, workspaces, and tips for newcomers. Turn on 🌐 if you want me to search the web for up-to-date info.",
    error: 'Sorry, the connection to the assistant failed. Make sure the server is running and try again.',
    viewOnMap: 'View picks on the map',
    viewDetail: 'View location details',
    search: 'Web search',
    searchHintOn: '🌐 Web search on — answers use up-to-date info',
    searching: 'Searching the web…',
    suggestions: [
      'Best nature spots in Kulon Progo?',
      'Must-try local food?',
      'How to get to Kalibiru from YIA?',
      'A cafe with fast WiFi to work?'
    ]
  }
}

export default function ChatWidget() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'id'
  const s = STRINGS[lang]

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([]) // { role, content }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [webSearch, setWebSearch] = useState(false)
  const [searching, setSearching] = useState(false)

  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll ke pesan terbaru.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Fokus ke input saat panel dibuka.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Tutup dengan tombol Escape.
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      const nextMessages = [...messages, { role: 'user', content: trimmed }]
      setMessages(nextMessages)
      setInput('')
      setLoading(true)
      if (webSearch) setSearching(true)

      // Sisipkan bubble asisten kosong yang akan diisi secara streaming.
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages,
            webSearch,
            pageContext: pageContextFor(pathname)
          })
        })

        if (!res.ok || !res.body) throw new Error('Bad response')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        // Loop baca stream SSE: setiap event dipisah "\n\n", data diawali "data: ".
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const evt of events) {
            const line = evt.trim()
            if (!line.startsWith('data:')) continue
            const payload = JSON.parse(line.slice(5).trim())

            if (payload.type === 'delta') {
              setSearching(false)
              setMessages((prev) => {
                const copy = [...prev]
                copy[copy.length - 1] = {
                  role: 'assistant',
                  content: copy[copy.length - 1].content + payload.text
                }
                return copy
              })
            } else if (payload.type === 'error') {
              throw new Error(payload.message || 'stream error')
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: s.error }
          return copy
        })
      } finally {
        setLoading(false)
        setSearching(false)
      }
    },
    [messages, loading, webSearch, pathname, s.error]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
    {/* Backdrop — klik di luar untuk tutup */}
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[49] bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
    <div className="fixed right-4 lg:right-6 bottom-20 lg:bottom-6 z-50 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{ transformOrigin: 'bottom right' }}
            className="glass rounded-3xl w-[calc(100vw-2rem)] sm:w-96 h-[65vh] sm:h-[500px] max-h-[600px] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/60 dark:border-white/10 bg-brand-500/10">
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0">
                <Bot size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm leading-tight truncate">{s.title}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{s.subtitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={s.close}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Sapaan awal */}
              <Bubble role="assistant" content={s.greeting} />

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {s.suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-brand-500/40 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => {
                if (m.role === 'assistant') {
                  const { text, mapIds } = parseAssistant(m.content)
                  // Bubble kosong saat masih streaming — biar indikator yang tampil.
                  if (!text && mapIds.length === 0) return null
                  return (
                    <div key={i} className="space-y-2">
                      {text && <Bubble role="assistant" content={text} />}
                      {mapIds.length > 0 && (
                        <button
                          onClick={() => {
                            // 1 lokasi → halaman detail; beberapa → Peta ter-filter.
                            navigate(
                              mapIds.length === 1
                                ? `/map/${mapIds[0]}`
                                : `/map?focus=${mapIds.join(',')}`
                            )
                            setOpen(false)
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm"
                        >
                          <MapPin size={14} /> {mapIds.length === 1 ? s.viewDetail : s.viewOnMap}
                        </button>
                      )}
                    </div>
                  )
                }
                return <Bubble key={i} role={m.role} content={m.content} />
              })}

              {loading && messages[messages.length - 1]?.content === '' && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  {searching ? (
                    <><Globe size={15} className="animate-pulse text-brand-500" /> {s.searching}</>
                  ) : (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                </div>
              )}
            </div>

            {/* Hint saat web search aktif */}
            {webSearch && (
              <div className="px-3 pt-2 text-[11px] text-brand-600 dark:text-brand-400">{s.searchHintOn}</div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 p-3 border-t border-gray-200/60 dark:border-white/10"
            >
              <button
                type="button"
                onClick={() => setWebSearch((v) => !v)}
                title={s.search}
                aria-label={s.search}
                aria-pressed={webSearch}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                  webSearch
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'border-gray-300 dark:border-white/15 text-gray-400 hover:text-brand-500 hover:border-brand-400'
                }`}
              >
                <Globe size={16} />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={s.placeholder}
                className="flex-1 min-w-0 bg-gray-100/80 dark:bg-white/5 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol bulat pemicu */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? s.close : s.open}
        className="w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg flex items-center justify-center shrink-0"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
    </>
  )
}

function Bubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-brand-500 text-white rounded-br-sm'
            : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-bl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  )
}
