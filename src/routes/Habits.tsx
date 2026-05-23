import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Flame, Pencil, Sprout, Trash2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import DayStrip from '@/components/DayStrip'
import Avatar from '@/components/Avatar'
import { CATEGORIES, DIFFICULTY_TIERS } from '@/lib/constants'
import { useActivities, deleteActivity } from '@/hooks/useActivities'
import {
  useDailyLogs,
  toggleLog,
  isTicked,
  earnedOnDate,
  streakFor,
  isComebackDay,
} from '@/hooks/useDailyLogs'
import { useAuth, otherUser, userName } from '@/store/auth'
import { usePrefs } from '@/store/prefs'
import { playTickClick, vibrate } from '@/lib/sound'
import { todayStr, cn, dayName, parseDate } from '@/lib/utils'
import { freqLabel, isScheduledOn } from '@/lib/frequency'
import type { Activity, Category, Difficulty, UserId } from '@/types'

const SUGGESTIONS: Array<{
  name: string
  category: Category
  points: Difficulty
}> = [
  { name: 'Reading 30m', category: 'mental', points: 2 },
  { name: 'Meditation', category: 'spiritual', points: 2 },
  { name: 'Gym', category: 'physical', points: 5 },
  { name: '8 glasses of water', category: 'physical', points: 1 },
  { name: 'Wake at 6', category: 'material', points: 3 },
  { name: 'Journal', category: 'mental', points: 2 },
]

function difficultyEmoji(points: Difficulty) {
  return DIFFICULTY_TIERS.find((t) => t.points === points)?.emoji ?? '💧'
}

