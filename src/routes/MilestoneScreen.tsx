import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCelebration } from '@/store/celebration'
import { MILESTONE_THRESHOLDS } from '@/hooks/useMilestones'

const LABELS: Record<number, string> = {
  25: 'a quarter in · petals',
  50: 'halfway · sparkles',
  75: 'almost · hearts',
  95: 'unlocked · the trip',
}

export default function MilestoneScreen() {
  const show = useCelebration((s) => s.show)
  return (
    <div className="min-h-svh p-6">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">preview</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-8">Milestone ceremonies</h1>

      <p className="text-muted font-display italic mb-6">
        these auto-trigger when combined % crosses each threshold. preview one here.
      </p>

      <div className="space-y-2">
        {MILESTONE_THRESHOLDS.map((t) => (
          <button
            key={t}
            onClick={() => show(t)}
            className="w-full rounded-card bg-white border border-line p-4 flex items-center justify-between hover:border-line-strong transition active:scale-[0.98]"
          >
            <span>
              <span className="font-display text-2xl text-apeksha">{t}%</span>
              <span className="text-sm text-muted ml-2">{LABELS[t]}</span>
            </span>
            <span className="text-xs text-muted">preview →</span>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-faint italic font-display mt-8">
        tip: tap one to see the animation. the real one fires once per threshold, persisted in firebase.
      </p>
    </div>
  )
}
