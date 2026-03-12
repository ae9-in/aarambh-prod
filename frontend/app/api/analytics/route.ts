import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const orgId = searchParams.get('orgId')
    const periodParam = searchParams.get('period')
    const periodDays = periodParam ? Number(periodParam) || 7 : 7

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
    }

    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(now.getDate() - periodDays)
    const periodStartStr = periodStart.toISOString().slice(0, 10)

    const [
      { data: profiles, error: profilesError },
      { data: content, error: contentError },
      { data: progress, error: progressError },
      { data: weeklyActivity, error: weeklyError },
      { data: quizAttempts, error: quizError },
      { data: chatSessions, error: chatError },
    ] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select<'id,status,xp_points,level,weekly_xp,org_id', {
          id: string
          status: string | null
          xp_points: number | null
          level: string | null
          weekly_xp: number | null
          org_id: string
        }>('id,status,xp_points,level,weekly_xp,org_id')
        .eq('org_id', orgId),
      supabaseAdmin
        .from('content')
        .select<'id,type,completion_count,view_count,org_id', {
          id: string
          type: string | null
          completion_count: number | null
          view_count: number | null
          org_id: string
        }>('id,type,completion_count,view_count,org_id')
        .eq('org_id', orgId),
      supabaseAdmin
        .from('user_progress')
        .select<'user_id,status,completed_at,org_id', {
          user_id: string
          status: string
          completed_at: string | null
          org_id: string
        }>('user_id,status,completed_at,org_id')
        .eq('org_id', orgId),
      supabaseAdmin
        .from('weekly_activity')
        .select<'*', any>('*')
        .eq('org_id', orgId)
        .gte('date', periodStartStr),
      supabaseAdmin
        .from('quiz_attempts')
        .select<'score,passed', { score: number | null; passed: boolean | null }>('score,passed')
        .limit(1000),
      supabaseAdmin
        .from('ai_chat_sessions')
        .select<'id,org_id', { id: string; org_id: string }>('id,org_id')
        .eq('org_id', orgId),
    ])

    if (profilesError) console.error('analytics: profiles error', profilesError)
    if (contentError) console.error('analytics: content error', contentError)
    if (progressError) console.error('analytics: progress error', progressError)
    if (weeklyError) console.error('analytics: weekly_activity error', weeklyError)
    if (quizError) console.error('analytics: quiz_attempts error', quizError)
    if (chatError) console.error('analytics: ai_chat_sessions error', chatError)

    const users = profiles ?? []
    const contents = content ?? []
    const progressRows = progress ?? []
    const weekly = weeklyActivity ?? []
    const quizzes = quizAttempts ?? []
    const chats = chatSessions ?? []

    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length
    const totalContent = contents.length

    const contentByType = contents.reduce<Record<string, number>>((acc, c) => {
      const t = c.type ?? 'OTHER'
      acc[t] = (acc[t] ?? 0) + 1
      return acc
    }, {})

    const completedProgress = progressRows.filter((p) => p.status === 'COMPLETED')
    const avgCompletion =
      totalUsers > 0 ? completedProgress.length / totalUsers : 0

    const topContent = [...contents]
      .sort(
        (a, b) =>
          (b.completion_count ?? 0) - (a.completion_count ?? 0),
      )
      .slice(0, 5)

    const leaderboard = [...users]
      .sort(
        (a, b) =>
          (b.xp_points ?? 0) - (a.xp_points ?? 0),
      )
      .slice(0, 10)

    const totalQuiz = quizzes.length
    const passedQuiz = quizzes.filter((q) => q.passed).length
    const quizPassRate = totalQuiz > 0 ? passedQuiz / totalQuiz : 0

    const aiQueryCount = chats.length

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalContent,
      contentByType,
      avgCompletion,
      weeklyActivity: weekly,
      topContent,
      leaderboard,
      quizPassRate,
      aiQueryCount,
    })
  } catch (e) {
    console.error('analytics route error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

