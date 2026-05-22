import { useFirebaseAuthBoot } from '@/hooks/useFirebaseAuthBoot'

export default function AuthBoot({ children }: { children: React.ReactNode }) {
  const { ready, error } = useFirebaseAuthBoot()

  if (!ready) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-cream">
        <p className="font-display italic text-muted">signing in…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-cream p-6 text-center">
        <p className="font-display italic text-material text-lg mb-2">couldn't sign in</p>
        <p className="text-sm text-muted max-w-sm">{error}</p>
        <p className="text-xs text-faint mt-6 max-w-sm italic font-display">
          if you're the dev — enable <strong>Anonymous Authentication</strong> in the Firebase Console
          (Authentication → Sign-in method).
        </p>
      </div>
    )
  }

  return <>{children}</>
}
