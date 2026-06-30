import { Link } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Hero from '../components/Home/Hero'
import ArrivalTwinSection from '../components/ArrivalTwin/ArrivalTwinSection'
import FeaturesSection from '../components/Home/FeaturesSection'
import ArticlesSection from '../components/Articles/ArticlesSection'
import AboutSection from '../components/About/AboutSection'
import Skeleton from '../components/common/Skeleton'
import { logEvent } from '../utils/eventLogger'

// recharts-heavy — split into its own chunk to keep initial load light
const TravelAnalytics = lazy(() => import('../components/Home/TravelAnalytics'))

export default function Home() {
  const { t } = useTranslation()
  useEffect(() => { logEvent('screen_view', 'home') }, [])

  return (
    <>
      <Hero />
      <ArrivalTwinSection />
      <FeaturesSection />
      <Suspense fallback={<div className="container-app py-16"><Skeleton className="h-72 w-full" /></div>}>
        <TravelAnalytics />
      </Suspense>
      <ArticlesSection />
      <AboutSection />

      <div className="container-app pb-6 text-center">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-500 transition-colors">
          <ShieldCheck size={13} /> {t('nav.admin')}
        </Link>
      </div>
    </>
  )
}
