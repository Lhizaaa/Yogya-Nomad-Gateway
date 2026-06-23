import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, ChevronUp, ChevronDown, X, Copy } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getLocations } from '../utils/locationStore'
import { logEvent } from '../utils/eventLogger'
import GlassCard from '../components/common/GlassCard'
import Button from '../components/common/Button'
import BudgetCalculator from '../components/Itinerary/BudgetCalculator'

export default function ItineraryPage() {
  const { t } = useTranslation()
  const { itinerary, removeFromItinerary, moveItineraryItem } = useApp()
  const [toast, setToast] = useState('')

  const locations = useMemo(() => {
    const all = getLocations()
    return itinerary.map((id) => all.find((l) => l.id === id)).filter(Boolean)
  }, [itinerary])

  const exportItinerary = async () => {
    const text = locations.map((l, i) => `${i + 1}. ${l.name} — ${l.address}`).join('\n')
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
    logEvent('itinerary_export', `${locations.length} spots`)
    setToast(t('itinerary.exported'))
    setTimeout(() => setToast(''), 1800)
  }

  return (
    <section className="py-8">
      <div className="container-app max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{t('itinerary.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('itinerary.subtitle')}</p>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CalendarCheck size={36} className="mx-auto mb-3 opacity-50" />
            <p>{t('itinerary.empty')}</p>
          </div>
        ) : (
          <GlassCard className="p-4 divide-y divide-gray-200/60 dark:divide-white/10">
            {locations.map((loc, i) => (
              <div key={loc.id} className="flex items-center gap-3 py-3">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-brand-50 dark:bg-white/10 text-brand-600 dark:text-brand-300 text-xs font-bold shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{loc.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{loc.address}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveItineraryItem(loc.id, -1)} disabled={i === 0} title={t('itinerary.moveUp')} className="p-1.5 rounded-full text-gray-400 hover:text-brand-500 disabled:opacity-30">
                    <ChevronUp size={16} />
                  </button>
                  <button onClick={() => moveItineraryItem(loc.id, 1)} disabled={i === locations.length - 1} title={t('itinerary.moveDown')} className="p-1.5 rounded-full text-gray-400 hover:text-brand-500 disabled:opacity-30">
                    <ChevronDown size={16} />
                  </button>
                  <button onClick={() => removeFromItinerary(loc.id)} title={t('itinerary.remove')} className="p-1.5 rounded-full text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </GlassCard>
        )}

        {locations.length > 0 && (
          <Button variant="secondary" onClick={exportItinerary}><Copy size={15} /> {t('itinerary.export')}</Button>
        )}

        <BudgetCalculator />
      </div>

      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-full bg-gray-900 text-white text-sm px-4 py-2 shadow-xl">
          {toast}
        </div>
      )}
    </section>
  )
}
