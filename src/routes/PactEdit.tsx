import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useActivePact, updateActivePact, abandonActivePact, dayNumberInPact, pactDurationDays } from '@/hooks/usePact'
import { useBoards, gradientClasses } from '@/hooks/useBoards'
import { cn, todayStr } from '@/lib/utils'

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  startDate: z.string(),
  endDate: z.string(),
  targetPct: z.number().int().min(50).max(100),
})

type FormData = z.infer<typeof schema>
const TARGET_PRESETS = [70, 80, 90, 95, 100]

export default function PactEdit() {
  const navigate = useNavigate()
  const { pact, loading } = useActivePact()
  const { boards } = useBoards()
  const [rewardBoardId, setRewardBoardId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (pact) {
      reset({ name: pact.name, startDate: pact.startDate, endDate: pact.endDate, targetPct: pact.targetPct })
      setRewardBoardId(pact.rewardBoardId)
    }
  }, [pact, reset])

  if (loading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  if (!pact) return <Navigate to="/onboarding" replace />

  const startLocked = pact.startDate <= todayStr()
  const targetPct = watch('targetPct') ?? pact.targetPct

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const updates: Partial<typeof pact> = {
        name: data.name,
        endDate: data.endDate,
        targetPct: data.targetPct,
        rewardBoardId,
      }
      if (!startLocked) updates.startDate = data.startDate
      await updateActivePact(updates)
      navigate('/settings')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'failed to save')
      setSubmitting(false)
    }
  }

  async function handleAbandon() {
    if (!confirm('end this pact early? all logs stay archived under it.')) return
    await abandonActivePact()
    navigate('/onboarding')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-svh p-6 pb-12">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <div className="flex items-center justify-between mt-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">edit</p>
          <h1 className="font-display text-4xl text-ink mt-1">{pact.name}</h1>
        </div>
        <span className="rounded-pill bg-lavender text-apeksha text-xs px-3 py-1.5">
          day {dayNumberInPact(pact)} · {pactDurationDays(pact)}d
        </span>
      </div>

      <div className="mt-8 mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">name</label>
        <input {...register('name')} className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3.5 text-base outline-none focus:border-apeksha transition" />
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted">start {startLocked && '🔒'}</label>
          <input
            type="date"
            disabled={startLocked}
            {...register('startDate')}
            className={cn(
              'mt-2 w-full rounded-card border px-3 py-3 text-sm outline-none transition',
              startLocked ? 'border-dashed border-line bg-paper text-muted' : 'border-line bg-white focus:border-apeksha'
            )}
          />
          {startLocked && <p className="text-[10px] text-muted mt-1">pact already started</p>}
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted">end</label>
          <input
            type="date"
            {...register('endDate')}
            className="mt-2 w-full bg-white rounded-card border border-line px-3 py-3 text-sm outline-none focus:border-apeksha transition"
          />
          {errors.endDate && <p className="text-material text-xs mt-1.5">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">together target</label>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {TARGET_PRESETS.map((p) => {
            const active = targetPct === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => setValue('targetPct', p, { shouldValidate: true })}
                className={cn(
                  'rounded-card py-3 border-2 transition flex flex-col items-center',
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white'
                )}
              >
                <span className="font-display text-xl">{p}%</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">reward board</label>
        <p className="text-xs text-faint italic font-display mt-0.5 mb-2">
          the board this pact unlocks when you hit the target
        </p>
        {boards.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-paper p-4 text-center">
            <p className="text-sm text-muted">no boards yet</p>
            <Link to="/board-new" className="text-xs text-apeksha mt-1 inline-block">create one →</Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {boards.map((b) => {
              const active = rewardBoardId === b.id
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setRewardBoardId(active ? null : b.id)}
                  className={cn(
                    'rounded-pill px-3 py-1.5 text-sm flex items-center gap-1.5 border-2 bg-gradient-to-br transition',
                    gradientClasses(b.coverColor),
                    active ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <span>{b.emoji}</span>
                  <span className="truncate max-w-[120px]">{b.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {submitError && <p className="text-material text-sm mb-3">⚠️ {submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'saving…' : 'save changes'}
      </button>

      <button
        type="button"
        onClick={handleAbandon}
        className="w-full mt-6 px-4 py-3 rounded-pill bg-white text-material border border-line flex items-center justify-center gap-2 hover:bg-paper transition"
      >
        <Trash2 size={16} /> end this pact
      </button>
    </form>
  )
}
