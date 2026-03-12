import { supabaseAdmin } from '@/lib/supabase'

type BadgeConditionType =
  | 'LESSONS_COMPLETED'
  | 'XP_EARNED'
  | 'STREAK_DAYS'
  | 'QUIZ_PASSED'
  | 'PERFECT_SCORE'
  | 'FIRST_LESSON'
  | 'SPEED_LEARNER'
  | 'CONSISTENT'

export interface Badge {
  id: string
  org_id: string
  name: string
  description: string | null
  icon: string | null
  condition_type: BadgeConditionType
  condition_value: number
  xp_bonus: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserStats {
  lessonsCompleted: number
  quizzesPassed: number
  streakDays: number
  xpPoints: number
  latestQuizScore?: number
}

export const DEFAULT_BADGES: Array<
  Omit<Badge, 'id' | 'org_id'> & { condition_type: BadgeConditionType }
> = [
  {
    name: 'First Step',
    description: 'Complete your very first lesson.',
    icon: '👣',
    condition_type: 'FIRST_LESSON',
    condition_value: 1,
    xp_bonus: 50,
    rarity: 'common',
  },
  {
    name: 'Quick Learner',
    description: 'Complete 5 lessons.',
    icon: '⚡',
    condition_type: 'LESSONS_COMPLETED',
    condition_value: 5,
    xp_bonus: 100,
    rarity: 'common',
  },
  {
    name: 'Dedicated',
    description: 'Complete 10 lessons.',
    icon: '📚',
    condition_type: 'LESSONS_COMPLETED',
    condition_value: 10,
    xp_bonus: 150,
    rarity: 'rare',
  },
  {
    name: 'Expert',
    description: 'Complete 25 lessons.',
    icon: '🎓',
    condition_type: 'LESSONS_COMPLETED',
    condition_value: 25,
    xp_bonus: 300,
    rarity: 'epic',
  },
  {
    name: 'Quiz Master',
    description: 'Pass 5 quizzes.',
    icon: '🧠',
    condition_type: 'QUIZ_PASSED',
    condition_value: 5,
    xp_bonus: 200,
    rarity: 'rare',
  },
  {
    name: 'Perfect Score',
    description: 'Score 100% on any quiz.',
    icon: '💯',
    condition_type: 'PERFECT_SCORE',
    condition_value: 100,
    xp_bonus: 250,
    rarity: 'epic',
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak.',
    icon: '🔥',
    condition_type: 'STREAK_DAYS',
    condition_value: 7,
    xp_bonus: 150,
    rarity: 'rare',
  },
  {
    name: 'Month Champion',
    description: 'Maintain a 30-day learning streak.',
    icon: '🏆',
    condition_type: 'STREAK_DAYS',
    condition_value: 30,
    xp_bonus: 500,
    rarity: 'legendary',
  },
]

export async function seedOrgBadges(orgId: string): Promise<void> {
  if (!orgId) return

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('badges')
    .select<'name', { name: string }>('name')
    .eq('org_id', orgId)

  if (existingError) {
    console.error('seedOrgBadges existing error:', existingError)
    return
  }

  const existingNames = new Set((existing ?? []).map((b) => b.name))

  const toInsert = DEFAULT_BADGES.filter((b) => !existingNames.has(b.name)).map(
    (b) => ({
      ...b,
      org_id: orgId,
    })
  )

  if (!toInsert.length) return

  const { error: insertError } = await supabaseAdmin.from('badges').insert(toInsert)

  if (insertError) {
    console.error('seedOrgBadges insert error:', insertError)
  }
}

function meetsCondition(badge: Badge, stats: UserStats): boolean {
  switch (badge.condition_type) {
    case 'FIRST_LESSON':
      return stats.lessonsCompleted >= 1
    case 'LESSONS_COMPLETED':
      return stats.lessonsCompleted >= badge.condition_value
    case 'QUIZ_PASSED':
      return stats.quizzesPassed >= badge.condition_value
    case 'STREAK_DAYS':
      return stats.streakDays >= badge.condition_value
    case 'XP_EARNED':
      return stats.xpPoints >= badge.condition_value
    case 'PERFECT_SCORE':
      return (stats.latestQuizScore ?? 0) >= badge.condition_value
    case 'SPEED_LEARNER':
    case 'CONSISTENT':
      // These are not used in DEFAULT_BADGES but are kept for extensibility.
      // By default, treat them as streak-based achievements.
      return stats.streakDays >= badge.condition_value
    default:
      return false
  }
}

export async function checkAndAwardBadges(
  userId: string,
  orgId: string,
  stats: UserStats
): Promise<Badge[]> {
  if (!userId || !orgId) return []

  const [{ data: badges, error: badgesError }, { data: earned, error: earnedError }] =
    await Promise.all([
      supabaseAdmin.from('badges').select<Badge, Badge>('*').eq('org_id', orgId),
      supabaseAdmin
        .from('user_badges')
        .select<'badge_id', { badge_id: string }>('badge_id')
        .eq('user_id', userId),
    ])

  if (badgesError) {
    console.error('checkAndAwardBadges badges error:', badgesError)
    return []
  }
  if (earnedError) {
    console.error('checkAndAwardBadges earned error:', earnedError)
    return []
  }

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id))
  const newBadges: Badge[] = []
  let totalBonusXp = 0

  for (const badge of badges ?? []) {
    if (!badge || earnedIds.has(badge.id)) continue
    if (!meetsCondition(badge, stats)) continue

    const { error: insertBadgeError } = await supabaseAdmin
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badge.id })

    if (insertBadgeError) {
      console.error('checkAndAwardBadges user_badges insert error:', insertBadgeError)
      continue
    }

    if (badge.xp_bonus && badge.xp_bonus > 0) {
      totalBonusXp += badge.xp_bonus
    }

    const { error: notifError } = await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      org_id: orgId,
      type: 'achievement',
      title: `New Badge: ${badge.name}!`,
      message: badge.description,
      is_read: false,
      action_url: '/learn/profile?tab=badges',
      metadata: { badgeId: badge.id },
    })

    if (notifError) {
      console.error('checkAndAwardBadges notification insert error:', notifError)
    }

    newBadges.push(badge)
  }

  if (totalBonusXp > 0) {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select<'xp_points', { xp_points: number | null }>('xp_points')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('checkAndAwardBadges profile fetch error:', profileError)
    } else if (profile) {
      const currentXp = profile.xp_points ?? 0
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ xp_points: currentXp + totalBonusXp })
        .eq('id', userId)

      if (updateError) {
        console.error('checkAndAwardBadges profile update error:', updateError)
      }
    }
  }

  return newBadges
}

