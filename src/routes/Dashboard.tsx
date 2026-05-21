import { useEffect, useState } from 'react'
import { onValue, ref, serverTimestamp, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import BottomNav from '@/components/BottomNav'
import JarSVG from '@/components/JarSVG'
import Avatar from '@/components/Avatar'
import { useAuth, userName } from '@/store/auth'
import { daysLeft } from '@/lib/utils'

type PingStatus =
  | { state: 'pending' }
  | { state: 'ok'; lastWrite: number }
  | { state: 'error'; message: string }

export default function Dashboard() {
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const [ping, setPing] = useState<PingStatus>({ state: 'pending' })
  const [combinedPct, setCombinedPct] = useState(0)

  // simulate a fill so the jar isn't dead — remove once real data arrives
  useEffect(() => {
    const id = setTimeout(() => setCombinedPct(42), 600)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const pingRef = ref(db, `_ping/${user}`)
    set(pingRef, { ts: serverTimestamp() }).catch((err) => {
      setPing({ state: 'error', message: err.message })
    })
    return onValue(
      pingRef,
      (snap) => {
        const value = snap.val() as { ts?: number } | null
        if (value?.ts) setPing({ state: 'ok', lastWrite: value.ts })
      },
      (err) => setPing({ state: 'error', message: err.message })
    )
  }, [user])

  return (
    <div className="min-h-svh pb-28">
      <header className="px-6 pt-8 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            day {Math.max(1, 50 - daysLeft())} / 50
          </p>
          <h1 className="font-display text-3xl text-ink mt-1">
            good morning, <em className="italic text-apeksha">{userName(user)}</em>
          </h1>
        </div>
        <Avatar user={user} />
      </header>

      <div className="flex flex-col items-center mt-6">
        <JarSVG pct={combinedPct} size={200} showLabel />
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-3">
          together
        </p>
        <p className="font-display text-2xl text-ink mt-1">
          {combinedPct}<span className="text-muted text-base"> / 95%</span>
        </p>
        <p className="text-sm text-muted">
          {daysLeft()} days left · unlocks 🌴
        </p>
      </div>

      <section className="mx-6 mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-card bg-white shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Avatar user="apeksha" size="sm" />
            <span className="text-sm font-medium">Apeksha</span>
          </div>
          <p className="font-display text-3xl text-apeksha mt-2">0%</p>
          <p className="text-xs text-muted">0 pts earned</p>
        </div>
        <div className="rounded-card bg-white shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Avatar user="ved" size="sm" />
            <span className="text-sm font-medium">Ved</span>
          </div>
          <p className="font-display text-3xl text-ved mt-2">0%</p>
          <p className="text-xs text-muted">0 pts earned</p>
        </div>
      </section>

      <div className="mx-6 mt-6 rounded-card bg-paper p-3.5 text-xs flex items-center justify-between">
        <span className="uppercase tracking-widest text-muted">firebase</span>
        {ping.state === 'pending' && <span className="text-muted">⏳ connecting…</span>}
        {ping.state === 'ok' && (
          <span className="text-physical">
            🟢 ok · {new Date(ping.lastWrite).toLocaleTimeString()}
          </span>
        )}
        {ping.state === 'error' && (
          <span className="text-material truncate ml-2">⚠️ {ping.message}</span>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
