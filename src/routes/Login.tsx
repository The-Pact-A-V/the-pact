import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useActivePact, hasJoined, dayNumberInPact, pactDurationDays } from '@/hooks/usePact'
import { claimIdentity } from '@/hooks/useFirebaseAuthBoot'
import { cn } from '@/lib/utils'
import type { UserId } from '@/types'

interface UserCard {
  id: UserId
  name: string
  sub: string
  cardBorder: string
  avatar: string
  arrow: string
}

const USERS: UserCard[] = [
  {
    id: 'apeksha',
    name: 'Apeksha',
    sub: 'her path · lavender',
    cardBorder: 'border-lavender-deep',
    avatar: 'bg-lavender text-apeksha',
    arrow: 'bg-apeksha text-cream',
  },
  {
    id: 'ved',
    name: 'Ved',
    sub: 'his path · sage',
    cardBorder: 'border-sage-deep',
    avatar: 'bg-sage text-ved',
    arrow: 'bg-ved text-cream',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const [picked, setPicked] = useState<UserId | null>(user)
  const [error, setError] = useState<string | null>(null)
  const { pact, loading } = useActivePact()

  // Smart routing once we know the user + pact state
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'sign-in failed')
      setPicked(null)
    }
  }

  const dayPillLabel = pact
    ? `${pact.startDate.slice(5).replace('-', '/')} · day ${dayNumberInPact(pact)} of ${pactDurationDays(pact)}`
    : 'a fresh pact awaits'

  return (
    <main className="min-h-svh flex flex-col bg-cream">
      {/* Hero band */}
      <div
        className="h-[280px] flex-shrink-0 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(/couple-beach.png)',
          backgroundPosition: 'center 32%',
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[70px]"
          style={{ background: 'linear-gradient(180deg, transparent 0%, var(--color-cream) 100%)' }}
        />
      </div>

      <div className="flex-1 px-6 pt-3.5 pb-7 flex flex-col">
        <div className="text-center mb-5">
          <span className="inline-block text-[9px] tracking-[0.2em] uppercase font-bold text-coral bg-peach rounded-pill px-3 py-1.5 mb-2.5">
            {dayPillLabel}
          </span>
          <h1 className="font-display font-semibold text-[38px] leading-none tracking-tight text-ink mb-1.5">
            the <em className="italic text-coral font-medium">pact</em>
          </h1>
          <p className="font-display italic text-sm text-muted">
            "95% together or it doesn't count."
          </p>
        </div>

        <div className="flex flex-col gap-2.5 mb-4">
          {USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => pickUser(u.id)}
              disabled={!!picked}
              className={cn(
                'bg-surface rounded-[20px] border-[1.6px] p-3.5 flex items-center gap-3.5 transition active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50',
                u.cardBorder
              )}
            >
              <span
                className={cn(
                  'w-[54px] h-[54px] rounded-full flex items-center justify-center font-display italic font-semibold text-[26px] shrink-0',
                  u.avatar
                )}
              >
                {u.name[0]}
              </span>
              <span className="flex-1 text-left">
                <span className="block font-display font-semibold text-[21px] leading-tight tracking-tight text-ink">
                  {u.name}
                </span>
                <span className="block font-display italic text-xs text-muted">{u.sub}</span>
              </span>
              <span
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  u.arrow
                )}
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-material text-xs text-center mb-2">⚠️ {error}</p>
        )}

        {picked && !error && (
          <p className="text-center text-xs text-muted italic font-display mb-2">
            signing you in…
          </p>
        )}

        <p className="mt-auto text-center font-display italic text-[11px] text-faint">
          made for A &amp; V
          <span className="inline-block w-[3px] h-[3px] bg-coral rounded-full mx-1.5 align-middle" />
          {pact ? `${pact.startDate} → ${pact.endDate}` : 'create your pact next'}
        </p>
      </div>
    </main>
  )
}
