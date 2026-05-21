import { Link } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import { CATEGORIES, DIFFICULTY_TIERS } from '@/lib/constants'

export default function Habits() {
  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">habits</p>
          <h1 className="font-display text-4xl text-ink mt-1">Today</h1>
        </div>
        <Link
          to="/add-habit"
          className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center text-2xl shadow-md shadow-coral/30 active:scale-95 transition"
          aria-label="Add habit"
        >
          +
        </Link>
      </header>

      <div className="mx-6 grid grid-cols-2 gap-3">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <div key={key} className="rounded-card bg-white shadow-sm p-4">
            <p className="text-2xl">{cat.emoji}</p>
            <p className="text-sm font-medium mt-1">{cat.label}</p>
            <p className="text-xs text-muted">no habits yet</p>
          </div>
        ))}
      </div>

      <section className="mx-6 mt-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">
          difficulty tiers
        </p>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_TIERS.map((t) => (
            <span
              key={t.points}
              className="rounded-pill bg-paper px-3 py-1.5 text-xs flex items-center gap-1.5"
            >
              <span>{t.emoji}</span>
              <span className="text-muted">{t.label}</span>
              <span className="font-medium text-ink">+{t.points}</span>
            </span>
          ))}
        </div>
      </section>

      <nav className="mx-6 mt-8 flex flex-col gap-2 text-sm">
        <Link to="/habits-empty" className="text-muted hover:text-ink">→ habits empty state</Link>
        <Link to="/habits-peek" className="text-muted hover:text-ink">→ peek partner</Link>
        <Link to="/habits-past" className="text-muted hover:text-ink">→ backfill past day</Link>
      </nav>

      <BottomNav />
    </div>
  )
}
