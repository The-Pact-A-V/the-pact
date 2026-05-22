import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth, otherUser, userName } from '@/store/auth'
import { sendBuzz, useBuzzes, buzzesLeftToday, BUZZ_PRESETS, type BuzzPreset } from '@/hooks/useBuzzes'
import Avatar from '@/components/Avatar'
import { cn } from '@/lib/utils'

export default function Buzzer() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const navigate = useNavigate()
  const { buzzes } = useBuzzes()
  const remaining = buzzesLeftToday(buzzes, me)
  const [custom, setCustom] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend(preset: BuzzPreset | null, customMessage?: string) {
    if (sending || remaining === 0) return
    setSending(true)
    try {
      const message = customMessage?.trim() || preset?.message || 'thinking of you'
      await sendBuzz({
        from: me,
        to: otherUser(me),
        message,
        presetType: preset?.type ?? null,
      })
      navigate('/dashboard')
    } catch (err) {
      console.warn(err)
      setSending(false)
    }
  }

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center gap-3 mt-6">
        <Avatar user={otherUser(me)} size="lg" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">send a buzz</p>
          <h1 className="font-display text-3xl text-ink">
            to <em className="italic text-apeksha">{userName(otherUser(me))}</em>
          </h1>
        </div>
      </div>

      <div className="mt-6 rounded-card bg-paper p-3 flex items-center justify-between text-xs">
        <span className="text-muted">today's buzzes</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{10 - remaining}/10 sent</span>
          <div className="w-20 h-1.5 rounded-pill bg-white overflow-hidden">
            <div
              className="h-full bg-coral transition-all"
              style={{ width: `${((10 - remaining) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-7 mb-2">presets</p>
      <div className="grid grid-cols-2 gap-2">
        {BUZZ_PRESETS.map((p) => (
          <button
            key={p.type}
            onClick={() => handleSend(p)}
            disabled={sending || remaining === 0}
            className={cn(
              'rounded-card bg-white border border-line p-3.5 flex items-center gap-3 transition active:scale-[0.97] disabled:opacity-50',
              'hover:border-line-strong'
            )}
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="text-sm font-medium text-left">{p.message}</span>
          </button>
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-7 mb-2">custom</p>
      <div className="rounded-card bg-white border border-line p-3.5">
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value.slice(0, 140))}
          placeholder="UPSC tomorrow — I'm with you"
          rows={2}
          className="w-full bg-transparent outline-none text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-faint">{custom.length}/140</span>
          <button
            onClick={() => handleSend(null, custom)}
            disabled={sending || remaining === 0 || !custom.trim()}
            className="px-4 py-2 rounded-pill bg-coral text-white text-sm font-medium shadow-md shadow-coral/30 active:scale-[0.97] transition disabled:opacity-50"
          >
            {sending ? 'sending…' : 'send'}
          </button>
        </div>
      </div>

      {remaining === 0 && (
        <p className="text-center text-muted text-xs mt-6 italic font-display">
          no more buzzes today — meaning over noise.
        </p>
      )}
    </div>
  )
}
