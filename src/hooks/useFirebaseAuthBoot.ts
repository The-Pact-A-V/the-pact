import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { onValue, ref, set, remove } from 'firebase/database'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/store/auth'
import type { UserId } from '@/types'

const BOOT_TIMEOUT_MS = 10_000

// Boots Firebase Auth on app start. Tolerant: hard timeout at 10s so the
// "signing in…" splash can never get stuck.
export function useFirebaseAuthBoot(): { ready: boolean; error: string | null } {
  const setUser = useAuth((s) => s.setUser)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubMap: (() => void) | undefined
    let timedOut = false

    // Hard timeout — surface a recoverable error if Firebase never resolves
    const timeout = window.setTimeout(() => {
      timedOut = true
      setError('still trying… check your connection then refresh')
      setReady(true)
    }, BOOT_TIMEOUT_MS)

    const finishReady = () => {
      if (timedOut) return
      window.clearTimeout(timeout)
      setReady(true)
    }

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (timedOut) return

      if (!firebaseUser) {
        // No session — sign in anonymously. onAuthStateChanged fires again
        // once it resolves.
        try {
          await signInAnonymously(auth)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'sign-in failed')
          finishReady()
        }
        return
      }

      // We have a Firebase UID. Listen for our /uid_map entry.
      unsubMap?.()
      const mapRef = ref(db, `uid_map/${firebaseUser.uid}`)
      unsubMap = onValue(
        mapRef,
        (snap) => {
          const logical = snap.val() as UserId | null
          setUser(logical === 'apeksha' || logical === 'ved' ? logical : null)
          finishReady()
        },
        () => {
          // Permission denied or transient — treat as "not claimed yet" so
          // Login can show. Don't get stuck.
          setUser(null)
          finishReady()
        }
      )
    })

    return () => {
      window.clearTimeout(timeout)
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
