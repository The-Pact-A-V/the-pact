import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Board } from '@/types'

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'boards')
    const unsubscribe = onValue(r, (snap) => {
      const data = (snap.val() as Record<string, Board> | null) ?? {}
      setBoards(Object.values(data).sort((a, b) => a.createdAt - b.createdAt))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { boards, loading }
}

export function useBoard(boardId: string | null) {
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) {
      setBoard(null)
      setLoading(false)
      return
    }
    const r = ref(db, `boards/${boardId}`)
    const unsubscribe = onValue(r, (snap) => {
      setBoard((snap.val() as Board) ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [boardId])

  return { board, loading }
}

export interface BoardInput {
  name: string
  emoji: string
  coverColor: string
}

export async function createBoard(input: BoardInput): Promise<Board> {
  const newRef = push(ref(db, 'boards'))
  const board: Board = {
    id: newRef.key!,
    name: input.name.trim(),
    emoji: input.emoji,
    coverColor: input.coverColor,
    createdAt: Date.now(),
  }
  await set(newRef, board)
  return board
}

export async function updateBoard(boardId: string, input: BoardInput): Promise<void> {
  await update(ref(db, `boards/${boardId}`), {
    name: input.name.trim(),
    emoji: input.emoji,
    coverColor: input.coverColor,
  })
}

export async function deleteBoard(boardId: string): Promise<void> {
  await remove(ref(db, `boards/${boardId}`))
  await remove(ref(db, `board_items/${boardId}`))
  await remove(ref(db, `board_reactions/${boardId}`))
}

export const GRADIENT_PRESETS: Array<{ key: string; classes: string; preview: string }> = [
  { key: 'butter-peach', classes: 'from-butter to-peach', preview: 'butter → peach' },
  { key: 'sage-lavender', classes: 'from-sage to-lavender', preview: 'sage → lavender' },
  { key: 'pink-lavender', classes: 'from-pink to-lavender', preview: 'pink → lavender' },
  { key: 'lavender-cream', classes: 'from-lavender to-cream', preview: 'lavender → cream' },
  { key: 'peach-pink', classes: 'from-peach to-pink', preview: 'peach → pink' },
  { key: 'butter-sage', classes: 'from-butter to-sage', preview: 'butter → sage' },
  { key: 'pink-butter', classes: 'from-pink to-butter', preview: 'pink → butter' },
  { key: 'sage-peach', classes: 'from-sage to-peach', preview: 'sage → peach' },
]

export function gradientClasses(key: string): string {
  return GRADIENT_PRESETS.find((g) => g.key === key)?.classes ?? GRADIENT_PRESETS[0].classes
}

export const EMOJI_PICKS = [
  '🌴', '🏝', '✈️', '🗺',
  '💜', '💖', '🌸', '✨',
  '🏡', '🏠', '🛋', '🪴',
  '🍱', '🍷', '🍝', '🥘',
  '🎨', '📚', '📓', '🎬',
  '🌅', '🌊', '🌳', '🌷',
]
