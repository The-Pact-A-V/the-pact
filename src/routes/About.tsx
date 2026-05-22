import { Link } from 'react-router-dom'
import { ArrowLeft, Share2, Plus } from 'lucide-react'
import Avatar from '@/components/Avatar'
import { useActivePact, pactDurationDays } from '@/hooks/usePact'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    // @ts-expect-error iOS-only
    window.navigator.standalone === true
  )
}

export default function About() {
  const { pact } = useActivePact()
  const installed = isStandalone()

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center justify-center gap-3 mt-12">
        <Avatar user="apeksha" size="lg" />
        <span className="text-2xl">💜</span>
        <Avatar user="ved" size="lg" />
      </div>

      <h1 className="font-display text-3xl text-ink text-center mt-6">
        Made for <em className="italic text-apeksha">Apeksha</em> &amp; <em className="italic text-ved">Ved</em>
      </h1>

      {/* Install on iPhone */}
      <section className="mt-10 rounded-card bg-white border border-line p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">
          {installed ? '✓ installed on this device' : 'install on iPhone'}
        </p>

        {installed ? (
          <p className="text-sm text-muted">
            you're already running this as a home-screen app. nice.
          </p>
        ) : (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-display text-apeksha shrink-0 w-5">1.</span>
              <span>open this URL in <strong>Safari</strong> on your iPhone</span>
            </li>
            <li className="flex gap-2">
              <span className="font-display text-apeksha shrink-0 w-5">2.</span>
              <span className="flex items-center flex-wrap gap-1">
                tap the share icon <Share2 size={14} className="inline text-muted" /> at the bottom
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-display text-apeksha shrink-0 w-5">3.</span>
              <span className="flex items-center flex-wrap gap-1">
                scroll → tap <Plus size={14} className="inline text-muted" /> <strong>add to home screen</strong>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-display text-apeksha shrink-0 w-5">4.</span>
              <span>name shows as <strong>Pact β</strong> (distinct from v1)</span>
            </li>
          </ol>
        )}
      </section>

      {/* Key dates */}
      <section className="mt-5 rounded-card bg-paper p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">
          key dates
        </p>
        {pact ? (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Pact begins</span><span className="font-medium">{pact.startDate}</span></li>
            <li className="flex justify-between"><span>Pact ends</span><span className="font-medium">{pact.endDate}</span></li>
            <li className="flex justify-between"><span>Duration</span><span className="font-medium">{pactDurationDays(pact)} days</span></li>
            <li className="flex justify-between"><span>Target</span><span className="font-medium">{pact.targetPct}% together</span></li>
          </ul>
        ) : (
          <p className="text-sm text-muted italic font-display">no active pact</p>
        )}
      </section>

      <p className="text-center text-faint text-xs mt-12">v2.0.0 β · the rewrite</p>
    </div>
  )
}
