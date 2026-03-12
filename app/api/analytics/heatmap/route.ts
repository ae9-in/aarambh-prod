import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
    }

    const { data: content, error: contentError } = await supabaseAdmin
      .from('content')
      .select('id,org_id,views,completion_count')
      .eq('org_id', orgId)

    if (contentError) {
      console.error('heatmap content error:', contentError)
      return NextResponse.json({ error: 'Failed to load heatmap' }, { status: 500 })
    }

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('access_logs')
      .select('content_id,action')
      .eq('org_id', orgId)

    if (logsError) {
      console.error('heatmap logs error:', logsError)
    }

    const viewCounts = new Map<string, number>()
    const completionCounts = new Map<string, number>()

    logs?.forEach(row => {
      const cid = row.content_id as string | null
      if (!cid) return
      if (row.action === 'VIEW') {
        viewCounts.set(cid, (viewCounts.get(cid) ?? 0) + 1)
      }
      if (row.action === 'COMPLETE') {
        completionCounts.set(cid, (completionCounts.get(cid) ?? 0) + 1)
      }
    })

    const heatmapData: Record<
      string,
      { views: number; completions: number; completion_rate: number }
    > = {}

    content?.forEach(row => {
      const cid = row.id as string
      const views =
        viewCounts.get(cid) ??
        (typeof row.views === 'number' ? (row.views as number) : 0)
      const completions =
        completionCounts.get(cid) ??
        (typeof row.completion_count === 'number'
          ? (row.completion_count as number)
          : 0)
      const completion_rate = views > 0 ? Math.round((completions / views) * 100) : 0
      heatmapData[cid] = { views, completions, completion_rate }
    })

    return NextResponse.json({ heatmapData })
  } catch (e) {
    console.error('GET /api/analytics/heatmap unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

