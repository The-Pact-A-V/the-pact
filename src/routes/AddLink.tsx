import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import { addBoardItem } from '@/hooks/useBoardItems'
import { cn } from '@/lib/utils'

function detectSource(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('instagram')) return 'instagram'
    if (host.includes('youtube') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('spotify')) return 'spotify'
    if (host.includes('airbnb')) return 'airbnb'
    if (host.includes('pinterest')) return 'pinterest'
    return host.replace('www.', '')
  } catch {
    return undefined
  }
}

export default function AddLink() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { board } = useBoard(boardId ?? null)

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!boardId) return <Navigate to="/boards" replace />

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setUrl(text)
    } catch {
      // ignored
    }
  }

  async function handleSave() {
    if (!url.trim() || !boardId) return
    setSubmitting(true)
    setError(null)
    try {
      const source = detectSource(url.trim())
      await addBoardItem(boardId, {
        type: 'link',
        content: {
          url: url.trim(),
          title: title.trim() || undefined,
          source,
        },
        addedBy: me,
      })
      navigate(`/board/${boardId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to={`/board/${boardId}`} className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center justify-between mt-6 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">new link</p>
          <h1 className="font-display text-3xl text-ink mt-1">Pin a link</h1>
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

      <div className="mb-6">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">url</label>
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 bg-white rounded-card border border-line px-4 py-3 text-base outline-none focus:border-apeksha transition"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="px-3 rounded-card bg-white border border-line text-sm hover:border-line-strong transition"
            aria-label="Paste"
          >
            paste
          </button>
        </div>
        {url && (
          <p className="text-[10px] text-muted mt-1.5">
            <LinkIcon size={10} className="inline mr-1" />
            {detectSource(url) ?? 'web'}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 80))}
          placeholder="seaside villa · ₹6500/night"
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3 text-base outline-none focus:border-apeksha transition"
        />
      </div>

      {error && <p className="text-material text-sm mb-3">⚠️ {error}</p>}

      <button
        onClick={handleSave}
        disabled={submitting || !url.trim()}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'pinning…' : 'pin to board'}
      </button>

      <p className="text-[11px] text-faint italic font-display mt-6 text-center">
        rich preview thumbnails coming soon — for now, just paste any URL.
      </p>
    </div>
  )
}
