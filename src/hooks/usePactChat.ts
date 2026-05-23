import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { UserId } from '@/types'

export interface PactMessage {
  id: string
  userId: UserId
  text: string
  createdAt: number
}

export function usePactChat() {
  const [messages, setMessages] = useState<PactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'pact_chat')
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, PactMessage> | null) ?? {}
      setMessages(Object.values(data).sort((a, b) => a.createdAt - b.createdAt))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { messages, loading }
}

export async function sendPactMessage(userId: UserId, text: string): Promise<PactMessage> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('message is empty')
  const newRef = push(ref(db, 'pact_chat'))
  const message: PactMessage = {
    id: newRef.key!,
    userId,
    text: trimmed,
    createdAt: Date.now(),
  }
  await set(newRef, message)
  return message
}

export async function deletePactMessage(messageId: string): Promise<void> {
  await remove(ref(db, `pact_chat/${messageId}`))
}

const PACT_CHAT_SEEN_KEY = 'pact_chat_last_seen'

export function getPactChatLastSeen(): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(PACT_CHAT_SEEN_KEY)
  return raw ? Number(raw) : 0
}

export function markPactChatSeen(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PACT_CHAT_SEEN_KEY, String(Date.now()))
}
