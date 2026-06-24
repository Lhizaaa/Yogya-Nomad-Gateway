import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, RotateCcw, Compass, Coffee, ShieldCheck } from 'lucide-react'
import GlassCard from '../common/GlassCard'
import Button from '../common/Button'
import { logEvent } from '../../utils/eventLogger'

const KEY = 'nomad_quiz_type'

// Each question's options map to a nomad type vote.
const QUESTIONS = [
  { id: 'budget', options: [['budgetLow', 'explorer'], ['budgetHigh', 'comfort']] },
  { id: 'work', options: [['workCafe', 'social'], ['workQuiet', 'comfort']] },
  { id: 'social', options: [['social', 'social'], ['solo', 'explorer']] }
]

// type -> accordion section to auto-open
const RECOMMENDED = { explorer: 'costGuide', comfort: 'transport', social: 'tips' }
const TYPE_ICON = { explorer: Compass, comfort: ShieldCheck, social: Coffee }

function loadType() {
  try { return localStorage.getItem(KEY) || null } catch { return null }
}

export default function NomadQuiz({ onResult }) {
  const { t } = useTranslation()
  const [result, setResult] = useState(loadType)
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [votes, setVotes] = useState({})

  useEffect(() => {
    if (result) onResult?.(RECOMMENDED[result])
  }, [result, onResult])

  const pick = (type) => {
    const nextVotes = { ...votes, [type]: (votes[type] || 0) + 1 }
    if (step < QUESTIONS.length - 1) {
      setVotes(nextVotes)
      setStep(step + 1)
    } else {
      const winner = Object.entries(nextVotes).sort((a, b) => b[1] - a[1])[0][0]
      try { localStorage.setItem(KEY, winner) } catch { /* ignore */ }
      logEvent('quiz_complete', winner)
      setResult(winner)
      setActive(false)
    }
  }

  const start = () => { setVotes({}); setStep(0); setActive(true) }
  const retake = () => { setResult(null); start() }

  if (result && !active) {
    const Icon = TYPE_ICON[result]
    return (
      <GlassCard className="p-5 flex items-start gap-4">
        <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shrink-0">
          <Icon size={22} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400">{t('starterKit.quiz.yourType')}</div>
          <h2 className="font-bold text-gray-900 dark:text-white">{t(`starterKit.quiz.types.${result}`)}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(`starterKit.quiz.types.${result}Desc`)}</p>
          <button onClick={retake} className="mt-2 inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600">
            <RotateCcw size={12} /> {t('starterKit.quiz.retake')}
          </button>
        </div>
      </GlassCard>
    )
  }

  if (active) {
    const q = QUESTIONS[step]
    return (
      <GlassCard className="p-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{t('starterKit.quiz.title')}</span><span>{step + 1}/{QUESTIONS.length}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t(`starterKit.quiz.questions.${q.id}`)}</h2>
            <div className="grid gap-2">
              {q.options.map(([optKey, type]) => (
                <button
                  key={optKey}
                  onClick={() => pick(type)}
                  className="w-full text-left rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-white/5 transition-colors"
                >
                  {t(`starterKit.quiz.options.${optKey}`)}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shrink-0">
          <Sparkles size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 dark:text-white">{t('starterKit.quiz.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{t('starterKit.quiz.intro')}</p>
        </div>
      </div>
      <Button className="shrink-0" onClick={start}>{t('starterKit.quiz.start')}</Button>
    </GlassCard>
  )
}
