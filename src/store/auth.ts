import { create } from 'zustand'
import type { UserId } from '@/types'

interface AuthState {
  user: UserId | null
  setUser: (user: UserId | null) => void
  logout: () => void
}

const stored = (typeof window !== 'undefined' ? localStorage.getItem('pact_user') : null) as UserId | null

export const useAuth = create<AuthState>((set) => ({
  user: stored,
  setUser: (user) => {
    if (user) localStorage.setItem('pact_user', user)
    else localStorage.removeItem('pact_user')
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('pact_user')
    set({ user: null })
  },
}))

export function otherUser(u: UserId): UserId {
  return u === 'apeksha' ? 'ved' : 'apeksha'
}

export function userName(u: UserId): string {
  return u === 'apeksha' ? 'Apeksha' : 'Ved'
}
