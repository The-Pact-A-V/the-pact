import type { Activity } from '@/types'
import { useActivities } from './useActivities'
import { useDailyLogs, totalEarned } from './useDailyLogs'

const PACT_LENGTH_DAYS = 50

function sumPoints(activities: Activity[]): number {
  return activities.reduce((s, a) => s + a.points, 0)
}

export function useCombinedProgress() {
  const a = useActivities('apeksha')
  const v = useActivities('ved')
  const aLogs = useDailyLogs('apeksha')
  const vLogs = useDailyLogs('ved')

  const aPossible = sumPoints(a.activities) * PACT_LENGTH_DAYS
  const vPossible = sumPoints(v.activities) * PACT_LENGTH_DAYS
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
