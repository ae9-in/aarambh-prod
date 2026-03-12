import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const openai = new OpenAI({
  // Keep legacy helper routes build-safe even when only Groq/Gemini keys are configured.
  apiKey: process.env.OPENAI_API_KEY || 'not-used-for-groq-chat',
})

const geminiApiKey = process.env.GEMINI_API_KEY
const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null

type EmbeddingTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'

async function embedWithGeminiModel(
  modelName: 'text-embedding-004' | 'gemini-embedding-001' | 'embedding-001',
  text: string,
  taskType: EmbeddingTaskType,
) {
  if (!geminiClient) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const model = geminiClient.getGenerativeModel({ model: modelName })
  const trimmed = text.slice(0, 8000)

  // Prefer structured embed request first.
  try {
    return await model.embedContent({
      content: {
        role: 'user',
        parts: [{ text: trimmed }],
      },
      taskType,
    } as any)
  } catch {
    // Some accounts/models only accept raw input style.
    return await model.embedContent(trimmed as any)
  }
}

// Create embedding vector with Gemini text-embedding-004.
export async function createEmbedding(
  text: string,
  taskType: EmbeddingTaskType = 'RETRIEVAL_DOCUMENT',
): Promise<number[]> {
  if (!geminiClient) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  let res: any
  try {
    res = await embedWithGeminiModel('text-embedding-004', text, taskType)
  } catch (primaryError) {
    console.warn(
      'Gemini text-embedding-004 failed, falling back to gemini-embedding-001:',
      primaryError,
    )
    try {
      res = await embedWithGeminiModel('gemini-embedding-001', text, taskType)
    } catch (secondaryError) {
      console.warn(
        'Gemini gemini-embedding-001 failed, falling back to embedding-001:',
        secondaryError,
      )
      res = await embedWithGeminiModel('embedding-001', text, taskType)
    }
  }
  const raw = res.embedding.values

  // Keep compatibility with existing pgvector(1536) schema.
  if (raw.length >= 1536) {
    return raw.slice(0, 1536)
  }
  return [...raw, ...new Array(1536 - raw.length).fill(0)]
}

// Split text into overlapping chunks
export function chunkText(text: string, size = 400): string[] {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''

  for (const s of sentences) {
    const combined = current ? current + ' ' + s : s
    if (combined.split(' ').length > size && current) {
      chunks.push(current.trim())
      current = s
    } else {
      current = combined
    }
  }
  if (current.trim().split(' ').length > 10) {
    chunks.push(current.trim())
  }
  return chunks
}

// Extract raw text from file buffer
export async function extractText(
  buffer: Buffer,
  mime: string,
  name: string,
): Promise<string> {
  try {
    if (mime === 'application/pdf') {
      const pdf = await import('pdf-parse')
      const data = await pdf.default(buffer)
      return data.text
    }
    if (name.endsWith('.docx') || mime.includes('word')) {
      const mammoth = await import('mammoth')
      const res = await mammoth.extractRawText({ buffer })
      return res.value
    }
    if (
      mime.includes('presentation') ||
      name.endsWith('.pptx') ||
      name.endsWith('.ppt')
    ) {
      // Parse PPTX slide XML for visible text runs.
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(buffer)
      const slideFiles = Object.keys(zip.files)
        .filter((key) => /^ppt\/slides\/slide\d+\.xml$/.test(key))
        .sort((a, b) => {
          const ai = Number((a.match(/slide(\d+)\.xml$/) || [])[1] || '0')
          const bi = Number((b.match(/slide(\d+)\.xml$/) || [])[1] || '0')
          return ai - bi
        })

      const decodeXml = (input: string) =>
        input
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")

      const textParts: string[] = []
      for (const slidePath of slideFiles) {
        const xml = await zip.files[slidePath].async('text')
        const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || []
        for (const raw of matches) {
          const t = raw.replace(/^<a:t[^>]*>/, '').replace(/<\/a:t>$/, '')
          const decoded = decodeXml(t).trim()
          if (decoded) textParts.push(decoded)
        }
      }

      return textParts.join('\n')
    }
    if (mime === 'text/plain') {
      return buffer.toString('utf-8')
    }
    return ''
  } catch (e) {
    console.error('Extract error:', e)
    return ''
  }
}

// XP → Level name
export function getLevel(xp: number): string {
  if (xp < 500) return 'Fresher'
  if (xp < 1500) return 'Learner'
  if (xp < 3500) return 'Expert'
  return 'Champion'
}

// Next level info
export function getNextLevel(
  xp: number,
): { name: string; required: number; current: number } {
  if (xp < 500) return { name: 'Learner', required: 500, current: xp }
  if (xp < 1500) return { name: 'Expert', required: 1500, current: xp }
  if (xp < 3500) return { name: 'Champion', required: 3500, current: xp }
  return { name: 'Champion', required: 3500, current: xp }
}

