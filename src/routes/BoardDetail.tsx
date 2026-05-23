import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal, Plus, FileText, Camera, Link as LinkIcon, Mic, Pencil, Trash2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import Avatar from '@/components/Avatar'
import LinkPreview, { type LinkContent } from '@/components/LinkPreview'
import ActionSheet, { type SheetRow } from '@/components/ActionSheet'
import { useBoard, gradientClasses, deleteBoard } from '@/hooks/useBoards'
import { useBoardItems } from '@/hooks/useBoardItems'
import { cn } from '@/lib/utils'
import type { BoardItem } from '@/types'

interface NoteContent { text: string; color?: string; emoji?: string }
interface PhotoContent { url: string; caption?: string }
interface VoiceContent { audioUrl: string; durationSeconds?: number; caption?: string }

function NoteCard({ item }: { item: BoardItem }) {
  const c = item.content as unknown as NoteContent
  const bg = c.color === 'butter' ? 'bg-butter'
    : c.color === 'pink' ? 'bg-pink'
    : c.color === 'sage' ? 'bg-sage'
    : c.color === 'peach' ? 'bg-peach'
    : 'bg-lavender'
  return (
    <div className={cn('rounded-card p-4 break-inside-avoid mb-3', bg)}>
      {c.emoji && <span className="text-2xl block mb-1">{c.emoji}</span>}
      <p className="font-display italic text-ink leading-snug">{c.text}</p>
      <div className="mt-3 flex justify-end">
        <Avatar user={item.addedBy} size="sm" />
      </div>
    </div>
  )
}

function PhotoCard({ item }: { item: BoardItem }) {
  const c = item.content as unknown as PhotoContent
  return (
    <div className="rounded-card overflow-hidden bg-white shadow-sm break-inside-avoid mb-3">
      <img
        loading="lazy"
        src={c.url}
        alt={c.caption ?? ''}
        className="w-full block bg-paper"
      />
      <div className="p-2.5 flex items-center justify-between">
        {c.caption ? (
          <p className="text-xs text-ink truncate flex-1 mr-2">{c.caption}</p>
        ) : (
          <span className="flex-1" />
        )}
        <Avatar user={item.addedBy} size="sm" />
      </div>
    </div>
  )
}

function LinkCard({ item }: { item: BoardItem }) {
  const c = item.content as unknown as LinkContent
  return (
    <div className="relative">
      <LinkPreview content={c} variant="card" />
      <span className="absolute top-2 right-2">
        <Avatar user={item.addedBy} size="sm" />
      </span>
    </div>
  )
}

function VoiceCard({ item }: { item: BoardItem }) {
  const c = item.content as unknown as VoiceContent
  return (
    <div className="rounded-card bg-sage p-3.5 break-inside-avoid mb-3">
      <div className="flex items-center gap-2">
        <Mic size={18} className="text-physical" />
        <span className="text-sm font-medium">voice note</span>
        {c.durationSeconds != null && (
          <span className="text-xs text-muted ml-auto">{c.durationSeconds}s</span>
        )}
      </div>
      {c.caption && <p className="text-xs italic font-display text-ink-soft mt-2">{c.caption}</p>}
      <div className="mt-3 flex justify-end">
        <Avatar user={item.addedBy} size="sm" />
      </div>
    </div>
  )
}

