// Fetches Open Graph metadata for any URL via microlink.io's free API.
// 50 req/day free tier, no key required. We cache the result in the pin's
// content so each link is only fetched once at save time.

export interface OGMetadata {
  title?: string
  description?: string
  image?: string
  publisher?: string
}

interface MicrolinkResponse {
  status: string
  data?: {
    title?: string | null
    description?: string | null
    image?: { url?: string } | null
    publisher?: string | null
  }
}

const TIMEOUT_MS = 8000

export async function fetchOGMetadata(url: string): Promise<OGMetadata> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&data=title,description,image,publisher`
    const res = await fetch(endpoint, { signal: controller.signal })
    if (!res.ok) throw new Error(`microlink ${res.status}`)
    const json = (await res.json()) as MicrolinkResponse
    if (json.status !== 'success' || !json.data) return {}

    return {
      title: json.data.title ?? undefined,
      description: json.data.description ?? undefined,
      image: json.data.image?.url ?? undefined,
      publisher: json.data.publisher ?? undefined,
    }
  } catch {
    // Best-effort — return empty and let the UI fall back to URL-only display.
    return {}
  } finally {
    clearTimeout(timer)
  }
}
