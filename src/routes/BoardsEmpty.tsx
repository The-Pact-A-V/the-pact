import { Link } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'

export default function BoardsEmpty() {
  return (
    <div className="min-h-svh pb-24 px-6 pt-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">boards</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-8">No boards yet</h1>
      <p className="text-muted text-center font-display italic mb-8">
        boards are where you collect the things you're working toward.
      </p>
      <Link
        to="/board-new"
        className="block text-center px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
      >
        create your first board
      </Link>
      <BottomNav />
    </div>
  )
}
