import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { estimateBudget } from '../../utils/budget'
import { logEvent } from '../../utils/eventLogger'
import GlassCard from '../common/GlassCard'
import Button from '../common/Button'
import kit from '../../data/starterKit.json'

const TIERS = ['low', 'medium', 'high']

export default function BudgetCalculator() {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const [days, setDays] = useState(3)
  const [tier, setTier] = useState('medium')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const r = estimateBudget(kit.costGuide.items, tier, Number(days) || 1)
    setResult(r)
    logEvent('budget_calc', `${days}days:${tier}:${r.total}`)
  }

  return (
    <GlassCard className="p-6">
      <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Wallet size={18} className="text-brand-500" /> {t('budget.title')}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{t('budget.subtitle')}</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('budget.days')}</label>
          <input
            type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('budget.tier')}</label>
          <div className="flex rounded-xl bg-gray-100 dark:bg-white/10 p-1">
            {TIERS.map((ty) => (
              <button
                key={ty}
                onClick={() => setTier(ty)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tier === ty ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-300 shadow' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t(`touchdown.budget${ty[0].toUpperCase()}${ty.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={calculate}>{t('budget.calculate')}</Button>

      {result && (
        <div className="mt-5 space-y-2">
          {result.breakdown.map((b, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{lang === 'en' ? b.label_en : b.label_id}</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">Rp {b.total.toLocaleString('id-ID')}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-gray-200/60 dark:border-white/10 font-bold text-gray-900 dark:text-white">
            <span>{t('budget.total')} ({result.days}d)</span>
            <span>Rp {result.total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
