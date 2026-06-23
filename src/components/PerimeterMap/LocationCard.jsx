import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wifi, WifiOff, Plug, MapPin, Star, Clock, Bookmark, BookmarkCheck, CalendarPlus, CalendarCheck } from 'lucide-react'
import Badge from '../common/Badge'
import { useApp } from '../../context/AppContext'
import { logEvent } from '../../utils/eventLogger'

const priceLabel = { low: '$', medium: '$$', high: '$$$' }

export default function LocationCard({ loc, bestMatch }) {
  const { t } = useTranslation()
  const { isFavorite, toggleFavorite, isInItinerary, addToItinerary } = useApp()
  const favorite = isFavorite(loc.id)
  const inItinerary = isInItinerary(loc.id)

  const onToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(loc.id)
    logEvent('toggle_favorite', loc.name)
  }

  const onAddItinerary = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToItinerary(loc.id)
    logEvent('itinerary_add', loc.name)
  }

  return (
    <Link to={`/map/${loc.id}`} className="block h-full">
      <div className="group h-full rounded-3xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-white/10 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{loc.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={11} /> {loc.distance_km} km • {t(`map.types.${loc.type}`)}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onAddItinerary}
              title={inItinerary ? t('itinerary.added') : t('itinerary.add')}
              className={`p-1.5 rounded-full transition-colors ${inItinerary ? 'text-brand-500' : 'text-gray-400 hover:text-brand-500'}`}
            >
              {inItinerary ? <CalendarCheck size={16} /> : <CalendarPlus size={16} />}
            </button>
            <button
              onClick={onToggleFavorite}
              title={favorite ? t('favorites.remove') : t('favorites.add')}
              className={`p-1.5 rounded-full transition-colors ${favorite ? 'text-brand-500' : 'text-gray-400 hover:text-brand-500'}`}
            >
              {favorite ? <BookmarkCheck size={16} className="fill-brand-500/20" /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
        {bestMatch && <Badge tone="brand" className="mt-1.5">★ {t('map.bestMatch')}</Badge>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {loc.wifi_speed_mbps != null ? (
            <Badge tone="green"><Wifi size={11} /> {loc.wifi_speed_mbps} Mbps · {t('map.nomadTested')}</Badge>
          ) : (
            <Badge tone="gray"><WifiOff size={11} /> {t('map.speedNotVerified')}</Badge>
          )}
          {loc.has_power_outlet && <Badge tone="blue"><Plug size={11} /> {t('map.powerOutlet')}</Badge>}
          <Badge tone="gray">{priceLabel[loc.price_range]}</Badge>
          <Badge tone={loc.open_now ? 'green' : 'gray'}>
            <Clock size={11} /> {loc.open_now ? t('common.openNow') : t('common.closed')}
          </Badge>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            {loc.rating && <><Star size={11} className="text-brand-500 fill-brand-500" /> {loc.rating}</>}
          </span>
          <span>{t('detail.lastUpdated')}: {loc.last_updated}</span>
        </div>
      </div>
    </Link>
  )
}
