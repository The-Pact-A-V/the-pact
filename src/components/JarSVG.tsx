import { motion } from 'motion/react'
import { clamp } from '@/lib/utils'

interface JarProps {
  pct: number
  size?: number
  showLabel?: boolean
}

const JAR_TOP_Y = 50
const JAR_BOTTOM_Y = 200
const JAR_HEIGHT = JAR_BOTTOM_Y - JAR_TOP_Y

export default function JarSVG({ pct, size = 220, showLabel = false }: JarProps) {
  const safePct = clamp(pct, 0, 100)
  const liquidY = JAR_BOTTOM_Y - (safePct / 100) * JAR_HEIGHT

  return (
    <svg
      viewBox="0 0 160 220"
      width={size}
      role="img"
      aria-label={`Jar ${safePct}% full`}
      style={{ maxWidth: '100%', display: 'block' }}
    >
      <defs>
        <clipPath id="jar-clip">
          <path d="M 32 50 Q 32 42 40 42 L 120 42 Q 128 42 128 50 L 128 198 Q 128 206 120 206 L 40 206 Q 32 206 32 198 Z" />
        </clipPath>
        <linearGradient id="liquid-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9BDED" />
          <stop offset="100%" stopColor="#7B6FB8" />
        </linearGradient>
      </defs>

      {/* Lid band */}
      <rect x="36" y="22" width="88" height="20" rx="5" fill="#DCD3BD" />
      <rect x="34" y="38" width="92" height="5" rx="2" fill="#B0A693" />

      {/* Jar body outline */}
      <path
        d="M 32 50 Q 32 42 40 42 L 120 42 Q 128 42 128 50 L 128 198 Q 128 206 120 206 L 40 206 Q 32 206 32 198 Z"
        fill="#FDFAF2"
        stroke="#DCD3BD"
        strokeWidth="2"
      />

      {/* Liquid */}
      <g clipPath="url(#jar-clip)">
        <motion.rect
          x="30"
          width="100"
          height="220"
          fill="url(#liquid-gradient)"
          initial={false}
          animate={{ y: liquidY }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
        {/* Surface ripple */}
        <motion.ellipse
          cx="80"
          rx="44"
          ry="3"
          fill="#E8DFF8"
          opacity="0.5"
          initial={false}
          animate={{ cy: liquidY, scaleX: [1, 1.04, 1] }}
          transition={{
            cy: { type: 'spring', stiffness: 60, damping: 18 },
            scaleX: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </g>

      {/* Glass highlight */}
      <ellipse cx="48" cy="90" rx="5" ry="40" fill="white" opacity="0.22" />

      {showLabel && (
        <text
          x="80"
          y="135"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, serif"
          fontSize="32"
          fontStyle="italic"
          fill="#FBF8F0"
          opacity="0.85"
        >
          {safePct}%
        </text>
      )}
    </svg>
  )
}
