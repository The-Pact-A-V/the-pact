import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { onValue, ref, set, remove } from 'firebase/database'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/store/auth'
import type { UserId } from '@/types'

// Boots Firebase Auth on app start, signs in anonymously if needed, and
// reconciles the Firebase UID with the logical user identity ('apeksha' | 'ved')
// stored at /uid_map/{firebaseUid}.
export function useFirebaseAuthBoot(): { ready: boolean; error: string | null } {
  const setUser = useAuth((s) => s.setUser)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubMap: (() => void) | undefined

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // No session — attempt anonymous sign-in. Once successful, this
        // callback fires again with the new user.
        try {
          await signInAnonymously(auth)
        } catch (err) {
          // Most likely: Anonymous Auth isn't enabled in Firebase Console yet.
          setError(err instanceof Error ? err.message : 'sign-in failed')
          setReady(true) // surface the error UI; don't block the app forever
        }
        return
      }

      // We have a Firebase UID. Listen for our /uid_map entry.
      unsubMap?.()
      const mapRef = ref(db, `uid_map/${firebaseUser.uid}`)
      unsubMap = onValue(mapRef, (snap) => {
        const logical = snap.val() as UserId | null
        setUser(logical === 'apeksha' || logical === 'ved' ? logical : null)
        setReady(true)
      }, () => {
        // Permission denied while reading — DB rules require uid_map entry to
        // read other paths. Treat as "not claimed yet" so Login shows.
        setUser(null)
        setReady(true)
      })
    })

    return () => {
      unsubAuth()
      unsubMap?.()
    }
  }, [setUser])

  return { ready, error }
}

// Claim a logical identity on the current device. Writes /uid_map/{firebaseUid}.
export async function claimIdentity(logical: UserId): Promise<void> {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
  const current = auth.currentUser
  if (!current) throw new Error('failed to sign in — is Anonymous Auth enabled in Firebase?')
  await set(ref(db, `uid_map/${current.uid}`), logical)
}

// Release the claim on this device + sign out of Firebase.
export async function releaseIdentity(): Promise<void> {
  const current = auth.currentUser
  if (current) {
    try {
      await remove(ref(db, `uid_map/${current.uid}`))
    } catch {
      // ignore
    }
  }
  await signOut(auth)
}
