import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getLocations } from '../utils/locationStore'
import LocationCard from '../components/PerimeterMap/LocationCard'

export default function MySpotsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { favorites } = useApp()
  const locations = useMemo(() => {
    const all = getLocations()
    return favorites.map((id) => all.find((l) => l.id === id)).filter(Boolean)
  }, [favorites])

  return (
    <section className="py-8">
      <div className="container-app">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 mb-5">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{t('favorites.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('favorites.subtitle')}</p>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bookmark size={36} className="mx-auto mb-3 opacity-50" />
            <p>{t('favorites.empty')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => <LocationCard key={loc.id} loc={loc} />)}
          </div>
        )}
      </div>
    </section>
  )
}
