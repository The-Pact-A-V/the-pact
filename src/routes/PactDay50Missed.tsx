import { Link, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useActivePact, pactDurationDays } from '@/hooks/usePact'
import { useCombinedProgress } from '@/hooks/useCombinedProgress'
import JarSVG from '@/components/JarSVG'

export default function PactDay50Missed() {
  const { pact } = useActivePact()
  const progress = useCombinedProgress()
  if (!pact) return <Navigate to="/dashboard" replace />

  const finalPct = progress.combinedPct
  const targetPct = pact.targetPct
  const shortBy = Math.max(0, targetPct - finalPct)

  return (
    <div className="min-h-svh px-6 py-10 flex flex-col items-center text-center bg-gradient-to-br from-rose/30 via-cream to-lavender/30">
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-[11px] uppercase tracking-[0.3em] text-muted"
      >
        day {pactDurationDays(pact)} · {pact.endDate}
      </motion.p>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-display text-5xl text-ink mt-2 mb-1 italic leading-none"
      >
        you tried.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-display italic text-rose text-base"
      >
        — and that's already a lot.
      </motion.p>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 80 }}
        className="my-7"
      >
        <JarSVG pct={finalPct} size={200} showLabel />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="font-display text-4xl text-ink italic"
      >
        {finalPct}% together
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-sm text-muted mt-2"
      >
        {shortBy} pts short of {targetPct}% target
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        className="font-display italic text-base text-ink-soft mt-8 max-w-xs leading-snug"
      >
        the trip isn't unlocked — but <em className="italic text-apeksha">the pact wasn't the trip.</em> the pact was {pactDurationDays(pact)} days of trying together.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="mt-10 w-full max-w-sm space-y-3"
      >
        <Link
          to="/pact-wrapped"
          className="block px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
        >
          see the recap
        </Link>
        <Link
          to="/pact-new"
          className="block px-4 py-3 rounded-pill bg-white border border-line text-ink font-medium active:scale-[0.98] transition"
        >
          try a new pact
        </Link>
        <Link
          to="/dashboard"
          className="block px-4 py-3 text-sm text-muted hover:text-ink transition"
        >
          back to dashboard
        </Link>
      </motion.div>
    </div>
  )
}