function PinCard({ item }: { item: BoardItem }) {
  const inner = (() => {
    switch (item.type) {
      case 'note': return <NoteCard item={item} />
      case 'photo': return <PhotoCard item={item} />
      case 'link': return <LinkCard item={item} />
      case 'voice': return <VoiceCard item={item} />
      default: return null
    }
  })()
  return (
    <Link to={`/item/${item.boardId}/${item.id}`} className="block active:scale-[0.98] transition">
      {inner}
    </Link>
  )
}

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { board, loading: bLoading } = useBoard(id ?? null)
  const { items, loading: iLoading } = useBoardItems(id ?? null)
  const [menuOpen, setMenuOpen] = useState(false)

  if (bLoading) return <div className="min-h-svh p-6 text-muted italic font-display">loading…</div>
  if (!board || !id) return <Navigate to="/boards" replace />

  async function handleDeleteBoard() {
    if (!id || !board) return
    if (!confirm(`delete "${board.name}" and all its pins?`)) return
    await deleteBoard(id)
    navigate('/boards')
  }

  const menuRows: SheetRow[] = [
    {
      key: 'edit',
      icon: <Pencil size={18} className="text-spiritual" />,
      iconBg: 'bg-butter/40',
      title: 'Edit board',
      subtitle: 'rename · change cover · recolor',
      chevron: true,
      onClick: () => navigate(`/board/${id}/edit`),
    },
    {
      key: 'delete',
      icon: <Trash2 size={18} />,
      title: 'Delete board',
      subtitle: `removes ${items.length} ${items.length === 1 ? 'pin' : 'pins'} · cannot be undone`,
      destructive: true,
      onClick: handleDeleteBoard,
    },
  ]

  return (
    <div className="min-h-svh pb-28">
      <div className={cn('bg-gradient-to-br', gradientClasses(board.coverColor))}>
        <header className="px-5 pt-7 pb-5 flex items-center justify-between">
          <Link to="/boards" className="inline-flex items-center gap-1 text-ink/80 text-sm">
            <ArrowLeft size={16} /> boards
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-full hover:bg-white/30 transition"
            aria-label="Board menu"
          >
            <MoreHorizontal size={18} />
          </button>
        </header>
        <div className="px-6 pb-7">
          <span className="text-4xl">{board.emoji}</span>
          <h1 className="font-display text-3xl text-ink mt-2">{board.name}</h1>
          <p className="text-xs text-ink-soft mt-1">
            {iLoading ? 'loading…' : `${items.length} ${items.length === 1 ? 'pin' : 'pins'}`}
          </p>
        </div>
      </div>

      {/* Add strip */}
      <div className="px-6 -mt-4 mb-4 grid grid-cols-4 gap-2 relative z-10">
        <Link
          to={`/add-photo/${id}`}
          className="rounded-card bg-white border border-line p-3 flex flex-col items-center text-xs shadow-sm active:scale-95 transition"
        >
          <Camera size={20} className="text-apeksha mb-1" />
          photo
        </Link>
        <Link
          to={`/add-note/${id}`}
          className="rounded-card bg-white border border-line p-3 flex flex-col items-center text-xs shadow-sm active:scale-95 transition"
        >
          <FileText size={20} className="text-physical mb-1" />
          note
        </Link>
        <Link
          to={`/add-link/${id}`}
          className="rounded-card bg-white border border-line p-3 flex flex-col items-center text-xs shadow-sm active:scale-95 transition"
        >
          <LinkIcon size={20} className="text-spiritual mb-1" />
          link
        </Link>
        <button
          disabled
          className="rounded-card bg-paper border border-line p-3 flex flex-col items-center text-xs opacity-50"
          aria-label="Voice — coming soon"
        >
          <Mic size={20} className="text-faint mb-1" />
          voice
        </button>
      </div>

      {/* Pin grid (masonry-ish using columns) */}
      <div className="px-4">
        {items.length === 0 && !iLoading && (
          <div className="text-center py-16 px-6">
            <Plus size={32} className="text-faint mx-auto mb-3" />
            <p className="font-display italic text-muted">empty board. pin something.</p>
          </div>
        )}
        {items.length > 0 && (
          <div className="columns-2 gap-3">
            {items.map((it) => (
              <PinCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      <ActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        rows={menuRows}
        header={
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'w-12 h-12 rounded-card bg-gradient-to-br flex items-center justify-center text-xl',
                gradientClasses(board.coverColor)
              )}
            >
              {board.emoji}
            </span>
            <div className="min-w-0">
              <p className="font-medium truncate">{board.name}</p>
              <p className="text-[11px] text-muted">{items.length} {items.length === 1 ? 'pin' : 'pins'}</p>
            </div>
          </div>
        }
      />
    </div>
  )
}
