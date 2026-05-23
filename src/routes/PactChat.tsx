import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth, userName } from '@/store/auth'
import {
  usePactChat,
  sendPactMessage,
  deletePactMessage,
  markPactChatSeen,
  useChatReactions,
  toggleChatReaction,
  CHAT_REACTION_EMOJIS,
  type PactMessage,
  type ChatReaction,
} from '@/hooks/usePactChat'
import Avatar from '@/components/Avatar'
import { addDays, formatDate, parseDate, todayStr } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { UserId } from '@/types'

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
  reactions,
  onDelete,
  onToggleReaction,
  today,
  yesterday,
}: {
  msg: PactMessage
  me: ReturnType<typeof useAuth.getState>['user']
  reactions: ChatReaction[]
  onDelete: () => void
  onToggleReaction: (emoji: string) => void
  today: string
  yesterday: string
}) {
  const mine = msg.userId === me
  const [pickerOpen, setPickerOpen] = useState(false)
  const longPressTimer = useRef<number | undefined>(undefined)

  function handlePointerDown() {
    longPressTimer.current = window.setTimeout(() => setPickerOpen(true), 450)
  }
  function handlePointerUp() {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current)
  }

  // Group reactions by emoji
  const grouped: Record<string, UserId[]> = {}
  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = []
    grouped[r.emoji].push(r.userId)
  }
  const myEmojis = new Set(reactions.filter((r) => r.userId === me).map((r) => r.emoji))

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

        <div className="relative">
          <button
            onClick={() => setPickerOpen((p) => !p)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={cn(
              'rounded-card px-3 py-2 text-sm leading-snug break-words text-left transition active:scale-[0.99]',
              mine ? 'bg-lavender text-ink' : 'bg-white border border-line text-ink'
            )}
          >
            {msg.text}
          </button>

          {/* Picker */}
          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute z-10 bg-white rounded-pill border border-line shadow-lg px-2 py-1.5 flex gap-1',
                  mine ? 'right-0 -top-10' : 'left-0 -top-10'
                )}
              >
                {CHAT_REACTION_EMOJIS.map((e) => {
                  const active = myEmojis.has(e)
                  return (
                    <button
                      key={e}
                      onClick={() => {
                        onToggleReaction(e)
                        setPickerOpen(false)
                      }}
                      className={cn(
                        'w-8 h-8 rounded-full text-base flex items-center justify-center transition active:scale-90',
                        active ? 'bg-lavender' : 'hover:bg-paper'
                      )}
                    >
                      {e}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Existing reactions */}
        {Object.keys(grouped).length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1.5', mine && 'justify-end')}>
            {Object.entries(grouped).map(([emoji, users]) => {
              const isMine = myEmojis.has(emoji)
              return (
                <button
                  key={emoji}
                  onClick={() => onToggleReaction(emoji)}
                  className={cn(
                    'rounded-pill px-2 py-0.5 text-[11px] inline-flex items-center gap-1 transition active:scale-95 border',
                    isMine ? 'bg-lavender border-apeksha text-apeksha' : 'bg-white border-line text-muted hover:border-line-strong'
                  )}
                >
                  <span>{emoji}</span>
                  <span className="font-medium">{users.length}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PactChat() {
  const me = useAuth((s) => s.user)
  const { messages, loading } = usePactChat()
  const reactionsByMessage = useChatReactions()
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

  async function handleReact(messageId: string, emoji: string) {
    if (!me) return
    try {
      await toggleChatReaction(messageId, me, emoji)
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
            reactions={reactionsByMessage[m.id] ?? []}
            onDelete={() => handleDelete(m.id)}
            onToggleReaction={(emoji) => handleReact(m.id, emoji)}
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
