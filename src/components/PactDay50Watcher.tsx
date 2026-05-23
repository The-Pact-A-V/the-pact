import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useActivePact } from '@/hooks/usePact'
import { useAuth } from '@/store/auth'
import { todayStr } from '@/lib/utils'

const SEEN_PREFIX = 'day50_seen_'
const ROUTES_TO_GUARD = ['/dashboard', '/habits', '/boards', '/settings']
const CEREMONY_ROUTES = ['/pact-day-50', '/pact-day-50-missed', '/pact-wrapped']

// Auto-fires the day-50 ceremony the first time the user opens the app on or
// after pact.endDate. Persisted per pact id so each pact only fires once per
// device. The success-vs-missed branch is decided downstream by PactDay50.
export default function PactDay50Watcher() {
  const me = useAuth((s) => s.user)
  const { pact, loading } = useActivePact()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!me || loading || !pact) return
    // Don't interrupt onboarding / login flows. Only fire when the user is
    // already on a "real" route.
    if (!ROUTES_TO_GUARD.some((r) => location.pathname.startsWith(r))) return
    if (CEREMONY_ROUTES.some((r) => location.pathname.startsWith(r))) return

    if (todayStr() < pact.endDate) return // pact hasn't ended yet

    const seenKey = `${SEEN_PREFIX}${pact.id}`
    if (typeof window !== 'undefined' && localStorage.getItem(seenKey)) return

    localStorage.setItem(seenKey, '1')
    // PactDay50 redirects to PactDay50Missed itself if combined % < target
    navigate('/pact-day-50', { replace: false })
  }, [me, pact, loading, location.pathname, navigate])

  return null
}
