import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import {
  detectLinkType,
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
  getSpotifyEmbedUrl,
  getInstagramEmbedUrl,
  sourceLabel,
  getHostname,
} from '@/lib/links'
import { cn } from '@/lib/utils'

export interface LinkContent {
  url: string
  title?: string
  description?: string
  image?: string
  publisher?: string
  source?: string
}

interface Props {
  content: LinkContent
  /** card = thumbnail in the board masonry; detail = full embed in item-detail. */
  variant?: 'card' | 'detail'
}

const SOURCE_BADGE_CLASSES: Record<string, string> = {
  YouTube: 'bg-rose/30 text-material',
  Spotify: 'bg-sage text-physical',
  Instagram: 'bg-pink text-material',
  X: 'bg-paper text-ink-soft',
  TikTok: 'bg-paper text-ink-soft',
}

function SourceBadge({ url }: { url: string }) {
  const label = sourceLabel(url)
  const cls = SOURCE_BADGE_CLASSES[label] ?? 'bg-paper text-muted'
  return (
    <span className={cn('text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-pill font-medium', cls)}>
      {label}
    </span>
  )
}

// ---------- Card (board masonry) ----------

function YoutubeCard({ content }: { content: LinkContent }) {
  const thumb = content.image ?? getYoutubeThumbnail(content.url)
  return (
    <div className="rounded-card overflow-hidden bg-white border border-line shadow-sm break-inside-avoid mb-3">
      {thumb && (
        <div className="relative">
          <img loading="lazy" src={thumb} alt="" className="w-full block aspect-video object-cover" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <Play size={18} className="text-white ml-0.5" fill="currentColor" />
            </span>
          </span>
        </div>
      )}
      <div className="p-2.5">
        <SourceBadge url={content.url} />
        {content.title && <p className="text-xs font-medium text-ink mt-1 line-clamp-2">{content.title}</p>}
      </div>
    </div>
  )
}

function SpotifyCard({ content }: { content: LinkContent }) {
  return (
    <div className="rounded-card overflow-hidden bg-sage border border-sage-deep shadow-sm break-inside-avoid mb-3">
      {content.image && (
        <img loading="lazy" src={content.image} alt="" className="w-full block aspect-square object-cover" />
      )}
      <div className="p-2.5">
        <SourceBadge url={content.url} />
        {content.title && <p className="text-xs font-medium text-ink mt-1 line-clamp-2">{content.title}</p>}
      </div>
    </div>
  )
}

function InstagramCard({ content }: { content: LinkContent }) {
  const embed = getInstagramEmbedUrl(content.url)
  // Try the embed first; Instagram serves a thumbnail-only oembed iframe even when
  // OG scraping fails. The poster (?) page shows the post media when available.
  return (
    <div className="rounded-card overflow-hidden bg-white border border-line shadow-sm break-inside-avoid mb-3">
      {content.image ? (
        <img loading="lazy" src={content.image} alt="" className="w-full block aspect-square object-cover" />
      ) : embed ? (
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink to-lavender">
          <iframe
            src={embed}
            title="Instagram preview"
            className="absolute -inset-x-2 -top-12 w-[calc(100%+1rem)] h-[180%] border-0 pointer-events-none"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-transparent to-white/0" />
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-pink to-lavender flex flex-col items-center justify-center text-center p-4">
          <span className="text-3xl mb-2">📷</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-material">Instagram</span>
          <span className="text-[10px] text-ink-soft mt-1 italic font-display">tap to view</span>
        </div>
      )}
      <div className="p-2.5">
        <SourceBadge url={content.url} />
        {content.title && <p className="text-xs font-medium text-ink mt-1 line-clamp-2">{content.title}</p>}
      </div>
    </div>
  )
}

