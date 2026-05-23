import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mic, Play, Pause, X } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useBoard, gradientClasses } from '@/hooks/useBoards'
import { addBoardItem } from '@/hooks/useBoardItems'
import { uploadVoicePin } from '@/lib/storage'
import { stripUndefined } from '@/lib/firebase-helpers'
import { cn } from '@/lib/utils'

const MAX_SECONDS = 60

type State = 'idle' | 'recording' | 'recorded' | 'uploading'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function AddVoice() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { board } = useBoard(boardId ?? null)

  const [state, setState] = useState<State>('idle')
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('audio/webm')
  const [caption, setCaption] = useState('')
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const tickRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        try { mediaRecorderRef.current.stop() } catch { /* ignore */ }
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (tickRef.current) window.clearInterval(tickRef.current)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!boardId) return <Navigate to="/boards" replace />

  async function startRecording() {
    setError(null)
    setSeconds(0)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      // Prefer webm/opus, fall back to mp4 (Safari iOS)
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
      const chosen = candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? ''
      const mr = chosen ? new MediaRecorder(stream, { mimeType: chosen }) : new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      setMimeType(mr.mimeType || 'audio/webm')

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        setBlob(finalBlob)
        setBlobUrl(URL.createObjectURL(finalBlob))
        setState('recorded')
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      mr.start()
      setState('recording')

      // Tick seconds + auto-stop at MAX_SECONDS
      tickRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording()
            return MAX_SECONDS
          }
          return s + 1
        })
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'mic permission denied')
      setState('idle')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (tickRef.current) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }

  function discard() {
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlob(null)
    setBlobUrl(null)
    setSeconds(0)
    setState('idle')
    setPlaying(false)
  }

  function togglePlayback() {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      el.play()
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  async function handleSave() {
    if (!blob || !boardId) return
    setState('uploading')
    setError(null)
    try {
      const url = await uploadVoicePin(blob, me, boardId, mimeType)
      await addBoardItem(boardId, {
        type: 'voice',
        content: stripUndefined({
          audioUrl: url,
          durationSeconds: seconds,
          caption: caption.trim() || undefined,
          mimeType,
        }),
        addedBy: me,
      })
      navigate(`/board/${boardId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed')
      setState('recorded')
    }
  }

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to={`/board/${boardId}`} className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center justify-between mt-6 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">new voice</p>
          <h1 className="font-display text-3xl text-ink mt-1">
            record a <em className="italic text-coral">voice</em>
          </h1>
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

      {/* Recording surface */}
      <div className="rounded-hero bg-sage/30 border border-sage-deep p-8 flex flex-col items-center mb-6 min-h-[260px] justify-center">
        {state === 'idle' && (
          <>
            <button
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-coral text-white flex items-center justify-center shadow-xl shadow-coral/40 active:scale-95 transition border-4 border-surface"
              aria-label="Start recording"
            >
              <Mic size={36} />
            </button>
            <p className="font-display italic text-muted text-sm mt-5">tap to start · max 60s</p>
          </>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full bg-coral text-white flex items-center justify-center shadow-xl shadow-coral/40 active:scale-95 transition border-4 border-surface"
              aria-label="Stop recording"
            >
              <span className="block w-6 h-6 bg-white rounded" />
            </button>
            <p className="font-display text-base text-ink mt-5">
              <span className="font-sans font-bold text-ved not-italic">{formatTime(seconds)}</span>
              <span className="italic text-muted"> · recording</span>
            </p>
            <div className="flex items-center justify-center gap-1 mt-3 h-6">
              {Array.from({ length: 18 }).map((_, i) => {
                const h = 6 + Math.abs(Math.sin((Date.now() / 200) + i * 0.4)) * 18
                return (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-coral"
                    style={{ height: `${h}px`, transition: 'height 0.12s ease' }}
                  />
                )
              })}
            </div>
          </>
        )}

        {(state === 'recorded' || state === 'uploading') && blobUrl && (
          <>
            <button
              onClick={togglePlayback}
              className="w-24 h-24 rounded-full bg-ved text-white flex items-center justify-center shadow-xl shadow-ved/40 active:scale-95 transition border-4 border-surface"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
            </button>
            <p className="font-display italic text-muted text-sm mt-5">
              <span className="font-sans font-bold text-ink not-italic">{formatTime(seconds)}</span>
              {' · recorded · tap to preview'}
            </p>
            <audio
              ref={audioRef}
              src={blobUrl}
              onEnded={() => setPlaying(false)}
              hidden
            />
            <button
              onClick={discard}
              className="mt-4 text-xs text-muted hover:text-material transition inline-flex items-center gap-1"
            >
              <X size={11} /> discard + re-record
            </button>
          </>
        )}
      </div>

      {state === 'recorded' || state === 'uploading' ? (
        <div className="mb-6">
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted">caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 100))}
            placeholder="just remembered our last trip"
            className="mt-2 w-full bg-paper rounded-card border border-line px-4 py-3 text-base outline-none focus:border-coral focus:bg-surface transition font-display italic"
          />
        </div>
      ) : null}

      {error && <p className="text-material text-sm mb-3">⚠️ {error}</p>}

      {state === 'recorded' && (
        <button
          onClick={handleSave}
          className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition"
        >
          pin to board
        </button>
      )}
      {state === 'uploading' && (
        <button
          disabled
          className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 transition opacity-50"
        >
          uploading…
        </button>
      )}
    </div>
  )
}
