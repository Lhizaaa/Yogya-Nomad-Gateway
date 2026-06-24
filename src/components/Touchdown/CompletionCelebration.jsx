import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { Trophy, MapPin, Backpack, Share2, Award } from 'lucide-react'
import GlassCard from '../common/GlassCard'
import Button from '../common/Button'

const CONFETTI_COLORS = ['#FF7300', '#FF9233', '#FFB066', '#22c55e', '#3b82f6', '#a855f7']

function Confetti() {
  const pieces = useMemo(() => (
    Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.6,
      size: 6 + Math.random() * 7,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 80
    }))
  ), [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 rounded-[2px]"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.5, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: '120%', x: p.drift, opacity: [0, 1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

export default function CompletionCelebration({ onShare }) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="mb-6"
    >
      <GlassCard className="relative overflow-hidden p-7 text-center">
        {!reduce && <Confetti />}
        <div className="relative z-10">
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            className="mx-auto grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-500/30"
          >
            <Trophy size={36} />
          </motion.span>

          <h2 className="mt-5 text-2xl font-extrabold text-gray-900 dark:text-white">{t('touchdown.celebration.title')}</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">{t('touchdown.celebration.desc')}</p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/20 px-4 py-1.5 text-sm font-bold">
            <Award size={15} /> {t('touchdown.celebration.badge')}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Link to="/map">
              <Button className="!py-2 !text-sm"><MapPin size={15} /> {t('touchdown.celebration.explore')}</Button>
            </Link>
            <Link to="/starter-kit">
              <Button variant="secondary" className="!py-2 !text-sm"><Backpack size={15} /> {t('touchdown.celebration.starterKit')}</Button>
            </Link>
            <Button variant="ghost" className="!py-2 !text-sm" onClick={onShare}>
              <Share2 size={15} /> {t('touchdown.celebration.share')}
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
