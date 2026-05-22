import type { Activity } from '@/types'
import { useActivities } from './useActivities'
import { useDailyLogs, totalEarned } from './useDailyLogs'
import { pactDurationDays, useActivePact } from './usePact'
import { DEFAULT_PACT_LENGTH_DAYS, occurrencesInPact } from '@/lib/frequency'

function totalPossible(activities: Activity[], pactDays: number): number {
  return activities.reduce(
    (sum, a) => sum + a.points * occurrencesInPact(a.frequency, pactDays),
    0
  )
}

export function useCombinedProgress() {
  const { pact } = useActivePact()
  const pactDays = pact ? pactDurationDays(pact) : DEFAULT_PACT_LENGTH_DAYS

  const a = useActivities('apeksha')
  const v = useActivities('ved')
  const aLogs = useDailyLogs('apeksha')
  const vLogs = useDailyLogs('ved')

  const aPossible = totalPossible(a.activities, pactDays)
  const vPossible = totalPossible(v.activities, pactDays)
  const aEarned = totalEarned(aLogs.logs)
  const vEarned = totalEarned(vLogs.logs)

  const combinedPossible = aPossible + vPossible
  const combinedEarned = aEarned + vEarned

  const pct = (earned: number, possible: number) =>
    possible > 0 ? Math.min(100, Math.round((earned / possible) * 100)) : 0

  return {
    loading: a.loading || v.loading || aLogs.loading || vLogs.loading,
    targetPct: pact?.targetPct ?? 95,
    combinedPct: pct(combinedEarned, combinedPossible),
    apekshaPct: pct(aEarned, aPossible),
    vedPct: pct(vEarned, vPossible),
    apekshaEarned: aEarned,
    vedEarned: vEarned,
    combinedEarned,
    combinedPossible,
  }
}
