import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useActivities } from '@/hooks/useActivities'
import { useDailyLogs, earnedOnDate } from '@/hooks/useDailyLogs'
import { useActivePact } from '@/hooks/usePact'
import { isScheduledOn } from '@/lib/frequency'
import { formatDate, parseDate, todayStr, cn } from '@/lib/utils'
import type { Activity, Difficulty } from '@/types'
import { DIFFICULTY_TIERS } from '@/lib/constants'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function difficultyEmoji(points: Difficulty) {
  return DIFFICULTY_TIERS.find((t) => t.points === points)?.emoji ?? '💧'
}

export default function History() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { activities } = useActivities(me)
  const { logs } = useDailyLogs(me)
  const { pact } = useActivePact()
  const navigate = useNavigate()
  const today = todayStr()

  // Default view: month containing today
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())

  const grid = useMemo(() => {
    // First day of month
    const first = new Date(viewYear, viewMonth, 1)
    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate()
    // Day-of-week of first (Sun = 0)
    const startDow = first.getDay()
    // Total cells = startDow + lastDate, rounded up to nearest 7
    const cells: Array<{ date: string; day: number } | null> = []
    for (let i = 0; i < startDow; i++) cells.push(null)
    for (let d = 1; d <= lastDate; d++) {
      const date = formatDate(new Date(viewYear, viewMonth, d))
      cells.push({ date, day: d })
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [viewYear, viewMonth])

  function shadeFor(ds: string): 'high' | 'mid' | 'low' | 'none' {
    const date = parseDate(ds)
    const scheduled = activities.filter((a) => isScheduledOn(a.frequency, date))
    const possible = scheduled.reduce((s, a) => s + a.points, 0)
    if (possible === 0) return 'none'
    const earned = earnedOnDate(logs, ds)
    const pct = earned / possible
    if (pct >= 0.8) return 'high'
    if (pct >= 0.3) return 'mid'
    if (pct > 0) return 'low'
    return 'none'
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else setViewMonth((m) => m + 1)
  }

  function pickDay(ds: string) {
    const date = parseDate(ds)
    const t = todayStr()
    if (formatDate(date) > t) return // future
    navigate(`/habits?date=${ds}`)
  }

  // Per-habit summary stats (lifetime)
  function habitStats(activity: Activity) {
    let completedDays = 0
    let pointsTotal = 0
    let streak = 0
    let walking = parseDate(today)
    let walkingStreak = true
    for (const date in logs) {
      const entry = logs[date]?.[activity.id]
      if (entry?.completed) {
        completedDays++
        pointsTotal += entry.pointsAtTick
      }
    }
    // walking streak (today or yesterday backward while ticked)
    let streakDate = parseDate(today)
    if (!logs[formatDate(streakDate)]?.[activity.id]?.completed) {
      streakDate.setDate(streakDate.getDate() - 1)
    }
    while (logs[formatDate(streakDate)]?.[activity.id]?.completed) {
      streak++
      streakDate.setDate(streakDate.getDate() - 1)
    }
    void walking; void walkingStreak
    return { completedDays, pointsTotal, streak }
  }

  const pactStart = pact?.startDate
  const todayMonth = new Date().getMonth() === viewMonth && new Date().getFullYear() === viewYear

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">history</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-6">The whole pact</h1>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center hover:border-line-strong transition"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-xl">{MONTH_NAMES[viewMonth]} <span className="text-muted">{viewYear}</span></span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center hover:border-line-strong transition"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* DOW labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-[10px] uppercase tracking-wider text-muted">
        {DOW_LABELS.map((l, i) => <span key={i}>{l}</span>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-8">
        {grid.map((cell, idx) => {
          if (!cell) return <span key={idx} />
          const future = cell.date > today
          const isToday = cell.date === today
          const isStart = pactStart && cell.date === pactStart
          const shade = future ? null : shadeFor(cell.date)
          const cls = isToday
            ? 'bg-ink text-cream font-bold'
            : future
              ? 'bg-paper text-faint'
              : shade === 'high' ? 'bg-sage text-ved'
              : shade === 'mid' ? 'bg-butter text-ink-soft'
              : shade === 'low' ? 'bg-paper text-muted'
              : 'bg-paper text-faint'
          return (
            <button
              key={cell.date}
              disabled={future}
              onClick={() => pickDay(cell.date)}
              className={cn(
                'aspect-square rounded-card text-sm flex items-center justify-center transition active:scale-95',
                cls,
                isStart && 'ring-2 ring-coral',
                future && 'cursor-not-allowed'
              )}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted mb-8">
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sage" /> 80%+</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-butter" /> 30–80%</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-paper border border-line" /> some</span>
        {pactStart && (
          <span className="inline-flex items-center gap-1 ml-auto"><span className="w-2 h-2 rounded-full ring-2 ring-coral" /> start</span>
        )}
      </div>

      {todayMonth && (
        <p className="text-[11px] italic font-display text-muted mb-6 text-center">
          tap any past day to backfill it.
        </p>
      )}

      {/* Per-habit stats */}
      {activities.length > 0 && (
        <>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">all-time per habit</p>
          <div className="space-y-2">
            {activities.map((a) => {
              const stats = habitStats(a)
              return (
                <div key={a.id} className="rounded-card bg-white border border-line p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{difficultyEmoji(a.points)}</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.name}</p>
                      <p className="text-[11px] text-muted">
                        {stats.completedDays} days · +{stats.pointsTotal} pts
                      </p>
                    </div>
                  </div>
                  {stats.streak >= 2 && (
                    <span className="text-spiritual text-xs font-medium inline-flex items-center gap-0.5">
                      🔥 {stats.streak}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
