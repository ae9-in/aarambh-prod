import { NextResponse } from "next/server"
import { getAdminStorage } from "@/lib/firebase-admin"

const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "arambh-prod.appspot.com"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const orgId = formData.get("orgId") as string | null

    if (!file || !orgId) {
      return NextResponse.json(
        { error: "Missing file or orgId" },
        { status: 400 },
      )
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed." },
        { status: 400 },
      )
    }

    const storage = getAdminStorage()
    const bucket = storage.bucket(BUCKET_NAME)

    const ts = Date.now()
    const clean = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-").replace(/-+/g, "-")
    const storagePath = `orgs/${orgId}/categories/${ts}-${clean}`
    const fileRef = bucket.file(storagePath)

    const buffer = Buffer.from(await file.arrayBuffer())

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || "image/jpeg",
      },
    })

    await fileRef.makePublic()

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`

    return NextResponse.json({
      imageUrl: publicUrl,
      orgId,
    })
  } catch (e: any) {
    console.error("Firebase Admin category upload error:", e)
    const message = e?.message || "Upload failed"
    if (message.includes("bucket does not exist")) {
      return NextResponse.json(
        { error: `Firebase Storage bucket '${BUCKET_NAME}' not found. Go to Firebase Console > Storage and enable it.` },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
