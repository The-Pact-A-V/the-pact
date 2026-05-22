import { create } from 'zustand'
import type { Buzz } from '@/types'

interface BuzzAnimState {
  // The currently-animating incoming buzz (drives FloatingHearts overlay).
  incoming: Buzz | null
  trigger: (buzz: Buzz) => void
  clear: () => void
}

export const useBuzzAnim = create<BuzzAnimState>((set) => ({
  incoming: null,
  trigger: (buzz) => set({ incoming: buzz }),
  clear: () => set({ incoming: null }),
}))
