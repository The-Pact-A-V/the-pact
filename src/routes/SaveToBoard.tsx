import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Check, Plus, X } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useBoards, gradientClasses } from '@/hooks/useBoards'
import { useBoardItem, addBoardItem } from '@/hooks/useBoardItems'
import { cn } from '@/lib/utils'

export default function SaveToBoard() {
  const { boardId, id } = useParams<{ boardId: string; id: string }>()
  const navigate = useNavigate()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { boards, loading: bLoading } = useBoards()
  const { item, loading: iLoading } = useBoardItem(boardId ?? null, id ?? null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset selected when item changes
  useEffect(() => {
    setSelected(new Set())
  }, [boardId, id])

  if (bLoading || iLoading) {
    return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  }
  if (!item || !boardId || !id) return <Navigate to="/boards" replace />

  const otherBoards = boards.filter((b) => b.id !== boardId)
  const sourceBoard = boards.find((b) => b.id === boardId)

  function toggle(targetId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(targetId)) next.delete(targetId)
      else next.add(targetId)
      return next
    })
  }

  async function handleSave() {
    if (selected.size === 0 || !item) {
      navigate(`/item/${boardId}/${id}`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      for (const targetBoardId of selected) {
        await addBoardItem(targetBoardId, {
          type: item.type,
          content: item.content,
          addedBy: me,
        })
      }
      navigate(`/item/${boardId}/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh bg-ink/40 flex items-end">
      <div className="bg-surface rounded-t-[24px] w-full max-w-[480px] mx-auto pb-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="block w-9 h-1 rounded-full bg-line-strong" />
        </div>

        <header className="px-6 pt-2 pb-3 flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink">
            save to <em className="italic text-coral">board</em>
          </h1>
          <Link
            to={`/item/${boardId}/${id}`}
            className="w-9 h-9 rounded-full bg-paper flex items-center justify-center text-muted hover:text-ink transition"
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} />
          </Link>
        </header>

        <p className="px-6 text-sm text-muted italic font-display mb-4">
          copy this pin to another board · or leave it just on{' '}
          <em className="italic">{sourceBoard?.name ?? 'this board'}</em>.
        </p>

        <div className="px-3 space-y-2">
          {/* Current board (read-only) */}
          {sourceBoard && (
            <div className="rounded-card border border-sage-deep bg-sage/40 p-3 flex items-center gap-3">
              <span
                className={cn(
                  'w-11 h-11 rounded-card bg-gradient-to-br flex items-center justify-center text-lg shrink-0',
                  gradientClasses(sourceBoard.coverColor)
                )}
              >
                {sourceBoard.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink truncate">{sourceBoard.name}</p>
                <p className="text-[11px] text-physical italic font-display">currently saved here</p>
              </div>
              <span className="w-6 h-6 rounded-full bg-physical text-white flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </span>
            </div>
          )}

          {/* Other boards */}
          {otherBoards.map((b) => {
            const isSelected = selected.has(b.id)
            return (
              <button
                key={b.id}
                onClick={() => toggle(b.id)}
                className={cn(
                  'w-full rounded-card border-[1.5px] p-3 flex items-center gap-3 transition active:scale-[0.99] text-left',
                  isSelected ? 'border-coral bg-peach/30' : 'border-line bg-surface hover:border-line-strong'
                )}
              >
                <span
                  className={cn(
                    'w-11 h-11 rounded-card bg-gradient-to-br flex items-center justify-center text-lg shrink-0',
                    gradientClasses(b.coverColor)
                  )}
                >
                  {b.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink truncate">{b.name}</p>
                  <p className="text-[11px] text-muted italic font-display">
                    {isSelected ? 'will be saved here too' : 'tap to also save here'}
                  </p>
                </div>
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition',
                    isSelected ? 'bg-coral border-coral text-white' : 'border-line-strong text-transparent'
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
              </button>
            )
          })}

          <Link
            to="/board-new"
            className="w-full rounded-card border-2 border-dashed border-line-strong p-3 flex items-center gap-3 hover:border-ink/30 transition"
          >
            <span className="w-9 h-9 rounded-card bg-coral text-white flex items-center justify-center shrink-0">
              <Plus size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-coral text-sm">+ create new board</p>
              <p className="text-[11px] text-ink-soft">save this pin to a brand new board</p>
            </div>
          </Link>
        </div>

        {error && <p className="px-6 mt-3 text-material text-sm">⚠️ {error}</p>}

        <div className="px-3 mt-4 pt-3 border-t border-line flex gap-2.5">
          <Link
            to={`/item/${boardId}/${id}`}
            className="flex-1 text-center py-3 rounded-pill bg-paper text-sm font-medium text-ink-soft hover:bg-line transition"
          >
            cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-center py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
          >
            {saving
              ? 'saving…'
              : selected.size === 0
                ? 'done'
                : `save · ${selected.size} ${selected.size === 1 ? 'board' : 'boards'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
