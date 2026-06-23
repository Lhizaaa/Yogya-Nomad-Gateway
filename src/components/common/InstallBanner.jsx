import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '../../utils/useInstallPrompt'
import Button from './Button'

const DISMISS_KEY = 'nomad_install_dismissed'

export default function InstallBanner() {
  const { t } = useTranslation()
  const { canInstall, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  return (
    <AnimatePresence>
      {canInstall && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 md:bottom-5 inset-x-4 sm:inset-x-auto sm:right-5 sm:w-80 z-50"
        >
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl p-4 flex items-start gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shrink-0">
              <Download size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{t('install.title')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('install.desc')}</p>
              <div className="flex gap-2 mt-3">
                <Button onClick={promptInstall} className="!py-1.5 !px-3 !text-xs">{t('install.install')}</Button>
                <Button variant="ghost" onClick={dismiss} className="!py-1.5 !px-3 !text-xs">{t('install.dismiss')}</Button>
              </div>
            </div>
            <button onClick={dismiss} className="p-1 rounded-full text-gray-400 hover:text-gray-600 shrink-0">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
