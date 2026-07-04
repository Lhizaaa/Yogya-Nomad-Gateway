import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { List, Map as MapIcon, Sparkles, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getLocations } from '../utils/locationStore'
import LocationCard from '../components/PerimeterMap/LocationCard'
import MapView from '../components/PerimeterMap/MapView'
import Skeleton from '../components/common/Skeleton'
import Button from '../components/common/Button'
import { logEvent } from '../utils/eventLogger'

const TYPES = ['all', 'cafe', 'coworking', 'wifi-spot']

export default function PerimeterMapPage() {
  const { t, i18n } = useTranslation()
  const { prefs } = useApp()
  const [params, setSearchParams] = useSearchParams()
  const [type, setType] = useState(params.get('filter') || 'all')
  const [openOnly, setOpenOnly] = useState(false)
  const [view, setView] = useState('list')
  const [loading, setLoading] = useState(true)
  const [all] = useState(() => getLocations())

  useEffect(() => {
    logEvent('screen_view', 'perimeter_map')
    const id = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(id)
  }, [])

  // Lokasi yang direkomendasikan chatbot (dari ?focus=id1,id2).
  const focusIds = useMemo(() => {
    const raw = params.get('focus')
    return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []
  }, [params])

  const { results, message } = useMemo(() => {
    let list = all
    if (type !== 'all') list = list.filter((l) => l.type === type)
    if (openOnly) list = list.filter((l) => l.open_now)

    // budget matching
    let msg = null
    if (prefs?.budget) {
      const matched = list.filter((l) => l.price_range === prefs.budget)
      if (matched.length === 0 && list.length > 0) {
        msg = t('map.noBudgetMatch')
        list = list.filter((l) => l.distance_km <= 5)
        if (list.length === 0) list = all.filter((l) => l.distance_km <= 5)
      }
    }

    // all too far
    const within = list.filter((l) => l.distance_km <= 15)
    if (within.length === 0 && list.length > 0) {
      msg = t('map.tooFar')
    }

    // Lokasi rekomendasi chatbot: pastikan selalu tampil & naikkan ke atas.
    if (focusIds.length) {
      const present = new Set(list.map((l) => l.id))
      const extra = all.filter((l) => focusIds.includes(l.id) && !present.has(l.id))
      list = [...list, ...extra].sort((a, b) => {
        const ai = focusIds.includes(a.id) ? focusIds.indexOf(a.id) : Infinity
        const bi = focusIds.includes(b.id) ? focusIds.indexOf(b.id) : Infinity
        return ai - bi
      })
    }

    return { results: list, message: msg }
  }, [all, type, openOnly, prefs, t, focusIds])

  const clearFocus = () => {
    const next = new URLSearchParams(params)
    next.delete('focus')
    setSearchParams(next, { replace: true })
  }

  const focusBanner =
    i18n.language?.startsWith('en')
      ? 'Showing Nomad Assistant recommendations'
      : 'Menampilkan rekomendasi Nomad Assistant'

  const isBest = (l) => prefs?.budget && l.price_range === prefs.budget

  return (
    <section className="py-8">
      <div className="container-app">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{t('map.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('map.subtitle')}</p>
          </div>
          {/* View toggle */}
          <div className="flex rounded-2xl bg-gray-100 dark:bg-white/10 p-1 self-start">
            {[['list', List, t('map.listView')], ['map', MapIcon, t('map.mapView')]].map(([v, Icon, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                  view === v ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-300 shadow' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {TYPES.map((ty) => (
            <button
              key={ty}
              onClick={() => setType(ty)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                type === ty
                  ? 'bg-brand-500 text-white shadow'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-400'
              }`}
            >
              {t(`map.types.${ty}`)}
            </button>
          ))}
          <button
            onClick={() => setOpenOnly((v) => !v)}
            className={`ml-auto px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              openOnly
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {t('map.openNow')}
          </button>
        </div>

        {focusIds.length > 0 && (
          <div className="mb-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 p-4 text-sm text-brand-700 dark:text-brand-300 flex items-center justify-between gap-3 flex-wrap">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles size={16} /> {focusBanner}
            </span>
            <button
              onClick={clearFocus}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full hover:bg-brand-500/15 transition-colors"
            >
              <X size={13} /> {i18n.language?.startsWith('en') ? 'Clear' : 'Hapus'}
            </button>
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 p-4 text-sm text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3 flex-wrap">
            <span>{message}</span>
            <Button variant="secondary" className="!py-1.5 !text-xs">{t('map.planTransport')}</Button>
          </div>
        )}
        {message === t('map.tooFar') && (
          <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">{t('map.transportEst')}</p>
        )}

        {view === 'list' ? (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((loc, i) => (
                <motion.div key={loc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 6) * 0.06 }}>
                  <LocationCard loc={loc} bestMatch={isBest(loc)} highlighted={focusIds.includes(loc.id)} />
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <MapView locations={results} />
        )}
      </div>
    </section>
  )
}
