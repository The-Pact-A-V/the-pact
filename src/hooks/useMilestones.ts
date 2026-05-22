import { useEffect, useState } from 'react'
import { onValue, ref, get, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Milestone, UserId } from '@/types'

export const MILESTONE_THRESHOLDS = [25, 50, 75, 95] as const
export type MilestoneThreshold = (typeof MILESTONE_THRESHOLDS)[number]

export function useMilestones() {
  const [milestones, setMilestones] = useState<Record<string, Milestone>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'milestones')
    const unsubscribe = onValue(r, (snap) => {
      setMilestones((snap.val() ?? {}) as Record<string, Milestone>)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { milestones, loading }
}

export async function recordMilestone(threshold: MilestoneThreshold, hitBy: UserId): Promise<boolean> {
  const r = ref(db, `milestones/${threshold}`)
  const existing = await get(r)
  if (existing.exists()) return false
  const entry: Milestone = {
    threshold,
    hitAt: Date.now(),
    hitBy,
  }
  await set(r, entry)
  return true
}
