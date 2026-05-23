import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Mail, MailOpen, Trash2 } from 'lucide-react'
import { useAuth, otherUser, userName } from '@/store/auth'
import {
  useLoveNotes,
  sendLoveNote,
  markLoveNoteOpened,
  deleteLoveNote,
  isDeliverable,
  type LoveNote,
} from '@/hooks/useLoveNotes'
import Avatar from '@/components/Avatar'
import { addDays, formatDate, parseDate, todayStr, cn } from '@/lib/utils'

function timeUntil(deliveryDate: string, today: string): string {
  const days = Math.round(
    (parseDate(deliveryDate).getTime() - parseDate(today).getTime()) / 86_400_000
  )
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days < 7) return `in ${days} days`
  if (days < 30) return `in ${Math.round(days / 7)} weeks`
  return `in ${Math.round(days / 30)} months`
}

export default function LoveNotes() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { notes, loading } = useLoveNotes()
  const today = todayStr()

  const [composeOpen, setComposeOpen] = useState(false)
  const [openedNote, setOpenedNote] = useState<LoveNote | null>(null)

  // Defaults: deliver 7 days from now
  const [text, setText] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(formatDate(addDays(parseDate(today), 7)))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter to: only the recipient sees deliverable notes, but the sender always sees what they sent
  const incoming = notes.filter((n) => n.toUser === me && isDeliverable(n, today))
  const sent = notes.filter((n) => n.fromUser === me)
  const sentPending = sent.filter((n) => !isDeliverable(n, today))
  const sentDelivered = sent.filter((n) => isDeliverable(n, today))

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    setError(null)
    try {
      await sendLoveNote({
        fromUser: me,
        toUser: otherUser(me),
        text,
        deliveryDate,
      })
      setText('')
      setComposeOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to send')
    } finally {
      setSending(false)
    }
  }

  async function handleOpenNote(note: LoveNote) {
    setOpenedNote(note)
    if (!note.openedAt && note.toUser === me) {
      try { await markLoveNoteOpened(note.id) } catch { /* ignore */ }
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm('delete this note? this can\'t be undone.')) return
    try {
      await deleteLoveNote(noteId)
      setOpenedNote(null)
    } catch (err) {
      console.warn(err)
    }
  }

  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">letters</p>
      <h1 className="font-display text-4xl text-ink italic mt-1 mb-2">love notes</h1>
      <p className="text-sm text-muted italic font-display mb-6 max-w-sm">
        write a letter to <em className="italic">{userName(otherUser(me))}</em> that arrives in
        the future. tomorrow. day 50. their birthday. whenever.
      </p>

      {!composeOpen && (
        <button
          onClick={() => setComposeOpen(true)}
          className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition mb-8"
        >
          write a letter
        </button>
      )}

      {composeOpen && (
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-card border border-line bg-paper p-4 mb-8"
        >
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              for {userName(otherUser(me))}
            </p>
            <button
              onClick={() => setComposeOpen(false)}
              className="text-xs text-muted hover:text-ink transition"
            >
              cancel
            </button>
          </div>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            placeholder="something you want them to read later…"
            rows={5}
            className="w-full bg-white rounded-card border border-line px-4 py-3 text-sm outline-none focus:border-apeksha transition resize-none font-display italic leading-relaxed"
          />
          <p className="text-[10px] text-faint mt-1 text-right">{text.length}/1000</p>

          <div className="mt-4">
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted">deliver on</label>
            <input
              type="date"
              value={deliveryDate}
              min={today}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="mt-2 w-full bg-white rounded-card border border-line px-3 py-3 text-sm outline-none focus:border-apeksha transition"
            />
            {deliveryDate && (
              <p className="text-xs italic font-display text-muted mt-1.5">
                arrives <em>{timeUntil(deliveryDate, today)}</em>
              </p>
            )}
          </div>

          {error && <p className="text-material text-sm mt-3">⚠️ {error}</p>}

          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="mt-5 w-full px-4 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
          >
            {sending ? 'sending…' : 'seal + schedule'}
          </button>
        </motion.section>
      )}

      {/* Incoming (deliverable to me) */}
      {incoming.length > 0 && (
        <section className="mb-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">for you</p>
          <div className="space-y-2">
            {incoming.map((n) => (
              <NoteRow key={n.id} note={n} unread={!n.openedAt && n.toUser === me} onOpen={() => handleOpenNote(n)} variant="incoming" />
            ))}
          </div>
        </section>
      )}

      {/* My pending */}
      {sentPending.length > 0 && (
        <section className="mb-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">scheduled</p>
          <div className="space-y-2">
            {sentPending.map((n) => (
              <NoteRow key={n.id} note={n} onOpen={() => handleOpenNote(n)} variant="pending" />
            ))}
          </div>
        </section>
      )}

      {/* My delivered */}
      {sentDelivered.length > 0 && (
        <section className="mb-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">delivered</p>
          <div className="space-y-2">
            {sentDelivered.map((n) => (
              <NoteRow key={n.id} note={n} onOpen={() => handleOpenNote(n)} variant="delivered" />
            ))}
          </div>
        </section>
      )}

      {incoming.length === 0 && sent.length === 0 && (
        <p className="text-center text-muted italic font-display mt-8">
          no letters yet. write one — slip it into the future.
        </p>
      )}

      {/* Reading overlay */}
      <AnimatePresence>
        {openedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenedNote(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 14 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-paper rounded-hero shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Avatar user={openedNote.fromUser} size="sm" />
                  <span className="text-xs text-muted">
                    from <span className="font-medium text-ink">{userName(openedNote.fromUser)}</span>
                  </span>
                </div>
                <button
                  onClick={() => setOpenedNote(null)}
                  className="text-muted hover:text-ink transition text-sm"
                >
                  close
                </button>
              </div>
              <p className="font-display italic text-xl text-ink leading-relaxed whitespace-pre-wrap">
                {openedNote.text}
              </p>
              <p className="text-[10px] text-faint mt-6">
                written {new Date(openedNote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' · '}delivered on {openedNote.deliveryDate}
              </p>
              {openedNote.fromUser === me && (
                <button
                  onClick={() => handleDelete(openedNote.id)}
                  className="mt-4 inline-flex items-center gap-1 text-xs text-material hover:text-material/70 transition"
                >
                  <Trash2 size={11} /> delete
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NoteRow({
  note,
  unread = false,
  onOpen,
  variant,
}: {
  note: LoveNote
  unread?: boolean
  onOpen: () => void
  variant: 'incoming' | 'pending' | 'delivered'
}) {
  const today = todayStr()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const otherUserName = userName(note.fromUser === me ? note.toUser : note.fromUser)
  return (
    <button
      onClick={onOpen}
      className={cn(
        'w-full rounded-card p-3.5 flex items-center gap-3 transition active:scale-[0.99] text-left',
        variant === 'incoming' && unread
          ? 'bg-gradient-to-br from-rose/30 to-pink border border-rose'
          : 'bg-white border border-line hover:border-line-strong'
      )}
    >
      <span
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          variant === 'pending' ? 'bg-paper text-faint' : 'bg-rose/20 text-material'
        )}
      >
        {variant === 'pending' ? <Mail size={16} /> : <MailOpen size={16} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.15em] text-muted">
          {variant === 'incoming' && (unread ? 'unread · for you' : `from ${otherUserName}`)}
          {variant === 'pending' && `to ${otherUserName} · arrives ${timeUntil(note.deliveryDate, today)}`}
          {variant === 'delivered' && `to ${otherUserName} · delivered ${note.deliveryDate}`}
        </p>
        <p className="text-sm italic font-display text-ink mt-0.5 truncate">
          {variant === 'pending' ? '✉️ sealed · open when delivered' : note.text}
        </p>
      </div>
    </button>
  )
}
