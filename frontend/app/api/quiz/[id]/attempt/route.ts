import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getLevel } from '@/lib/openai'
import { sendCertEmail } from '@/lib/email'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

async function updateStreak(userId: string): Promise<{ streak: number }> {
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
    lessonsCompleted?: number
    quizzesPassed: number
    streakDays?: number
    xpPoints?: number
    latestQuizScore: number
  },
): Promise<any[]> {
  // Placeholder badge logic – extend with real rules later.
  return []
}

// POST — Submit quiz attempt
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const quizId = params.id
    const body = await req.json()
    const {
      userId,
      orgId,
      answers,
      timeTakenSeconds,
    }: {
      userId: string
      orgId: string
      answers: any[]
      timeTakenSeconds: number
    } = body

    if (!quizId || !userId || !orgId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields' },
        { status: 400 },
      )
    }

    // 1. Get quiz
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .select(
        `
        id,
        org_id,
        content_id,
        title,
        questions,
        pass_percent,
        xp_reward_pass,
        xp_reward_fail
      `,
      )
      .eq('id', quizId)
      .maybeSingle()

    if (quizError || !quiz) {
      console.error('Quiz fetch error:', quizError)
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 },
      )
    }

    const questions: any[] = quiz.questions ?? []
    const total = questions.length || 1

    // 2. Grade answers
    let correct = 0
    questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) correct++
    })

    const score = Math.round((correct / total) * 100)
    const passed = score >= (quiz.pass_percent ?? 0)

    // 3. XP earned
    const xpEarned = passed
      ? quiz.xp_reward_pass ?? 100
      : quiz.xp_reward_fail ?? 25

    // 4. Attempt number
    const { count: attemptCount, error: countError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', quizId)
      .eq('user_id', userId)

    if (countError) {
      console.error('Attempt count error:', countError)
    }

    const attemptNumber = (attemptCount ?? 0) + 1

    // 5. INSERT quiz_attempts
    const { error: insertAttemptError } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: userId,
        org_id: orgId,
        answers,
        score,
        passed,
        time_taken_seconds: timeTakenSeconds,
        xp_earned: xpEarned,
        attempt_number: attemptNumber,
      })

    if (insertAttemptError) {
      console.error('Insert quiz attempt error:', insertAttemptError)
      return NextResponse.json(
        { error: 'Failed to save attempt' },
        { status: 500 },
      )
    }

    // 6. UPDATE quiz: completion_count + avg_score
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('score')
      .eq('quiz_id', quizId)

    if (attemptsError) {
      console.error('Attempts fetch error:', attemptsError)
    }

    const allScores = attempts?.map(a => a.score as number) ?? [score]
    const avgScore =
      allScores.reduce((sum, s) => sum + (s || 0), 0) / allScores.length

    await supabaseAdmin
      .from('quizzes')
      .update({
        completion_count: (quiz.completion_count ?? 0) + 1,
        avg_score: Math.round(avgScore),
      })
      .eq('id', quizId)

    // 7. Award XP to profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id,org_id,xp_points,level,weekly_xp,monthly_xp,email,full_name')
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

    const newXP = (profile.xp_points ?? 0) + xpEarned
    const newLevel = getLevel(newXP)

    await supabaseAdmin
      .from('profiles')
      .update({
        xp_points: newXP,
        level: newLevel,
        weekly_xp: (profile.weekly_xp ?? 0) + xpEarned,
        monthly_xp: (profile.monthly_xp ?? 0) + xpEarned,
      })
      .eq('id', userId)
      .eq('org_id', orgId)

    // 8. updateStreak
    const streakResult = await updateStreak(userId)

    // 9–10. Stats for badge check
    const { count: totalPassed, error: passedCountError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('passed', true)

    if (passedCountError) {
      console.error('Passed count error:', passedCountError)
    }

    const newBadges = await checkAndAwardBadges(userId, orgId, {
      latestQuizScore: score,
      quizzesPassed: (totalPassed ?? 0) + (passed ? 1 : 0),
    })

    // 11. Certificate generation on pass
    let certificateId: string | null = null

    if (passed) {
      const certNumber =
        'ARAMBH-' + Date.now().toString(36).toUpperCase()

      const { data: cert, error: certError } = await supabaseAdmin
        .from('certificates')
        .insert({
          user_id: userId,
          org_id: orgId,
          content_id: quiz.content_id,
          quiz_id: quizId,
          course_name: quiz.title,
          score,
          certificate_number: certNumber,
        })
        .select('id')
        .maybeSingle()

      if (certError) {
        console.error('Certificate insert error:', certError)
      } else if (cert?.id) {
        certificateId = cert.id as string
        if (profile.email) {
          await sendCertEmail(
            profile.email,
            profile.full_name ?? '',
            quiz.title,
            score,
            certificateId,
          )
        }
      }
    }

    // 12. UPDATE weekly_activity
    const date = todayISO()
    const { data: existingWeekly } = await supabaseAdmin
      .from('weekly_activity')
      .select('id,xp_earned,quizzes_completed')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    if (existingWeekly?.id) {
      await supabaseAdmin
        .from('weekly_activity')
        .update({
          xp_earned: (existingWeekly.xp_earned ?? 0) + xpEarned,
          quizzes_completed: (existingWeekly.quizzes_completed ?? 0) + 1,
        })
        .eq('id', existingWeekly.id)
    } else {
      await supabaseAdmin.from('weekly_activity').insert({
        user_id: userId,
        org_id: orgId,
        date,
        xp_earned: xpEarned,
        quizzes_completed: 1,
      })
    }

    // 13. Access log
    await supabaseAdmin.from('access_logs').insert({
      user_id: userId,
      org_id: orgId,
      content_id: quiz.content_id,
      action: 'QUIZ_COMPLETE',
    })

    // 14. Response
    return NextResponse.json({
      score,
      passed,
      xpEarned,
      correctAnswers: correct,
      totalQuestions: total,
      attemptNumber,
      newBadges,
      certificateId,
      newXP,
      newLevel,
      newStreak: streakResult.streak,
    })
  } catch (e) {
    console.error('POST /api/quiz/[id]/attempt unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

