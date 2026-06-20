import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '../../utils/useOnlineStatus'

export default function OfflineBanner() {
  const online = useOnlineStatus()
  const { t } = useTranslation()
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500 text-white text-xs font-medium overflow-hidden"
        >
          <div className="container-app py-2 flex items-center justify-center gap-2">
            <WifiOff size={14} />
            {t('offline.banner')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
