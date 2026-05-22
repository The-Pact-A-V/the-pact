import { useState, useRef } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import { addBoardItem } from '@/hooks/useBoardItems'
import { uploadPhoto } from '@/lib/storage'
import { stripUndefined } from '@/lib/firebase-helpers'
import { formatBytes } from '@/lib/imageCompress'
import { cn } from '@/lib/utils'

export default function AddPhoto() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { board } = useBoard(boardId ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!boardId) return <Navigate to="/boards" replace />

  function handleFile(f: File | null) {
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function handleSave() {
    if (!file || !boardId) return
    setSubmitting(true)
    setError(null)
    try {
      const url = await uploadPhoto(file, me, boardId)
      await addBoardItem(boardId, {
        type: 'photo',
        content: stripUndefined({ url, caption: caption.trim() || undefined }),
        addedBy: me,
      })
      navigate(`/board/${boardId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed')
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
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">new photo</p>
          <h1 className="font-display text-3xl text-ink mt-1">Pin a photo</h1>
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

      {!previewUrl ? (
        <div className="space-y-3 mb-8">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full rounded-card bg-white border border-line p-5 flex items-center gap-3 active:scale-[0.98] transition"
          >
            <Camera size={22} className="text-apeksha" />
            <span className="text-sm font-medium">take a photo</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-card bg-white border border-line p-5 flex items-center gap-3 active:scale-[0.98] transition"
          >
            <ImageIcon size={22} className="text-physical" />
            <span className="text-sm font-medium">choose from library</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <>
          <div className="rounded-card overflow-hidden mb-2 border border-line">
            <img src={previewUrl} alt="" className="w-full block" />
          </div>
          <p className="text-[10px] text-faint mb-4">
            original: {file ? formatBytes(file.size) : ''} · will be compressed to ~200–400 KB on upload
          </p>
          <button
            onClick={() => {
              setFile(null)
              setPreviewUrl(null)
            }}
            className="text-xs text-muted mb-6 underline"
          >
            pick a different photo
          </button>

          <div className="mb-6">
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted">caption (optional)</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 100))}
              placeholder="morjim sunset"
              className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3 text-base outline-none focus:border-apeksha transition"
            />
          </div>
        </>
      )}

      {error && <p className="text-material text-sm mb-3">⚠️ {error}</p>}

      <button
        onClick={handleSave}
        disabled={submitting || !file}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'compressing + uploading…' : 'pin to board'}
      </button>
    </div>
  )
}
