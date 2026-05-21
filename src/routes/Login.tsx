import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import type { UserId } from '@/types'

const USERS: Array<{ id: UserId; name: string; last: string; color: string }> = [
  { id: 'apeksha', name: 'Apeksha', last: 'Raina', color: 'bg-lavender text-apeksha' },
  { id: 'ved', name: 'Ved', last: 'Vyapak', color: 'bg-sage text-ved' },
]

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuth((s) => s.setUser)

  function pickUser(id: UserId) {
    setUser(id)
    navigate('/dashboard')
  }

  return (
    <main className="min-h-svh flex flex-col items-center justify-center px-7 py-12 text-center bg-gradient-to-br from-lavender via-sage to-pink">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted mb-3">
        the pact · a & v
      </p>

      <h1 className="font-display text-6xl text-apeksha leading-none tracking-tight mb-2">
        The Pact
      </h1>

      <p className="font-display italic text-base text-muted mb-3">
        Apeksha &amp; Ved
      </p>

      <div className="inline-flex items-center gap-1.5 bg-white rounded-pill px-3.5 py-1.5 text-xs text-apeksha shadow-sm mb-12">
        <span className="w-1.5 h-1.5 rounded-full bg-ved" />
        50 days to change everything
      </div>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-5">
        Who's checking in?
      </p>

      <div className="flex flex-col gap-3.5 w-full max-w-[300px]">
        {USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => pickUser(u.id)}
            className="bg-white rounded-card p-4 flex items-center gap-4 shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5"
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${u.color}`}
            >
              {u.name[0]}
            </span>
            <span className="text-left">
              <span className="block font-medium text-ink">{u.name}</span>
              <span className="block text-xs text-muted">{u.last}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="font-display italic text-sm text-muted mt-12">
        "95% together or it doesn't count." 🌴
      </p>
    </main>
  )
}
