import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useArchivedPact, pactDurationDays } from '@/hooks/usePact'
import { cn } from '@/lib/utils'

export default function PactArchived() {
  const { id } = useParams<{ id: string }>()
  const { pact, loading } = useArchivedPact(id ?? null)

  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  if (!pact) return <Navigate to="/pact-archive" replace />

  const unlocked = pact.status === 'completed'

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/pact-archive" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> archive
      </Link>

      <div className="flex items-center justify-between mt-6 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">archived</p>
          <h1 className="font-display text-4xl text-ink mt-1">{pact.name}</h1>
        </div>
        <span
          className={cn(
            'rounded-pill px-3 py-1 text-xs font-medium shrink-0',
            unlocked ? 'bg-sage text-physical' : 'bg-pink text-material'
          )}
        >
          {unlocked ? '✓ unlocked' : '· close · no unlock'}
        </span>
      </div>

      <section className="rounded-hero bg-gradient-to-br from-sage to-lavender p-5 shadow-sm mb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft mb-2">together target</p>
        <p className="font-display text-5xl text-ink">{pact.targetPct}%</p>
      </section>

      <section className="rounded-card bg-white border border-line p-4 mb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">window</p>
        <div className="flex items-center justify-between text-sm">
          <span>{pact.startDate}</span>
          <span className="text-faint">→</span>
          <span>{pact.endDate}</span>
        </div>
        <p className="text-xs text-muted mt-1">{pactDurationDays(pact)} days</p>
      </section>

      <section className="rounded-card bg-white border border-line p-4 mb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">status</p>
        <p className="text-sm capitalize">{pact.status}</p>
        {pact.closedAt && (
          <p className="text-xs text-muted mt-1">
            closed {new Date(pact.closedAt).toLocaleDateString()}
          </p>
        )}
      </section>

      <p className="text-center text-faint text-xs italic font-display mt-10">
        this pact is archived. fields can't be edited.
      </p>
    </div>
  )
}
