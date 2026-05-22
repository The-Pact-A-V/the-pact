import { useEffect, useState } from 'react'
import { onValue, push, ref, set, update } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Buzz, UserId } from '@/types'

const BUZZ_DAILY_LIMIT = 10

export function useBuzzes() {
  const [buzzes, setBuzzes] = useState<Buzz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'buzzes')
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, Buzz> | null) ?? {}
      setBuzzes(Object.values(data).sort((a, b) => b.sentAt - a.sentAt))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { buzzes, loading }
}

function isToday(ts: number): boolean {
  const d = new Date(ts)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function buzzesSentToday(buzzes: Buzz[], from: UserId): Buzz[] {
  return buzzes.filter((b) => b.fromUser === from && isToday(b.sentAt))
}

export function buzzesLeftToday(buzzes: Buzz[], from: UserId): number {
  return Math.max(0, BUZZ_DAILY_LIMIT - buzzesSentToday(buzzes, from).length)
}

export interface SendBuzzInput {
  from: UserId
  to: UserId
  message: string
  presetType: Buzz['presetType']
}

export async function sendBuzz(input: SendBuzzInput): Promise<Buzz> {
  const newRef = push(ref(db, 'buzzes'))
  const buzz: Buzz = {
    id: newRef.key!,
    fromUser: input.from,
    toUser: input.to,
    message: input.message,
    presetType: input.presetType,
    sentAt: Date.now(),
    seenAt: null,
  }
  await set(newRef, buzz)
  return buzz
}

export async function markBuzzSeen(buzzId: string): Promise<void> {
  await update(ref(db, `buzzes/${buzzId}`), { seenAt: Date.now() })
}

export const BUZZ_PRESETS = [
  { type: 'heart', emoji: '💜', message: 'thinking of you' },
  { type: 'star', emoji: '✦', message: "you got this" },
  { type: 'sun', emoji: '☀️', message: 'good morning' },
  { type: 'moon', emoji: '🌙', message: 'good night' },
] as const

export type BuzzPreset = (typeof BUZZ_PRESETS)[number]
