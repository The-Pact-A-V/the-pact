import { Sparkles } from 'lucide-react'
import { useActivePact } from '@/hooks/usePact'
import { useDailyLogs } from '@/hooks/useDailyLogs'
import { useAllBoardItems } from '@/hooks/useBoardItems'
import { useBuzzes } from '@/hooks/useBuzzes'
import { pickMemory } from '@/lib/memories'

export default function MemoryCard() {
  const { pact } = useActivePact()
  const aLogs = useDailyLogs('apeksha')
  const vLogs = useDailyLogs('ved')
  const { items: boardItems } = useAllBoardItems()
  const { buzzes } = useBuzzes()

  const memory = pickMemory({
    pact,
    apekshaLogs: aLogs.logs,
    vedLogs: vLogs.logs,
    boardItems,
    buzzes,
  })

  if (!memory) return null

  return (
    <section className="mx-6 mt-6 rounded-card bg-gradient-to-br from-lavender/40 to-peach/40 border border-line p-4 flex items-start gap-3">
      <span className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-lg shrink-0">
        {memory.emoji ?? <Sparkles size={18} className="text-spiritual" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">on this day</p>
        <p className="font-display italic text-base text-ink mt-0.5 leading-snug">{memory.text}</p>
      </div>
    </section>
  )
}
