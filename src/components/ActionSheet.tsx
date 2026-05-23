import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SheetRow {
  key: string
  icon: React.ReactNode
  title: string
  subtitle?: string
  iconBg?: string // tailwind class for the icon tint
  destructive?: boolean
  chevron?: boolean
  onClick: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  header?: React.ReactNode
  rows: SheetRow[]
}

export default function ActionSheet({ open, onClose, header, rows }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/40"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-surface rounded-t-[24px] shadow-2xl pb-8 max-w-[480px] mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="block w-9 h-1 rounded-full bg-line-strong" />
            </div>

            {header && <div className="px-5 pt-2 pb-3">{header}</div>}

            <div className="mx-3 rounded-card overflow-hidden border border-line divide-y divide-line">
              {rows.map((row) => (
                <button
                  key={row.key}
                  onClick={() => {
                    onClose()
                    row.onClick()
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 text-left transition active:bg-paper',
                    row.destructive ? 'bg-material-bg' : 'bg-surface hover:bg-paper'
                  )}
                >
                  <span
                    className={cn(
                      'w-10 h-10 rounded-card flex items-center justify-center text-lg shrink-0',
                      row.iconBg ?? (row.destructive ? 'bg-material-bg' : 'bg-paper')
                    )}
                  >
                    {row.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={cn(
                        'block font-medium text-sm leading-tight',
                        row.destructive ? 'text-material' : 'text-ink'
                      )}
                    >
                      {row.title}
                    </span>
                    {row.subtitle && (
                      <span className="block text-[11px] text-muted italic font-display mt-0.5">
                        {row.subtitle}
                      </span>
                    )}
                  </span>
                  {row.chevron && <ChevronRight size={14} className="text-muted shrink-0" />}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="block w-[calc(100%-1.5rem)] mx-3 mt-2.5 px-4 py-3 rounded-card bg-paper text-sm font-medium text-ink-soft hover:bg-line transition"
            >
              cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
