import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Activity, Category, Difficulty, UserId } from '@/types'

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

interface NewActivityInput {
  name: string
  category: Category
  points: Difficulty
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
    frequency: { type: 'daily' },
    points: input.points,
    createdAt: Date.now(),
  }
  await set(newRef, activity)
  return activity
}

export async function deleteActivity(userId: UserId, activityId: string): Promise<void> {
  await remove(ref(db, `activities/${userId}/${activityId}`))
}
