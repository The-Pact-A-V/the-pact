import type { UserId } from '@/types'
import { cn } from '@/lib/utils'

interface AvatarProps {
  user: UserId
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
}

export default function Avatar({ user, size = 'md', className }: AvatarProps) {
  const isA = user === 'apeksha'
  return (
    <span
      className={cn(
        'rounded-full inline-flex items-center justify-center font-medium',
        isA ? 'bg-lavender text-apeksha' : 'bg-sage text-ved',
        SIZES[size],
        className
      )}
      aria-label={user}
    >
      {isA ? 'A' : 'V'}
    </span>
  )
}
