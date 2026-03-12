import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Period = 'week' | 'month' | 'allTime'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')
    const period = (searchParams.get('period') || 'allTime') as Period

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
    }

    const field =
      period === 'week' ? 'weekly_xp' : period === 'month' ? 'monthly_xp' : 'xp_points'

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id,name,avatar_url,role,level,xp_points,weekly_xp,monthly_xp,streak_days')
      .eq('org_id', orgId)
      .order(field, { ascending: false })
      .limit(20)

    if (error) {
      console.error('leaderboard fetch error:', error)
      return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
    }

    const leaderboard =
      data?.map((row, index) => ({
        id: row.id,
        name: row.name,
        avatarUrl: row.avatar_url,
        role: row.role,
        level: row.level,
        xp:
          period === 'week'
            ? row.weekly_xp
            : period === 'month'
            ? row.monthly_xp
            : row.xp_points,
        streakDays: row.streak_days,
        rank: index + 1,
      })) ?? []

    return NextResponse.json({ leaderboard })
  } catch (e) {
    console.error('GET /api/leaderboard unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

