import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { addActivity } from '@/hooks/useActivities'
import { CATEGORIES, DIFFICULTY_TIERS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().trim().min(1, 'pick a name').max(60, 'keep it under 60 chars'),
  category: z.enum(['mental', 'physical', 'spiritual', 'material']),
  points: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5), z.literal(8)]),
})

type FormData = z.infer<typeof schema>

export default function AddHabit() {
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { points: 3 },
  })

  const selectedCategory = watch('category')
  const selectedPoints = watch('points')

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await addActivity(user, data)
      navigate('/habits')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'failed to save')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-svh p-6 pb-12">
      <Link
        to="/habits"
        className="inline-flex items-center gap-1 text-muted text-sm hover:text-ink transition"
      >
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">
        new habit
      </p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-8">Add a habit</h1>

      {/* Name */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
          name
        </label>
        <input
          type="text"
          autoFocus
          placeholder="morning meditation"
          {...register('name')}
          className="mt-2 w-full bg-white rounded-card border border-line px-4 py-3.5 text-base outline-none focus:border-apeksha transition"
        />
        {errors.name && (
          <p className="text-material text-xs mt-1.5">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
          category
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const active = selectedCategory === key
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setValue('category', key as FormData['category'], { shouldValidate: true })
                }
                className={cn(
                  'rounded-card p-3.5 border-2 transition flex items-center gap-2.5 text-left',
                  active
                    ? 'border-apeksha bg-lavender'
                    : 'border-line bg-white hover:border-line-strong'
                )}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
        {errors.category && (
          <p className="text-material text-xs mt-1.5">{errors.category.message}</p>
        )}
      </div>

      {/* Difficulty */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
          difficulty
        </label>
        <p className="text-xs text-faint italic font-display mt-0.5">
          harder = more liquid in the jar
        </p>
        <div className="mt-2.5 grid grid-cols-5 gap-1.5">
          {DIFFICULTY_TIERS.map((t) => {
            const active = selectedPoints === t.points
            return (
              <button
                key={t.points}
                type="button"
                onClick={() => setValue('points', t.points, { shouldValidate: true })}
                className={cn(
                  'rounded-card py-3 border-2 transition flex flex-col items-center gap-1',
                  active
                    ? 'border-apeksha bg-lavender'
                    : 'border-line bg-white hover:border-line-strong'
                )}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-[10px] font-medium text-muted">+{t.points}</span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-muted mt-2">
          {DIFFICULTY_TIERS.find((t) => t.points === selectedPoints)?.label} · {selectedPoints} pt{selectedPoints === 1 ? '' : 's'}
        </p>
      </div>

      {/* Frequency placeholder */}
      <div className="mb-8">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
          frequency
        </label>
        <div className="mt-2 rounded-card border border-line bg-paper px-4 py-3.5">
          <p className="text-sm font-medium">Daily</p>
          <p className="text-xs text-muted italic font-display">
            specific days / N×/week coming soon
          </p>
        </div>
      </div>

      {submitError && (
        <p className="text-material text-sm mb-3">⚠️ {submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'saving…' : 'save habit'}
      </button>
    </form>
  )
}
