import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/auth'
import { useBuzzes, markBuzzSeen } from '@/hooks/useBuzzes'
import { useBuzzAnim } from '@/store/buzz'
import { usePrefs } from '@/store/prefs'
import { playBuzzChime, vibrate } from '@/lib/sound'

// Watches incoming buzzes for the current user and triggers the
// FloatingHearts overlay when a new one arrives.
export default function BuzzListener() {
  const me = useAuth((s) => s.user)
  const { buzzes } = useBuzzes()
  const trigger = useBuzzAnim((s) => s.trigger)
  const soundOn = usePrefs((s) => s.soundOn)
  const lastShownRef = useRef<number>(Number(localStorage.getItem('buzz_last_shown_at') ?? 0))

  useEffect(() => {
    if (!me) return
    const lastShown = lastShownRef.current
    const newest = buzzes.find((b) => b.toUser === me && b.sentAt > lastShown)
    if (!newest) return
    lastShownRef.current = newest.sentAt
    localStorage.setItem('buzz_last_shown_at', String(newest.sentAt))
    trigger(newest)
    if (soundOn) {
      playBuzzChime()
      vibrate([20, 60, 20])
    }
    if (!newest.seenAt) markBuzzSeen(newest.id).catch(() => {})
  }, [buzzes, me, trigger, soundOn])

  return null
}
