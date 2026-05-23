import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Trash2 } from 'lucide-react'
import { useAuth, userName } from '@/store/auth'
import {
  usePactChat,
  sendPactMessage,
  deletePactMessage,
  markPactChatSeen,
  type PactMessage,
} from '@/hooks/usePactChat'
import Avatar from '@/components/Avatar'
import { addDays, formatDate, parseDate, todayStr } from '@/lib/utils'
import { cn } from '@/lib/utils'

function timeLabel(ts: number, today: string, yesterday: string): string {
  const ds = formatDate(new Date(ts))
  const t = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (ds === today) return t
  if (ds === yesterday) return `yesterday · ${t}`
  return `${new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${t}`
}

function MessageRow({
  msg,
  me,
  onDelete,
  today,
  yesterday,
}: {
  msg: PactMessage
  me: ReturnType<typeof useAuth.getState>['user']
  onDelete: () => void
  today: string
  yesterday: string
}) {
  const mine = msg.userId === me
  return (
    <div className={cn('flex gap-2.5', mine && 'flex-row-reverse')}>
      <Avatar user={msg.userId} size="sm" />
      <div className={cn('flex-1 min-w-0 max-w-[80%]', mine && 'flex flex-col items-end')}>
        <div className="flex items-baseline gap-2 text-[10px] text-muted mb-0.5">
          <span className="font-medium">{userName(msg.userId)}</span>
          <span className="text-faint">·</span>
          <span className="text-faint">{timeLabel(msg.createdAt, today, yesterday)}</span>
          {mine && (
            <button
              onClick={onDelete}
              className="text-faint hover:text-material transition ml-1"
              aria-label="Delete message"
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
          {msg.text}
        </div>
      </div>
    </div>
  )
}

export default function PactChat() {
  const me = useAuth((s) => s.user)
  const { messages, loading } = usePactChat()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const today = todayStr()
  const yesterday = formatDate(addDays(parseDate(today), -1))

  // Mark as seen on mount + whenever messages change
  useEffect(() => {
    markPactChatSeen()
  }, [messages.length])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!me || !text.trim() || sending) return
    setSending(true)
    try {
      await sendPactMessage(me, text)
      setText('')
      inputRef.current?.focus()
    } catch (err) {
      console.warn(err)
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(messageId: string) {
    if (!confirm('delete this message?')) return
    try {
      await deletePactMessage(messageId)
    } catch (err) {
      console.warn(err)
    }
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header className="px-6 pt-7 pb-3 border-b border-line bg-cream">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm">
          <ArrowLeft size={16} /> back
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <Avatar user="apeksha" size="sm" />
          <Avatar user="ved" size="sm" />
          <div className="ml-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">notes between you</p>
            <h1 className="font-display text-xl text-ink leading-none">just us.</h1>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {loading && <p className="text-muted italic font-display text-sm">loading…</p>}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <p className="font-display italic text-muted">no messages yet</p>
            <p className="text-[11px] text-faint italic font-display mt-2 max-w-xs mx-auto">
              this is for the in-between — "missed you," "remember to call mom,"
              "how was today" — not the pin-specific stuff.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <MessageRow
            key={m.id}
            msg={m}
            me={me}
            onDelete={() => handleDelete(m.id)}
            today={today}
            yesterday={yesterday}
          />
        ))}
      </div>

      <div className="border-t border-line bg-white px-6 py-3 pb-6 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 800))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="say something…"
          rows={1}
          className="flex-1 bg-paper rounded-card border border-line px-3 py-2.5 text-sm outline-none focus:border-apeksha transition resize-none min-h-[40px] max-h-32"
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
    </div>
  )
}
