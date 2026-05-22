import { useEffect, useState } from 'react'
import { onValue, push, ref, set, update, get, remove } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Pact, UserId } from '@/types'

export function useActivePact() {
  const [pact, setPact] = useState<Pact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'pacts/active')
    const unsubscribe = onValue(r, (snap) => {
      setPact((snap.val() as Pact) ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { pact, loading }
}

export interface NewPactInput {
  name: string
  startDate: string
  endDate: string
  targetPct: number
  rewardBoardId: string | null
}

export async function createPact(input: NewPactInput, createdBy: UserId): Promise<Pact> {
  const existing = await get(ref(db, 'pacts/active'))
  if (existing.exists()) {
    throw new Error('an active pact already exists — finish or end it before creating a new one')
  }
  const idRef = push(ref(db, 'pacts/_ids'))
  const pact: Pact = {
    id: idRef.key!,
    name: input.name.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    targetPct: input.targetPct,
    rewardBoardId: input.rewardBoardId,
    status: 'active',
    createdBy,
    pactJoinedByA: createdBy === 'apeksha',
    pactJoinedByV: createdBy === 'ved',
    createdAt: Date.now(),
    closedAt: null,
  }
  await set(ref(db, 'pacts/active'), pact)
  return pact
}

export async function updateActivePact(updates: Partial<Pact>): Promise<void> {
  await update(ref(db, 'pacts/active'), updates)
}

export async function joinActivePact(user: UserId): Promise<void> {
  const key = user === 'apeksha' ? 'pactJoinedByA' : 'pactJoinedByV'
  await update(ref(db, 'pacts/active'), { [key]: true })
}

export async function abandonActivePact(): Promise<void> {
  const snap = await get(ref(db, 'pacts/active'))
  const current = snap.val() as Pact | null
  if (!current) return
  const archived: Pact = {
    ...current,
    status: 'abandoned',
    closedAt: Date.now(),
  }
  await set(ref(db, `pacts/archive/${current.id}`), archived)
  await remove(ref(db, 'pacts/active'))
}

export function pactDurationDays(pact: Pact): number {
  const start = new Date(pact.startDate + 'T00:00:00')
  const end = new Date(pact.endDate + 'T23:59:59')
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))
}

export function daysLeftForPact(pact: Pact): number {
  const end = new Date(pact.endDate + 'T23:59:59')
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
}

export function dayNumberInPact(pact: Pact): number {
  const start = new Date(pact.startDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(1, Math.ceil((today.getTime() - start.getTime()) / 86_400_000) + 1)
}

export function hasJoined(pact: Pact, user: UserId): boolean {
  return user === 'apeksha' ? pact.pactJoinedByA : pact.pactJoinedByV
}

export function useArchivedPacts() {
  const [pacts, setPacts] = useState<Pact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'pacts/archive')
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, Pact> | null) ?? {}
      const list = Object.values(data).sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0))
      setPacts(list)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { pacts, loading }
}

export function useArchivedPact(pactId: string | null) {
  const [pact, setPact] = useState<Pact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pactId) {
      setPact(null)
      setLoading(false)
      return
    }
    const r = ref(db, `pacts/archive/${pactId}`)
    const unsubscribe = onValue(r, (snap) => {
      setPact((snap.val() as Pact) ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [pactId])

  return { pact, loading }
}
