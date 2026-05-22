import { create } from 'zustand'

interface Prefs {
  notifyBuzzes: boolean
  notifyMorning: boolean
  notifySunday: boolean
  soundOn: boolean
  setPref: <K extends keyof PrefsState>(k: K, v: PrefsState[K]) => void
}

type PrefsState = Omit<Prefs, 'setPref'>

const STORAGE_KEY = 'pact_prefs'

function load(): PrefsState {
  if (typeof window === 'undefined') {
    return { notifyBuzzes: true, notifyMorning: true, notifySunday: true, soundOn: true }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { notifyBuzzes: true, notifyMorning: true, notifySunday: true, soundOn: true, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return { notifyBuzzes: true, notifyMorning: true, notifySunday: true, soundOn: true }
}

export const usePrefs = create<Prefs>((set, get) => ({
  ...load(),
  setPref: (k, v) => {
    set({ [k]: v } as Partial<Prefs>)
    const state = { ...get(), [k]: v }
    const persist: PrefsState = {
      notifyBuzzes: state.notifyBuzzes,
      notifyMorning: state.notifyMorning,
      notifySunday: state.notifySunday,
      soundOn: state.soundOn,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
  },
}))
