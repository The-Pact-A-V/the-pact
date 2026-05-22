import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useBuzzAnim } from '@/store/buzz'

const HEART_COUNT = 12

function emojiForPreset(presetType: string | null, fallback = '💜'): string {
  switch (presetType) {
    case 'heart': return '💜'
    case 'star': return '✦'
    case 'sun': return '☀️'
    case 'moon': return '🌙'
    default: return fallback
  }
}

export default function FloatingHearts() {
  const incoming = useBuzzAnim((s) => s.incoming)
  const clear = useBuzzAnim((s) => s.clear)

  useEffect(() => {
    if (!incoming) return
    const t = setTimeout(() => clear(), 3200)
    return () => clearTimeout(t)
  }, [incoming, clear])

  return (
    <AnimatePresence>
      {incoming && (
        <>
          {/* Soft message banner */}
          <motion.div
            key="banner"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur rounded-pill shadow-lg px-4 py-2 flex items-center gap-2"
          >
            <span className="text-lg">{emojiForPreset(incoming.presetType)}</span>
            <span className="text-sm">
              <span className="font-medium capitalize">{incoming.fromUser}</span>
              <span className="text-muted"> · {incoming.message}</span>
            </span>
          </motion.div>

          {/* Floating hearts */}
          <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
            {Array.from({ length: HEART_COUNT }).map((_, i) => {
              const left = 10 + Math.random() * 80
              const delay = Math.random() * 0.6
              const drift = (Math.random() - 0.5) * 80
              const size = 24 + Math.random() * 24
              return (
                <motion.span
                  key={`h-${i}`}
                  initial={{ y: '100vh', x: 0, opacity: 0, scale: 0.5 }}
                  animate={{
                    y: '-20vh',
                    x: drift,
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.8],
                    rotate: drift * 0.3,
                  }}
                  transition={{ duration: 2.6, delay, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    fontSize: size,
                  }}
                >
                  {emojiForPreset(incoming.presetType)}
                </motion.span>
              )
            })}
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
