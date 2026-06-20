import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plane, Map, Backpack, ArrowRight } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'

export default function FeaturesSection() {
  const { t } = useTranslation()
  const features = [
    { to: '/touchdown', icon: Plane, title: t('features.touchdownTitle'), desc: t('features.touchdownDesc'), color: 'from-brand-500 to-brand-700' },
    { to: '/map', icon: Map, title: t('features.mapTitle'), desc: t('features.mapDesc'), color: 'from-sky-500 to-blue-700' },
    { to: '/starter-kit', icon: Backpack, title: t('features.kitTitle'), desc: t('features.kitDesc'), color: 'from-emerald-500 to-teal-700' }
  ]
  return (
    <section className="py-16">
      <div className="container-app">
        <SectionHeading title={t('features.title')} subtitle={t('features.subtitle')} />
        <div className="grid sm:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.to} delay={i * 0.08}>
              <Link to={f.to}>
                <div className="group relative h-full rounded-3xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-white/10 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <span className={`grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                    <f.icon size={22} />
                  </span>
                  <h3 className="mt-4 font-bold text-lg text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300 group-hover:gap-2 transition-all">
                    {t('common.viewDetail')} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
