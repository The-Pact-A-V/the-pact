import { useEffect, useState } from 'react'
import { onValue, ref, update } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { UserId } from '@/types'

export interface Profile {
  displayName?: string
  tagline?: string
  avatarColor?: string
}

export function useProfile(userId: UserId) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, `profiles/${userId}`)
    const unsubscribe = onValue(r, (snap) => {
      setProfile((snap.val() as Profile) ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [userId])

  return { profile, loading }
}

export async function updateProfile(userId: UserId, patch: Profile): Promise<void> {
  await update(ref(db, `profiles/${userId}`), patch)
}
