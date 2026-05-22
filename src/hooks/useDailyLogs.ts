import { useEffect, useState } from 'react'
import { onValue, ref, remove, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { UserId } from '@/types'

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
