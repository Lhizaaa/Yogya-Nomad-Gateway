import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plane, Globe } from 'lucide-react'
import Logo from './Logo'
import Reveal from '../common/Reveal'

export default function Footer() {
  const { t } = useTranslation()

  const services = [
    { label: t('footer.svc.touchdown'), to: '/touchdown' },
    { label: t('footer.svc.globe'), to: '/#arrival-twin' },
    { label: t('footer.svc.finder'), to: '/map' },
    { label: t('footer.svc.kit'), to: '/starter-kit' },
    { label: t('footer.svc.map'), to: '/map' },
    { label: t('footer.svc.analytics'), to: '/#analytics' }
  ]
  const company = [
    { label: t('footer.comp.about'), to: '/#about' },
    { label: t('footer.comp.docs'), to: '#' },
    { label: t('footer.comp.career'), to: '#' },
    { label: t('footer.comp.privacy'), to: '#' },
    { label: t('footer.comp.terms'), to: '#' }
  ]
  return (
    <footer className="relative mt-16 pb-24 md:pb-10 px-4">
      <Reveal>
        <div className="relative overflow-hidden container-app glass !rounded-[40px] p-8 sm:p-12 bg-gradient-to-br from-brand-50/70 to-sky-50/50 dark:from-white/5 dark:to-white/[0.02]">
          {/* subtle floating decor */}
          <Plane className="pointer-events-none absolute -top-2 right-10 text-brand-400/10 dark:text-brand-300/10 w-24 h-24 rotate-12" />
          <Globe className="pointer-events-none absolute bottom-6 left-6 text-brand-400/10 dark:text-brand-300/10 w-20 h-20" />

          <div className="relative grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Logo />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('footer.desc')}
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-3">
                {t('footer.services')}
              </h4>
              <ul className="space-y-2">
                {services.map((s, i) => (
                  <li key={i}>
                    <Link to={s.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 hover:-translate-y-0.5 inline-block transition">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-3">
                {t('footer.company')}
              </h4>
              <ul className="space-y-2">
                {company.map((c, i) => (
                  <li key={i}>
                    <Link to={c.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 hover:-translate-y-0.5 inline-block transition">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Badges */}
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{t('footer.connected')}</Badge>
                <Badge>{t('footer.smart')}</Badge>
                <Badge>{t('footer.experience')}</Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 text-[11px] font-medium border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulseDot" />
                  {t('footer.live')}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-10 pt-6 border-t border-gray-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('footer.copyright')}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-md">{t('footer.disclaimer')}</p>
          </div>
        </div>
      </Reveal>
    </footer>
  )
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/60 dark:bg-white/10 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 border border-white/40 dark:border-white/10">
      {children}
    </span>
  )
}
