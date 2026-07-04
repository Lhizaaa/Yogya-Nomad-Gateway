import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_CHAT_API || '/api'

const STRINGS = {
  id: {
    title: 'Briefing AI untukmu',
    loading: 'AI menyiapkan briefing personal…',
    error: 'Briefing AI tidak tersedia (server mati?).',
    retry: 'Coba lagi'
  },
  en: {
    title: 'Your AI briefing',
    loading: 'AI is preparing your personal briefing…',
    error: 'AI briefing unavailable (server down?).',
    retry: 'Retry'
  }
}

export default function AiBriefing({ budget, workspace }) {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'id'
  const s = STRINGS[lang]

  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`${API_BASE}/touchdown`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget, workspace, lang })
        })
        if (!res.ok) throw new Error('bad response')
        const data = await res.json()
        if (!cancelled) setText(data.text)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [budget, workspace, lang])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-700/5 border border-brand-500/20 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="grid place-items-center w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Sparkles size={15} />
        </span>
        <span className="font-bold text-sm text-gray-900 dark:text-white">{s.title}</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 size={15} className="animate-spin" /> {s.loading}
        </div>
      ) : error ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{s.error}</p>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{text}</p>
      )}
    </motion.div>
  )
}
