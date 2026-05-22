import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'
import { compressImage } from './imageCompress'
import type { UserId } from '@/types'

export async function uploadPhoto(file: File, addedBy: UserId, boardId: string): Promise<string> {
  // Compress + normalize EXIF orientation before upload. Typically takes a
  // 5 MB iPhone photo down to 200–400 KB and turns sideways shots upright.
  const blob = await compressImage(file, { maxDim: 1600, quality: 0.82 })
  const path = `boards/${boardId}/${Date.now()}_${addedBy}.jpg`
  const r = storageRef(storage, path)
  await uploadBytes(r, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(r)
}
