import { useEffect, useState } from 'react'
import { onValue, ref, remove, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { UserId } from '@/types'
import { addDays, formatDate, parseDate, todayStr } from '@/lib/utils'

export interface LogEntry {
  completed: boolean
  pointsAtTick: number
}

export type LogTree = Record<string, Record<string, LogEntry>>

export function useDailyLogs(userId: UserId) {
  const [logs, setLogs] = useState<LogTree>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, `daily_logs/${userId}`)
    const unsubscribe = onValue(r, (snap) => {
      setLogs((snap.val() ?? {}) as LogTree)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [userId])

  return { logs, loading }
}

export async function toggleLog(
  userId: UserId,
  date: string,
  activityId: string,
  completed: boolean,
  pointsAtTick: number
): Promise<void> {
  const r = ref(db, `daily_logs/${userId}/${date}/${activityId}`)
  if (completed) {
    await set(r, { completed: true, pointsAtTick })
  } else {
    await remove(r)
  }
}

export function totalEarned(logs: LogTree): number {
  let total = 0
  for (const date in logs) {
    for (const id in logs[date]) {
      const entry = logs[date][id]
      if (entry?.completed) total += entry.pointsAtTick ?? 0
    }
  }
  return total
}

export function earnedOnDate(logs: LogTree, date: string): number {
  const day = logs[date]
  if (!day) return 0
  let total = 0
  for (const id in day) {
    if (day[id]?.completed) total += day[id].pointsAtTick ?? 0
  }
  return total
}

export function isTicked(logs: LogTree, date: string, activityId: string): boolean {
  return !!logs[date]?.[activityId]?.completed
}

export function streakFor(logs: LogTree, activityId: string, fromDate: string = todayStr()): number {
  // Count consecutive days the habit was completed, ending at or before fromDate.
  // If today (fromDate) is ticked → include and walk backward.
  // If today isn't ticked → start from yesterday (so missing today doesn't break the streak yet).
  let streak = 0
  let d = parseDate(fromDate)

  if (!isTicked(logs, formatDate(d), activityId)) {
    d = addDays(d, -1)
  }
  while (isTicked(logs, formatDate(d), activityId)) {
    streak++
    d = addDays(d, -1)
  }
  return streak
}

export function dayHasAnyTick(logs: LogTree, date: string): boolean {
  const day = logs[date]
  if (!day) return false
  for (const id in day) {
    if (day[id]?.completed) return true
  }
  return false
}

// "comeback" = today has a tick AND yesterday had zero ticks
export function isComebackDay(logs: LogTree, date: string = todayStr()): boolean {
  if (!dayHasAnyTick(logs, date)) return false
  const yesterday = formatDate(addDays(parseDate(date), -1))
  return !dayHasAnyTick(logs, yesterday)
}
