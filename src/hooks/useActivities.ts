import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Activity, Category, Difficulty, Frequency, UserId } from '@/types'

export function useActivities(userId: UserId) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, `activities/${userId}`)
    const unsubscribe = onValue(r, (snap) => {
      const value = snap.val() as Record<string, Activity> | null
      const list = value ? Object.values(value) : []
      list.sort((a, b) => a.createdAt - b.createdAt)
      setActivities(list)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [userId])

  return { activities, loading }
}

export function useActivity(userId: UserId, activityId: string | null) {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activityId) {
      setActivity(null)
      setLoading(false)
      return
    }
    const r = ref(db, `activities/${userId}/${activityId}`)
    const unsubscribe = onValue(r, (snap) => {
      setActivity((snap.val() as Activity) ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [userId, activityId])

  return { activity, loading }
}

interface NewActivityInput {
  name: string
  category: Category
  points: Difficulty
  frequency: Frequency
}

export async function addActivity(userId: UserId, input: NewActivityInput): Promise<Activity> {
  const collectionRef = ref(db, `activities/${userId}`)
  const newRef = push(collectionRef)
  const activity: Activity = {
    id: newRef.key!,
    userId,
    pactId: 'current',
    name: input.name.trim(),
    category: input.category,
    frequency: input.frequency,
    points: input.points,
    createdAt: Date.now(),
  }
  await set(newRef, activity)
  return activity
}

interface UpdateActivityInput {
  name: string
  category: Category
  points: Difficulty
  frequency: Frequency
}

export async function updateActivity(
  userId: UserId,
  activityId: string,
  input: UpdateActivityInput
): Promise<void> {
  await update(ref(db, `activities/${userId}/${activityId}`), {
    name: input.name.trim(),
    category: input.category,
    points: input.points,
    frequency: input.frequency,
  })
}

export async function deleteActivity(userId: UserId, activityId: string): Promise<void> {
  await remove(ref(db, `activities/${userId}/${activityId}`))
}
