import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import JarSVG from '@/components/JarSVG'
import Avatar from '@/components/Avatar'
import MemoryCard from '@/components/MemoryCard'
import { useAuth, userName } from '@/store/auth'
import { useCombinedProgress } from '@/hooks/useCombinedProgress'
import { useActivePact, dayNumberInPact, daysLeftForPact, pactDurationDays } from '@/hooks/usePact'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import { useActivities } from '@/hooks/useActivities'
import { useDailyLogs, isTicked } from '@/hooks/useDailyLogs'
import { CATEGORIES } from '@/lib/constants'
import { isScheduledOn } from '@/lib/frequency'
import { todayStr, parseDate, cn } from '@/lib/utils'
import type { Category } from '@/types'

const CAT_TINT: Record<Category, string> = {
  mental: 'bg-lavender',
  physical: 'bg-sage',
  spiritual: 'bg-peach',
  material: 'bg-pink',
}
const CAT_INK: Record<Category, string> = {
  mental: 'text-mental',
  physical: 'text-physical',
  spiritual: 'text-spiritual',
  material: 'text-material',
}

export default function Dashboard() {
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const { pact } = useActivePact()
  const { board: rewardBoard } = useBoard(pact?.rewardBoardId ?? null)
  const progress = useCombinedProgress()
  const { activities } = useActivities(user)
  const { logs } = useDailyLogs(user)
  const today = todayStr()
  const todayDate = parseDate(today)

  function categoryProgress(cat: Category) {
    const acts = activities.filter(
      (a) => a.category === cat && isScheduledOn(a.frequency, todayDate)
    )
    const possible = acts.reduce((s, a) => s + a.points, 0)
    const earned = acts.reduce((s, a) => s + (isTicked(logs, today, a.id) ? a.points : 0), 0)
    return { possible, earned, count: acts.length }
  }

  const dow = todayDate.getDay()
  const showSundayBanner = dow === 0 || dow === 1 // Sun or Mon

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

      {showSundayBanner && (
        <Link
          to="/weekly-review"
          className="mx-6 mt-3 rounded-card bg-pink border border-pink-deep p-3 flex items-center gap-2 active:scale-[0.99] transition"
        >
          <Calendar size={16} className="text-material shrink-0" />
          <span className="text-sm flex-1">
            <span className="font-medium">{dow === 0 ? 'sunday' : 'monday'}</span>
            <span className="text-muted"> · your weekly review is ready</span>
          </span>
          <span className="text-xs text-material font-medium">view →</span>
        </Link>
      )}

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

        {pact && pact.rewardBoardId && rewardBoard ? (
          <Link
            to={`/board/${rewardBoard.id}`}
            className={cn(
              'mt-3 rounded-pill bg-gradient-to-br px-4 py-2 flex items-center gap-2 shadow-sm active:scale-[0.97] transition',
              gradientClasses(rewardBoard.coverColor)
            )}
          >
            <span className="text-base">{rewardBoard.emoji}</span>
            <span className="text-sm font-medium">
              unlocks <em className="italic">{rewardBoard.name}</em>
            </span>
          </Link>
        ) : pact && pact.rewardBoardId && !rewardBoard ? (
          <span className="mt-3 rounded-pill bg-paper px-4 py-1.5 text-xs text-faint">
            loading reward…
          </span>
        ) : pact ? (
          <Link
            to="/pact-edit"
            className="mt-3 rounded-pill bg-paper border border-dashed border-line-strong px-4 py-1.5 text-xs text-muted hover:text-ink transition"
          >
            🎁 pick a reward board →
          </Link>
        ) : null}
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

      <MemoryCard />

      {activities.length > 0 && (
        <section className="mx-6 mt-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2.5">
            today · by category
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(CATEGORIES) as Category[]).map((cat) => {
              const { earned, possible, count } = categoryProgress(cat)
              const pct = possible > 0 ? Math.round((earned / possible) * 100) : 0
              const done = possible > 0 && earned === possible
              return (
                <Link
                  key={cat}
                  to="/habits"
                  className="rounded-card bg-white shadow-sm p-3.5 active:scale-[0.98] transition flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('w-7 h-7 rounded-full flex items-center justify-center', CAT_TINT[cat])}>
                      <span className="text-sm">{CATEGORIES[cat].emoji}</span>
                    </span>
                    <span className="text-sm font-medium">{CATEGORIES[cat].label}</span>
                    {done && <span className="text-physical text-xs ml-auto">✓</span>}
                  </div>
                  {count === 0 ? (
                    <p className="text-xs text-faint mt-1">no habits today</p>
                  ) : (
                    <>
                      <p className="text-xs text-muted">
                        <span className={cn('font-display text-base', CAT_INK[cat])}>{earned}</span>
                        <span className="text-faint"> / {possible} pts</span>
                      </p>
                      <div className="h-1.5 rounded-pill bg-paper overflow-hidden mt-1">
                        <div
                          className={cn('h-full transition-all', CAT_TINT[cat])}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  )
}
