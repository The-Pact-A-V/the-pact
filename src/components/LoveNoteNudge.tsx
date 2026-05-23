import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useLoveNotes, isDeliverable } from '@/hooks/useLoveNotes'
import { todayStr } from '@/lib/utils'

export default function LoveNoteNudge() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { notes, loading } = useLoveNotes()
  if (loading) return null

  const unread = notes.filter(
    (n) => n.toUser === me && isDeliverable(n, todayStr()) && !n.openedAt
  )
  if (unread.length === 0) return null

  return (
    <Link
      to="/letters"
      className="mx-6 mt-6 rounded-card bg-gradient-to-br from-rose/30 to-pink border border-rose p-4 flex items-center gap-3 active:scale-[0.99] transition"
    >
      <span className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0">
        <Mail size={18} className="text-material" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-material">
          {unread.length === 1 ? 'a letter for you' : `${unread.length} letters for you`}
        </p>
        <p className="text-sm italic font-display text-ink">tap to open →</p>
      </div>
    </Link>
  )
}