function GenericCard({ content }: { content: LinkContent }) {
  return (
    <div className="rounded-card overflow-hidden bg-white border border-line shadow-sm break-inside-avoid mb-3">
      {content.image ? (
        <img loading="lazy" src={content.image} alt="" className="w-full block aspect-video object-cover" />
      ) : (
        <div className="aspect-video bg-gradient-to-br from-lavender to-cream flex items-center justify-center">
          <span className="font-display italic text-2xl text-ink/40">{getHostname(content.url)}</span>
        </div>
      )}
      <div className="p-2.5">
        <SourceBadge url={content.url} />
        {content.title ? (
          <p className="text-xs font-medium text-ink mt-1 line-clamp-2">{content.title}</p>
        ) : (
          <p className="text-xs text-muted mt-1 truncate">{getHostname(content.url)}</p>
        )}
        {content.description && (
          <p className="text-[10px] text-muted mt-1 line-clamp-2 italic font-display">{content.description}</p>
        )}
      </div>
    </div>
  )
}

// ---------- Detail ----------

function YoutubeDetail({ content }: { content: LinkContent }) {
  const embed = getYoutubeEmbedUrl(content.url)
  if (!embed) return <GenericDetail content={content} />
  return (
    <div className="rounded-hero overflow-hidden bg-black">
      <iframe
        src={embed}
        title={content.title ?? 'YouTube video'}
        className="w-full aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {content.title && (
        <p className="bg-white p-3 text-sm font-medium font-display italic text-ink">{content.title}</p>
      )}
    </div>
  )
}

function SpotifyDetail({ content }: { content: LinkContent }) {
  const embed = getSpotifyEmbedUrl(content.url)
  if (!embed) return <GenericDetail content={content} />
  return (
    <div className="rounded-hero overflow-hidden">
      <iframe
        src={embed}
        title={content.title ?? 'Spotify embed'}
        className="w-full"
        style={{ height: 352, border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}

function InstagramDetail({ content }: { content: LinkContent }) {
  const [failed, setFailed] = useState(false)
  const embed = getInstagramEmbedUrl(content.url)
  if (!embed || failed) {
    return (
      <a
        href={content.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-hero overflow-hidden bg-white border border-line"
      >
        {content.image && (
          <img src={content.image} alt="" className="w-full block aspect-square object-cover" />
        )}
        <div className="p-4">
          <SourceBadge url={content.url} />
          {content.title && <p className="font-display italic text-lg mt-2 text-ink">{content.title}</p>}
          <div className="flex items-center gap-1 text-xs text-muted mt-2">
            <ExternalLink size={12} /> open on Instagram
          </div>
        </div>
      </a>
    )
  }
  return (
    <div className="rounded-hero overflow-hidden bg-white border border-line">
      <iframe
        src={embed}
        title={content.title ?? 'Instagram embed'}
        className="w-full"
        style={{ height: 600, border: 0 }}
        allow="encrypted-media"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function GenericDetail({ content }: { content: LinkContent }) {
  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-hero bg-white border border-line overflow-hidden hover:border-line-strong transition"
    >
      {content.image && (
        <img src={content.image} alt="" className="w-full block aspect-video object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <SourceBadge url={content.url} />
          {content.publisher && content.publisher !== sourceLabel(content.url) && (
            <span className="text-[10px] text-faint">{content.publisher}</span>
          )}
        </div>
        <p className="font-display italic text-xl text-ink">
          {content.title || getHostname(content.url)}
        </p>
        {content.description && (
          <p className="text-sm text-muted mt-2 line-clamp-3">{content.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted mt-3">
          <ExternalLink size={12} />
          <span className="truncate">{content.url}</span>
        </div>
      </div>
    </a>
  )
}

// ---------- Entry point ----------

export default function LinkPreview({ content, variant = 'card' }: Props) {
  const type = detectLinkType(content.url)

  if (variant === 'card') {
    switch (type) {
      case 'youtube': return <YoutubeCard content={content} />
      case 'spotify': return <SpotifyCard content={content} />
      case 'instagram': return <InstagramCard content={content} />
      default: return <GenericCard content={content} />
    }
  }
  switch (type) {
    case 'youtube': return <YoutubeDetail content={content} />
    case 'spotify': return <SpotifyDetail content={content} />
    case 'instagram': return <InstagramDetail content={content} />
    default: return <GenericDetail content={content} />
  }
}
