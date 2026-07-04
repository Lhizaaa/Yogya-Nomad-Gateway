import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, MapPin, Wand2 } from 'lucide-react'
import GlassCard from '../common/GlassCard'
import Button from '../common/Button'
import { logEvent } from '../../utils/eventLogger'

const API_BASE = import.meta.env.VITE_CHAT_API || '/api'

const STRINGS = {
  id: {
    title: 'AI Trip Planner',
    subtitle: 'Biarkan AI menyusun rencana perjalanan Kulon Progo untukmu',
    duration: 'Durasi',
    day: 'hari',
    interests: 'Minat',
    budget: 'Anggaran',
    generate: 'Buat Rencana',
    regenerate: 'Buat Ulang',
    loading: 'AI sedang menyusun rencana…',
    error: 'Gagal membuat rencana. Pastikan server berjalan lalu coba lagi.',
    tips: 'Tips',
    viewDetail: 'Lihat di Peta',
    budgets: { low: 'Hemat', medium: 'Sedang', high: 'Premium' },
    interestOpts: [
      ['Alam', 'Alam'],
      ['Kuliner', 'Kuliner'],
      ['Budaya', 'Budaya'],
      ['Kerja', 'Kerja/Workspace'],
      ['Santai', 'Santai']
    ]
  },
  en: {
    title: 'AI Trip Planner',
    subtitle: 'Let AI craft a Kulon Progo trip plan for you',
    duration: 'Duration',
    day: 'day(s)',
    interests: 'Interests',
    budget: 'Budget',
    generate: 'Generate Plan',
    regenerate: 'Regenerate',
    loading: 'AI is planning your trip…',
    error: 'Failed to generate the plan. Make sure the server is running and try again.',
    tips: 'Tips',
    viewDetail: 'View on map',
    budgets: { low: 'Budget', medium: 'Mid', high: 'Premium' },
    interestOpts: [
      ['Nature', 'Nature'],
      ['Food', 'Food'],
      ['Culture', 'Culture'],
      ['Work', 'Work/Workspace'],
      ['Relax', 'Relax']
    ]
  }
}

export default function AiTripPlanner() {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'id'
  const s = STRINGS[lang]

  const [days, setDays] = useState(2)
  const [interests, setInterests] = useState([s.interestOpts[0][0]])
  const [budget, setBudget] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  const toggleInterest = (val) => {
    setInterests((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]))
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    setPlan(null)
    logEvent('ai_itinerary_generate', `${days}d/${interests.join('+')}/${budget}`)
    try {
      const res = await fetch(`${API_BASE}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, interests, budget, lang })
      })
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      setPlan(data.plan)
    } catch {
      setError(s.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-3">
        <span className="shrink-0 grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Sparkles size={18} />
        </span>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">{s.title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{s.subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <div className="mt-4 space-y-3">
        {/* Durasi */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{s.duration}</label>
          <div className="mt-1.5 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setDays(n)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold border transition-colors ${
                  days === n ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-brand-400'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="self-center text-xs text-gray-400 ml-1">{s.day}</span>
          </div>
        </div>

        {/* Minat */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{s.interests}</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {s.interestOpts.map(([val, label]) => (
              <button
                key={val}
                onClick={() => toggleInterest(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  interests.includes(val) ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-brand-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Anggaran */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{s.budget}</label>
          <div className="mt-1.5 flex gap-1.5">
            {['low', 'medium', 'high'].map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  budget === b ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-brand-400'
                }`}
              >
                {s.budgets[b]}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={generate} disabled={loading || interests.length === 0}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> {s.loading}</> : <><Wand2 size={16} /> {plan ? s.regenerate : s.generate}</>}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {/* Hasil rencana */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-4"
          >
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{plan.title}</h3>
            {plan.days?.map((d) => (
              <div key={d.day} className="rounded-2xl bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold shrink-0">{d.day}</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{d.theme}</span>
                </div>
                <ul className="space-y-2.5">
                  {d.items?.map((it, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400 mt-0.5 w-12">{it.time}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{it.title}</div>
                        {it.desc && <div className="text-xs text-gray-500 dark:text-gray-400">{it.desc}</div>}
                        {it.locationId && (
                          <Link to={`/map/${it.locationId}`} className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                            <MapPin size={11} /> {s.viewDetail}
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {plan.tips && (
              <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-3 text-sm text-brand-700 dark:text-brand-300">
                <span className="font-bold">{s.tips}: </span>{plan.tips}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
