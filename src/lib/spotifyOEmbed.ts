// Spotify's oEmbed endpoint is CORS-friendly, no auth required, and returns
// the album/track cover image plus the title. We hit it once per URL and
// cache the promise so repeated renders don't refetch.

export interface SpotifyOEmbed {
  image?: string
  title?: string
}

const cache = new Map<string, Promise<SpotifyOEmbed>>()

export function fetchSpotifyOEmbed(url: string): Promise<SpotifyOEmbed> {
  const existing = cache.get(url)
  if (existing) return existing

  const promise = (async (): Promise<SpotifyOEmbed> => {
    try {
      const res = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
      )
      if (!res.ok) return {}
      const data = (await res.json()) as {
        thumbnail_url?: string
        title?: string
      }
      return {
        image: data.thumbnail_url,
        title: data.title,
      }
    } catch {
      return {}
    }
  })()

  cache.set(url, promise)
  return promise
}
