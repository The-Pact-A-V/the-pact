import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/auth'
import { useBuzzes, markBuzzSeen } from '@/hooks/useBuzzes'
import { useBuzzAnim } from '@/store/buzz'

// Watches incoming buzzes for the current user and triggers the
// FloatingHearts overlay when a new one arrives.
export default function BuzzListener() {
  const me = useAuth((s) => s.user)
  const { buzzes } = useBuzzes()
  const trigger = useBuzzAnim((s) => s.trigger)
  const lastShownRef = useRef<number>(Number(localStorage.getItem('buzz_last_shown_at') ?? 0))

  useEffect(() => {
    if (!me) return
    const lastShown = lastShownRef.current
    // newest first (already sorted desc); pick the first one addressed to me, after lastShown
    const newest = buzzes.find((b) => b.toUser === me && b.sentAt > lastShown)
    if (!newest) return
    lastShownRef.current = newest.sentAt
    localStorage.setItem('buzz_last_shown_at', String(newest.sentAt))
    trigger(newest)
    if (!newest.seenAt) markBuzzSeen(newest.id).catch(() => {})
  }, [buzzes, me, trigger])

  return null
}
