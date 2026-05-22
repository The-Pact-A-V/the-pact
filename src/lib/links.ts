export type LinkType = 'youtube' | 'spotify' | 'instagram' | 'twitter' | 'tiktok' | 'generic'

export function detectLinkType(url: string): LinkType {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('youtube') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('spotify')) return 'spotify'
    if (host.includes('instagram')) return 'instagram'
    if (host.includes('twitter') || host.includes('x.com')) return 'twitter'
    if (host.includes('tiktok')) return 'tiktok'
    return 'generic'
  } catch {
    return 'generic'
  }
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const m = u.pathname.match(/\/(?:embed|shorts|v|live)\/([^/?]+)/)
      return m?.[1] ?? null
    }
    return null
  } catch {
    return null
  }
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const id = getYoutubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export function getSpotifyEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('spotify')) return null
    const match = u.pathname.match(/^\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/)
    if (!match) return null
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`
  } catch {
    return null
  }
}

export function getInstagramEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('instagram')) return null
    const match = u.pathname.match(/^\/(p|reel|tv)\/([^/]+)/)
    if (!match) return null
    return `https://www.instagram.com/${match[1]}/${match[2]}/embed`
  } catch {
    return null
  }
}

const SOURCE_LABEL: Partial<Record<LinkType, string>> = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  instagram: 'Instagram',
  twitter: 'X',
  tiktok: 'TikTok',
}

export function sourceLabel(url: string): string {
  const type = detectLinkType(url)
  return SOURCE_LABEL[type] ?? getHostname(url)
}
