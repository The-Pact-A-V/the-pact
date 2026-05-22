import { Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useActivePact, useArchivedPacts, dayNumberInPact, pactDurationDays } from '@/hooks/usePact'
import { useCombinedProgress } from '@/hooks/useCombinedProgress'
import { cn } from '@/lib/utils'
import type { Pact } from '@/types'

function PastRow({ pact }: { pact: Pact }) {
  const unlocked = pact.status === 'completed'
  return (
    <Link
      to={`/pact-archived/${pact.id}`}
      className="rounded-card bg-white border border-line p-3.5 flex items-center justify-between hover:border-line-strong transition active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">{pact.name}</p>
        <p className="text-xs text-muted">
          {pact.startDate} → {pact.endDate} · {pactDurationDays(pact)}d
        </p>
      </div>
      <span
        className={cn(
          'rounded-pill px-2.5 py-0.5 text-[10px] font-medium shrink-0 ml-2',
          unlocked ? 'bg-sage text-physical' : 'bg-pink text-material'
        )}
      >
        {unlocked ? '✓ unlocked' : '· no unlock'}
      </span>
    </Link>
  )
}

export default function PactArchive() {
  const { pact: active, loading: aLoading } = useActivePact()
  const { pacts: archived, loading: arLoading } = useArchivedPacts()
  const progress = useCombinedProgress()

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center justify-between mt-6 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">archive</p>
          <h1 className="font-display text-4xl text-ink mt-1">Pacts</h1>
        </div>
        {!active && !aLoading && (
          <Link
            to="/pact-new"
            className="rounded-pill bg-coral text-white px-4 py-2 text-sm font-medium shadow-md shadow-coral/30 active:scale-95 transition"
          >
            + new pact
          </Link>
        )}
        {active && (
          <span className="rounded-pill bg-paper border border-dashed border-line-strong text-muted px-3 py-1.5 text-xs cursor-not-allowed">
            + new pact
          </span>
        )}
      </div>

      {/* Active pact */}
      {active && (
        <section className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">active</p>
          <div className="rounded-hero bg-gradient-to-br from-butter to-pink p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display text-xl text-ink">{active.name}</p>
              <span className="rounded-pill bg-white/80 px-2.5 py-0.5 text-[10px] font-medium">
                live · day {dayNumberInPact(active)}
              </span>
            </div>
            <p className="text-xs text-ink-soft">{active.startDate} → {active.endDate}</p>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft">{progress.combinedPct}% / {active.targetPct}%</span>
                <span className="text-ink-soft">{pactDurationDays(active)} days</span>
              </div>
              <div className="mt-1.5 h-2 rounded-pill bg-white/50 overflow-hidden">
                <div
                  className="h-full bg-apeksha"
                  style={{ width: `${Math.min(progress.combinedPct, 100)}%` }}
                />
              </div>
            </div>

            <Link
              to="/pact-edit"
              className="text-xs text-ink-soft mt-3 inline-block underline"
            >
              edit pact
            </Link>
          </div>
        </section>
      )}

      {active && (
        <div className="mb-6 rounded-card bg-paper border border-line p-3 flex items-start gap-2">
          <Lock size={14} className="text-muted mt-0.5 shrink-0" />
          <p className="text-xs text-muted">
            <strong>one pact at a time</strong> — finish or end this one before starting a new one.
          </p>
        </div>
      )}

      {/* Past */}
      {!arLoading && archived.length === 0 && (
        <p className="text-center text-muted italic font-display mt-8">
          no past pacts yet. the first one you finish lands here.
        </p>
      )}

      {archived.length > 0 && (
        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">past</p>
          <div className="space-y-2">
            {archived.map((p) => <PastRow key={p.id} pact={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
