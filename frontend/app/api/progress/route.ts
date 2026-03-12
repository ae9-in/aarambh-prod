import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getLevel } from '@/lib/openai'

type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

function isMissingOrgIdColumn(error: any): boolean {
  const message = String(error?.message ?? '')
  return (
    error?.code === '42703' ||
    message.includes('column user_progress.org_id does not exist') ||
    message.includes("Could not find the 'org_id' column of 'user_progress'")
  )
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

async function updateStreak(userId: string): Promise<{ streak: number }> {
  // Minimal implementation based on profiles.streak_days
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('streak_days')
    .eq('id', userId)
    .maybeSingle()

  const current = profile?.streak_days ?? 0
  const next = current + 1

  await supabaseAdmin
    .from('profiles')
    .update({ streak_days: next })
    .eq('id', userId)

  return { streak: next }
}

async function checkAndAwardBadges(
  userId: string,
  orgId: string,
  _stats: {
    lessonsCompleted: number
    quizzesPassed: number
    streakDays: number
    xpPoints: number
  },
): Promise<any[]> {
  // Placeholder implementation – wire real logic later
  // For now just return empty array so callers can safely spread it.
  return []
}

// GET — User progress for all content
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const orgId = searchParams.get('orgId')

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Missing userId or orgId' },
        { status: 400 },
      )
    }

    let data: any[] | null = null
    let error: any = null

    const withOrg = await supabaseAdmin
      .from('user_progress')
      .select(
        `
        id,
        user_id,
        content_id,
        org_id,
        status,
        progress_percent,
        time_spent_minutes,
        last_position_seconds,
        is_bookmarked,
        notes,
        completed_at,
        created_at,
        updated_at,
        content:content_id (
          title,
          type,
          xp_reward,
          category_id,
          org_id
        )
      `,
      )
      .eq('user_id', userId)
      .eq('org_id', orgId)

    data = withOrg.data
    error = withOrg.error

    if (error && isMissingOrgIdColumn(error)) {
      const fallback = await supabaseAdmin
        .from('user_progress')
        .select(
          `
          id,
          user_id,
          content_id,
          status,
          progress_percent,
          time_spent_minutes,
          last_position_seconds,
          is_bookmarked,
          notes,
          completed_at,
          created_at,
          updated_at,
          content:content_id (
            title,
            type,
            xp_reward,
            category_id,
            org_id
          )
        `,
        )
        .eq('user_id', userId)

      data = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error('GET /api/progress error:', error)
      return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
    }

    const progress =
      data?.map((row: any) => ({
        ...row,
        title: row.content?.title ?? null,
        type: row.content?.type ?? null,
        xp_reward: row.content?.xp_reward ?? null,
        category_id: row.content?.category_id ?? null,
      }))
        .filter((row: any) => (row.content?.org_id ?? orgId) === orgId) ?? []

    return NextResponse.json({ progress })
  } catch (e) {
    console.error('GET /api/progress unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

// POST — Update progress (main gamification endpoint)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      userId,
      contentId,
      orgId,
      status,
      progressPercent,
      timeSpentMinutes,
      lastPositionSeconds,
    }: {
      userId: string
      contentId: string
      orgId: string
      status: ProgressStatus
      progressPercent: number
      timeSpentMinutes: number
      lastPositionSeconds?: number
    } = body

    if (!userId || !contentId || !orgId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // 1. Get existing progress record
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .maybeSingle()

    if (existingError) {
      console.error('Fetch existing progress error:', existingError)
    }

    const wasAlreadyCompleted = existing?.status === 'COMPLETED'

    // 3. Upsert user_progress (manual insert/update to avoid onConflict issues)
    let upsertedRecord: any = existing
    // Some older DBs don't have user_progress.org_id. Handle both schemas.
    const orgColumnProbe = await supabaseAdmin
      .from('user_progress')
      .select('org_id')
      .limit(1)
    const supportsOrgIdColumn = !isMissingOrgIdColumn(orgColumnProbe.error)

    const payload: any = {
      user_id: userId,
      content_id: contentId,
      status,
      progress_percent: progressPercent,
      time_spent_minutes: timeSpentMinutes,
      last_position_seconds: lastPositionSeconds ?? null,
      completed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
    }
    if (supportsOrgIdColumn) {
      payload.org_id = orgId
    }

    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from('user_progress')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .maybeSingle()

      if (error) {
        console.error('Update progress error:', error)
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 },
        )
      }
      upsertedRecord = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('user_progress')
        .insert(payload)
        .select()
        .maybeSingle()

      if (error) {
        console.error('Insert progress error:', error)
        return NextResponse.json(
          { error: 'Failed to create progress' },
          { status: 500 },
        )
      }
      upsertedRecord = data
    }

    // 5. If not completed, simply return progress
    if (status !== 'COMPLETED') {
      return NextResponse.json({ progress: upsertedRecord })
    }

    // 4. Completed flow, only if newly completed
    if (status === 'COMPLETED' && !wasAlreadyCompleted) {
      // a. Get content xp_reward
      const { data: content, error: contentError } = await supabaseAdmin
        .from('content')
        .select('id,xp_reward,completion_count,org_id')
        .eq('id', contentId)
        .maybeSingle()

      if (contentError) {
        console.error('Content fetch error:', contentError)
      }

      const xpReward = content?.xp_reward ?? 50

      // b. Get current profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id,org_id,xp_points,level,streak_days,weekly_xp,monthly_xp')
        .eq('id', userId)
        .eq('org_id', orgId)
        .maybeSingle()

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError)
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 500 },
        )
      }

      // c–e. XP / level / streak
      const newXP = (profile.xp_points ?? 0) + xpReward
      const newLevel = getLevel(newXP)
      const leveledUp = newLevel !== profile.level
      const streakResult = await updateStreak(userId)

      // g. UPDATE profiles
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({
          xp_points: newXP,
          level: newLevel,
          weekly_xp: (profile.weekly_xp ?? 0) + xpReward,
          monthly_xp: (profile.monthly_xp ?? 0) + xpReward,
        })
        .eq('id', userId)
        .eq('org_id', orgId)

      if (updateProfileError) {
        console.error('Profile update error:', updateProfileError)
      }

      // h. Upsert weekly_activity (manual get + update/insert)
      const date = todayISO()
      const { data: existingWeekly } = await supabaseAdmin
        .from('weekly_activity')
        .select('id,lessons_completed,xp_earned,minutes_spent')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle()

      if (existingWeekly?.id) {
        await supabaseAdmin
          .from('weekly_activity')
          .update({
            lessons_completed: (existingWeekly.lessons_completed ?? 0) + 1,
            xp_earned: (existingWeekly.xp_earned ?? 0) + xpReward,
            minutes_spent:
              (existingWeekly.minutes_spent ?? 0) + (timeSpentMinutes ?? 0),
          })
          .eq('id', existingWeekly.id)
      } else {
        await supabaseAdmin.from('weekly_activity').insert({
          user_id: userId,
          org_id: orgId,
          date,
          lessons_completed: 1,
          xp_earned: xpReward,
          minutes_spent: timeSpentMinutes ?? 0,
        })
      }

      // i. INCREMENT content.completion_count
      if (content?.id) {
        await supabaseAdmin
          .from('content')
          .update({
            completion_count: (content.completion_count ?? 0) + 1,
          })
          .eq('id', content.id)
      }

      // j. Get total completed count for user in org
      const { data: completedRows } = await supabaseAdmin
        .from('user_progress')
        .select(
          `
          id,
          status,
          content:content_id ( org_id )
        `,
        )
        .eq('user_id', userId)
        .eq('status', 'COMPLETED')

      const completedCount =
        completedRows?.filter((row: any) => row.content?.org_id === orgId)
          .length ?? 0

      // k. Get quiz passes count for user
      const { data: quizPassRows } = await supabaseAdmin
        .from('quiz_attempts')
        .select('id,passed,org_id')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .eq('passed', true)

      const quizPassCount = quizPassRows?.length ?? 0

      // l. Badge checks
      const newBadges = await checkAndAwardBadges(userId, orgId, {
        lessonsCompleted: completedCount,
        quizzesPassed: quizPassCount,
        streakDays: streakResult.streak,
        xpPoints: newXP,
      })

      // m. Level-up notification
      if (leveledUp) {
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          org_id: orgId,
          type: 'achievement',
          title: '⚡ Level Up!',
          message: `You are now ${newLevel}!`,
        })
      }

      // n. Access log
      await supabaseAdmin.from('access_logs').insert({
        user_id: userId,
        org_id: orgId,
        content_id: contentId,
        action: 'COMPLETE',
      })

      return NextResponse.json({
        xpEarned: xpReward,
        newXP,
        newLevel,
        leveledUp,
        newStreak: streakResult.streak,
        newBadges,
      })
    }

    // Already completed before – just return record
    return NextResponse.json({ progress: upsertedRecord })
  } catch (e) {
    console.error('POST /api/progress unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

