import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useActivePact, pactDurationDays } from '@/hooks/usePact'
import { useCombinedProgress } from '@/hooks/useCombinedProgress'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import JarSVG from '@/components/JarSVG'
import { cn } from '@/lib/utils'

const CONFETTI = ['🌴', '🌅', '🌊', '🍹', '✨', '💜']

export default function PactDay50() {
  const { pact } = useActivePact()
  const progress = useCombinedProgress()
  const { board: rewardBoard } = useBoard(pact?.rewardBoardId ?? null)
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === '1'

  if (!pact && !isPreview) return <Navigate to="/dashboard" replace />

  const targetPct = pact?.targetPct ?? 95
  const finalPct = isPreview ? Math.max(targetPct + 2, 97) : progress.combinedPct
  const succeeded = finalPct >= targetPct
  const days = pact ? pactDurationDays(pact) : 50
  const pactName = pact?.name ?? 'the pact'

  if (!succeeded) return <Navigate to="/pact-day-50-missed" replace />

  return (
    <div className="min-h-svh px-6 py-10 flex flex-col items-center text-center bg-gradient-to-br from-butter via-peach to-pink overflow-hidden relative">
      {/* Confetti */}
      {Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100
        const emoji = CONFETTI[i % CONFETTI.length]
        const delay = Math.random() * 2
        const duration = 4 + Math.random() * 3
        const drift = (Math.random() - 0.5) * 120
        const size = 18 + Math.random() * 24
        return (
          <motion.span
            key={i}
            initial={{ y: '-10vh', x: 0, opacity: 0, rotate: 0 }}
            animate={{ y: '110vh', x: drift, opacity: [0, 1, 1, 0], rotate: (Math.random() - 0.5) * 720 }}
            transition={{ duration, delay, ease: 'easeIn', repeat: Infinity, repeatDelay: 0.5 }}
            style={{ position: 'absolute', left: `${left}%`, fontSize: size }}
          >
            {emoji}
          </motion.span>
        )
      })}

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[11px] uppercase tracking-[0.3em] text-ink-soft relative z-10"
      >
        day {days} · {pact?.endDate ?? 'today'}
      </motion.p>

      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 12 }}
        className="font-display text-6xl text-ink mt-2 mb-2 italic leading-none relative z-10"
      >
        we did it.
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="font-display italic text-lg text-ink-soft relative z-10"
      >
        {pactName}
      </motion.p>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 90, damping: 14 }}
        className="my-6 relative z-10"
      >
        <JarSVG pct={finalPct} size={200} showLabel />
      </motion.div>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="font-display text-4xl text-ink italic relative z-10"
      >
        {finalPct}% together
      </motion.p>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="text-sm text-ink-soft mt-2 relative z-10 max-w-xs"
      >
        you cleared {targetPct}% — {rewardBoard ? rewardBoard.name : 'your reward'} is yours.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-10 w-full max-w-sm space-y-3 relative z-10"
      >
        <Link
          to="/pact-wrapped"
          className="block px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-lg shadow-coral/30 active:scale-[0.98] transition"
        >
          see the recap
        </Link>
        {rewardBoard && (
          <Link
            to={`/board/${rewardBoard.id}`}
            className={cn(
              'block px-4 py-3 rounded-pill bg-gradient-to-br text-ink font-medium shadow-md active:scale-[0.98] transition',
              gradientClasses(rewardBoard.coverColor)
            )}
          >
            <span className="mr-1">{rewardBoard.emoji}</span>
            open {rewardBoard.name}
          </Link>
        )}
        <Link
          to="/dashboard"
          className="block px-4 py-3 text-sm text-ink-soft hover:text-ink transition"
        >
          back to today
        </Link>
      </motion.div>
    </div>
  )
}
