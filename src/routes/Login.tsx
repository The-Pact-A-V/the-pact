import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { useActivePact, hasJoined } from '@/hooks/usePact'
import { claimIdentity } from '@/hooks/useFirebaseAuthBoot'
import type { UserId } from '@/types'

const USERS: Array<{ id: UserId; name: string; last: string; color: string }> = [
  { id: 'apeksha', name: 'Apeksha', last: 'Raina', color: 'bg-lavender text-apeksha' },
  { id: 'ved', name: 'Ved', last: 'Vyapak', color: 'bg-sage text-ved' },
]

export default function Login() {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const [picked, setPicked] = useState<UserId | null>(user)
  const [error, setError] = useState<string | null>(null)
  const { pact, loading } = useActivePact()

  // If we already know who you are AND pact state has loaded, route on.
  useEffect(() => {
    if (!user || loading) return
    if (!pact) navigate('/onboarding', { replace: true })
    else if (!hasJoined(pact, user)) navigate('/pact-joining', { replace: true })
    else navigate('/dashboard', { replace: true })
  }, [user, pact, loading, navigate])

  async function pickUser(id: UserId) {
    setPicked(id)
    setError(null)
    try {
      await claimIdentity(id)
      // AuthBoot subscribes to /uid_map/{uid} and will populate useAuth.user;
      // the useEffect above takes over and routes us forward.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'sign-in failed')
      setPicked(null)
    }
  }

  return (
    <main className="min-h-svh flex flex-col items-center justify-center px-7 py-12 text-center bg-gradient-to-br from-lavender via-sage to-pink">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted mb-3">the pact · a & v</p>
      <h1 className="font-display text-6xl text-apeksha leading-none tracking-tight mb-2">The Pact</h1>
      <p className="font-display italic text-base text-muted mb-12">Apeksha &amp; Ved</p>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-5">
        {picked ? 'signing you in…' : "who's checking in?"}
      </p>

      <div className="flex flex-col gap-3.5 w-full max-w-[300px]">
        {USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => pickUser(u.id)}
            disabled={!!picked}
            className="bg-white rounded-card p-4 flex items-center gap-4 shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${u.color}`}>
              {u.name[0]}
            </span>
            <span className="text-left">
              <span className="block font-medium text-ink">{u.name}</span>
              <span className="block text-xs text-muted">{u.last}</span>
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-material text-xs mt-6 max-w-xs">⚠️ {error}</p>
      )}

      <p className="font-display italic text-sm text-muted mt-12">
        "95% together or it doesn't count." 🌴
      </p>
    </main>
  )
}