interface HabitRowProps {
  activity: Activity
  ticked: boolean
  streak: number
  readonly: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

function HabitRow({ activity, ticked, streak, readonly, onToggle, onEdit, onDelete }: HabitRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card p-3 border transition',
        ticked ? 'bg-sage border-sage-deep' : 'bg-white border-line',
        readonly && 'opacity-90'
      )}
    >
      <button
        onClick={onToggle}
        disabled={readonly}
        aria-label={ticked ? `Untick ${activity.name}` : `Tick ${activity.name}`}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center border-2 transition shrink-0',
          readonly
            ? 'border-line bg-paper text-faint cursor-not-allowed'
            : 'active:scale-90',
          ticked && !readonly && 'bg-ved border-ved text-white',
          ticked && readonly && 'bg-ved/40 border-ved/40 text-white',
          !ticked && !readonly && 'bg-white border-line-strong text-transparent hover:border-ved'
        )}
      >
        <Check size={18} strokeWidth={3} />
      </button>

      <button
        onClick={readonly ? undefined : onEdit}
        disabled={readonly}
        className="flex-1 min-w-0 text-left"
      >
        <p
          className={cn(
            'font-medium truncate',
            ticked ? 'text-ink/70 line-through decoration-ved/40' : 'text-ink'
          )}
        >
          {activity.name}
        </p>
        {activity.notes && (
          <p className="text-[11px] text-muted italic font-display truncate">{activity.notes}</p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
          <span>{difficultyEmoji(activity.points)} +{activity.points}</span>
          <span className="text-faint">·</span>
          <span>{freqLabel(activity.frequency)}</span>
          {streak >= 2 && (
            <>
              <span className="text-faint">·</span>
              <span className="text-spiritual font-medium inline-flex items-center gap-0.5">
                <Flame size={11} fill="currentColor" /> {streak}
              </span>
            </>
          )}
        </div>
      </button>

      {!readonly && (
        <>
          <button
            onClick={onEdit}
            className="p-2 text-faint hover:text-apeksha transition shrink-0"
            aria-label={`Edit ${activity.name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-faint hover:text-material transition shrink-0"
            aria-label={`Delete ${activity.name}`}
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  )
}

interface SuggestionsProps {
  user: UserId
}

function Suggestions({ user: _user }: SuggestionsProps) {
  return (
    <section className="mx-6 mt-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">
        or start from a suggestion
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SUGGESTIONS.map((s) => {
          const params = new URLSearchParams({
            name: s.name,
            category: s.category,
            points: String(s.points),
          })
          return (
            <Link
              key={s.name}
              to={`/add-habit?${params.toString()}`}
              className="rounded-card bg-white border border-line p-3 flex items-center gap-2 hover:border-line-strong transition active:scale-[0.98]"
            >
              <span className="text-lg">{CATEGORIES[s.category].emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-[10px] text-muted">
                  {CATEGORIES[s.category].label} · {difficultyEmoji(s.points)} +{s.points}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default function Habits() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const soundOn = usePrefs((s) => s.soundOn)

  const peekMode = searchParams.get('peek') === 'true'
  const viewedUser: UserId = peekMode ? otherUser(me) : me
  const viewedDate = searchParams.get('date') ?? todayStr()
  const today = todayStr()
  const isPast = viewedDate !== today

  const { activities, loading } = useActivities(viewedUser)
  const { logs } = useDailyLogs(viewedUser)

  // For my day-strip shading
  const { logs: myLogs } = useDailyLogs(me)
  const { activities: myActs } = useActivities(me)
  const myDailyMax = myActs.reduce(
    (s, a) => s + (isScheduledOn(a.frequency, parseDate(viewedDate)) ? a.points : 0),
    0
  )

  const scheduledToday = activities.filter((a) =>
    isScheduledOn(a.frequency, parseDate(viewedDate))
  )

  const earnedThisDay = earnedOnDate(logs, viewedDate)
  const possibleThisDay = scheduledToday.reduce((s, a) => s + a.points, 0)

  const comeback = !peekMode && viewedDate === today && isComebackDay(logs, today)

  function shadeFor(ds: string): 'high' | 'mid' | 'low' | 'none' {
    const earned = earnedOnDate(myLogs, ds)
    const possible = myActs.reduce(
      (s, a) => s + (isScheduledOn(a.frequency, parseDate(ds)) ? a.points : 0),
      0
    )
    if (possible === 0) return 'none'
    const pct = earned / possible
    if (pct >= 0.8) return 'high'
    if (pct >= 0.3) return 'mid'
    if (pct > 0) return 'low'
    return 'none'
  }

  async function handleToggle(activity: Activity) {
    if (peekMode) return
    const currently = isTicked(logs, viewedDate, activity.id)
    if (!currently && soundOn) {
      // Only chime on the "tick on" — silence the untick path to avoid noise
      playTickClick()
      vibrate(10)
    }
    try {
      await toggleLog(me, viewedDate, activity.id, !currently, activity.points)
    } catch (err) {
      console.warn(err)
    }
  }

  async function handleDelete(activityId: string, name: string) {
    if (peekMode) return
    if (!confirm(`Remove "${name}"?`)) return
    try {
      await deleteActivity(me, activityId)
    } catch (err) {
      console.warn(err)
    }
  }

  function pickDate(ds: string) {
    const next = new URLSearchParams(searchParams)
    if (ds === today) next.delete('date')
    else next.set('date', ds)
    setSearchParams(next, { replace: true })
  }

  function togglePeek() {
    const next = new URLSearchParams(searchParams)
    if (peekMode) next.delete('peek')
    else next.set('peek', 'true')
    setSearchParams(next, { replace: true })
  }

  const byCategory = (cat: Category) => scheduledToday.filter((a) => a.category === cat)

  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              habits {isPast && '· past day'}
            </p>
            <h1 className="font-display text-4xl text-ink mt-1">
              {isPast ? dayName(parseDate(viewedDate).getDay()) : 'Today'}
            </h1>
            {scheduledToday.length > 0 && (
              <p className="text-xs text-muted mt-1">
                {earnedThisDay} <span className="text-faint">/ {possibleThisDay}</span> pts
                {!peekMode && ' · today'}
                {peekMode && ` · ${userName(viewedUser)}`}
                {' · '}
                <span className="text-faint">
                  daily max {myDailyMax}
                </span>
              </p>
            )}
          </div>
          {!peekMode && (
            <Link
              to="/add-habit"
              className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center text-2xl shadow-md shadow-coral/30 active:scale-95 transition"
              aria-label="Add habit"
            >
              +
            </Link>
          )}
        </div>

        {/* Peek toggle */}
        <div className="mt-3 inline-flex rounded-pill bg-paper p-1 text-xs">
          <button
            onClick={() => peekMode && togglePeek()}
            className={cn(
              'px-3 py-1.5 rounded-pill flex items-center gap-1.5 transition',
              !peekMode ? 'bg-white shadow-sm text-apeksha font-medium' : 'text-muted'
            )}
          >
            <Avatar user={me} size="sm" /> mine
          </button>
          <button
            onClick={() => !peekMode && togglePeek()}
            className={cn(
              'px-3 py-1.5 rounded-pill flex items-center gap-1.5 transition',
              peekMode ? 'bg-white shadow-sm text-ved font-medium' : 'text-muted'
            )}
          >
            <Avatar user={otherUser(me)} size="sm" /> peek at {userName(otherUser(me))}
          </button>
        </div>
      </header>

      {peekMode && (
        <div className="mx-6 mt-3 rounded-card bg-sage/40 border border-sage-deep px-3 py-2 text-xs text-ved">
          👀 view-only — you can see {userName(otherUser(me))}'s progress but can't tick it
        </div>
      )}

      {comeback && (
        <div className="mx-6 mt-3 rounded-card bg-butter border border-butter-deep px-3 py-2 text-xs flex items-center gap-2">
          <Sprout size={14} className="text-physical" />
          <span><strong>comeback day</strong> · you showed up after a quiet one. that's the win.</span>
        </div>
      )}

      <DayStrip viewedDate={viewedDate} onPick={pickDate} shadeFor={shadeFor} />

      {isPast && (
        <p className="text-center text-[11px] text-muted italic font-display -mt-2 mb-2">
          backfilling {dayName(parseDate(viewedDate).getDay()).toLowerCase()} · ticks update the jar retroactively
        </p>
      )}

      {!loading && activities.length === 0 && !peekMode && (
        <div className="mx-6 mt-4">
          <div className="text-center mb-6">
            <p className="font-display italic text-muted">
              no habits yet. plant something small.
            </p>
            <Link
              to="/add-habit"
              className="inline-block mt-4 px-6 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
            >
              + add your own
            </Link>
          </div>
          <Suggestions user={me} />
        </div>
      )}

      {!loading && activities.length === 0 && peekMode && (
        <p className="mx-6 mt-6 text-center text-muted font-display italic">
          {userName(viewedUser)} hasn't added any habits yet.
        </p>
      )}

      {scheduledToday.length === 0 && activities.length > 0 && (
        <p className="mx-6 mt-6 text-center text-muted font-display italic">
          nothing scheduled today. rest is a feature.
        </p>
      )}

      {scheduledToday.length > 0 && (
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
                      ticked={isTicked(logs, viewedDate, a.id)}
                      streak={streakFor(logs, a.id, viewedDate)}
                      readonly={peekMode}
                      onToggle={() => handleToggle(a)}
                      onEdit={() => navigate(`/add-habit?edit=${a.id}`)}
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
