import { Link } from 'react-router-dom'
import { ChevronRight, NotebookPen } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useJournalEntry } from '@/hooks/useJournal'
import { todayStr } from '@/lib/utils'

export default function JournalCard() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { entry, loading } = useJournalEntry(me, todayStr())
  if (loading) return null

  const hasEntry = !!entry?.text || !!entry?.photoUrl

  return (
    <Link
      to="/journal"
      className="mx-6 mt-6 rounded-card bg-white border border-line shadow-sm p-4 flex items-center gap-3 active:scale-[0.99] transition"
    >
      <span className="w-10 h-10 rounded-full bg-butter flex items-center justify-center shrink-0">
        <NotebookPen size={18} className="text-spiritual" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">today's journal</p>
        {hasEntry && entry?.text ? (
          <p className="text-sm italic font-display text-ink truncate">{entry.text}</p>
        ) : hasEntry ? (
          <p className="text-sm italic font-display text-muted">photo saved · add a line?</p>
        ) : (
          <p className="text-sm italic font-display text-muted">a sentence is enough.</p>
        )}
      </div>
      <ChevronRight size={14} className="text-muted shrink-0" />
    </Link>
  )
}
