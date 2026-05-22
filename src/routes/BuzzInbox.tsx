import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth, otherUser, userName } from '@/store/auth'
import { useBuzzes, buzzesLeftToday } from '@/hooks/useBuzzes'
import Avatar from '@/components/Avatar'
import { todayStr, formatDate, addDays, parseDate } from '@/lib/utils'
import type { Buzz } from '@/types'

function presetEmoji(p: Buzz['presetType']): string {
  switch (p) {
    case 'heart': return '💜'
    case 'star': return '✦'
    case 'sun': return '☀️'
    case 'moon': return '🌙'
    default: return '✉️'
  }
}

function bucket(b: Buzz, today: string, yesterday: string): 'today' | 'yesterday' | 'earlier' {
  const d = formatDate(new Date(b.sentAt))
  if (d === today) return 'today'
  if (d === yesterday) return 'yesterday'
  return 'earlier'
}

export default function BuzzInbox() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { buzzes, loading } = useBuzzes()
  const today = todayStr()
  const yesterday = formatDate(addDays(parseDate(today), -1))
  const remaining = buzzesLeftToday(buzzes, me)

  const mine = buzzes.filter((b) => b.fromUser === me || b.toUser === me)
  const grouped: Record<'today' | 'yesterday' | 'earlier', Buzz[]> = { today: [], yesterday: [], earlier: [] }
  for (const b of mine) grouped[bucket(b, today, yesterday)].push(b)

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">inbox</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-2">Buzz history</h1>
      <p className="text-xs text-muted">{remaining}/10 buzzes left today</p>

      {loading && <p className="mt-8 text-muted italic font-display">loading…</p>}

      {!loading && mine.length === 0 && (
        <div className="mt-12 text-center">
          <div className="w-20 h-20 rounded-full bg-lavender flex items-center justify-center text-3xl mx-auto mb-4">💜</div>
          <p className="font-display italic text-muted mb-6">no buzzes yet</p>
          <Link
            to="/buzzer"
            className="inline-block px-6 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
          >
            send your first buzz
          </Link>
        </div>
      )}

      {(['today', 'yesterday', 'earlier'] as const).map((key) => {
        const list = grouped[key]
        if (list.length === 0) return null
        return (
          <section key={key} className="mt-7">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">{key}</p>
            <div className="space-y-2">
              {list.map((b) => {
                const sent = b.fromUser === me
                const other = sent ? b.toUser : b.fromUser
                return (
                  <div
                    key={b.id}
                    className="rounded-card bg-white border border-line p-3 flex items-start gap-3"
                  >
                    <Avatar user={other} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{userName(other)}</span>
                        <span className="text-[10px] uppercase tracking-wider text-faint">
                          {sent ? 'sent' : 'received'}
                        </span>
                        <span className="text-[10px] text-faint ml-auto">
                          {new Date(b.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5">
                        <span className="mr-1">{presetEmoji(b.presetType)}</span>
                        {b.message}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <Link
        to="/buzzer"
        className="block text-center mt-8 px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
      >
        buzz {userName(otherUser(me))}
      </Link>
    </div>
  )
}
