import { NextResponse } from "next/server"
import { getAdminStorage } from "@/lib/firebase-admin"

export const maxDuration = 300

const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "arambh-prod.appspot.com"

function buildStoragePath(orgId: string, fileType: string, fileName: string): string {
  const ts = Date.now()
  const clean = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-")

  const folders: Record<string, string> = {
    VIDEO: "videos",
    PDF: "documents",
    AUDIO: "audio",
    PPT: "presentations",
    IMAGE: "images",
    NOTE: "notes",
  }
  const folder = folders[fileType] || "files"
  return `orgs/${orgId}/${folder}/${ts}-${clean}`
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const orgId = formData.get("orgId") as string | null
    const fileType = formData.get("fileType") as string | null

    if (!file || !orgId || !fileType) {
      return NextResponse.json(
        { error: "Missing file, orgId, or fileType" },
        { status: 400 },
      )
    }

    const storage = getAdminStorage()
    const bucket = storage.bucket(BUCKET_NAME)

    const storagePath = buildStoragePath(orgId, fileType, file.name)
    const fileRef = bucket.file(storagePath)

    const buffer = Buffer.from(await file.arrayBuffer())

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || "application/octet-stream",
      },
    })

    await fileRef.makePublic()

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`

    return NextResponse.json({
      url: publicUrl,
      path: storagePath,
      size: file.size,
    })
  } catch (e: any) {
    console.error("Firebase Admin upload error:", e)
    const message = e?.message || "Upload failed"
    if (message.includes("bucket does not exist")) {
      return NextResponse.json(
        { error: `Firebase Storage bucket '${BUCKET_NAME}' not found. Go to Firebase Console > Storage and enable it.` },
        { status: 500 },
      )
    }
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
