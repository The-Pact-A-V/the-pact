import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useActivePact, joinActivePact, pactDurationDays, hasJoined } from '@/hooks/usePact'
import { useAuth, otherUser, userName } from '@/store/auth'
import Avatar from '@/components/Avatar'

export default function PactJoining() {
  const me = useAuth((s) => s.user)
  const navigate = useNavigate()
  const { pact, loading } = useActivePact()
  const [joining, setJoining] = useState(false)

  if (!me) return <Navigate to="/" replace />
  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  if (!pact) return <Navigate to="/onboarding" replace />
  if (hasJoined(pact, me)) return <Navigate to="/dashboard" replace />

  const partnerName = userName(otherUser(me))

  async function handleJoin() {
    if (!me) return
    setJoining(true)
    try {
      await joinActivePact(me)
      navigate('/dashboard')
    } catch (err) {
      console.warn(err)
      setJoining(false)
    }
  }

  return (
    <div className="min-h-svh p-6 pb-12 flex flex-col bg-gradient-to-br from-sage/30 to-cream">
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted">a pact is waiting</p>
        <h1 className="font-display text-4xl text-ink mt-1 mb-2 leading-tight">
          <em className="italic text-apeksha">{partnerName}</em> is waiting for you
        </h1>
        <p className="text-muted font-display italic">they made a pact. it isn't real until you say yes.</p>

        <section className="mt-8 rounded-hero bg-white shadow-sm border border-line p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar user={pact.createdBy} size="md" />
            <div>
              <p className="text-xs text-muted">set up by</p>
              <p className="font-medium">{userName(pact.createdBy)}</p>
            </div>
          </div>

          <div className="space-y-3">
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
          </div>
        </section>

        <p className="mt-8 font-display italic text-muted text-center">
          you both fill the jar — <em className="italic text-apeksha">together or not at all.</em>
        </p>
      </div>

      <button
        onClick={handleJoin}
        disabled={joining}
        className="px-4 py-3.5 rounded-pill bg-ved text-white font-medium shadow-md shadow-ved/30 active:scale-[0.98] transition disabled:opacity-50 mt-6"
      >
        {joining ? 'joining…' : "i'm in · let's begin"}
      </button>

      <button
        onClick={() => navigate('/pact-edit')}
        className="px-4 py-3 text-sm text-muted hover:text-ink transition mt-3"
      >
        something off? <em className="italic">suggest a change</em>
      </button>
    </div>
  )
}
