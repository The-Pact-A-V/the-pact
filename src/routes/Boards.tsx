import { Link } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'

const SAMPLE_BOARDS = [
  { id: 'goa', emoji: '🌴', name: 'Goa · July 13', tint: 'from-butter to-peach' },
  { id: 'home', emoji: '🏡', name: 'Home setup', tint: 'from-sage to-lavender' },
  { id: 'dates', emoji: '💭', name: 'Date ideas', tint: 'from-pink to-lavender' },
]

export default function Boards() {
  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">boards</p>
          <h1 className="font-display text-4xl text-ink mt-1">Yours</h1>
        </div>
        <Link
          to="/board-new"
          className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center text-2xl shadow-md shadow-coral/30 active:scale-95 transition"
          aria-label="New board"
        >
          +
        </Link>
      </header>

      <div className="mx-6 grid grid-cols-2 gap-3">
        {SAMPLE_BOARDS.map((b) => (
          <Link
            key={b.id}
            to={`/board/${b.id}`}
            className={`rounded-hero bg-gradient-to-br ${b.tint} p-5 shadow-sm h-32 flex flex-col justify-between active:scale-[0.98] transition`}
          >
            <span className="text-3xl">{b.emoji}</span>
            <span className="font-medium text-ink">{b.name}</span>
          </Link>
        ))}
        <Link
          to="/board-new"
          className="rounded-hero border-2 border-dashed border-line-strong h-32 flex items-center justify-center text-muted text-sm hover:text-ink transition"
        >
          + new board
        </Link>
      </div>

      <nav className="mx-6 mt-8 flex flex-col gap-2 text-sm">
        <Link to="/boards-empty" className="text-muted hover:text-ink">→ boards empty state</Link>
      </nav>

      <BottomNav />
    </div>
  )
}
