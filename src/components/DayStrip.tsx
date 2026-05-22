import { addDays, dayShort, formatDate, isFuture, parseDate, todayStr } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DayStripProps {
  viewedDate: string
  todayDate?: string
  onPick: (dateStr: string) => void
  shadeFor: (dateStr: string) => 'high' | 'mid' | 'low' | 'none' | 'future'
}

function shadeClass(shade: ReturnType<DayStripProps['shadeFor']>): string {
  switch (shade) {
    case 'high':
      return 'bg-sage text-ved'
    case 'mid':
      return 'bg-butter text-ink-soft'
    case 'low':
      return 'bg-paper text-muted'
    case 'future':
      return 'bg-transparent text-faint border border-line'
    default:
      return 'bg-paper text-faint'
  }
}

export default function DayStrip({ viewedDate, todayDate = todayStr(), onPick, shadeFor }: DayStripProps) {
  // Build a 7-day window ending today
  const today = parseDate(todayDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))

  return (
    <div className="flex justify-between items-center px-6 mt-2 mb-4 gap-1.5">
      {days.map((d) => {
        const ds = formatDate(d)
        const future = isFuture(d)
        const isViewed = ds === viewedDate
        const isToday = ds === todayDate
        const shade = future ? 'future' : shadeFor(ds)
        return (
          <button
            key={ds}
            disabled={future}
            onClick={() => onPick(ds)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-card py-2 px-1 flex-1 transition active:scale-[0.97]',
              shadeClass(shade),
              isViewed && !future && 'ring-2 ring-apeksha',
              isToday && 'font-bold',
              future && 'cursor-not-allowed'
            )}
            aria-label={ds}
          >
            <span className="text-[10px] uppercase tracking-wider">{dayShort(d.getDay())}</span>
            <span className="text-base font-medium">{d.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
