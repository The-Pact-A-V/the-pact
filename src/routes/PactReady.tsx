import { Link, Navigate } from 'react-router-dom'
import { useActivePact, pactDurationDays } from '@/hooks/usePact'
import { useAuth, otherUser, userName } from '@/store/auth'

export default function PactReady() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { pact, loading } = useActivePact()
  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  if (!pact) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-svh p-6 pb-12 flex flex-col">
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">ready</p>
        <h1 className="font-display text-4xl text-ink mt-1 mb-2">
          the pact is <em className="italic text-apeksha">set</em>
        </h1>
        <p className="text-muted font-display italic">starting tomorrow, every habit you both log adds a drop.</p>

        <section className="mt-8 rounded-hero bg-white shadow-sm border border-line p-5 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">name</p>
            <p className="font-display text-2xl text-ink">{pact.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">window</p>
              <p>{pact.startDate} → {pact.endDate}</p>
              <p className="text-xs text-muted">{pactDurationDays(pact)} days</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">target</p>
              <p className="font-display text-xl">{pact.targetPct}%</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-card bg-lavender border border-lavender-deep p-4">
          <p className="text-xs">🔔 <strong>{userName(otherUser(me))}</strong> will be notified — they'll see this pact on next open.</p>
        </section>

        <p className="mt-8 font-display italic text-muted">
          you both fill the jar — <em className="italic text-apeksha">together or not at all.</em>
        </p>
      </div>

      <Link
        to="/dashboard"
        className="block text-center px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition mt-6"
      >
        let's begin
      </Link>
    </div>
  )
}
