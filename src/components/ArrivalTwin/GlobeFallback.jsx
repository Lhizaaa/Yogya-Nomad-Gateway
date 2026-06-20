import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'

// Static 2D fallback shown when offline / data-saver.
export default function GlobeFallback() {
  const { t } = useTranslation()
  return (
    <div className="relative w-full max-w-[340px] aspect-square grid place-items-center rounded-3xl bg-gradient-to-br from-sky-100 to-brand-50 dark:from-sky-950/40 dark:to-brand-900/20 border border-white/40 dark:border-white/10">
      <svg viewBox="0 0 200 120" className="w-3/4 text-sky-700/70 dark:text-sky-300/60">
        <path fill="currentColor" d="M20 70 q15 -10 35 -6 q10 -14 30 -10 q20 -18 45 -6 q25 -4 45 14 q-10 16 -35 14 q-20 12 -45 4 q-25 8 -50 -2 q-20 -6 -25 -14Z" />
      </svg>
      <div className="absolute" style={{ left: '52%', top: '64%' }}>
        <MapPin className="text-brand-500 drop-shadow" size={28} fill="currentColor" />
      </div>
      <p className="absolute bottom-3 px-4 text-center text-[11px] text-gray-500 dark:text-gray-400">
        {t('arrivalTwin.fallbackNote')}
      </p>
    </div>
  )
}
