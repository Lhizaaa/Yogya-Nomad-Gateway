import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import SectionHeading from '../common/SectionHeading'
import FloatingShapes from '../decorative/FloatingShapes'
import ParticleBackground from '../decorative/ParticleBackground'
import Skeleton from '../common/Skeleton'
import GlobeFallback from './GlobeFallback'
import ArrivalDataPanel from './ArrivalDataPanel'
import { useOnlineStatus } from '../../utils/useOnlineStatus'

const Globe3D = lazy(() => import('./Globe3D'))

export default function ArrivalTwinSection() {
  const { t } = useTranslation()
  const online = useOnlineStatus()

  return (
    <section id="arrival-twin" className="relative overflow-hidden py-16">
      <ParticleBackground count={28} />
      <FloatingShapes subtle />
      <div className="container-app relative z-10">
        <SectionHeading title={t('arrivalTwin.title')} subtitle={t('arrivalTwin.subtitle')} />
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="grid place-items-center">
            {online ? (
              <Suspense fallback={<Skeleton className="w-[320px] h-[320px] rounded-full" />}>
                <Globe3D />
              </Suspense>
            ) : (
              <GlobeFallback />
            )}
          </div>
          <ArrivalDataPanel />
        </div>
      </div>
    </section>
  )
}
