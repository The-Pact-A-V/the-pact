import { useEffect } from 'react'
import { useAuth } from '@/store/auth'
import { useCelebration } from '@/store/celebration'
import { useCombinedProgress } from '@/hooks/useCombinedProgress'
import { MILESTONE_THRESHOLDS, recordMilestone, useMilestones } from '@/hooks/useMilestones'

// Watches combined % and triggers a celebration when a new threshold is crossed.
// Persisted in /milestones/{threshold} so it fires once across users.
// Local "seen" flag in localStorage so re-opening doesn't replay an already-seen one.
export default function MilestoneWatcher() {
  const me = useAuth((s) => s.user)
  const { combinedPct, loading } = useCombinedProgress()
  const { milestones, loading: mLoading } = useMilestones()
  const show = useCelebration((s) => s.show)

  useEffect(() => {
    if (!me || loading || mLoading) return

    // 1. If a threshold has been recorded but this client hasn't shown it yet → show it
    for (const t of MILESTONE_THRESHOLDS) {
      const seenKey = `milestone_seen_${t}`
      const recorded = milestones[String(t)]
      if (recorded && !localStorage.getItem(seenKey)) {
        localStorage.setItem(seenKey, '1')
        show(t)
        return
      }
    }

    // 2. If combinedPct has crossed a threshold that isn't yet recorded → record it (this will trigger #1 on next tick)
    for (const t of MILESTONE_THRESHOLDS) {
      if (combinedPct >= t && !milestones[String(t)]) {
        recordMilestone(t, me).catch(() => {})
        return // only record one per render
      }
    }
  }, [combinedPct, milestones, loading, mLoading, me, show])

  return null
}
