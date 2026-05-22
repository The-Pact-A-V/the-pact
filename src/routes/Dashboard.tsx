import { Link } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import JarSVG from '@/components/JarSVG'
import Avatar from '@/components/Avatar'
import { useAuth, userName } from '@/store/auth'
import { useCombinedProgress } from '@/hooks/useCombinedProgress'
import { useActivePact, dayNumberInPact, daysLeftForPact, pactDurationDays } from '@/hooks/usePact'

export default function Dashboard() {
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const { pact } = useActivePact()
  const progress = useCombinedProgress()

  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            {pact ? `day ${dayNumberInPact(pact)} / ${pactDurationDays(pact)}` : 'no pact yet'}
          </p>
          <h1 className="font-display text-3xl text-ink mt-1">
            good morning, <em className="italic text-apeksha">{userName(user)}</em>
          </h1>
          {pact && (
            <p className="text-xs text-muted mt-0.5">
              {pact.name} · ends {pact.endDate}
            </p>
          )}
        </div>
        <Avatar user={user} />
      </header>

      <div className="flex flex-col items-center mt-6">
        <JarSVG pct={progress.combinedPct} size={200} showLabel />
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-3">together</p>
        <p className="font-display text-2xl text-ink mt-1">
          {progress.combinedPct}
          <span className="text-muted text-base"> / {progress.targetPct}%</span>
        </p>
        <p className="text-sm text-muted">
          {progress.combinedEarned} pts of {progress.combinedPossible}
          {pact && ` · ${daysLeftForPact(pact)} days left`}
        </p>
      </div>

      <section className="mx-6 mt-8 grid grid-cols-2 gap-3">
        <Link
          to="/habits"
          className="rounded-card bg-white shadow-sm p-4 active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-2">
            <Avatar user="apeksha" size="sm" />
            <span className="text-sm font-medium">Apeksha</span>
          </div>
          <p className="font-display text-3xl text-apeksha mt-2">{progress.apekshaPct}%</p>
          <p className="text-xs text-muted">{progress.apekshaEarned} pts earned</p>
        </Link>
        <Link
          to="/habits?peek=true"
          className="rounded-card bg-white shadow-sm p-4 active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-2">
            <Avatar user="ved" size="sm" />
            <span className="text-sm font-medium">Ved</span>
          </div>
          <p className="font-display text-3xl text-ved mt-2">{progress.vedPct}%</p>
          <p className="text-xs text-muted">{progress.vedEarned} pts earned</p>
        </Link>
      </section>

      {progress.combinedPossible === 0 && !progress.loading && (
        <p className="text-center text-muted text-sm mt-8 italic font-display max-w-xs mx-auto">
          add your first habit on the Habits tab — the jar fills as you tick.
        </p>
      )}

      <BottomNav />
    </div>
  )
}
