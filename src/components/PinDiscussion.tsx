import { useRef, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import {
  usePinComments,
  addPinComment,
  deletePinComment,
  type PinComment,
} from '@/hooks/useBoardItems'
import { useAuth, userName } from '@/store/auth'
import Avatar from './Avatar'
import { cn } from '@/lib/utils'

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CommentRow({
  comment,
  me,
  onDelete,
}: {
  comment: PinComment
  me: ReturnType<typeof useAuth.getState>['user']
  onDelete: () => void
}) {
  const mine = comment.userId === me
  return (
    <div className={cn('flex gap-2.5', mine && 'flex-row-reverse')}>
      <Avatar user={comment.userId} size="sm" />
      <div className={cn('flex-1 min-w-0 max-w-[80%]', mine && 'flex flex-col items-end')}>
        <div className="flex items-baseline gap-2 text-[10px] text-muted mb-0.5">
          <span className="font-medium">{userName(comment.userId)}</span>
          <span className="text-faint">·</span>
          <span className="text-faint">{timeAgo(comment.createdAt)}</span>
          {mine && (
            <button
              onClick={onDelete}
              className="text-faint hover:text-material transition ml-1"
              aria-label="Delete comment"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
        <div
          className={cn(
            'rounded-card px-3 py-2 text-sm leading-snug break-words',
            mine ? 'bg-lavender text-ink' : 'bg-white border border-line text-ink'
          )}
        >
          {comment.text}
        </div>
      </div>
    </div>
  )
}

interface Props {
  boardId: string
  itemId: string
}

export default function PinDiscussion({ boardId, itemId }: Props) {
  const me = useAuth((s) => s.user)
  const { comments, loading } = usePinComments(boardId, itemId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    if (!me || !text.trim() || sending) return
    setSending(true)
    try {
      await addPinComment(boardId, itemId, me, text)
      setText('')
      // Re-focus to keep typing flow
      inputRef.current?.focus()
    } catch (err) {
      console.warn(err)
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('delete this comment?')) return
    try {
      await deletePinComment(boardId, itemId, commentId)
    } catch (err) {
      console.warn(err)
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">discussion</p>
        {!loading && comments.length > 0 && (
          <span className="text-[10px] text-faint">{comments.length} {comments.length === 1 ? 'message' : 'messages'}</span>
        )}
      </div>

      {loading && (
        <p className="text-xs text-muted italic font-display">loading…</p>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-xs text-muted italic font-display mb-4">
          no messages yet. say something — they'll see it next time they open this pin.
        </p>
      )}

      {comments.length > 0 && (
        <div className="space-y-4 mb-5">
          {comments.map((c) => (
            <CommentRow key={c.id} comment={c} me={me} onDelete={() => handleDelete(c.id)} />
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter inserts newline
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="say something…"
          rows={1}
          className="flex-1 bg-white rounded-card border border-line px-3 py-2.5 text-sm outline-none focus:border-apeksha transition resize-none min-h-[40px]"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          aria-label="Send"
          className="w-10 h-10 shrink-0 rounded-full bg-coral text-white flex items-center justify-center shadow-md shadow-coral/30 active:scale-95 transition disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
      {text.length > 0 && (
        <p className="text-[10px] text-faint mt-1 text-right">{text.length}/500</p>
      )}
    </section>
  )
}
