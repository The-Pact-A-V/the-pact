import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useAuth, userName } from '@/store/auth'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import { useBoardItem, deleteBoardItem, useReactions, toggleReaction } from '@/hooks/useBoardItems'
import Avatar from '@/components/Avatar'
import LinkPreview, { type LinkContent } from '@/components/LinkPreview'
import { cn } from '@/lib/utils'
import type { BoardItem, UserId } from '@/types'

interface NoteContent { text: string; color?: string; emoji?: string }
interface PhotoContent { url: string; caption?: string }
interface VoiceContent { audioUrl: string; durationSeconds?: number; caption?: string }

const REACTION_PICKS = ['💜', '🔥', '😍', '🌊', '✨', '🥹']

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function ItemContent({ item }: { item: BoardItem }) {
  switch (item.type) {
    case 'note': {
      const c = item.content as unknown as NoteContent
      const bg = c.color === 'butter' ? 'bg-butter'
        : c.color === 'pink' ? 'bg-pink'
        : c.color === 'sage' ? 'bg-sage'
        : c.color === 'peach' ? 'bg-peach'
        : 'bg-lavender'
      return (
        <div className={cn('rounded-hero p-7', bg)}>
          {c.emoji && <span className="text-4xl block mb-3">{c.emoji}</span>}
          <p className="font-display italic text-2xl text-ink leading-snug">{c.text}</p>
        </div>
      )
    }
    case 'photo': {
      const c = item.content as unknown as PhotoContent
      return (
        <div className="rounded-hero overflow-hidden bg-white">
          <img src={c.url} alt={c.caption ?? ''} className="w-full block" />
          {c.caption && <p className="p-4 text-sm font-display italic text-muted">{c.caption}</p>}
        </div>
      )
    }
    case 'link': {
      const c = item.content as unknown as LinkContent
      return <LinkPreview content={c} variant="detail" />
    }
    case 'voice': {
      const c = item.content as unknown as VoiceContent
      return (
        <div className="rounded-hero bg-sage p-6">
          <p className="font-display italic text-ink">voice note · {c.durationSeconds ?? '?'}s</p>
          {c.caption && <p className="text-sm mt-2">{c.caption}</p>}
        </div>
      )
    }
    default:
      return <p className="text-muted">unknown pin type</p>
  }
}

export default function ItemDetail() {
  const { boardId, id } = useParams<{ boardId: string; id: string }>()
  const navigate = useNavigate()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { board } = useBoard(boardId ?? null)
  const { item, loading } = useBoardItem(boardId ?? null, id ?? null)
  const reactions = useReactions(boardId ?? null, id ?? null)

  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  if (!item || !boardId || !id) return <Navigate to="/boards" replace />

  async function handleReact(emoji: string) {
    await toggleReaction(boardId!, id!, me as UserId, emoji).catch(console.warn)
  }

  async function handleDelete() {
    if (!confirm('delete this pin?')) return
    await deleteBoardItem(boardId!, id!)
    navigate(`/board/${boardId}`)
  }

  // Group reactions by emoji
  const byEmoji: Record<string, UserId[]> = {}
  for (const r of reactions) {
    if (!byEmoji[r.emoji]) byEmoji[r.emoji] = []
    byEmoji[r.emoji].push(r.userId)
  }
  const myEmojis = new Set(reactions.filter((r) => r.userId === me).map((r) => r.emoji))

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to={`/board/${boardId}`} className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      {/* Pinned-by chip */}
      <div className="mt-6 flex items-center gap-2">
        <Avatar user={item.addedBy} size="sm" />
        <span className="text-xs text-muted">
          <span className="font-medium text-ink">{userName(item.addedBy)}</span> pinned · {timeAgo(item.addedAt)}
        </span>
        {board && (
          <span
            className={cn(
              'rounded-pill bg-gradient-to-br px-2 py-0.5 text-[10px] flex items-center gap-1 ml-auto',
              gradientClasses(board.coverColor)
            )}
          >
            <span>{board.emoji}</span>
            <span>{board.name}</span>
          </span>
        )}
      </div>

      <div className="mt-5">
        <ItemContent item={item} />
      </div>

      {/* Existing reactions */}
      {Object.keys(byEmoji).length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {Object.entries(byEmoji).map(([emoji, users]) => {
            const mine = myEmojis.has(emoji)
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={cn(
                  'rounded-pill px-3 py-1 text-xs flex items-center gap-1.5 border transition active:scale-95',
                  mine ? 'bg-lavender border-apeksha text-apeksha' : 'bg-white border-line text-ink hover:border-line-strong'
                )}
              >
                <span>{emoji}</span>
                <span className="font-medium">{users.length}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Reaction picker */}
      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">react</p>
        <div className="flex gap-2">
          {REACTION_PICKS.map((e) => {
            const active = myEmojis.has(e)
            return (
              <button
                key={e}
                onClick={() => handleReact(e)}
                className={cn(
                  'aspect-square w-11 rounded-card text-xl border-2 transition active:scale-95',
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white hover:border-line-strong'
                )}
              >
                {e}
              </button>
            )
          })}
        </div>
      </div>

      {/* Danger */}
      <button
        onClick={handleDelete}
        className="w-full mt-10 px-4 py-3 rounded-pill bg-white text-material border border-line flex items-center justify-center gap-2 hover:bg-paper transition"
      >
        <Trash2 size={16} /> delete pin
      </button>
    </div>
  )
}
