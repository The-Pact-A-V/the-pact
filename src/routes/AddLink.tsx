import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Link as LinkIcon, RefreshCw } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import { addBoardItem } from '@/hooks/useBoardItems'
import { stripUndefined } from '@/lib/firebase-helpers'
import { fetchOGMetadata, type OGMetadata } from '@/lib/ogFetch'
import { detectLinkType, sourceLabel } from '@/lib/links'
import LinkPreview from '@/components/LinkPreview'
import { cn } from '@/lib/utils'

export default function AddLink() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { board } = useBoard(boardId ?? null)

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [og, setOG] = useState<OGMetadata>({})
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<number | undefined>(undefined)

  // Debounce-fetch OG metadata as the URL changes
  useEffect(() => {
    if (!url.trim() || !/^https?:\/\//i.test(url.trim())) {
      setOG({})
      setFetched(false)
      return
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      setFetching(true)
      const data = await fetchOGMetadata(url.trim())
      setOG(data)
      setFetching(false)
      setFetched(true)
    }, 600)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [url])

  if (!boardId) return <Navigate to="/boards" replace />

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setUrl(text)
    } catch {
      // ignored
    }
  }

  async function handleRefetch() {
    if (!url.trim()) return
    setFetching(true)
    const data = await fetchOGMetadata(url.trim())
    setOG(data)
    setFetching(false)
    setFetched(true)
  }

  async function handleSave() {
    if (!url.trim() || !boardId) return
    setSubmitting(true)
    setError(null)
    try {
      await addBoardItem(boardId, {
        type: 'link',
        content: stripUndefined({
          url: url.trim(),
          title: (title.trim() || og.title) || undefined,
          description: og.description || undefined,
          image: og.image || undefined,
          publisher: og.publisher || undefined,
          source: sourceLabel(url.trim()),
        }),
        addedBy: me,
      })
      navigate(`/board/${boardId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save')
      setSubmitting(false)
    }
  }

  const previewContent = {
    url: url.trim() || 'https://example.com',
    title: title.trim() || og.title,
    description: og.description,
    image: og.image,
    publisher: og.publisher,
  }
  const hasUrl = !!url.trim() && /^https?:\/\//i.test(url.trim())

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

      <div className="mb-4">
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
          >
            paste
          </button>
        </div>
        {hasUrl && (
          <p className="text-[10px] text-muted mt-1.5 flex items-center gap-1.5">
            <LinkIcon size={10} />
            {sourceLabel(url.trim())}
            {fetching && <span className="text-faint italic font-display ml-2">fetching preview…</span>}
            {fetched && !fetching && (
              <button
                type="button"
                onClick={handleRefetch}
                className="ml-auto text-faint hover:text-ink transition flex items-center gap-1"
                aria-label="refetch metadata"
              >
                <RefreshCw size={10} /> refetch
              </button>
            )}
          </p>
        )}
      </div>

      {/* Live preview */}
      {hasUrl && (
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">preview</p>
          <LinkPreview content={previewContent} variant="detail" />
        </div>
      )}

      <div className="mb-6">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 80))}
          placeholder={og.title ?? 'override the fetched title'}
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3 text-base outline-none focus:border-apeksha transition"
        />
        {og.title && !title && (
          <p className="text-[10px] text-muted mt-1 italic font-display">using fetched title: {og.title}</p>
        )}
      </div>

      {error && <p className="text-material text-sm mb-3">⚠️ {error}</p>}

      <button
        onClick={handleSave}
        disabled={submitting || !hasUrl}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'pinning…' : 'pin to board'}
      </button>

      <p className="text-[11px] text-faint italic font-display mt-6 text-center">
        previews powered by microlink.io · {detectLinkType(url.trim() || '') !== 'generic' ? `${sourceLabel(url.trim() || '')} embeds in detail view` : 'fetched on save, cached forever'}
      </p>
    </div>
  )
}
