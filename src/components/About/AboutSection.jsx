import { useTranslation } from 'react-i18next'
import { ShieldCheck, Gift, Wifi } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import GlassCard from '../common/GlassCard'
import Reveal from '../common/Reveal'

export default function AboutSection() {
  const { t } = useTranslation()
  const values = [
    { icon: ShieldCheck, title: t('about.value1Title'), desc: t('about.value1Desc') },
    { icon: Gift, title: t('about.value2Title'), desc: t('about.value2Desc') },
    { icon: Wifi, title: t('about.value3Title'), desc: t('about.value3Desc') }
  ]
  return (
    <section id="about" className="py-16">
      <div className="container-app">
        <SectionHeading title={t('about.title')} />
        <Reveal>
          <p className="max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('about.desc')}
          </p>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6 text-center h-full" hover>
                <span className="mx-auto grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
                  <v.icon size={22} />
                </span>
                <h3 className="mt-4 font-bold text-gray-900 dark:text-white">{v.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{v.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
