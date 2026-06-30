import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const icons = { light: Sun, dark: Moon, system: Monitor }

export default function ThemeToggle() {
  const { mode, cycle } = useTheme()
  const Icon = icons[mode]
  return (
    <button
      onClick={cycle}
      aria-label="Toggle theme"
      title={`Theme: ${mode}`}
      className="relative p-1 sm:p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25 }}
          className="block"
        >
          <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
