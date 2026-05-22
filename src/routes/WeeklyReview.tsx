import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUp, ArrowDown, Minus, Sprout, Star } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useDailyLogs } from '@/hooks/useDailyLogs'
import { computeWeekStats, previousWeekStats } from '@/lib/week'
import { todayStr, dayShort, dayName, cn, parseDate } from '@/lib/utils'

export default function WeeklyReview() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { logs, loading } = useDailyLogs(me)
  const today = todayStr()

  if (loading) {
    return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  }

  const week = computeWeekStats(logs, today)
  const lastWeek = previousWeekStats(logs, today)
  const delta = week.totalEarned - lastWeek.totalEarned
  const maxPerDay = Math.max(1, ...week.perDay.map((d) => d.earned))

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">sunday review</p>
      <h1 className="font-display text-4xl text-ink mt-1 leading-tight">
        this week, <em className="italic text-apeksha">together</em>
      </h1>
      <p className="text-xs text-muted mt-1">{week.start} → {week.end}</p>

      {/* Headline counts */}
      <section className="mt-8 rounded-hero bg-white shadow-sm border border-line p-5 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">you did</p>
        <p className="font-display text-5xl text-ink mt-1">
          {week.completedHabitCount} <span className="text-muted text-lg">habits</span>
        </p>
        <p className="text-sm text-muted mt-1">{week.totalEarned} pts earned</p>

        <div
          className={cn(
            'inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs mt-3',
            delta > 0 ? 'bg-sage text-physical' : delta < 0 ? 'bg-pink text-material' : 'bg-paper text-muted'
          )}
        >
          {delta > 0 ? <ArrowUp size={12} /> : delta < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
          <span className="font-medium">
            {delta > 0 && '+'}{delta} pts <span className="text-faint">vs last week</span>
          </span>
        </div>
      </section>

      {/* Best + comeback */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-card bg-white border border-line p-3.5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted flex items-center gap-1">
            <Star size={11} /> best day
          </p>
          {week.bestDay ? (
            <>
              <p className="font-display text-2xl text-spiritual mt-1">
                {dayName(week.bestDay.weekday)}
              </p>
              <p className="text-xs text-muted">{week.bestDay.earned} pts</p>
            </>
          ) : (
            <p className="text-xs text-faint mt-1 italic font-display">nothing yet</p>
          )}
        </div>
        <div className="rounded-card bg-white border border-line p-3.5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted flex items-center gap-1">
            <Sprout size={11} /> comeback
          </p>
          {week.comebackDay ? (
            <>
              <p className="font-display text-2xl text-physical mt-1">
                {dayName(week.comebackDay.weekday)}
              </p>
              <p className="text-xs text-muted">recovered after a quiet day</p>
            </>
          ) : (
            <p className="text-xs text-faint mt-1 italic font-display">no comeback this week</p>
          )}
        </div>
      </section>

      {/* 7-day bar chart */}
      <section className="mt-6 rounded-card bg-white border border-line p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">this week</p>
        <div className="flex items-end justify-between gap-1.5 h-32">
          {week.perDay.map((d) => {
            const height = (d.earned / maxPerDay) * 100
            const isBest = week.bestDay?.date === d.date
            const isComeback = week.comebackDay?.date === d.date
            const isToday = d.date === today
            const past = parseDate(d.date) <= parseDate(today)
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-full flex flex-col justify-end">
                  <div
                    className={cn(
                      'w-full rounded-t transition-all',
                      isComeback ? 'bg-physical' : isBest ? 'bg-spiritual' : 'bg-lavender-deep',
                      !past && 'opacity-25'
                    )}
                    style={{ height: `${Math.max(4, height)}%` }}
                    title={`${d.earned} pts`}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] uppercase tracking-wider',
                    isToday ? 'text-ink font-bold' : 'text-muted'
                  )}
                >
                  {dayShort(d.weekday)}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-muted">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-lavender-deep" /> daily</span>
          {week.bestDay && <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-spiritual" /> best</span>}
          {week.comebackDay && <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-physical" /> comeback</span>}
        </div>
      </section>

      <Link
        to="/dashboard"
        className="block text-center mt-8 px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
      >
        back to today
      </Link>
    </div>
  )
}
