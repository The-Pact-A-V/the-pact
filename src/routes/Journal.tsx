import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Camera, Check, X } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useJournal, useJournalEntry, saveJournalEntry } from '@/hooks/useJournal'
import { uploadJournalPhoto } from '@/lib/storage'
import Avatar from '@/components/Avatar'
import { todayStr, parseDate, cn } from '@/lib/utils'

const PROMPTS = [
  'how was today?',
  'one good thing.',
  'one thing you noticed.',
  'a quiet sentence.',
  'a moment to remember.',
]

function promptForDate(date: string): string {
  const seed = parseDate(date).getDate() % PROMPTS.length
  return PROMPTS[seed]
}

export default function Journal() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const [searchParams, setSearchParams] = useSearchParams()
  const today = todayStr()
  const date = searchParams.get('date') ?? today
  const isToday = date === today
  const isFuture = date > today

  const { entry, loading: eLoading } = useJournalEntry(me, date)
  const { entries: myEntries } = useJournal(me)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')
  const [savedText, setSavedText] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (entry) {
      setText(entry.text ?? '')
      setSavedText(entry.text ?? '')
    } else {
      setText('')
      setSavedText('')
    }
  }, [entry?.text, date])

  const dirty = text.trim() !== savedText.trim()

  async function handleSaveText() {
    setSaving(true)
    setError(null)
    try {
      await saveJournalEntry(me, date, { text, photoUrl: entry?.photoUrl })
      setSavedText(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhoto(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadJournalPhoto(file, me, date)
      await saveJournalEntry(me, date, { text, photoUrl: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemovePhoto() {
    if (!confirm('remove this photo?')) return
    await saveJournalEntry(me, date, { text, photoUrl: undefined })
  }

  function gotoDate(d: string) {
    if (d === today) setSearchParams({})
    else setSearchParams({ date: d })
  }

  // Past entries list (excluding today)
  const past = Object.values(myEntries)
    .filter((e) => e.date !== date && e.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)

  const displayDate = parseDate(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center gap-3 mt-6 mb-2">
        <Avatar user={me} size="md" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            {isToday ? "today's journal" : 'journal entry'}
          </p>
          <h1 className="font-display text-3xl text-ink italic leading-tight">{displayDate}</h1>
        </div>
      </div>

      {!isToday && (
        <div className="flex items-center gap-2 text-xs mb-4">
          <button
            onClick={() => gotoDate(today)}
            className="text-apeksha hover:text-apeksha/70 transition italic font-display"
          >
            ← back to today
          </button>
        </div>
      )}

      {isFuture ? (
        <p className="text-center text-muted italic font-display mt-12">
          future days don't have entries yet.
        </p>
      ) : eLoading ? (
        <p className="text-muted italic font-display mt-6">loading…</p>
      ) : (
        <>
          <p className="text-sm font-display italic text-muted mb-3">{promptForDate(date)}</p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 280))}
            placeholder="a sentence is enough."
            rows={3}
            className="w-full bg-white rounded-card border border-line px-4 py-3 text-base outline-none focus:border-apeksha transition resize-none font-display italic"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-faint">{text.length}/280</span>
            {dirty && (
              <button
                onClick={handleSaveText}
                disabled={saving}
                className="text-xs text-coral hover:text-coral-deep transition inline-flex items-center gap-1 disabled:opacity-50"
              >
                <Check size={11} /> {saving ? 'saving…' : 'save'}
              </button>
            )}
          </div>

          {/* Photo */}
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">photo</p>
            {entry?.photoUrl ? (
              <div className="relative">
                <img
                  src={entry.photoUrl}
                  alt=""
                  className="w-full rounded-card block bg-paper"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-material shadow-md hover:bg-white transition"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  'w-full rounded-card border border-dashed border-line-strong bg-paper py-8 flex flex-col items-center justify-center gap-2 text-muted hover:text-ink hover:border-ink/30 transition',
                  uploading && 'opacity-50'
                )}
              >
                <Camera size={22} />
                <span className="text-sm">{uploading ? 'uploading…' : 'add a photo'}</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && <p className="text-material text-sm mt-4">⚠️ {error}</p>}
        </>
      )}

      {/* Past entries */}
      {past.length > 0 && (
        <section className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">past</p>
          <div className="space-y-2">
            {past.map((e) => (
              <button
                key={e.date}
                onClick={() => gotoDate(e.date)}
                className="w-full rounded-card bg-white border border-line p-3 flex items-start gap-3 text-left hover:border-line-strong transition active:scale-[0.99]"
              >
                {e.photoUrl && (
                  <img src={e.photoUrl} alt="" className="w-12 h-12 rounded-card object-cover shrink-0 bg-paper" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted">
                    {parseDate(e.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {e.text && (
                    <p className="text-sm italic font-display text-ink mt-0.5 line-clamp-2">{e.text}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
