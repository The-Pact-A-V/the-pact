import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'
import type { UserId } from '@/types'

export async function uploadPhoto(file: File, addedBy: UserId, boardId: string): Promise<string> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const path = `boards/${boardId}/${Date.now()}_${addedBy}.${ext}`
  const r = storageRef(storage, path)
  await uploadBytes(r, file, { contentType: file.type })
  return getDownloadURL(r)
}
