import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth, userName } from '@/store/auth'
import { useProfile, updateProfile } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'

const COLORS: Array<{ key: string; cls: string }> = [
  { key: 'lavender', cls: 'bg-lavender text-apeksha' },
  { key: 'sage', cls: 'bg-sage text-ved' },
  { key: 'butter', cls: 'bg-butter text-spiritual' },
  { key: 'pink', cls: 'bg-pink text-material' },
  { key: 'peach', cls: 'bg-peach text-spiritual' },
  { key: 'lavender-deep', cls: 'bg-lavender-deep text-cream' },
]

export default function EditProfile() {
  const me = useAuth((s) => s.user) ?? 'apeksha'
  const { profile, loading } = useProfile(me)
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [tagline, setTagline] = useState('')
  const [avatarColor, setAvatarColor] = useState<string>(me === 'apeksha' ? 'lavender' : 'sage')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '')
      setTagline(profile.tagline ?? '')
      if (profile.avatarColor) setAvatarColor(profile.avatarColor)
    }
  }, [profile])

  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>

  const initials = (displayName || userName(me))[0].toUpperCase()
  const previewColor = COLORS.find((c) => c.key === avatarColor) ?? COLORS[0]

  async function handleSave() {
    setSubmitting(true)
    setError(null)
    try {
      await updateProfile(me, {
        displayName: displayName.trim() || undefined,
        tagline: tagline.trim() || undefined,
        avatarColor,
      })
      navigate('/settings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">profile</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-8">Edit profile</h1>

      <div className="flex justify-center mb-7">
        <span
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center font-display text-4xl shadow-md',
            previewColor.cls
          )}
        >
          {initials}
        </span>
      </div>

      <div className="mb-6">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.slice(0, 30))}
          placeholder={userName(me)}
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3.5 text-base outline-none focus:border-apeksha transition"
        />
      </div>

      <div className="mb-6">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">tagline</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value.slice(0, 60))}
          placeholder="the one who runs"
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3.5 text-base outline-none focus:border-apeksha transition italic font-display"
        />
        <p className="text-[10px] text-faint mt-1 text-right">{tagline.length}/60</p>
      </div>

      <div className="mb-8">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">avatar color</label>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {COLORS.map((c) => {
            const active = avatarColor === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setAvatarColor(c.key)}
                className={cn(
                  'aspect-square rounded-full border-2 flex items-center justify-center font-medium transition',
                  c.cls,
                  active ? 'border-ink' : 'border-transparent'
                )}
                aria-label={c.key}
              >
                {initials}
              </button>
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
        {submitting ? 'saving…' : 'save profile'}
      </button>
    </div>
  )
}
