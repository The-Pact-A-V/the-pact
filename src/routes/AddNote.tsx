import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import { addBoardItem } from '@/hooks/useBoardItems'
import { cn } from '@/lib/utils'

const COLOR_OPTIONS = [
  { key: 'lavender', cls: 'bg-lavender' },
  { key: 'butter', cls: 'bg-butter' },
  { key: 'pink', cls: 'bg-pink' },
  { key: 'sage', cls: 'bg-sage' },
  { key: 'peach', cls: 'bg-peach' },
]

const EMOJI_OPTIONS = ['💭', '✨', '💜', '🌷', '🍯', '🌊', '☀️', '🌙', '']

export default function AddNote() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { board } = useBoard(boardId ?? null)

  const [text, setText] = useState('')
  const [color, setColor] = useState('lavender')
  const [emoji, setEmoji] = useState('💭')
  const [submitting, setSubmitting] = useState(false)

  if (!boardId) return <Navigate to="/boards" replace />

  async function handleSave() {
    if (!text.trim() || !boardId) return
    setSubmitting(true)
    try {
      await addBoardItem(boardId, {
        type: 'note',
        content: { text: text.trim(), color, emoji: emoji || undefined },
        addedBy: me,
      })
      navigate(`/board/${boardId}`)
    } catch (err) {
      console.warn(err)
      setSubmitting(false)
    }
  }

  const previewCls = COLOR_OPTIONS.find((c) => c.key === color)?.cls ?? 'bg-lavender'

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to={`/board/${boardId}`} className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center justify-between mt-6 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">new note</p>
          <h1 className="font-display text-3xl text-ink mt-1">Pin a thought</h1>
        </div>
        {board && (
          <span
            className={cn(
              'rounded-pill bg-gradient-to-br px-3 py-1 text-xs flex items-center gap-1',
              gradientClasses(board.coverColor)
            )}
          >
            <span>{board.emoji}</span>
            <span>{board.name}</span>
          </span>
        )}
      </div>

      {/* Preview */}
      <div className={cn('rounded-card p-4 mb-6', previewCls)}>
        {emoji && <span className="text-2xl block mb-1">{emoji}</span>}
        <p className="font-display italic text-ink leading-snug min-h-[2.5em]">
          {text || 'your note will look like this…'}
        </p>
      </div>

      {/* Text */}
      <div className="mb-6">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          placeholder="calangute or anjuna? leaning anjuna"
          rows={3}
          className="w-full bg-white rounded-card border border-line px-4 py-3 text-base outline-none focus:border-apeksha transition resize-none"
        />
        <p className="text-[10px] text-faint mt-1 text-right">{text.length}/280</p>
      </div>

      {/* Color */}
      <div className="mb-5">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">color</label>
        <div className="mt-2 flex gap-2">
          {COLOR_OPTIONS.map((c) => {
            const active = color === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                className={cn(
                  'w-10 h-10 rounded-full border-2 transition',
                  c.cls,
                  active ? 'border-ink' : 'border-transparent'
                )}
                aria-label={c.key}
              />
            )
          })}
        </div>
      </div>

      {/* Corner emoji */}
      <div className="mb-8">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">corner emoji</label>
        <div className="mt-2 grid grid-cols-9 gap-1.5">
          {EMOJI_OPTIONS.map((e, i) => {
            const active = emoji === e
            return (
              <button
                key={i}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  'aspect-square rounded-card text-lg border-2 transition',
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white'
                )}
              >
                {e || '∅'}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={submitting || !text.trim()}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'pinning…' : 'pin to board'}
      </button>
    </div>
  )
}
