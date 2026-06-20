import { motion, useReducedMotion } from 'framer-motion'
import { Plane, Cloud, Laptop, Coffee, Wifi } from 'lucide-react'

const items = [
  { Icon: Plane, top: '12%', left: '8%', size: 30, dur: 9 },
  { Icon: Cloud, top: '20%', left: '82%', size: 38, dur: 12 },
  { Icon: Laptop, top: '62%', left: '14%', size: 28, dur: 10 },
  { Icon: Coffee, top: '72%', left: '78%', size: 26, dur: 11 },
  { Icon: Wifi, top: '40%', left: '90%', size: 24, dur: 8 },
  { Icon: Plane, top: '80%', left: '45%', size: 22, dur: 13 }
]

export default function FloatingShapes({ subtle = false }) {
  const reduce = useReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
      {items.map(({ Icon, top, left, size, dur }, i) => (
        <motion.div
          key={i}
          className={`absolute text-brand-400 ${subtle ? 'opacity-[0.08]' : 'opacity-20'}`}
          style={{ top, left }}
          animate={reduce ? {} : {
            y: [0, -18, 0, 14, 0],
            x: [0, 10, -6, 0],
            rotate: [0, 8, -6, 0],
            opacity: subtle ? [0.05, 0.1, 0.05] : [0.12, 0.28, 0.12]
          }}
          transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        >
          <Icon size={size} strokeWidth={1.6} />
        </motion.div>
      ))}
    </div>
  )
}
