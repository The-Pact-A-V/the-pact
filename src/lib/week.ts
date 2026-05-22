import { addDays, formatDate, parseDate } from './utils'
import type { LogTree } from '@/hooks/useDailyLogs'
import { earnedOnDate, dayHasAnyTick } from '@/hooks/useDailyLogs'

export interface WeekStats {
  start: string
  end: string
  totalEarned: number
  perDay: Array<{ date: string; weekday: number; earned: number }>
  bestDay: { date: string; weekday: number; earned: number } | null
  comebackDay: { date: string; weekday: number; earned: number } | null
  completedHabitCount: number
}

// Sunday-to-Saturday week containing `date`.
export function weekRange(date: string): { start: Date; end: Date } {
  const d = parseDate(date)
  const dow = d.getDay() // 0 = Sun
  const start = addDays(d, -dow)
  const end = addDays(start, 6)
  return { start, end }
}

export function computeWeekStats(logs: LogTree, date: string): WeekStats {
  const { start, end } = weekRange(date)
  const perDay: WeekStats['perDay'] = []
  let totalEarned = 0
  let bestDay: WeekStats['bestDay'] = null
  let comebackDay: WeekStats['comebackDay'] = null
  let completedHabitCount = 0

  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i)
    const ds = formatDate(d)
    const earned = earnedOnDate(logs, ds)
    totalEarned += earned
    perDay.push({ date: ds, weekday: d.getDay(), earned })
    if (earned > 0 && (!bestDay || earned > bestDay.earned)) {
      bestDay = { date: ds, weekday: d.getDay(), earned }
    }
    // comeback: this day has any tick AND previous calendar day had none
    const prev = formatDate(addDays(d, -1))
    if (dayHasAnyTick(logs, ds) && !dayHasAnyTick(logs, prev)) {
      if (!comebackDay || earned > comebackDay.earned) {
        comebackDay = { date: ds, weekday: d.getDay(), earned }
      }
    }
    // count completed habit ticks
    const day = logs[ds]
    if (day) {
      for (const id in day) {
        if (day[id]?.completed) completedHabitCount++
      }
    }
  }

  return {
    start: formatDate(start),
    end: formatDate(end),
    totalEarned,
    perDay,
    bestDay,
    comebackDay,
    completedHabitCount,
  }
}

export function previousWeekStats(logs: LogTree, date: string): WeekStats {
  const { start } = weekRange(date)
  const prev = formatDate(addDays(start, -1))
  return computeWeekStats(logs, prev)
}
