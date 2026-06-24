import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Phone, X, Copy, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import kit from '../../data/starterKit.json'

export default function EmergencyCard({ open, onClose, onCopy }) {
  const { t } = useTranslation()
  const { lang } = useLanguage()
  const items = kit.emergency.items

  const telHref = (value) => `tel:${value.replace(/[^0-9+]/g, '')}`

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] bg-red-600 text-white overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="container-app max-w-lg py-8">
            <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-5">
              <ArrowLeft size={16} /> {t('common.back')}
            </button>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                <Phone size={24} /> {t('starterKit.emergency.cardMode')}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="rounded-2xl bg-white/15 backdrop-blur p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm text-white/80">{lang === 'en' ? it.label_en : it.label_id}</div>
                      <div className="text-3xl font-extrabold tracking-wide">{it.value}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a href={telHref(it.value)} className="inline-flex items-center gap-1.5 rounded-2xl bg-white text-red-600 font-bold px-4 py-2.5 text-sm">
                        <Phone size={16} /> {t('starterKit.emergency.call')}
                      </a>
                      <button onClick={() => onCopy(it.value)} className="inline-flex items-center gap-1 rounded-2xl bg-white/20 hover:bg-white/30 px-3 py-2.5 text-sm">
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
