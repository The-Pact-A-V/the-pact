import { PACT_END, PACT_START } from './constants'

export function todayStr(): string {
  return formatDate(new Date())
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseDate(ds: string): Date {
  return new Date(`${ds}T00:00:00`)
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

export function isSameDay(a: Date, b: Date): boolean {
  return formatDate(a) === formatDate(b)
}

export function isFuture(d: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cmp = new Date(d)
  cmp.setHours(0, 0, 0, 0)
  return cmp.getTime() > today.getTime()
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

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export function dayShort(weekday: number): string {
  return DAY_LABELS[weekday] ?? '?'
}
export function dayName(weekday: number): string {
  return DAY_NAMES[weekday] ?? ''
}
