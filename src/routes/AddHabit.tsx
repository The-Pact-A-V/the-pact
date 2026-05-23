import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { addActivity, deleteActivity, updateActivity, useActivity } from '@/hooks/useActivities'
import { CATEGORIES, DIFFICULTY_TIERS } from '@/lib/constants'
import { cn, dayShort } from '@/lib/utils'
import type { Frequency } from '@/types'

const freqTypes = ['daily', 'times_per_week', 'specific_days', 'custom'] as const

const schema = z.object({
  name: z.string().trim().min(1, 'pick a name').max(60, 'keep it under 60 chars'),
  category: z.enum(['mental', 'physical', 'spiritual', 'material']),
  points: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5), z.literal(8)]),
  freqType: z.enum(freqTypes),
  freqN: z.number().int().min(1).max(7).optional(),
  freqDays: z.array(z.number().int().min(0).max(6)).optional(),
  freqUnit: z.enum(['days', 'weeks', 'monthly']).optional(),
  freqInterval: z.number().int().min(1).max(30).optional(),
}).refine(
  (d) => d.freqType !== 'specific_days' || (d.freqDays && d.freqDays.length > 0),
  { message: 'pick at least one day', path: ['freqDays'] }
)

type FormData = z.infer<typeof schema>

function toFrequency(d: FormData): Frequency {
  switch (d.freqType) {
    case 'daily':
      return { type: 'daily' }
    case 'times_per_week':
      return { type: 'times_per_week', n: d.freqN ?? 3 }
    case 'specific_days':
      return { type: 'specific_days', days: (d.freqDays ?? []).slice().sort((a, b) => a - b) }
    case 'custom':
      return { type: 'custom', unit: d.freqUnit ?? 'days', interval: d.freqInterval ?? 1 }
  }
}

function fromFrequency(f: Frequency | undefined): Partial<FormData> {
  if (!f) return { freqType: 'daily' }
  switch (f.type) {
    case 'daily':
      return { freqType: 'daily' }
    case 'times_per_week':
      return { freqType: 'times_per_week', freqN: f.n }
    case 'specific_days':
      return { freqType: 'specific_days', freqDays: f.days }
    case 'custom':
      return { freqType: 'custom', freqUnit: f.unit, freqInterval: f.interval ?? 1 }
  }
}

const FREQ_TILES = [
  { value: 'daily', label: 'Daily', sub: 'every day' },
  { value: 'times_per_week', label: 'N×/week', sub: 'flexible' },
  { value: 'specific_days', label: 'Pick days', sub: 'M·W·F etc.' },
  { value: 'custom', label: 'Custom', sub: 'every N days' },
] as const

