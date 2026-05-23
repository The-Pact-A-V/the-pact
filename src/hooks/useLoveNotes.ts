import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '@/lib/firebase'
import { stripUndefined } from '@/lib/firebase-helpers'
import type { UserId } from '@/types'

export interface LoveNote {
  id: string
  fromUser: UserId
  toUser: UserId
  text: string
  deliveryDate: string // YYYY-MM-DD — date when the note becomes visible to the recipient
  createdAt: number
  openedAt?: number
}

export function useLoveNotes() {
  const [notes, setNotes] = useState<LoveNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'love_notes')
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, LoveNote> | null) ?? {}
      setNotes(Object.values(data).sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { notes, loading }
}

export interface NewLoveNoteInput {
  fromUser: UserId
  toUser: UserId
  text: string
  deliveryDate: string
}

export async function sendLoveNote(input: NewLoveNoteInput): Promise<LoveNote> {
  const trimmed = input.text.trim()
  if (!trimmed) throw new Error('letter is empty')
  if (!input.deliveryDate) throw new Error('pick a delivery date')

  const newRef = push(ref(db, 'love_notes'))
  const note: LoveNote = stripUndefined({
    id: newRef.key!,
    fromUser: input.fromUser,
    toUser: input.toUser,
    text: trimmed,
    deliveryDate: input.deliveryDate,
    createdAt: Date.now(),
  }) as LoveNote
  await set(newRef, note)
  return note
}

export async function markLoveNoteOpened(noteId: string): Promise<void> {
  await update(ref(db, `love_notes/${noteId}`), { openedAt: Date.now() })
}

export async function deleteLoveNote(noteId: string): Promise<void> {
  await remove(ref(db, `love_notes/${noteId}`))
}

// "Deliverable" = delivery date has arrived (or passed)
export function isDeliverable(note: LoveNote, today: string): boolean {
  return note.deliveryDate <= today
}