export async function updateStreak(
  userId: string
): Promise<{ streak: number; updated: boolean }> {
  if (!userId) return { streak: 0, updated: false }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select<'streak_days, last_active, longest_streak', {
      streak_days: number | null
      last_active: string | null
      longest_streak: number | null
    }>('streak_days, last_active, longest_streak')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    if (error) console.error('updateStreak profile error:', error)
    return { streak: 0, updated: false }
  }

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const lastActiveStr = profile.last_active
  let streak = profile.streak_days ?? 0
  let updated = false

  if (!lastActiveStr) {
    streak = 1
    updated = true
  } else if (lastActiveStr === todayStr) {
    return { streak, updated: false }
  } else if (lastActiveStr === yesterdayStr) {
    streak = streak + 1
    updated = true
  } else {
    streak = 1
    updated = true
  }

  const longest = Math.max(profile.longest_streak ?? 0, streak)

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      streak_days: streak,
      longest_streak: longest,
      last_active: todayStr,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('updateStreak update error:', updateError)
  }

  return { streak, updated }
}

export async function calculateScore(userId: string): Promise<number | null> {
  if (!userId) return null

  const [
    { data: progress, error: progressError },
    { data: attempts, error: attemptsError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabaseAdmin
      .from('user_progress')
      .select<'status', { status: string }>('status')
      .eq('user_id', userId)
      .eq('status', 'COMPLETED'),
    supabaseAdmin
      .from('quiz_attempts')
      .select<'score', { score: number }>('score')
      .eq('user_id', userId),
    supabaseAdmin
      .from('profiles')
      .select<'streak_days', { streak_days: number | null }>('streak_days')
      .eq('id', userId)
      .single(),
  ])

  if (progressError) {
    console.error('calculateScore progress error:', progressError)
  }
  if (attemptsError) {
    console.error('calculateScore attempts error:', attemptsError)
  }
  if (profileError) {
    console.error('calculateScore profile error:', profileError)
  }

  const completedLessons = (progress ?? []).length
  const avgQuizScore =
    attempts && attempts.length
      ? attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / attempts.length
      : 0
  const streakDays = profile?.streak_days ?? 0

  // Weighted score:
  //  - 50% from quiz average
  //  - 30% from completed lessons (cap impact at 20 lessons)
  //  - 20% from streak days (cap impact at 30 days)
  const lessonsNormalized = Math.min(completedLessons / 20, 1)
  const quizNormalized = Math.min(avgQuizScore / 100, 1)
  const streakNormalized = Math.min(streakDays / 30, 1)

  const score =
    Math.round(quizNormalized * 50 + lessonsNormalized * 30 + streakNormalized * 20) || 0

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ score })
    .eq('id', userId)

  if (updateError) {
    console.error('calculateScore update error:', updateError)
  }

  return score
}

