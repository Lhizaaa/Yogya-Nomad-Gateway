import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Smartphone, ChevronDown, Wifi, Signal } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import GlassCard from '../common/GlassCard'
import Badge from '../common/Badge'
import kit from '../../data/starterKit.json'

export default function SimComparison() {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const [guideOpen, setGuideOpen] = useState(false)
  const data = kit.sim

  return (
    <GlassCard className="p-5">
      <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Smartphone size={18} className="text-brand-500" /> {t('starterKit.sim.title')}
      </h2>

      <div className="space-y-3">
        {data.items.map((sim) => (
          <div
            key={sim.name}
            className={`rounded-2xl border p-4 ${
              sim.bestValue
                ? 'border-brand-300 dark:border-brand-500/40 bg-brand-50/60 dark:bg-brand-500/10'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{sim.name}</span>
                {sim.esim && <Badge tone="blue"><Signal size={11} /> {t('starterKit.sim.esim')}</Badge>}
              </div>
              {sim.bestValue && <Badge tone="brand">★ {t('starterKit.sim.bestValue')}</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[11px] text-gray-400">{t('starterKit.sim.price')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">{sim.price}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400">{t('starterKit.sim.quota')}</div>
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1"><Wifi size={12} className="text-brand-500" /> {sim.quota}</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{lang === 'en' ? sim.coverage_en : sim.coverage_id}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button onClick={() => setGuideOpen((v) => !v)} className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('starterKit.sim.esimGuide')}
          <motion.span animate={{ rotate: guideOpen ? 180 : 0 }}><ChevronDown size={16} className="text-gray-400" /></motion.span>
        </button>
        <AnimatePresence initial={false}>
          {guideOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <p className="px-3 pb-3 text-xs text-gray-500 dark:text-gray-400">{lang === 'en' ? data.esimNote_en : data.esimNote_id}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}
