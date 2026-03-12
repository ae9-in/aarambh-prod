import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type UploadMetadataPayload = {
  orgId: string
  categoryId: string
  userId: string
  title?: string
  fileType: string
  fileName?: string
  mimeType?: string
  firebaseUrl: string
  firebasePath: string
  fileSize: number
  durationMinutes?: number | null
}

const EMBEDDABLE_TYPES = new Set(['PDF', 'NOTE', 'PPT', 'VIDEO'])

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<UploadMetadataPayload>

    const {
      orgId,
      categoryId,
      userId,
      title,
      fileType,
      fileName,
      mimeType,
      firebaseUrl,
      firebasePath,
      fileSize,
      durationMinutes,
    } = body

    if (!orgId || !categoryId || !userId) {
      return NextResponse.json(
        { error: 'Missing orgId, categoryId, or userId' },
        { status: 400 },
      )
    }

    if (!fileType || !firebaseUrl || !firebasePath || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'Missing file metadata (fileType, firebaseUrl, firebasePath, fileSize)' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('content')
      .insert({
        org_id: orgId,
        category_id: categoryId,
        title: title ?? null,
        type: fileType,
        file_url: firebaseUrl,
        firebase_path: firebasePath,
        file_size: fileSize,
        uploaded_by: userId,
        is_published: true,
        duration_minutes: durationMinutes ?? null,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('upload metadata insert error:', error)
      return NextResponse.json({ error: 'Failed to save content' }, { status: 400 })
    }

    // Fire-and-forget embedding trigger for embeddable content types
    if (EMBEDDABLE_TYPES.has(fileType)) {
      const origin = req.nextUrl.origin
      // Do not await – fire and forget
      fetch(`${origin}/api/ai/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: data.id,
          fileUrl: firebaseUrl,
          orgId,
          fileName: fileName ?? null,
          mimeType: mimeType ?? null,
        }),
      }).catch((e) => {
        console.error('embed trigger error:', e)
      })
    }

    return NextResponse.json({ content: data }, { status: 201 })
  } catch (e) {
    console.error('upload route error:', e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

