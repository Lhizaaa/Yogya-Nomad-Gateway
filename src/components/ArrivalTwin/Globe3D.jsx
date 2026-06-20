import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import data from '../../data/arrivalTwin.json'

// Lightweight stylized "3D" globe using SVG + CSS (no Three.js) so it stays fast
// and works on slow connections. Shows YIA marker + glowing arcs from origin countries.
const SIZE = 320
const C = SIZE / 2
const R = SIZE / 2 - 14

// place country dots around the globe rim/face deterministically
const positions = [
  { x: 0.30, y: 0.30 }, { x: 0.72, y: 0.26 }, { x: 0.82, y: 0.62 },
  { x: 0.66, y: 0.78 }, { x: 0.26, y: 0.66 }, { x: 0.20, y: 0.46 }
]

export default function Globe3D() {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState(null)
  const yia = { x: C, y: C + R * 0.18 } // YIA near center-bottom (Indonesia)

  return (
    <div className="relative grid place-items-center select-none">
      <motion.div
        className="relative"
        style={{ width: SIZE, height: SIZE }}
        animate={reduce ? {} : { rotate: [0, 0] }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            <radialGradient id="ocean" cx="38%" cy="34%" r="75%">
              <stop offset="0%" stopColor="#2a7de1" />
              <stop offset="55%" stopColor="#155bb5" />
              <stop offset="100%" stopColor="#0a2e63" />
            </radialGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF9233" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF9233" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFB066" />
              <stop offset="100%" stopColor="#FF7300" />
            </linearGradient>
          </defs>

          {/* outer glow */}
          <circle cx={C} cy={C} r={R + 12} fill="url(#glow)" />
          {/* sphere */}
          <circle cx={C} cy={C} r={R} fill="url(#ocean)" />

          {/* rotating meridian/parallel lines */}
          <g stroke="#bcd6ff" strokeOpacity="0.25" fill="none">
            {[0.35, 0.65, 0.9].map((k, i) => (
              <ellipse key={`p${i}`} cx={C} cy={C} rx={R} ry={R * k} />
            ))}
            <motion.g
              style={{ transformOrigin: `${C}px ${C}px` }}
              animate={reduce ? {} : { rotate: 360 }}
              transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            >
              {[0.3, 0.6, 0.95].map((k, i) => (
                <ellipse key={`m${i}`} cx={C} cy={C} rx={R * k} ry={R} />
              ))}
            </motion.g>
          </g>

          {/* faux landmass blobs */}
          <g fill="#2fa36b" fillOpacity="0.85">
            <path d="M110 120 q30 -18 60 -6 q20 14 -4 30 q-30 10 -50 -2 q-18 -10 -6 -22Z" />
            <path d="M180 200 q26 -10 40 8 q8 22 -18 26 q-28 2 -30 -16 q-2 -14 8 -18Z" />
            <path d="M120 210 q14 -8 26 2 q6 14 -10 18 q-18 2 -20 -10Z" />
          </g>

          {/* arcs from countries to YIA */}
          {data.top_origin_countries.slice(0, positions.length).map((c, i) => {
            const p = positions[i]
            const x = p.x * SIZE
            const y = p.y * SIZE
            const mx = (x + yia.x) / 2
            const my = (y + yia.y) / 2 - 60
            return (
              <g key={c.code}>
                <motion.path
                  d={`M${x},${y} Q${mx},${my} ${yia.x},${yia.y}`}
                  fill="none"
                  stroke="url(#arc)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={reduce ? { pathLength: 1, opacity: 0.7 } : { pathLength: [0, 1], opacity: [0.2, 0.9, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
                />
                <circle
                  cx={x} cy={y} r={hover === i ? 6 : 4}
                  fill="#FFB066" stroke="#fff" strokeWidth="1.2"
                  className="cursor-pointer"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            )
          })}

          {/* YIA marker with pulse */}
          <circle cx={yia.x} cy={yia.y} r="9" fill="#FF7300" fillOpacity="0.25">
            {!reduce && <animate attributeName="r" values="9;16;9" dur="2s" repeatCount="indefinite" />}
          </circle>
          <circle cx={yia.x} cy={yia.y} r="5" fill="#FF7300" stroke="#fff" strokeWidth="1.5" />
        </svg>

        {hover != null && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900/90 text-white text-xs px-2.5 py-1 shadow-lg pointer-events-none"
            style={{ left: positions[hover].x * SIZE, top: positions[hover].y * SIZE - 8 }}
          >
            {data.top_origin_countries[hover].country}: {data.top_origin_countries[hover].visitors.toLocaleString('id-ID')}
          </div>
        )}
      </motion.div>
    </div>
  )
}
