import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plane, MapPin, Backpack, Sparkles } from 'lucide-react'
import AnimatedGradientBg from '../decorative/AnimatedGradientBg'
import FloatingShapes from '../decorative/FloatingShapes'
import ParticleBackground from '../decorative/ParticleBackground'
import GlassCard from '../common/GlassCard'
import Button from '../common/Button'
import WeatherWidget from './WeatherWidget'

export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
      <AnimatedGradientBg />
      <ParticleBackground />
      <FloatingShapes />

      <div className="container-app relative z-10 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/20"
          >
            <Sparkles size={13} /> {t('hero.badge')}
          </motion.span>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }} className="mt-3">
            <WeatherWidget />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.05]"
          >
            {t('hero.title').split(' ').slice(0, 2).join(' ')}{' '}
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              {t('hero.title').split(' ').slice(2).join(' ')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <Link to="/touchdown">
              <Button className="!px-6 !py-3 text-base"><Plane size={18} /> {t('hero.startTrip')}</Button>
            </Link>
            <Link to="/map">
              <Button variant="secondary" className="!py-3"><MapPin size={16} /> {t('hero.viewMap')}</Button>
            </Link>
            <Link to="/starter-kit">
              <Button variant="ghost" className="!py-3"><Backpack size={16} /> {t('hero.starterKit')}</Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 120, damping: 18 }}
          className="relative"
        >
          <GlassCard className="p-7 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
                <Plane size={22} />
              </span>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('hero.summaryTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('hero.summaryDesc')}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { k: '15 km', v: 'Radius' },
                { k: '10+', v: 'Workspaces' },
                { k: '48h', v: 'Plan' }
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-white/50 dark:bg-white/5 py-3 border border-white/40 dark:border-white/10">
                  <div className="text-xl font-extrabold text-brand-600 dark:text-brand-300">{s.k}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.v}</div>
                </div>
              ))}
            </div>
            <Link to="/touchdown" className="mt-6 block">
              <Button className="w-full">{t('hero.startTrip')}</Button>
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
