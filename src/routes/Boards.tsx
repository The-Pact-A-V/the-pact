import { Link } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import { useBoards, gradientClasses } from '@/hooks/useBoards'
import { cn } from '@/lib/utils'

export default function Boards() {
  const { boards, loading } = useBoards()

  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">boards</p>
          <h1 className="font-display text-4xl text-ink mt-1">Yours</h1>
          {!loading && (
            <p className="text-xs text-muted mt-1">
              {boards.length} {boards.length === 1 ? 'board' : 'boards'} · shared with each other
            </p>
          )}
        </div>
        <Link
          to="/board-new"
          className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center text-2xl shadow-md shadow-coral/30 active:scale-95 transition"
          aria-label="New board"
        >
          +
        </Link>
      </header>

      {!loading && boards.length === 0 && (
        <div className="mx-6 mt-6 text-center">
          <p className="font-display italic text-muted mb-6">
            no boards yet. boards are what you're working toward.
          </p>
          <Link
            to="/board-new"
            className="inline-block px-6 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
          >
            create your first board
          </Link>
        </div>
      )}

      {boards.length > 0 && (
        <div className="mx-6 grid grid-cols-2 gap-3">
          {boards.map((b) => (
            <Link
              key={b.id}
              to={`/board/${b.id}`}
              className={cn(
                'rounded-hero bg-gradient-to-br p-5 shadow-sm h-36 flex flex-col justify-between active:scale-[0.98] transition',
                gradientClasses(b.coverColor)
              )}
            >
              <span className="text-3xl">{b.emoji}</span>
              <span className="font-medium text-ink truncate">{b.name}</span>
            </Link>
          ))}
          <Link
            to="/board-new"
            className="rounded-hero border-2 border-dashed border-line-strong h-36 flex items-center justify-center text-muted text-sm hover:text-ink hover:border-ink/30 transition"
          >
            + new board
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
