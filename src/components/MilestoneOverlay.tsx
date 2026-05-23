import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCelebration } from '@/store/celebration'
import { usePrefs } from '@/store/prefs'
import { playMilestoneChime, vibrate } from '@/lib/sound'
import JarSVG from './JarSVG'
import type { MilestoneThreshold } from '@/hooks/useMilestones'

interface Look {
  bg: string
  eyebrow: string
  title: string
  emojis: string[]
  count: number
}

const LOOKS: Record<MilestoneThreshold, Look> = {
  25: {
    bg: 'from-lavender via-cream to-sage',
    eyebrow: 'a quarter in',
    title: 'beginnings.',
    emojis: ['🌸', '🍃'],
    count: 18,
  },
  50: {
    bg: 'from-butter via-peach to-pink',
    eyebrow: 'halfway',
    title: 'half full.',
    emojis: ['✨', '💫', '🌟'],
    count: 28,
  },
  75: {
    bg: 'from-pink via-lavender to-cream',
    eyebrow: 'three quarters',
    title: 'almost there.',
    emojis: ['💜', '✦', '🌷'],
    count: 32,
  },
  95: {
    bg: 'from-coral via-butter to-sage',
    eyebrow: 'pact unlocked',
    title: 'the trip is yours.',
    emojis: ['🌴', '🌅', '🌊', '🍹', '✨'],
    count: 40,
  },
}

export default function MilestoneOverlay() {
  const active = useCelebration((s) => s.active)
  const hide = useCelebration((s) => s.hide)
  const soundOn = usePrefs((s) => s.soundOn)

  useEffect(() => {
    if (active && soundOn) {
      playMilestoneChime()
      vibrate([30, 80, 30, 80, 50])
    }
  }, [active, soundOn])

  if (!active) return null
  const look = LOOKS[active]

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="milestone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed inset-0 z-[60] bg-gradient-to-br ${look.bg} flex flex-col items-center justify-center px-8 text-center overflow-hidden`}
        >
          {/* Confetti / petals layer */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: look.count }).map((_, i) => {
              const emoji = look.emojis[i % look.emojis.length]
              const left = Math.random() * 100
              const delay = Math.random() * 1.5
              const duration = 3 + Math.random() * 2.5
              const drift = (Math.random() - 0.5) * 100
              const size = 18 + Math.random() * 22
              const rotateEnd = (Math.random() - 0.5) * 720
              return (
                <motion.span
                  key={i}
                  initial={{ y: '-10vh', x: 0, opacity: 0, rotate: 0 }}
                  animate={{ y: '110vh', x: drift, opacity: [0, 1, 1, 0], rotate: rotateEnd }}
                  transition={{ duration, delay, ease: 'easeIn', repeat: Infinity, repeatDelay: 0.5 }}
                  style={{ position: 'absolute', left: `${left}%`, fontSize: size }}
                >
                  {emoji}
                </motion.span>
              )
            })}
          </div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] uppercase tracking-[0.3em] text-ink-soft relative"
          >
            {look.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 120, damping: 12 }}
            className="font-display text-7xl text-ink mt-2 mb-6 relative italic leading-none"
          >
            {active}%
          </motion.h1>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 100, damping: 14 }}
            className="relative"
          >
            <JarSVG pct={active} size={180} showLabel={false} />
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="font-display text-3xl text-ink mt-6 italic relative"
          >
            {look.title}
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            onClick={hide}
            className="mt-10 px-6 py-3 rounded-pill bg-white text-ink font-medium shadow-lg active:scale-[0.97] transition relative"
          >
            back to today
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
