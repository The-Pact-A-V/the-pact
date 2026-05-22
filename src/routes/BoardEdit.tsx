import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  useBoard,
  updateBoard,
  deleteBoard,
  GRADIENT_PRESETS,
  EMOJI_PICKS,
  gradientClasses,
} from '@/hooks/useBoards'
import { cn } from '@/lib/utils'

export default function BoardEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { board, loading } = useBoard(id ?? null)

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌴')
  const [coverColor, setCoverColor] = useState(GRADIENT_PRESETS[0].key)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (board) {
      setName(board.name)
      setEmoji(board.emoji)
      setCoverColor(board.coverColor)
    }
  }, [board])

  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  if (!board || !id) return <Navigate to="/boards" replace />

  async function handleSave() {
    if (!id) return
    if (!name.trim()) {
      setError('give it a name')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await updateBoard(id, { name, emoji, coverColor })
      navigate(`/board/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save')
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm(`delete "${name}" and all its pins?`)) return
    await deleteBoard(id)
    navigate('/boards')
  }

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to={`/board/${id}`} className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">edit</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-6">Board settings</h1>

      <div
        className={cn(
          'rounded-hero bg-gradient-to-br p-6 mb-8 shadow-sm h-32 flex flex-col justify-between',
          gradientClasses(coverColor)
        )}
      >
        <span className="text-3xl">{emoji}</span>
        <span className="font-medium text-ink">{name || 'untitled'}</span>
      </div>

      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3.5 text-base outline-none focus:border-apeksha transition"
        />
      </div>

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
        onClick={handleSave}
        disabled={submitting}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'saving…' : 'save changes'}
      </button>

      <button
        onClick={handleDelete}
        className="w-full mt-4 px-4 py-3 rounded-pill bg-white text-material border border-line flex items-center justify-center gap-2 hover:bg-paper transition"
      >
        <Trash2 size={16} /> delete board
      </button>
    </div>
  )
}
