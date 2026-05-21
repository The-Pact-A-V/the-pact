import { Link } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import JarSVG from '@/components/JarSVG'

export default function DashboardEmpty() {
  return (
    <div className="min-h-svh pb-24">
      <header className="px-6 pt-8 pb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">day 1 / 50</p>
        <h1 className="font-display text-4xl text-ink mt-1">Welcome — let's begin</h1>
      </header>

      <div className="flex justify-center mt-4">
        <JarSVG pct={5} size={200} />
      </div>

      <section className="mx-6 mt-6 rounded-hero bg-white shadow-sm p-6 text-center">
        <p className="font-display text-3xl text-ink">0 / 95%</p>
        <p className="text-sm text-muted mt-1">0 pts earned · A 0 · V 0</p>
      </section>

      <Link
        to="/habits-empty"
        className="block mx-6 mt-8 text-center px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
      >
        + add your first habit
      </Link>

      <BottomNav />
    </div>
  )
}
