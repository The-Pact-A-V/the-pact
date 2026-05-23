import { useNavigate } from 'react-router-dom'
import { Bell, Heart, Sun, Calendar } from 'lucide-react'
import { useActivePact } from '@/hooks/usePact'

export default function NotifPermission() {
  const navigate = useNavigate()
  const { pact } = useActivePact()

  // Onboarding flow (no pact yet) → step forward to creating one.
  // Otherwise (dev preview / settings re-entry) → return to where the user came from.
  const next = pact ? '/settings' : '/pact-new'

  async function requestAndContinue() {
    if (typeof Notification !== 'undefined') {
      try {
        await Notification.requestPermission()
      } catch {
        // ignore
      }
    }
    navigate(next)
  }

  function skip() {
    navigate(next)
  }

  return (
    <div className="min-h-svh p-7 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-lavender flex items-center justify-center mt-12 mb-6">
        <Bell className="text-apeksha" size={28} />
      </div>

      <p className="text-[11px] uppercase tracking-[0.3em] text-muted mb-3">stay in sync</p>
      <h1 className="font-display text-3xl text-ink mb-8 leading-tight max-w-xs">
        we'll only ping you for <em className="italic text-apeksha">the moments that matter</em>
      </h1>

      <ul className="space-y-4 w-full max-w-sm text-left">
        <li className="flex items-start gap-3">
          <Heart size={18} className="text-rose mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Buzzes from your partner</p>
            <p className="text-xs text-muted">when they tap the heart to say hi</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Sun size={18} className="text-spiritual mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Morning check-in</p>
            <p className="text-xs text-muted">one gentle nudge before the day starts</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Calendar size={18} className="text-physical mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Sunday review</p>
            <p className="text-xs text-muted">your weekly recap</p>
          </div>
        </li>
      </ul>

      <p className="text-[11px] text-faint italic font-display mt-6 max-w-xs">
        we'll never send marketing. only these three. change anytime in settings.
      </p>

      {pact && (
        <p className="text-[10px] text-material/70 italic font-display mt-3 max-w-xs">
          ⚠️ iOS push delivery is not yet wired — these toggles currently only
          control the in-app chime + banner while the app is open.
        </p>
      )}

      <div className="mt-auto w-full max-w-sm pt-12 space-y-3">
        <button
          onClick={requestAndContinue}
          className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
        >
          allow notifications
        </button>
        <button
          onClick={skip}
          className="w-full px-4 py-3 text-sm text-muted hover:text-ink transition"
        >
          not now · turn on later
        </button>
      </div>
    </div>
  )
}
