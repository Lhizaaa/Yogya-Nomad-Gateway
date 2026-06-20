import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20 hover:from-brand-600 hover:to-brand-700',
  secondary:
    'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-brand-400',
  ghost:
    'bg-transparent text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-white/5',
  danger:
    'bg-red-500 text-white hover:bg-red-600'
}

export default function Button({
  as = 'button', variant = 'primary', className = '', children, ...props
}) {
  const Comp = motion[as] || motion.button
  return (
    <Comp
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}
