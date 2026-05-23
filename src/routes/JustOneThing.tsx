import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Check, RefreshCw, Sprout } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useActivities } from '@/hooks/useActivities'
import { useDailyLogs, isTicked, toggleLog } from '@/hooks/useDailyLogs'
import { usePrefs } from '@/store/prefs'
import { playTickClick, vibrate } from '@/lib/sound'
import { isScheduledOn } from '@/lib/frequency'
import { CATEGORIES, DIFFICULTY_TIERS } from '@/lib/constants'
import { todayStr, parseDate, cn } from '@/lib/utils'
import type { Activity, Difficulty } from '@/types'

function difficultyEmoji(points: Difficulty) {
  return DIFFICULTY_TIERS.find((t) => t.points === points)?.emoji ?? '💧'
}

// Pick one habit: prefer easy + not-yet-done today. seed=0 returns the
// easiest (lowest points, then alpha). seed > 0 randomizes — used by the
// "pick a different one" link.
function pickJustOne(
  activities: Activity[],
  today: string,
  logs: ReturnType<typeof useDailyLogs>['logs'],
  seed: number
): Activity | null {
  const todayDate = parseDate(today)
  const scheduled = activities.filter((a) => isScheduledOn(a.frequency, todayDate))
  const undone = scheduled.filter((a) => !isTicked(logs, today, a.id))
  if (undone.length === 0) return null
  if (seed === 0) {
    const sorted = [...undone].sort((a, b) => a.points - b.points || a.name.localeCompare(b.name))
    return sorted[0]
  }
  // Deterministic shuffle by seed so re-renders don't flicker
  return undone[(seed - 1) % undone.length]
}

export default function JustOneThing() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { activities, loading: aLoading } = useActivities(me)
  const { logs, loading: lLoading } = useDailyLogs(me)
  const soundOn = usePrefs((s) => s.soundOn)
  const today = todayStr()

  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [done, setDone] = useState(false)

  const habit = useMemo(() => {
    if (aLoading || lLoading) return null
    return pickJustOne(activities, today, logs, shuffleSeed)
  }, [activities, logs, today, aLoading, lLoading, shuffleSeed])

  async function handleTick() {
    if (!habit) return
    if (soundOn) {
      playTickClick()
      vibrate(20)
    }
    await toggleLog(me, today, habit.id, true, habit.points)
    setDone(true)
  }

  if (aLoading || lLoading) {
    return <div className="min-h-svh p-6 text-muted italic font-display">finding one thing for you…</div>
  }

  if (!habit && !done) {
    return (
      <div className="min-h-svh p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-sage/30 to-cream">
        <Sprout size={48} className="text-physical mb-4" />
        <h1 className="font-display text-3xl text-ink italic mb-2">that's all of today.</h1>
        <p className="text-muted text-sm mb-8 max-w-xs">
          every scheduled habit is already ticked. take the rest.
        </p>
        <Link
          to="/dashboard"
          className="px-5 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.97] transition"
        >
          back to dashboard
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-svh p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-sage to-cream">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          className="w-20 h-20 rounded-full bg-ved text-white flex items-center justify-center mb-5"
        >
          <Check size={36} strokeWidth={3} />
        </motion.div>
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-4xl text-ink italic mb-2"
        >
          that was enough.
        </motion.h1>
        <p className="font-display italic text-muted text-base mb-10">
          showing up at all is the win.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.97] transition"
        >
          back to dashboard
        </Link>
      </div>
    )
  }

  // Habit picked
  const cat = CATEGORIES[habit!.category]
  return (
    <div className="min-h-svh p-6 flex flex-col bg-gradient-to-br from-lavender/30 via-cream to-butter/30">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted mb-2">just one thing</p>
        <p className="font-display italic text-base text-muted mb-8 max-w-xs">
          when the whole list feels like too much, this is enough.
        </p>

        <motion.div
          key={habit!.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 14 }}
          className="rounded-hero bg-white shadow-lg border border-line p-7 mb-6 max-w-sm w-full"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{cat.label}</span>
          </div>
          <h1 className="font-display text-3xl text-ink leading-tight">{habit!.name}</h1>
          {habit!.notes && (
            <p className="text-sm italic font-display text-muted mt-2">{habit!.notes}</p>
          )}
          <p className="text-xs text-faint mt-4">
            {difficultyEmoji(habit!.points)} +{habit!.points} pts ·{' '}
            {DIFFICULTY_TIERS.find((t) => t.points === habit!.points)?.label}
          </p>
        </motion.div>

        <button
          onClick={handleTick}
          className={cn(
            'w-full max-w-sm px-4 py-4 rounded-pill bg-ved text-white font-medium shadow-lg shadow-ved/40 active:scale-[0.97] transition',
            'flex items-center justify-center gap-2 text-base'
          )}
        >
          <Check size={20} strokeWidth={3} /> done
        </button>

        <button
          onClick={() => setShuffleSeed((s) => s + 1)}
          className="mt-3 text-xs text-muted hover:text-ink transition inline-flex items-center gap-1"
        >
          <RefreshCw size={11} /> pick a different one
        </button>
      </div>
    </div>
  )
}
