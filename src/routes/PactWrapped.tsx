import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useActivePact, pactDurationDays } from '@/hooks/usePact'
import { useCombinedProgress } from '@/hooks/useCombinedProgress'
import { useDailyLogs, dayHasAnyTick, earnedOnDate } from '@/hooks/useDailyLogs'
import { addDays, formatDate, parseDate, cn } from '@/lib/utils'
import Avatar from '@/components/Avatar'

interface Card {
  bg: string
  eyebrow: string
  headline: React.ReactNode
  sub?: React.ReactNode
}

export default function PactWrapped() {
  const { pact } = useActivePact()
  const progress = useCombinedProgress()
  const aLogs = useDailyLogs('apeksha')
  const vLogs = useDailyLogs('ved')
  const [step, setStep] = useState(0)

  const cards = useMemo<Card[]>(() => {
    if (!pact) return []
    const days = pactDurationDays(pact)
    const succeeded = progress.combinedPct >= pact.targetPct

    // Shared-days count: days both users had at least one tick
    let sharedDays = 0
    let cur = parseDate(pact.startDate)
    const end = parseDate(pact.endDate)
    let hardest: { date: string; total: number } | null = null
    while (cur <= end) {
      const ds = formatDate(cur)
      const both = dayHasAnyTick(aLogs.logs, ds) && dayHasAnyTick(vLogs.logs, ds)
      if (both) sharedDays++
      // hardest = day where both showed up but earned the LEAST (combined)
      if (both) {
        const total = earnedOnDate(aLogs.logs, ds) + earnedOnDate(vLogs.logs, ds)
        if (!hardest || total < hardest.total) hardest = { date: ds, total }
      }
      cur = addDays(cur, 1)
    }
    const hardestStr = hardest
      ? parseDate(hardest.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      : null

    return [
      {
        bg: 'from-lavender via-cream to-pink',
        eyebrow: 'the pact',
        headline: (
          <>
            you started <em className="italic text-apeksha">{pact.name}</em><br />
            <span className="text-2xl font-display italic">{days} days ago</span>
          </>
        ),
        sub: <span className="text-base">{pact.startDate} → {pact.endDate}</span>,
      },
      {
        bg: 'from-butter via-peach to-pink',
        eyebrow: 'together',
        headline: (
          <>
            <span className="text-7xl font-display italic block">{progress.combinedEarned}</span>
            <span className="text-xl font-display italic mt-2 block">pts earned together</span>
          </>
        ),
        sub: <span className="text-sm text-ink-soft">{progress.apekshaEarned} + {progress.vedEarned}</span>,
      },
      {
        bg: 'from-sage via-cream to-lavender',
        eyebrow: 'showing up',
        headline: (
          <>
            you logged together on<br />
            <span className="text-7xl font-display italic block mt-2">{sharedDays}</span>
            <span className="text-xl font-display italic block">{sharedDays === 1 ? 'day' : 'days'}</span>
          </>
        ),
      },
      {
        bg: 'from-rose/40 via-cream to-butter',
        eyebrow: 'the hardest day',
        headline: hardestStr ? (
          <>
            <span className="text-3xl font-display italic block">{hardestStr}</span>
            <span className="text-base font-display italic block mt-3">— and you both still showed up.</span>
          </>
        ) : (
          <>every day was a softer day.</>
        ),
      },
      {
        bg: succeeded
          ? 'from-butter via-peach to-coral/40'
          : 'from-rose/40 via-cream to-lavender',
        eyebrow: succeeded ? 'unlocked' : 'still real',
        headline: succeeded ? (
          <>
            <span className="text-7xl font-display italic block">{progress.combinedPct}%</span>
            <span className="text-2xl font-display italic block mt-2">together</span>
            <span className="text-base font-display italic block mt-4">you earned this.</span>
          </>
        ) : (
          <>
            <span className="text-7xl font-display italic block">{progress.combinedPct}%</span>
            <span className="text-2xl font-display italic block mt-2">together</span>
            <span className="text-base font-display italic block mt-4">— that's still real.</span>
          </>
        ),
      },
    ]
  }, [pact, progress, aLogs.logs, vLogs.logs])

  if (!pact) return <Navigate to="/dashboard" replace />

  const card = cards[step]
  const last = step === cards.length - 1

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const x = e.clientX
    const width = (e.currentTarget as HTMLElement).clientWidth
    // left 35% → back, right 65% → forward
    if (x < width * 0.35 && step > 0) setStep(step - 1)
    else if (x >= width * 0.35 && step < cards.length - 1) setStep(step + 1)
  }

  return (
    <div
      onClick={handleTap}
      className={cn('min-h-svh flex flex-col items-center justify-center p-7 text-center bg-gradient-to-br relative overflow-hidden cursor-pointer', card.bg)}
    >
      {/* Progress dots */}
      <div className="absolute top-7 left-7 right-7 flex gap-1.5">
        {cards.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-pill transition-all',
              i < step ? 'bg-ink/40' : i === step ? 'bg-ink' : 'bg-ink/15'
            )}
          />
        ))}
      </div>

      {/* Avatars */}
      <div className="absolute top-12 left-7 flex items-center gap-1">
        <Avatar user="apeksha" size="sm" />
        <Avatar user="ved" size="sm" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-ink"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-soft mb-4">{card.eyebrow}</p>
          <div className="font-display italic text-3xl leading-tight">{card.headline}</div>
          {card.sub && <p className="mt-4 text-ink-soft">{card.sub}</p>}
        </motion.div>
      </AnimatePresence>

      {last && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-12 left-7 right-7 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to="/dashboard"
            className="block w-full px-4 py-3 rounded-pill bg-white text-ink font-medium shadow-md active:scale-[0.98] transition"
          >
            back to today
          </Link>
        </motion.div>
      )}

      {!last && (
        <p className="absolute bottom-10 text-[10px] uppercase tracking-wider text-ink-soft">
          tap to continue →
        </p>
      )}
    </div>
  )
}
