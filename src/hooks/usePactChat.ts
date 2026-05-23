import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, get } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { UserId } from '@/types'

export const CHAT_REACTION_EMOJIS = ['💜', '🔥', '😍', '🌊', '✨', '🥹'] as const

export interface ChatReaction {
  userId: UserId
  emoji: string
  createdAt: number
}

function reactionKey(userId: UserId, emoji: string): string {
  return `${userId}_${[...emoji].map((c) => c.codePointAt(0)).join('-')}`
}

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
  await remove(ref(db, `pact_chat_reactions/${messageId}`))
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

// ----- Reactions -----

export function useChatReactions() {
  const [byMessage, setByMessage] = useState<Record<string, ChatReaction[]>>({})

  useEffect(() => {
    const r = ref(db, 'pact_chat_reactions')
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, Record<string, ChatReaction>> | null) ?? {}
      const out: Record<string, ChatReaction[]> = {}
      for (const msgId in data) {
        out[msgId] = Object.values(data[msgId])
      }
      setByMessage(out)
    })
    return () => unsubscribe()
  }, [])

  return byMessage
}

export async function toggleChatReaction(
  messageId: string,
  userId: UserId,
  emoji: string
): Promise<void> {
  const key = reactionKey(userId, emoji)
  const r = ref(db, `pact_chat_reactions/${messageId}/${key}`)
  const snap = await get(r)
  if (snap.exists()) {
    await remove(r)
  } else {
    await set(r, { userId, emoji, createdAt: Date.now() })
  }
}
