import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ListChecks, Check, RotateCcw } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import GlassCard from '../common/GlassCard'
import kit from '../../data/starterKit.json'
import { logEvent } from '../../utils/eventLogger'

const KEY = 'nomad_checklist'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

const TABS = ['preDeparture', 'onArrival']

export default function ArrivalChecklist() {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const [tab, setTab] = useState('preDeparture')
  const [checked, setChecked] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(checked)) } catch { /* ignore */ }
  }, [checked])

  const data = kit.checklist
  const allItems = [...data.preDeparture, ...data.onArrival]
  const itemKey = (group, i) => `${group}:${i}`
  const completed = allItems.filter((_, idx) => {
    const group = idx < data.preDeparture.length ? 'preDeparture' : 'onArrival'
    const i = idx < data.preDeparture.length ? idx : idx - data.preDeparture.length
    return checked[itemKey(group, i)]
  }).length
  const progress = Math.round((completed / allItems.length) * 100)

  const toggle = (group, i) => {
    const k = itemKey(group, i)
    setChecked((prev) => ({ ...prev, [k]: !prev[k] }))
    logEvent('checklist_toggle', k)
  }

  const reset = () => { setChecked({}); logEvent('checklist_reset', '') }

  const items = data[tab]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ListChecks size={18} className="text-brand-500" /> {t('starterKit.checklist.title')}
        </h2>
        <button onClick={reset} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500">
          <RotateCcw size={13} /> {t('starterKit.checklist.reset')}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{t('starterKit.checklist.progress')}</span><span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-brand-400 to-brand-600" animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <div className="flex rounded-2xl bg-gray-100 dark:bg-white/10 p-1 mb-4">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`flex-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === tb ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-300 shadow' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t(`starterKit.checklist.${tb}`)}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {items.map((it, i) => {
          const k = itemKey(tab, i)
          const on = !!checked[k]
          return (
            <li key={k}>
              <button
                onClick={() => toggle(tab, i)}
                className="w-full flex items-center gap-3 text-left rounded-xl px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className={`grid place-items-center w-5 h-5 rounded-md border-2 transition-colors shrink-0 ${
                  on ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {on && <Check size={13} strokeWidth={3} />}
                </span>
                <span className={`text-sm ${on ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                  {it[lang] || it.id}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}
