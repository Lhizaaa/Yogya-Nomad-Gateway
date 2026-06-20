import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Search, LocateFixed, Info, ExternalLink } from 'lucide-react'
import { YIA, directionsUrl } from '../../utils/distance'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { logEvent } from '../../utils/eventLogger'

// Uses the free OpenStreetMap embed (no API key). The "search" box performs an
// unlimited live search by opening Google Maps in a new tab — satisfying the
// "pencarian lokasi tak terbatas" requirement without paid billing.
export default function MapView({ locations }) {
  const { t } = useTranslation()
  const [center, setCenter] = useState(YIA)
  const [active, setActive] = useState(null)
  const [query, setQuery] = useState('')

  const bbox = useMemo(() => {
    const d = 0.08
    return `${center.lng - d}%2C${center.lat - d}%2C${center.lng + d}%2C${center.lat + d}`
  }, [center])

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat}%2C${center.lng}`

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { /* denied — keep YIA */ }
    )
  }

  const search = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    logEvent('places_search', query)
    window.open(directionsUrl(`${query} near Yogyakarta International Airport`), '_blank')
  }

  return (
    <div>
      <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 p-3 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2 mb-4">
        <Info size={15} className="shrink-0 mt-0.5" /> {t('map.mapRequiresKey')}
      </div>

      <form onSubmit={search} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('map.searchPlaceholder')}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <Button type="submit">{t('common.search')}</Button>
      </form>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <iframe
            title="map"
            src={src}
            className="w-full h-[300px] lg:h-[460px]"
            loading="lazy"
            style={{ border: 0 }}
          />
        </div>

        <div className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={useMyLocation}>
            <LocateFixed size={16} /> {t('map.useMyLocation')}
          </Button>
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => { setCenter({ lat: loc.lat, lng: loc.lng }); setActive(loc.id) }}
                className={`w-full text-left rounded-2xl border p-3 transition-colors ${
                  active === loc.id
                    ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{loc.name}</span>
                  <Badge tone="green">{loc.distance_km} km</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{loc.address}</p>
                <div className="mt-2 flex gap-2">
                  <Link to={`/map/${loc.id}`} className="text-xs font-semibold text-brand-600 dark:text-brand-300">{t('common.viewDetail')}</Link>
                  <a href={directionsUrl(loc.address)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gray-500 inline-flex items-center gap-0.5">
                    {t('map.openInGoogle')} <ExternalLink size={11} />
                  </a>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
