import { PACT_END, PACT_START } from './constants'

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysLeft(end: Date = PACT_END): number {
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
}

export function daysSinceStart(start: Date = PACT_START): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const s = new Date(start)
  s.setHours(0, 0, 0, 0)
  return Math.max(1, Math.ceil((today.getTime() - s.getTime()) / 86_400_000) + 1)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
