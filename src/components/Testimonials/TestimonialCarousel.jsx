import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import SectionHeading from '../common/SectionHeading'
import GlassCard from '../common/GlassCard'
import testimonials from '../../data/testimonials.json'

export default function TestimonialCarousel() {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  const go = useCallback((d) => {
    setDir(d)
    setIdx((i) => (i + d + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    const id = setInterval(() => go(1), 6000)
    return () => clearInterval(id)
  }, [go])

  const tm = testimonials[idx]
  const role = lang === 'en' ? tm.role_en : tm.role_id
  const quote = lang === 'en' ? tm.quote_en : tm.quote_id

  return (
    <section className="py-16">
      <div className="container-app">
        <SectionHeading title={t('testimonials.title')} subtitle={t('testimonials.subtitle')} />
        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={tm.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard className="p-8 text-center">
                <Quote className="mx-auto text-brand-400/50" size={32} />
                <p className="mt-3 text-lg text-gray-700 dark:text-gray-200 italic">“{quote}”</p>
                <div className="mt-5 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < tm.rating ? 'text-brand-500 fill-brand-500' : 'text-gray-300 dark:text-gray-600'} />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold">
                    {tm.name.charAt(0)}
                  </span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{tm.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{role}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i) }}
                  className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-brand-500' : 'w-2 bg-gray-300 dark:bg-gray-600'}`} />
              ))}
            </div>
            <button onClick={() => go(1)} className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
