import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { get, ref, update } from 'firebase/database'
import { db } from '@/lib/firebase'
import { fetchOGMetadata } from '@/lib/ogFetch'
import { sourceLabel } from '@/lib/links'
import { stripUndefined } from '@/lib/firebase-helpers'
import type { Board, BoardItem } from '@/types'

interface LinkContentShape {
  url: string
  title?: string
  description?: string
  image?: string
  publisher?: string
  source?: string
}

interface Status {
  state: 'idle' | 'running' | 'done' | 'error'
  total: number
  done: number
  updated: number
  skipped: number
  error?: string
}

const THROTTLE_MS = 1100 // microlink free tier is 50/day, throttle to 1/sec

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function BackfillOG() {
  const [status, setStatus] = useState<Status>({
    state: 'idle',
    total: 0,
    done: 0,
    updated: 0,
    skipped: 0,
  })

  async function run() {
    setStatus({ state: 'running', total: 0, done: 0, updated: 0, skipped: 0 })
    try {
      // 1. Pull all boards + all items
      const boardsSnap = await get(ref(db, 'boards'))
      const itemsSnap = await get(ref(db, 'board_items'))
      const boards = (boardsSnap.val() as Record<string, Board> | null) ?? {}
      const itemsByBoard = (itemsSnap.val() as Record<string, Record<string, BoardItem>> | null) ?? {}

      // 2. Collect link pins that need backfill
      const todo: Array<{ boardId: string; itemId: string; content: LinkContentShape }> = []
      for (const bId in boards) {
        const items = itemsByBoard[bId] ?? {}
        for (const iId in items) {
          const it = items[iId]
          if (it.type !== 'link') continue
          const content = it.content as unknown as LinkContentShape
          if (!content.url) continue
          if (content.image) continue // already has preview
          todo.push({ boardId: bId, itemId: iId, content })
        }
      }

      setStatus((s) => ({ ...s, total: todo.length }))

      // 3. Fetch + write one at a time
      let updated = 0
      let skipped = 0
      for (let i = 0; i < todo.length; i++) {
        const { boardId, itemId, content } = todo[i]
        const og = await fetchOGMetadata(content.url)
        if (og.image || og.title || og.description) {
          await update(
            ref(db, `board_items/${boardId}/${itemId}/content`),
            stripUndefined({
              title: content.title || og.title || undefined,
              description: og.description || undefined,
              image: og.image || undefined,
              publisher: og.publisher || undefined,
              source: content.source || sourceLabel(content.url),
            })
          )
          updated++
        } else {
          skipped++
        }
        setStatus((s) => ({ ...s, done: i + 1, updated, skipped }))
        if (i < todo.length - 1) await sleep(THROTTLE_MS)
      }

      setStatus((s) => ({ ...s, state: 'done' }))
    } catch (err) {
      setStatus((s) => ({
        ...s,
        state: 'error',
        error: err instanceof Error ? err.message : 'unknown error',
      }))
    }
  }

  return (
    <div className="min-h-svh p-6 pb-12">
      <Link to="/settings" className="inline-flex items-center gap-1 text-muted text-sm">
        <ArrowLeft size={16} /> back
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-6">developer</p>
      <h1 className="font-display text-3xl text-ink mt-1 mb-2">Backfill link previews</h1>
      <p className="text-sm text-muted mb-8 max-w-md">
        Re-fetches OG metadata (image, title, description) for every link pin that's missing it.
        Throttled at ~1/sec to stay under microlink's free tier (50/day). Safe to re-run.
      </p>

      {status.state === 'idle' && (
        <button
          onClick={run}
          className="px-5 py-3 rounded-pill bg-coral text-white font-medium shadow-md shadow-coral/30 active:scale-[0.98] transition flex items-center gap-2"
        >
          <RefreshCw size={16} /> start backfill
        </button>
      )}

      {status.state !== 'idle' && (
        <section className="rounded-card border border-line bg-paper p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">progress</p>
            <p className="text-sm font-medium">
              {status.done} / {status.total || '…'}
            </p>
          </div>
          <div className="h-2 rounded-pill bg-white overflow-hidden">
            <div
              className="h-full bg-apeksha transition-all"
              style={{ width: status.total > 0 ? `${(status.done / status.total) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex gap-4 text-xs text-muted">
            <span>✓ {status.updated} updated</span>
            <span>· {status.skipped} skipped</span>
            {status.total === 0 && status.state === 'done' && (
              <span className="italic font-display">nothing to backfill</span>
            )}
          </div>
          {status.state === 'done' && (
            <p className="text-xs italic font-display text-physical">all caught up.</p>
          )}
          {status.state === 'error' && (
            <p className="text-xs text-material">⚠️ {status.error}</p>
          )}
        </section>
      )}
    </div>
  )
}
