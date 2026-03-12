import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createEmbedding } from '@/lib/openai'
import Groq from 'groq-sdk'
import { getAccessibleCategoryIdsForUser } from '@/lib/category-access'

type ChatRequestBody = {
  question?: string
  userId?: string
  orgId?: string
  userRole?: string
  sessionId?: string
  categoryId?: string | null
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody
    const { question, userId, orgId, userRole, sessionId: incomingSessionId, categoryId } = body

    // 1. Validate inputs
    if (!question || !question.trim() || !userId || !orgId) {
      return NextResponse.json(
        { error: 'Missing question, userId, or orgId' },
        { status: 400 },
      )
    }

    // 2-5. Retrieval pipeline (embedding + vector search + access filtering).
    let chunks: any[] = []
    let retrievalIssue: string | null = null
    try {
      const questionEmbedding = await createEmbedding(question, 'RETRIEVAL_QUERY')

      // Resolve category access for this user.
      let accessibleCategoryIds: string[] | null = null
      const { data: categoryRows, error: categoryError } = await supabaseAdmin.rpc(
        'get_accessible_categories',
        {
          p_user_id: userId,
          p_org_id: orgId,
        },
      )

      if (!categoryError && Array.isArray(categoryRows)) {
        accessibleCategoryIds = categoryRows.map((r: { category_id: string }) => r.category_id)
      } else {
                    // Fallback for environments where get_accessible_categories is unavailable.
                    accessibleCategoryIds = await getAccessibleCategoryIdsForUser(
                      orgId,
                      userId,
                      userRole || 'EMPLOYEE',
                    )
      }

      if (categoryId) {
        accessibleCategoryIds = (accessibleCategoryIds || []).filter((id) => id === categoryId)
      }

      const {
        data: matchedChunks,
        error: matchError,
      } = await supabaseAdmin.rpc('match_documents', {
        query_embedding: questionEmbedding,
        match_count: 20,
        filter_org_id: orgId,
        filter_role: userRole || 'EMPLOYEE',
      })

      if (matchError) {
        console.error('chat: match_documents error', matchError)
      }

      chunks = Array.isArray(matchedChunks) ? [...matchedChunks] : []
      if (chunks.length > 0 && accessibleCategoryIds && accessibleCategoryIds.length > 0) {
        const contentIds = [...new Set(chunks.map((c: any) => c.content_id).filter(Boolean))]
        const { data: contentRows } = await supabaseAdmin
          .from('content')
          .select('id, category_id')
          .in('id', contentIds)

        const allowedByContent = new Set(
          (contentRows || [])
            .filter((row: any) => {
              const catId = row.category_id as string | null
              return Boolean(catId && accessibleCategoryIds?.includes(catId))
            })
            .map((row: any) => row.id as string),
        )

        chunks = chunks.filter((c: any) => allowedByContent.has(c.content_id))
      }
      chunks = chunks.slice(0, 8)
    } catch (retrievalError) {
      console.error('chat: retrieval pipeline error', retrievalError)
      retrievalIssue = 'Knowledge retrieval is temporarily unavailable.'
      chunks = []
    }

    // 6. Build context
    const context =
      chunks && Array.isArray(chunks) && chunks.length
        ? chunks.map((c: any) => c.chunk_text).join('\n\n---\n\n')
        : ''

    // 7. Create session if needed
    let sessionId = incomingSessionId ?? null
    if (!sessionId) {
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('ai_chat_sessions')
        .insert({
          user_id: userId,
          org_id: orgId,
        })
        .select('id')
        .single()

      if (sessionError || !session) {
        console.error('chat: session create error', sessionError)
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
      }
      sessionId = session.id as string
    }

    // 8. Save user message
    const { error: msgError } = await supabaseAdmin.from('ai_chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: question,
    })

    if (msgError) {
      console.error('chat: user message insert error', msgError)
    }

    const encoder = new TextEncoder()
    let fullText = ''
    const sourceIds =
      chunks && Array.isArray(chunks)
        ? chunks.map((c: any) => c.content_id).filter(Boolean)
        : []

    // 9. If nothing relevant is found, stream a grounded fallback immediately.
    if (!context.trim()) {
      fullText = retrievalIssue
        ? `${retrievalIssue} Please try again in a moment.`
        : "This topic is not covered in your current training materials. Try asking within a specific category you have access to, like Web Development, Sales, or Marketing."

      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          const words = fullText.split(' ')
          for (const word of words) {
            controller.enqueue(encoder.encode(`${word} `))
            await new Promise((resolve) => setTimeout(resolve, 20))
          }

          const { error: saveError } = await supabaseAdmin.from('ai_chat_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: fullText.trim(),
            sources: sourceIds,
          })

          if (saveError) {
            console.error('chat: assistant fallback insert error', saveError)
          }

          controller.close()
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
          'x-chat-session-id': String(sessionId),
        },
      })
    }

    // 10. Stream completion from Groq
    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 900,
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are Arambh AI, a senior training assistant.

Use ONLY the company training content provided below.
- If the user asks something outside this content, respond exactly:
"This topic is not covered in your current training materials."
- Keep answers detailed, practical, and encouraging.
- Output clean Markdown, with proper spacing:
  - Use short headings (## or ###) for sections
  - Put each bullet on a new line
  - Use numbered lists for step-by-step instructions
  - Add blank lines between paragraphs and sections
  - Do not dump one giant paragraph
- Do not invent facts beyond the provided training content.

Training Content:
${context}`,
        },
        { role: 'user', content: question },
      ],
    })

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content || ''
            if (text) {
              fullText += text
              controller.enqueue(encoder.encode(text))
            }
          }

          const { error: saveError } = await supabaseAdmin
            .from('ai_chat_messages')
            .insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullText,
              sources: sourceIds,
            })

          if (saveError) {
            console.error('chat: assistant message insert error', saveError)
          }

          controller.close()
        } catch (e) {
          console.error('chat: stream error', e)
          controller.error(e)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        'x-chat-session-id': String(sessionId),
      },
    })
  } catch (e) {
    console.error('chat route error:', e)
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Internal error',
      },
      { status: 500 },
    )
  }
}

