import { useEffect, useState } from 'react'
import { onValue, ref, remove, set, update } from 'firebase/database'
import { db } from '@/lib/firebase'
import { stripUndefined } from '@/lib/firebase-helpers'
import type { UserId } from '@/types'

export interface JournalEntry {
  userId: UserId
  date: string // YYYY-MM-DD
  text?: string
  photoUrl?: string
  updatedAt: number
}

// All of a user's entries, keyed by date.
export function useJournal(userId: UserId | null) {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setEntries({})
      setLoading(false)
      return
    }
    const r = ref(db, `journal/${userId}`)
    const unsubscribe = onValue(r, (snap) => {
      setEntries((snap.val() ?? {}) as Record<string, JournalEntry>)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [userId])

  return { entries, loading }
}

export function useJournalEntry(userId: UserId | null, date: string) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setEntry(null)
      setLoading(false)
      return
    }
    const r = ref(db, `journal/${userId}/${date}`)
    const unsubscribe = onValue(r, (snap) => {
      setEntry((snap.val() as JournalEntry) ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [userId, date])

  return { entry, loading }
}

interface SaveInput {
  text?: string
  photoUrl?: string
}

export async function saveJournalEntry(
  userId: UserId,
  date: string,
  input: SaveInput
): Promise<void> {
  const trimmed = input.text?.trim()
  // If both fields empty, delete the entry instead.
  if (!trimmed && !input.photoUrl) {
    await remove(ref(db, `journal/${userId}/${date}`))
    return
  }
  await update(
    ref(db, `journal/${userId}/${date}`),
    stripUndefined({
      userId,
      date,
      text: trimmed || null,
      photoUrl: input.photoUrl || null,
      updatedAt: Date.now(),
    })
  )
}

export async function setJournalText(userId: UserId, date: string, text: string): Promise<void> {
  await saveJournalEntry(userId, date, { text })
}

export async function setJournalPhoto(userId: UserId, date: string, photoUrl: string): Promise<void> {
  // Merge into existing entry without dropping text
  const r = ref(db, `journal/${userId}/${date}`)
  await update(r, { photoUrl, updatedAt: Date.now(), userId, date })
}

export async function clearJournalPhoto(userId: UserId, date: string): Promise<void> {
  await update(ref(db, `journal/${userId}/${date}`), { photoUrl: null, updatedAt: Date.now() })
}

export async function deleteJournalEntry(userId: UserId, date: string): Promise<void> {
  await set(ref(db, `journal/${userId}/${date}`), null)
}
