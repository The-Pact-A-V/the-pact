import { Link } from 'react-router-dom'
import { MessageCircle, ChevronRight } from 'lucide-react'
import { useAuth, userName } from '@/store/auth'
import { usePactChat, getPactChatLastSeen } from '@/hooks/usePactChat'
import Avatar from './Avatar'
import { cn } from '@/lib/utils'

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PactChatCard() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { messages } = usePactChat()
  const lastSeen = getPactChatLastSeen()

  const latest = messages.length > 0 ? messages[messages.length - 1] : null
  const unreadCount = messages.filter((m) => m.userId !== me && m.createdAt > lastSeen).length

  return (
    <Link
      to="/chat"
      className="mx-6 mt-6 rounded-card bg-white shadow-sm border border-line p-4 flex items-center gap-3 active:scale-[0.99] transition"
    >
      {latest ? (
        <>
          <Avatar user={latest.userId} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium">{userName(latest.userId)}</p>
              <span className="text-[10px] text-faint">· {timeAgo(latest.createdAt)}</span>
            </div>
            <p className="text-sm text-ink-soft truncate italic font-display">{latest.text}</p>
          </div>
        </>
      ) : (
        <>
          <span className="w-10 h-10 rounded-full bg-lavender flex items-center justify-center">
            <MessageCircle size={18} className="text-apeksha" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">notes between you</p>
            <p className="text-sm text-muted italic font-display">say something to each other →</p>
          </div>
        </>
      )}
      {unreadCount > 0 && (
        <span className={cn(
          'rounded-pill bg-coral text-white text-[10px] font-medium px-2 py-0.5 shrink-0'
        )}>
          {unreadCount} new
        </span>
      )}
      <ChevronRight size={14} className="text-muted shrink-0" />
    </Link>
  )
}
