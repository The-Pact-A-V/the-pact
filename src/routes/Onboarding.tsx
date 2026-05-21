import { Link } from 'react-router-dom'
import JarSVG from '@/components/JarSVG'

export default function Onboarding() {
  return (
    <div className="min-h-svh px-7 py-12 flex flex-col items-center text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted mb-3">
        how it works
      </p>
      <h1 className="font-display text-4xl text-ink mb-8 leading-tight">
        a pact <em className="italic text-apeksha">in three parts</em>
      </h1>

      <JarSVG pct={28} size={180} />

      <ol className="mt-10 space-y-5 max-w-sm text-left">
        <li className="flex gap-4">
          <span className="font-display text-2xl text-apeksha">1.</span>
          <div>
            <p className="font-medium text-ink">Pick a window together</p>
            <p className="text-sm text-muted">30 days, 50 days, 100 days — your call.</p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="font-display text-2xl text-apeksha">2.</span>
          <div>
            <p className="font-medium text-ink">Agree on a target + reward</p>
            <p className="text-sm text-muted">A combined %, a trip or ritual to unlock.</p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="font-display text-2xl text-apeksha">3.</span>
          <div>
            <p className="font-medium text-ink">Log habits daily — the jar fills</p>
            <p className="text-sm text-muted">Every check-in is a drop.</p>
          </div>
        </li>
      </ol>

      <Link
        to="/notif-permission"
        className="mt-12 px-8 py-3.5 rounded-pill bg-coral text-white font-medium shadow-lg shadow-coral/30 active:scale-[0.98] transition"
      >
        create your pact
      </Link>
    </div>
  )
}
