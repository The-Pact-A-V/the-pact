import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { createPact } from '@/hooks/usePact'
import { formatDate, addDays, parseDate, cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().trim().min(1, 'name your pact').max(40),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  targetPct: z.number().int().min(50).max(100),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
  message: 'end must be after start',
  path: ['endDate'],
}).refine((d) => {
  const days = Math.ceil((new Date(d.endDate).getTime() - new Date(d.startDate).getTime()) / 86_400_000)
  return days >= 7
}, { message: 'pacts are at least a week long', path: ['endDate'] })

type FormData = z.infer<typeof schema>

const TARGET_PRESETS = [70, 80, 90, 95, 100]

export default function PactNew() {
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const today = formatDate(new Date())
  const defaultEnd = formatDate(addDays(parseDate(today), 49))

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: 'summer pact',
      startDate: today,
      endDate: defaultEnd,
      targetPct: 95,
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const targetPct = watch('targetPct')
  const duration = Math.max(
    1,
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000)
  )

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createPact(
        {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          targetPct: data.targetPct,
          rewardBoardId: null,
        },
        user
      )
      navigate('/pact-ready')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'failed to create')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-svh p-6 pb-12">
      <Link to="/onboarding" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">create</p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-8">
        a new <em className="italic text-apeksha">pact</em>
      </h1>

      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">name</label>
        <input
          {...register('name')}
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3.5 text-base outline-none focus:border-apeksha transition"
        />
        {errors.name && <p className="text-material text-xs mt-1.5">{errors.name.message}</p>}
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted">start</label>
          <input
            type="date"
            {...register('startDate')}
            className="mt-2 w-full bg-white rounded-card border border-line px-3 py-3 text-sm outline-none focus:border-apeksha transition"
          />
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

      <p className="text-xs text-muted -mt-3 mb-7">
        that's <span className="font-medium text-ink">{duration} days</span> · {Math.round(duration / 7)} weeks
      </p>

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
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white hover:border-line-strong'
                )}
              >
                <span className="font-display text-xl">{p}%</span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-muted mt-2 italic font-display">
          your combined target. hit it to unlock the reward.
        </p>
      </div>

      <div className="mb-8 rounded-card border border-line bg-paper p-3.5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">reward</p>
        <p className="text-sm mt-1">🌴 set later · pin a board on the Boards tab and link it in pact settings</p>
      </div>

      {submitError && <p className="text-material text-sm mb-3">⚠️ {submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'creating…' : 'begin the pact'}
      </button>
    </form>
  )
}
