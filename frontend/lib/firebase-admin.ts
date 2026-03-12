import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"

const privateKey = process.env.FIREBASE_PRIVATE_KEY
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

let app: App | undefined

export function getFirebaseAdmin(): App {
  if (!app) {
    if (!privateKey || !clientEmail || !projectId) {
      throw new Error(
        "Missing Firebase Admin credentials. Set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set."
      )
    }

    app =
      getApps().find((a) => a.name === "[DEFAULT]") ||
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
  }

  return app
}

export function getAdminStorage() {
  return getStorage(getFirebaseAdmin())
}
