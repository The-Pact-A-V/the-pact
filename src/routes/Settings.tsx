import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import Avatar from '@/components/Avatar'
import { useAuth, userName } from '@/store/auth'
import { releaseIdentity } from '@/hooks/useFirebaseAuthBoot'
import { useProfile } from '@/hooks/useProfile'
import { usePrefs } from '@/store/prefs'
import { cn } from '@/lib/utils'

interface RowProps {
  to?: string
  onClick?: () => void
  label: string
  hint?: string
  danger?: boolean
}

function Row({ to, onClick, label, hint, danger }: RowProps) {
  const className = `flex items-center justify-between px-4 py-3.5 bg-white hover:bg-paper transition ${danger ? 'text-material' : 'text-ink'}`
  const content = (
    <>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted flex items-center gap-1">
        {hint}
        <ChevronRight size={14} />
      </span>
    </>
  )
  return to ? (
    <Link to={to} className={className}>{content}</Link>
  ) : (
    <button onClick={onClick} className={`${className} w-full text-left`}>{content}</button>
  )
}

interface ToggleRowProps {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-paper transition text-left"
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-[10px] text-muted mt-0.5">{hint}</p>}
      </div>
      <span
        className={cn(
          'relative w-10 h-6 rounded-pill transition shrink-0',
          value ? 'bg-apeksha' : 'bg-line-strong'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
            value ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </span>
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted px-6 mb-2">{title}</p>
      <div className="mx-4 rounded-card overflow-hidden divide-y divide-line">
        {children}
      </div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const logout = useAuth((s) => s.logout)
  const { profile } = useProfile(user)
  const prefs = usePrefs()

  const displayName = profile?.displayName?.trim() || userName(user)
  const tagline = profile?.tagline

  async function handleLogout() {
    try {
      await releaseIdentity()
    } catch {
      // ignore
    }
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">settings</p>
        <h1 className="font-display text-4xl text-ink mt-1">{displayName}</h1>
      </header>

      <Link
        to="/edit-profile"
        className="mx-4 rounded-card bg-white shadow-sm p-4 flex items-center gap-4 hover:-translate-y-0.5 transition"
      >
        <Avatar user={user} size="lg" />
        <div className="flex-1">
          <p className="font-medium">{displayName}</p>
          {tagline ? (
            <p className="text-xs italic font-display text-muted">{tagline}</p>
          ) : (
            <p className="text-xs text-muted">tap to edit profile</p>
          )}
        </div>
        <ChevronRight size={16} className="text-muted" />
      </Link>

      <Section title="the pact">
        <Row to="/pact-edit" label="Current pact" />
        <Row to="/pact-archive" label="Pact archive" />
        <Row to="/habits?peek=true" label="Partner" />
        <Row to="/buzz-inbox" label="Buzz inbox" />
        <Row to="/about" label="About" />
      </Section>

      <Section title="your data">
        <Row to="/history" label="History" />
        <Row to="/weekly-review" label="Weekly review" />
      </Section>

      <Section title="notifications">
        <ToggleRow
          label="Buzzes"
          hint="when your partner sends a 💜"
          value={prefs.notifyBuzzes}
          onChange={(v) => prefs.setPref('notifyBuzzes', v)}
        />
        <ToggleRow
          label="Morning check-in"
          hint="one gentle nudge per day"
          value={prefs.notifyMorning}
          onChange={(v) => prefs.setPref('notifyMorning', v)}
        />
        <ToggleRow
          label="Sunday review"
          hint="your weekly recap"
          value={prefs.notifySunday}
          onChange={(v) => prefs.setPref('notifySunday', v)}
        />
      </Section>

      <Section title="preferences">
        <ToggleRow
          label="Sound"
          hint="chimes for buzzes and milestones"
          value={prefs.soundOn}
          onChange={(v) => prefs.setPref('soundOn', v)}
        />
      </Section>

      <Section title="developer (skeleton)">
        <Row to="/onboarding" label="Onboarding flow" />
        <Row to="/notif-permission" label="Notification permission" />
        <Row to="/pact-new" label="New pact form" />
        <Row to="/pact-day-50?preview=1" label="Day 50 — success" />
        <Row to="/pact-day-50-missed" label="Day 50 — missed" />
        <Row to="/pact-wrapped" label="Pact wrapped" />
        <Row to="/milestone" label="Milestone ceremony" />
        <Row to="/dashboard-empty" label="Empty dashboard" />
        <Row to="/backfill-og" label="Backfill link previews" />
      </Section>

      <div className="mx-4 mt-8 rounded-card overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-material px-4 py-4 hover:bg-paper transition"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
