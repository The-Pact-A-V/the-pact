import { Navigate } from 'react-router-dom'
import { useActivePact, hasJoined } from '@/hooks/usePact'
import { useAuth } from '@/store/auth'

function Loading() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-cream">
      <p className="font-display italic text-muted">loading…</p>
    </div>
  )
}

// Requires that there's an active pact AND the current user has joined it.
// Otherwise routes to /onboarding or /pact-joining.
export default function RequirePact({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user)
  const { pact, loading } = useActivePact()

  if (!user) return <Navigate to="/" replace />
  if (loading) return <Loading />
  if (!pact) return <Navigate to="/onboarding" replace />
  if (!hasJoined(pact, user)) return <Navigate to="/pact-joining" replace />
  return <>{children}</>
}
