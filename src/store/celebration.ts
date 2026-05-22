import { create } from 'zustand'
import type { MilestoneThreshold } from '@/hooks/useMilestones'

interface CelebrationState {
  active: MilestoneThreshold | null
  show: (t: MilestoneThreshold) => void
  hide: () => void
}

export const useCelebration = create<CelebrationState>((set) => ({
  active: null,
  show: (t) => set({ active: t }),
  hide: () => set({ active: null }),
}))
