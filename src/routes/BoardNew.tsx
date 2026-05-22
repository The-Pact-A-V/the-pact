import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createBoard, GRADIENT_PRESETS, EMOJI_PICKS, gradientClasses } from '@/hooks/useBoards'
import { cn } from '@/lib/utils'

export default function BoardNew() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌴')
  const [coverColor, setCoverColor] = useState(GRADIENT_PRESETS[0].key)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) {
      setError('give it a name')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const board = await createBoard({ name, emoji, coverColor })
      navigate(`/board/${board.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to create')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/boards" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">new board</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-6">Create a board</h1>

      {/* Live preview */}
      <div
        className={cn(
          'rounded-hero bg-gradient-to-br p-6 mb-8 shadow-sm h-32 flex flex-col justify-between',
          gradientClasses(coverColor)
        )}
      >
        <span className="text-3xl">{emoji}</span>
        <span className="font-medium text-ink">{name || 'untitled'}</span>
      </div>

      {/* Name */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder="Goa · July 13"
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3.5 text-base outline-none focus:border-apeksha transition"
        />
      </div>

      {/* Emoji */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">cover emoji</label>
        <div className="mt-2 grid grid-cols-8 gap-1.5">
          {EMOJI_PICKS.map((e) => {
            const active = emoji === e
            return (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  'rounded-card aspect-square text-xl border-2 transition',
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white hover:border-line-strong'
                )}
              >
                {e}
              </button>
            )
          })}
        </div>
      </div>

      {/* Gradient */}
      <div className="mb-8">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">cover gradient</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((g) => {
            const active = coverColor === g.key
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setCoverColor(g.key)}
                className={cn(
                  'aspect-square rounded-card bg-gradient-to-br border-2 transition',
                  g.classes,
                  active ? 'border-ink' : 'border-transparent'
                )}
                aria-label={g.preview}
              />
            )
          })}
        </div>
      </div>

      {error && <p className="text-material text-sm mb-3">⚠️ {error}</p>}

      <button
        onClick={handleCreate}
        disabled={submitting}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'creating…' : 'create board'}
      </button>
    </div>
  )
}
