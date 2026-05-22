// Browser-native image compression. Uses createImageBitmap with
// imageOrientation:'from-image' to bake in the EXIF rotation so the
// stored image displays right-side-up regardless of the viewer.

interface CompressOptions {
  maxDim?: number   // longest edge in pixels (default 1600)
  quality?: number  // JPEG quality 0..1 (default 0.82)
  mimeType?: string // default 'image/jpeg'
}

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<Blob> {
  const maxDim = opts.maxDim ?? 1600
  const quality = opts.quality ?? 0.82
  const mimeType = opts.mimeType ?? 'image/jpeg'

  // Decode with EXIF orientation applied. Safari 15+ / Chrome / Firefox support this.
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Old browser fallback: decode without orientation correction.
    bitmap = await createImageBitmap(file)
  }

  const { width, height } = bitmap
  const longest = Math.max(width, height)
  const scale = longest > maxDim ? maxDim / longest : 1
  const targetW = Math.round(width * scale)
  const targetH = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context unavailable')
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('canvas.toBlob returned null'))
      },
      mimeType,
      quality
    )
  })
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
