import { motion } from 'framer-motion'

export default function GlassCard({ className = '', children, hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`glass rounded-3xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
