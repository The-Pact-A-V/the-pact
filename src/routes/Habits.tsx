import { Link } from 'react-router-dom'
import { Check, Trash2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { CATEGORIES, DIFFICULTY_TIERS } from '@/lib/constants'
import { useActivities, deleteActivity } from '@/hooks/useActivities'
import { useDailyLogs, toggleLog, isTicked, earnedOnDate } from '@/hooks/useDailyLogs'
import { useAuth } from '@/store/auth'
import { todayStr, cn } from '@/lib/utils'
import type { Activity, Category, Difficulty } from '@/types'

function difficultyEmoji(points: Difficulty) {
  return DIFFICULTY_TIERS.find((t) => t.points === points)?.emoji ?? '💧'
}

interface HabitRowProps {
  activity: Activity
  ticked: boolean
  onToggle: () => void
  onDelete: () => void
}

function HabitRow({ activity, ticked, onToggle, onDelete }: HabitRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card p-3 border transition',
        ticked ? 'bg-sage border-sage-deep' : 'bg-white border-line'
      )}
    >
      <button
        onClick={onToggle}
        aria-label={ticked ? `Untick ${activity.name}` : `Tick ${activity.name}`}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center border-2 transition shrink-0 active:scale-90',
          ticked
            ? 'bg-ved border-ved text-white'
            : 'bg-white border-line-strong text-transparent hover:border-ved'
        )}
      >
        <Check size={18} strokeWidth={3} />
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium truncate',
            ticked ? 'text-ink/70 line-through decoration-ved/40' : 'text-ink'
          )}
        >
          {activity.name}
        </p>
        <p className="text-[11px] text-muted">
          {difficultyEmoji(activity.points)} +{activity.points} pts · daily
        </p>
      </div>

      <button
        onClick={onDelete}
        className="p-2 text-faint hover:text-material transition shrink-0"
        aria-label={`Delete ${activity.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export default function Habits() {
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const today = todayStr()
  const { activities, loading } = useActivities(user)
  const { logs } = useDailyLogs(user)

  const earned = earnedOnDate(logs, today)
  const possible = activities.reduce((s, a) => s + a.points, 0)

  async function handleToggle(activity: Activity) {
    const currently = isTicked(logs, today, activity.id)
    try {
      await toggleLog(user, today, activity.id, !currently, activity.points)
    } catch (err) {
      console.warn(err)
    }
  }

  async function handleDelete(activityId: string, name: string) {
    if (!confirm(`Remove "${name}"?`)) return
    try {
      await deleteActivity(user, activityId)
    } catch (err) {
      console.warn(err)
    }
  }

  const byCategory = (cat: Category) => activities.filter((a) => a.category === cat)

  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">habits</p>
          <h1 className="font-display text-4xl text-ink mt-1">Today</h1>
          {!loading && activities.length > 0 && (
            <p className="text-xs text-muted mt-1">
              {earned} <span className="text-faint">/ {possible}</span> pts earned today
            </p>
          )}
        </div>
        <Link
          to="/add-habit"
          className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center text-2xl shadow-md shadow-coral/30 active:scale-95 transition"
          aria-label="Add habit"
        >
          +
        </Link>
      </header>

      {!loading && activities.length === 0 && (
        <div className="mx-6 mt-6 text-center">
          <p className="font-display italic text-muted mb-6">
            no habits yet. the seeds you plant today fill tomorrow's jar.
          </p>
          <Link
            to="/add-habit"
            className="inline-block px-6 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
          >
            + add your first habit
          </Link>
        </div>
      )}

      {activities.length > 0 && (
        <div className="mx-6 mt-2 space-y-6">
          {(Object.keys(CATEGORIES) as Category[]).map((cat) => {
            const catActs = byCategory(cat)
            if (catActs.length === 0) return null
            return (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{CATEGORIES[cat].emoji}</span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                    {CATEGORIES[cat].label}
                  </span>
                  <span className="text-[11px] text-faint">· {catActs.length}</span>
                </div>
                <div className="space-y-2">
                  {catActs.map((a) => (
                    <HabitRow
                      key={a.id}
                      activity={a}
                      ticked={isTicked(logs, today, a.id)}
                      onToggle={() => handleToggle(a)}
                      onDelete={() => handleDelete(a.id, a.name)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
