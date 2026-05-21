import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Avatar from '@/components/Avatar'

export default function About() {
  return (
    <div className="min-h-svh p-6">
      <Link
        to="/settings"
        className="inline-flex items-center gap-1 text-muted text-sm hover:text-ink transition"
      >
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center justify-center gap-3 mt-12">
        <Avatar user="apeksha" size="lg" />
        <span className="text-2xl">💜</span>
        <Avatar user="ved" size="lg" />
      </div>

      <h1 className="font-display text-3xl text-ink text-center mt-6">
        Made for <em className="italic text-apeksha">Apeksha</em> & <em className="italic text-ved">Ved</em>
      </h1>

      <section className="mx-auto max-w-sm mt-12 rounded-card bg-paper p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">
          key dates
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between"><span>Pact begins</span><span className="font-medium">May 16, 2026</span></li>
          <li className="flex justify-between"><span>Pact ends</span><span className="font-medium">Jul 5, 2026</span></li>
          <li className="flex justify-between"><span>Trip</span><span className="font-medium">Jul 13–19, 2026</span></li>
        </ul>
      </section>

      <p className="text-center text-faint text-xs mt-12">v2.0.0 · skeleton</p>
    </div>
  )
}
