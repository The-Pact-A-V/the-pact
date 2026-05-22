import type { Activity } from '@/types'
import { useActivities } from './useActivities'
import { useDailyLogs, totalEarned } from './useDailyLogs'
import { occurrencesInPact } from '@/lib/frequency'

function totalPossible(activities: Activity[]): number {
  return activities.reduce(
    (sum, a) => sum + a.points * occurrencesInPact(a.frequency),
    0
  )
}

export function useCombinedProgress() {
  const a = useActivities('apeksha')
  const v = useActivities('ved')
  const aLogs = useDailyLogs('apeksha')
  const vLogs = useDailyLogs('ved')

  const aPossible = totalPossible(a.activities)
  const vPossible = totalPossible(v.activities)
  const aEarned = totalEarned(aLogs.logs)
  const vEarned = totalEarned(vLogs.logs)

  const combinedPossible = aPossible + vPossible
  const combinedEarned = aEarned + vEarned

  const pct = (earned: number, possible: number) =>
    possible > 0 ? Math.min(100, Math.round((earned / possible) * 100)) : 0

  return {
    loading: a.loading || v.loading || aLogs.loading || vLogs.loading,
    combinedPct: pct(combinedEarned, combinedPossible),
    apekshaPct: pct(aEarned, aPossible),
    vedPct: pct(vEarned, vPossible),
    apekshaEarned: aEarned,
    vedEarned: vEarned,
    combinedEarned,
    combinedPossible,
  }
}
