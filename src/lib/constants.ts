// Source of truth for the active pact will live in Firestore once data is wired.
// These are temporary placeholders that match the live v1 pact so screens have something to render.

export const USER_IDS = ['apeksha', 'ved'] as const
export type UserId = (typeof USER_IDS)[number]

export const PACT_START = new Date('2026-05-16T00:00:00')
export const PACT_END = new Date('2026-07-05T23:59:59')
export const PACT_TARGET_PCT = 95

export const CATEGORIES = {
  mental: { label: 'Mental', emoji: '🧠' },
  physical: { label: 'Physical', emoji: '💪' },
  spiritual: { label: 'Spiritual', emoji: '🕊️' },
  material: { label: 'Material', emoji: '💎' },
} as const

export type Category = keyof typeof CATEGORIES

export const DIFFICULTY_TIERS = [
  { points: 1, emoji: '💧', label: 'Sip' },
  { points: 2, emoji: '🥄', label: 'Quick' },
  { points: 3, emoji: '🥛', label: 'Steady' },
  { points: 5, emoji: '🏺', label: 'Big' },
  { points: 8, emoji: '🌊', label: 'Heroic' },
] as const