export default function AddHabit() {
  const user = useAuth((s) => s.user) ?? 'apeksha'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEdit = !!editId
  const { activity: existing, loading: loadingExisting } = useActivity(user, editId)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: searchParams.get('name') ?? '',
      category: (searchParams.get('category') as FormData['category']) || undefined,
      points: (Number(searchParams.get('points')) as FormData['points']) || 3,
      freqType: 'daily',
      freqN: 3,
      freqDays: [],
      freqUnit: 'days',
      freqInterval: 2,
    },
  })

  // When editing, populate the form once existing activity loads
  useEffect(() => {
    if (!isEdit || !existing) return
    reset({
      name: existing.name,
      category: existing.category,
      points: existing.points,
      ...fromFrequency(existing.frequency),
    })
  }, [isEdit, existing, reset])

  const selectedCategory = watch('category')
  const selectedPoints = watch('points')
  const selectedFreqType = watch('freqType')
  const freqDays = watch('freqDays') ?? []
  const freqN = watch('freqN') ?? 3
  const freqUnit = watch('freqUnit') ?? 'days'
  const freqInterval = watch('freqInterval') ?? 2

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        name: data.name,
        category: data.category,
        points: data.points,
        frequency: toFrequency(data),
      }
      if (isEdit && editId) {
        await updateActivity(user, editId, payload)
      } else {
        await addActivity(user, payload)
      }
      navigate('/habits')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'failed to save')
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editId) return
    if (!confirm('Remove this habit?')) return
    try {
      await deleteActivity(user, editId)
      navigate('/habits')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'failed to delete')
    }
  }

  function toggleDay(d: number) {
    const set = new Set(freqDays)
    if (set.has(d)) set.delete(d)
    else set.add(d)
    setValue('freqDays', Array.from(set).sort((a, b) => a - b), { shouldValidate: true })
  }

  if (isEdit && loadingExisting) {
    return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
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
        {isEdit ? 'edit habit' : 'new habit'}
      </p>
      <h1 className="font-display text-4xl text-ink mt-1 mb-8">
        {isEdit ? 'Edit habit' : 'Add a habit'}
      </h1>

      {/* Name */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">name</label>
        <input
          type="text"
          autoFocus={!isEdit}
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
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">category</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const active = selectedCategory === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setValue('category', key as FormData['category'], { shouldValidate: true })}
                className={cn(
                  'rounded-card p-3.5 border-2 transition flex items-center gap-2.5 text-left',
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white hover:border-line-strong'
                )}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
        {errors.category && <p className="text-material text-xs mt-1.5">{errors.category.message}</p>}
      </div>

      {/* Frequency */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">frequency</label>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {FREQ_TILES.map((tile) => {
            const active = selectedFreqType === tile.value
            return (
              <button
                key={tile.value}
                type="button"
                onClick={() => setValue('freqType', tile.value, { shouldValidate: true })}
                className={cn(
                  'rounded-card py-2.5 px-1 border-2 transition flex flex-col items-center text-center',
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white hover:border-line-strong'
                )}
              >
                <span className="text-[11px] font-medium">{tile.label}</span>
                <span className="text-[9px] text-muted mt-0.5">{tile.sub}</span>
              </button>
            )
          })}
        </div>

        {/* Sub-controls per type */}
        {selectedFreqType === 'times_per_week' && (
          <div className="mt-3 rounded-card border border-line bg-paper p-3.5 flex items-center justify-between">
            <span className="text-sm">{freqN}× per week</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setValue('freqN', Math.max(1, freqN - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
                className="w-8 h-8 rounded-full bg-white border border-line text-ink active:scale-95 transition"
              >
                −
              </button>
              <span className="font-medium w-6 text-center">{freqN}</span>
              <button
                type="button"
                onClick={() => setValue('freqN', Math.min(7, freqN + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
                className="w-8 h-8 rounded-full bg-white border border-line text-ink active:scale-95 transition"
              >
                +
              </button>
            </div>
          </div>
        )}

        {selectedFreqType === 'specific_days' && (
          <div className="mt-3">
            <div className="grid grid-cols-7 gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const active = freqDays.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'rounded-full aspect-square text-xs font-medium border-2 transition',
                      active
                        ? 'border-apeksha bg-lavender text-apeksha'
                        : 'border-line bg-white text-muted hover:border-line-strong'
                    )}
                  >
                    {dayShort(d)}
                  </button>
                )
              })}
            </div>
            {errors.freqDays && (
              <p className="text-material text-xs mt-1.5">{errors.freqDays.message}</p>
            )}
          </div>
        )}

        {selectedFreqType === 'custom' && (
          <div className="mt-3 rounded-card border border-line bg-paper p-3.5 space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
              {(['days', 'weeks', 'monthly'] as const).map((u) => {
                const active = freqUnit === u
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setValue('freqUnit', u)}
                    className={cn(
                      'rounded-card py-2 border-2 text-xs font-medium transition',
                      active ? 'border-apeksha bg-lavender' : 'border-line bg-white'
                    )}
                  >
                    {u}
                  </button>
                )
              })}
            </div>
            {freqUnit !== 'monthly' && (
              <div className="flex items-center justify-between">
                <span className="text-sm">every {freqInterval} {freqUnit}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('freqInterval', Math.max(1, freqInterval - 1))}
                    className="w-8 h-8 rounded-full bg-white border border-line active:scale-95 transition"
                  >
                    −
                  </button>
                  <span className="font-medium w-6 text-center">{freqInterval}</span>
                  <button
                    type="button"
                    onClick={() => setValue('freqInterval', Math.min(30, freqInterval + 1))}
                    className="w-8 h-8 rounded-full bg-white border border-line active:scale-95 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="mb-7">
        <label className="text-[11px] uppercase tracking-[0.2em] text-muted">difficulty</label>
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
                  active ? 'border-apeksha bg-lavender' : 'border-line bg-white hover:border-line-strong'
                )}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-[10px] font-medium text-muted">+{t.points}</span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-muted mt-2">
          {DIFFICULTY_TIERS.find((t) => t.points === selectedPoints)?.label} · {selectedPoints} pt
          {selectedPoints === 1 ? '' : 's'}
        </p>
      </div>

      {submitError && <p className="text-material text-sm mb-3">⚠️ {submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-3.5 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition disabled:opacity-50"
      >
        {submitting ? 'saving…' : isEdit ? 'save changes' : 'save habit'}
      </button>

      {isEdit && (
        <button
          type="button"
          onClick={handleDelete}
          className="w-full mt-4 px-4 py-3 rounded-pill bg-white text-material border border-line flex items-center justify-center gap-2 hover:bg-paper transition"
        >
          <Trash2 size={16} /> delete habit
        </button>
      )}
    </form>
  )
}
