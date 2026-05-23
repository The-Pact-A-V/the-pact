// "On this day" memory selection. Looks back N days for something worth
// surfacing on the dashboard. Returns a single, prioritized memory, or null.

import type { Pact, BoardItem, Buzz } from '@/types'
import type { LogTree } from '@/hooks/useDailyLogs'
import { dayHasAnyTick, earnedOnDate } from '@/hooks/useDailyLogs'
import { addDays, formatDate, parseDate, todayStr } from './utils'
import { userName } from '@/store/auth'

export interface Memory {
  kind: 'milestone' | 'perfect' | 'buzz' | 'pin' | 'comeback' | 'shared'
  text: string
  date: string // YYYY-MM-DD
  emoji?: string
  daysAgo: number
}

const CANDIDATE_AGES = [7, 14, 21, 30, 60, 90] // weeks / month / quarter

function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86_400_000)
}

interface Inputs {
  pact: Pact | null
  apekshaLogs: LogTree
  vedLogs: LogTree
  boardItems: BoardItem[]   // flat list, all boards
  buzzes: Buzz[]
}

export function pickMemory(input: Inputs): Memory | null {
  const today = todayStr()
  const candidates: Memory[] = []

  // 1. Pact-anniversary milestones (1 week / 2 weeks / 1 month into the pact)
  if (input.pact) {
    const sinceStart = daysBetween(input.pact.startDate, today)
    const MILESTONE_DAYS = [7, 14, 21, 30, 50, 100]
    for (const d of MILESTONE_DAYS) {
      if (sinceStart === d) {
        const label = d === 7 ? 'a week in'
          : d === 14 ? 'two weeks in'
          : d === 21 ? 'three weeks in'
          : d === 30 ? 'a month in'
          : d === 50 ? '50 days in'
          : `${d} days in`
        candidates.push({
          kind: 'milestone',
          text: `${label} · ${input.pact.name}`,
          date: input.pact.startDate,
          emoji: '🌱',
          daysAgo: sinceStart,
        })
      }
    }
  }

  // 2. Perfect / high-scoring shared days from N days ago
  for (const age of CANDIDATE_AGES) {
    const dateAgo = formatDate(addDays(parseDate(today), -age))
    const both = dayHasAnyTick(input.apekshaLogs, dateAgo) && dayHasAnyTick(input.vedLogs, dateAgo)
    if (!both) continue
    const combined = earnedOnDate(input.apekshaLogs, dateAgo) + earnedOnDate(input.vedLogs, dateAgo)
    if (combined >= 20) {
      candidates.push({
        kind: 'perfect',
        text: `${labelForAge(age)} you both showed up · ${combined} pts together`,
        date: dateAgo,
        emoji: '✨',
        daysAgo: age,
      })
    }
  }

  // 3. Memorable pins from N days ago
  for (const age of CANDIDATE_AGES) {
    const dateAgo = formatDate(addDays(parseDate(today), -age))
    const pinsThatDay = input.boardItems.filter(
      (it) => formatDate(new Date(it.addedAt)) === dateAgo
    )
    if (pinsThatDay.length === 0) continue
    const pin = pinsThatDay[0]
    const who = userName(pin.addedBy)
    const noun = pin.type === 'photo' ? 'a photo'
      : pin.type === 'note' ? 'a note'
      : pin.type === 'link' ? 'a link'
      : 'something'
    candidates.push({
      kind: 'pin',
      text: `${labelForAge(age)} ${who} pinned ${noun}`,
      date: dateAgo,
      emoji: '📌',
      daysAgo: age,
    })
  }

  // 4. The first buzz ever
  if (input.buzzes.length > 0) {
    const earliest = input.buzzes.reduce((min, b) => (b.sentAt < min.sentAt ? b : min), input.buzzes[0])
    const earliestDate = formatDate(new Date(earliest.sentAt))
    const ageOfFirstBuzz = daysBetween(earliestDate, today)
    if (CANDIDATE_AGES.includes(ageOfFirstBuzz)) {
      candidates.push({
        kind: 'buzz',
        text: `${labelForAge(ageOfFirstBuzz)} you sent your first buzz`,
        date: earliestDate,
        emoji: '💜',
        daysAgo: ageOfFirstBuzz,
      })
    }
  }

  if (candidates.length === 0) return null
  // Prioritize: milestone > perfect > buzz > pin
  const order: Record<Memory['kind'], number> = {
    milestone: 0, perfect: 1, buzz: 2, pin: 3, comeback: 4, shared: 5,
  }
  candidates.sort((a, b) => order[a.kind] - order[b.kind] || a.daysAgo - b.daysAgo)
  return candidates[0]
}

function labelForAge(d: number): string {
  if (d === 7) return 'a week ago today,'
  if (d === 14) return 'two weeks ago,'
  if (d === 21) return 'three weeks ago,'
  if (d === 30) return 'a month ago,'
  if (d === 60) return 'two months ago,'
  if (d === 90) return 'three months ago,'
  return `${d} days ago,`
}
