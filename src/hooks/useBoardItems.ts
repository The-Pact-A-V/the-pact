import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { BoardItem, UserId } from '@/types'

export function useBoardItems(boardId: string | null) {
  const [items, setItems] = useState<BoardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) {
      setItems([])
      setLoading(false)
      return
    }
    const r = ref(db, `board_items/${boardId}`)
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, BoardItem> | null) ?? {}
      setItems(Object.values(data).sort((a, b) => b.addedAt - a.addedAt))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [boardId])

  return { items, loading }
}

export function useBoardItem(boardId: string | null, itemId: string | null) {
  const [item, setItem] = useState<BoardItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId || !itemId) {
      setItem(null)
      setLoading(false)
      return
    }
    const r = ref(db, `board_items/${boardId}/${itemId}`)
    const unsubscribe = onValue(r, (snap) => {
      setItem((snap.val() as BoardItem) ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [boardId, itemId])

  return { item, loading }
}

interface AddItemInput {
  type: BoardItem['type']
  content: Record<string, unknown>
  addedBy: UserId
}

export async function addBoardItem(boardId: string, input: AddItemInput): Promise<BoardItem> {
  const newRef = push(ref(db, `board_items/${boardId}`))
  const item: BoardItem = {
    id: newRef.key!,
    boardId,
    type: input.type,
    content: input.content,
    position: Date.now(),
    addedBy: input.addedBy,
    addedAt: Date.now(),
  }
  await set(newRef, item)
  return item
}

export async function deleteBoardItem(boardId: string, itemId: string): Promise<void> {
  await remove(ref(db, `board_items/${boardId}/${itemId}`))
  await remove(ref(db, `board_reactions/${boardId}/${itemId}`))
  await remove(ref(db, `pin_comments/${boardId}/${itemId}`))
}

export interface ReactionEntry {
  userId: UserId
  emoji: string
  createdAt: number
}

export function useReactions(boardId: string | null, itemId: string | null) {
  const [reactions, setReactions] = useState<ReactionEntry[]>([])

  useEffect(() => {
    if (!boardId || !itemId) {
      setReactions([])
      return
    }
    const r = ref(db, `board_reactions/${boardId}/${itemId}`)
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, ReactionEntry> | null) ?? {}
      setReactions(Object.values(data))
    })
    return () => unsubscribe()
  }, [boardId, itemId])

  return reactions
}

function reactionKey(userId: UserId, emoji: string): string {
  // RTDB keys can't contain ., $, #, [, ], /
  return `${userId}_${[...emoji].map((c) => c.codePointAt(0)).join('-')}`
}

export async function toggleReaction(
  boardId: string,
  itemId: string,
  userId: UserId,
  emoji: string
): Promise<void> {
  const key = reactionKey(userId, emoji)
  const r = ref(db, `board_reactions/${boardId}/${itemId}/${key}`)
  // Read current state, toggle
  const { get } = await import('firebase/database')
  const snap = await get(r)
  if (snap.exists()) {
    await remove(r)
  } else {
    await set(r, { userId, emoji, createdAt: Date.now() })
  }
}

// --------------- Pin comments ----------------

export interface PinComment {
  id: string
  userId: UserId
  text: string
  createdAt: number
}

export function usePinComments(boardId: string | null, itemId: string | null) {
  const [comments, setComments] = useState<PinComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId || !itemId) {
      setComments([])
      setLoading(false)
      return
    }
    const r = ref(db, `pin_comments/${boardId}/${itemId}`)
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, PinComment> | null) ?? {}
      setComments(Object.values(data).sort((a, b) => a.createdAt - b.createdAt))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [boardId, itemId])

  return { comments, loading }
}

export async function addPinComment(
  boardId: string,
  itemId: string,
  userId: UserId,
  text: string
): Promise<PinComment> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('comment is empty')
  const collectionRef = ref(db, `pin_comments/${boardId}/${itemId}`)
  const newRef = push(collectionRef)
  const comment: PinComment = {
    id: newRef.key!,
    userId,
    text: trimmed,
    createdAt: Date.now(),
  }
  await set(newRef, comment)
  return comment
}

export async function deletePinComment(
  boardId: string,
  itemId: string,
  commentId: string
): Promise<void> {
  await remove(ref(db, `pin_comments/${boardId}/${itemId}/${commentId}`))
}

