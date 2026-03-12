import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const storage = getStorage(app)

export type ProgressCallback = (percent: number) => void

// Upload file with live progress tracking
export function uploadToFirebase(
  file: File,
  path: string,
  onProgress?: ProgressCallback,
): Promise<{ url: string; path: string }> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)

    task.on(
      'state_changed',
      snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        onProgress?.(pct)
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({ url, path })
      },
    )
  })
}

// Delete file from Firebase
export async function deleteFromFirebase(path: string): Promise<boolean> {
  try {
    await deleteObject(ref(storage, path))
    return true
  } catch (e) {
    console.error('Firebase delete:', e)
    return false
  }
}

// Generate file storage path
export function generatePath(orgId: string, fileType: string, fileName: string): string {
  const ts = Date.now()
  const clean = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-')

  const folders: Record<string, string> = {
    VIDEO: 'videos',
    PDF: 'documents',
    AUDIO: 'audio',
    PPT: 'presentations',
    IMAGE: 'images',
    NOTE: 'notes',
  }
  const folder = folders[fileType] || 'files'
  return `orgs/${orgId}/${folder}/${ts}-${clean}`
}

// Detect type from MIME
export function detectType(mime: string, name: string): string {
  if (mime.includes('video')) return 'VIDEO'
  if (mime === 'application/pdf') return 'PDF'
  if (mime.includes('audio')) return 'AUDIO'
  if (
    mime.includes('presentation') ||
    name.endsWith('.ppt') ||
    name.endsWith('.pptx')
  )
    return 'PPT'
  if (mime.includes('image')) return 'IMAGE'
  return 'NOTE'
}

// Human readable file size
export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

