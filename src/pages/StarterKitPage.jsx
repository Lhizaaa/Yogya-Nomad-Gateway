import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Wallet, Phone, Bus, ChevronDown, Copy, ExternalLink, Download, Printer, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import GlassCard from '../components/common/GlassCard'
import Button from '../components/common/Button'
import NomadQuiz from '../components/StarterKit/NomadQuiz'
import ArrivalChecklist from '../components/StarterKit/ArrivalChecklist'
import SimComparison from '../components/StarterKit/SimComparison'
import CurrencyConverter from '../components/StarterKit/CurrencyConverter'
import EmergencyCard from '../components/StarterKit/EmergencyCard'
import kit from '../data/starterKit.json'
import { logEvent } from '../utils/eventLogger'
import { downloadStarterKit } from '../utils/starterKitExport'

const SECTIONS = [
  { key: 'tips', icon: Lightbulb },
  { key: 'costGuide', icon: Wallet },
  { key: 'emergency', icon: Phone },
  { key: 'transport', icon: Bus }
]

export default function StarterKitPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const [open, setOpen] = useState('tips')
  const [toast, setToast] = useState('')
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  useEffect(() => { logEvent('screen_view', 'starter_kit') }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 1800) }

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
    showToast(t('common.copied'))
  }

  const onQuizResult = useCallback((section) => { if (section) setOpen(section) }, [])

  const openApp = (item) => {
    logEvent('open_transport', item.name)
    if (item.deeplink) {
      window.location.href = item.deeplink
      setTimeout(() => copy(item.address), 400)
    } else {
      copy(item.address)
    }
  }

  const onDownload = () => { downloadStarterKit(lang); logEvent('kit_export', 'download'); showToast(t('starterKit.export.done')) }
  const onPrint = () => { logEvent('kit_export', 'print'); window.print() }

  return (
    <section className="relative overflow-hidden py-10">
      <div className="container-app relative z-10 max-w-2xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 mb-5">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{t('starterKit.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('starterKit.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" className="!py-2 !px-3 !text-xs" onClick={() => { setEmergencyOpen(true); logEvent('emergency_card_open', '') }}>
              <Phone size={14} /> {t('starterKit.emergency.cardMode')}
            </Button>
            <Button variant="secondary" className="!py-2 !px-3 !text-xs" onClick={onDownload}>
              <Download size={14} /> {t('starterKit.export.download')}
            </Button>
            <Button variant="ghost" className="!py-2 !px-3 !text-xs" onClick={onPrint}>
              <Printer size={14} /> {t('starterKit.export.print')}
            </Button>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          <NomadQuiz onResult={onQuizResult} />
          <ArrivalChecklist />

          {SECTIONS.map(({ key, icon: Icon }) => {
            const data = kit[key]
            const isOpen = open === key
            return (
              <GlassCard key={key} className="overflow-hidden">
                <button onClick={() => setOpen(isOpen ? '' : key)} className="w-full flex items-center justify-between p-4">
                  <span className="flex items-center gap-3 font-semibold text-gray-900 dark:text-white">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white"><Icon size={17} /></span>
                    {data[lang] || data.id}
                  </span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown size={18} className="text-gray-400" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4">
                        {key === 'tips' && (
                          <ul className="space-y-2">
                            {data.items.map((it, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex gap-2">
                                <span className="text-brand-500 mt-0.5">•</span> {it[lang] || it.id}
                              </li>
                            ))}
                          </ul>
                        )}
                        {(key === 'costGuide' || key === 'emergency') && (
                          <ul className="divide-y divide-gray-200/60 dark:divide-white/10">
                            {data.items.map((it, i) => (
                              <li key={i} className="flex justify-between py-2 text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{lang === 'en' ? it.label_en : it.label_id}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{it.value}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {key === 'transport' && (
                          <div className="space-y-2">
                            {data.items.map((it, i) => (
                              <div key={i} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 p-3">
                                <div>
                                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{it.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{it.fallback}</div>
                                </div>
                                <div className="flex gap-1.5">
                                  {it.deeplink && (
                                    <Button variant="secondary" className="!py-1.5 !px-3 !text-xs" onClick={() => openApp(it)}>
                                      <ExternalLink size={13} /> {t('starterKit.openApp')}
                                    </Button>
                                  )}
                                  <Button variant="ghost" className="!py-1.5 !px-3 !text-xs" onClick={() => copy(it.address)}>
                                    <Copy size={13} /> {t('starterKit.copyAddress')}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            )
          })}

          <SimComparison />
          <CurrencyConverter />
        </div>
      </div>

      <EmergencyCard open={emergencyOpen} onClose={() => setEmergencyOpen(false)} onCopy={copy} />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-full bg-gray-900 text-white text-sm px-4 py-2 shadow-xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
