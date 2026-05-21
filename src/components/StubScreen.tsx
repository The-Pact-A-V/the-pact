import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface StubProps {
  title: string
  eyebrow?: string
  back?: string
  note?: string
  children?: React.ReactNode
}

export default function StubScreen({ title, eyebrow, back, note, children }: StubProps) {
  return (
    <div className="min-h-svh p-6">
      {back !== undefined && (
        <Link
          to={back}
          className="inline-flex items-center gap-1 text-muted text-sm hover:text-ink transition"
        >
          <ArrowLeft size={16} /> back
        </Link>
      )}

      {eyebrow && (
        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl text-ink mt-1">{title}</h1>

      {note ? (
        <p className="text-muted mt-6 italic font-display max-w-sm">{note}</p>
      ) : (
        <p className="text-faint mt-12 italic font-display">soon.</p>
      )}

      {children}
    </div>
  )
}
