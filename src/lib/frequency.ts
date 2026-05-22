import type { Frequency } from '@/types'

const PACT_LENGTH_DAYS = 50

export function isScheduledOn(freq: Frequency, date: Date): boolean {
  switch (freq.type) {
    case 'daily':
      return true
    case 'times_per_week':
      // Flexible — user picks any N days in the week. Show every day.
      return true
    case 'specific_days':
      return freq.days.includes(date.getDay())
    case 'custom':
      // For MVP: always show; computing exact schedule requires the pact's start date.
      return true
  }
}

export function occurrencesInPact(freq: Frequency, pactDays = PACT_LENGTH_DAYS): number {
  switch (freq.type) {
    case 'daily':
      return pactDays
    case 'times_per_week':
      return freq.n * Math.ceil(pactDays / 7)
    case 'specific_days':
      return Math.max(1, freq.days.length) * Math.ceil(pactDays / 7)
    case 'custom': {
      const interval = freq.interval ?? 1
      if (freq.unit === 'monthly') return Math.max(1, Math.ceil(pactDays / 30))
      if (freq.unit === 'weeks') return Math.max(1, Math.ceil(pactDays / (interval * 7)))
      return Math.max(1, Math.ceil(pactDays / interval))
    }
  }
}

export function freqLabel(freq: Frequency): string {
  switch (freq.type) {
    case 'daily':
      return 'daily'
    case 'times_per_week':
      return `${freq.n}×/week`
    case 'specific_days': {
      const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      return freq.days
        .slice()
        .sort((a, b) => a - b)
        .map((d) => labels[d])
        .join(' ')
    }
    case 'custom':
      if (freq.unit === 'monthly') return 'monthly'
      return `every ${freq.interval ?? 1} ${freq.unit}`
  }
}
