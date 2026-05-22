import { useFirebaseAuthBoot } from '@/hooks/useFirebaseAuthBoot'

export default function AuthBoot({ children }: { children: React.ReactNode }) {
  const { ready, error } = useFirebaseAuthBoot()

  if (!ready) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-cream p-6 text-center gap-3">
        <p className="font-display italic text-muted">signing in…</p>
        <p className="text-[10px] text-faint italic font-display max-w-xs">
          if this stays more than 10 seconds, check your connection and refresh.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-cream p-6 text-center">
        <p className="font-display italic text-material text-lg mb-2">couldn't sign in</p>
        <p className="text-sm text-muted max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-5 py-2.5 rounded-pill bg-coral text-white text-sm font-medium shadow-md shadow-coral/30 active:scale-[0.97] transition"
        >
          retry
        </button>
        <p className="text-xs text-faint mt-6 max-w-sm italic font-display">
          if you're the dev — verify Anonymous Authentication is enabled in the Firebase Console
          (Authentication → Sign-in method).
        </p>
      </div>
    )
  }

  return <>{children}</>
}
