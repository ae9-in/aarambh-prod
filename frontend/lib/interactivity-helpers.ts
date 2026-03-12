// Helper functions and hooks for wiring interactivity

import { useApp } from '@/lib/store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useInteractivity() {
  const { state, dispatch } = useApp()
  const router = useRouter()

  const completeLesson = (lessonId: string) => {
    dispatch({ type: 'COMPLETE_LESSON', payload: lessonId })
    dispatch({ type: 'EARN_XP', payload: 50 })
    toast.success('Lesson completed! +50 XP')
  }

  const submitQuiz = (score: number, passPercent: number) => {
    const passed = score >= passPercent
    dispatch({ type: 'EARN_XP', payload: passed ? 100 : 25 })
    
    if (passed) {
      toast.success(`Quiz passed! +100 XP`)
    } else {
      toast.info(`Try again! +25 XP for attempt`)
    }
    
    return passed
  }

  const earnBadge = (badgeId: string, badgeName: string) => {
    dispatch({ type: 'EARN_BADGE', payload: badgeId })
    toast.success(`Badge earned: ${badgeName}!`)
  }

  const addNotification = (type: string, title: string, description: string, actionUrl?: string) => {
    const notification = {
      id: `notif-${Date.now()}`,
      type: type as any,
      title,
      description,
      time: 'now',
      isRead: false,
      actionUrl,
    }
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
    localStorage.removeItem('arambh_user')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return {
    state,
    dispatch,
    completeLesson,
    submitQuiz,
    earnBadge,
    addNotification,
    handleLogout,
    navigateTo,
  }
}

// Animation variants for common patterns
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
}

// Format functions
export function formatXP(xp: number): string {
  return xp.toLocaleString()
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 1000) + 1
}

export function getXPForLevel(level: number): number {
  return level * 1000
}

export function getNextLevelXP(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP)
  const nextLevelThreshold = getXPForLevel(currentLevel)
  return nextLevelThreshold - currentXP
}

// Mock data helpers
export function getLessonById(lessonId: string, lessons: any[]) {
  return lessons.find(l => l.id === lessonId)
}

export function getCategoryById(categoryId: string, categories: any[]) {
  return categories.find(c => c.id === categoryId)
}

export function getUserById(userId: string, users: any[]) {
  return users.find(u => u.id === userId)
}

export function getLessonsByCategory(categoryId: string, lessons: any[]) {
  return lessons.filter(l => l.categoryId === categoryId)
}

export function getCompletedLessonsCount(user: any, lessons: any[]) {
  return user.completedLessons.filter((id: string) => 
    lessons.find(l => l.id === id)
  ).length
}

export function getCategoryProgress(categoryId: string, user: any, lessons: any[]) {
  const categoryLessons = getLessonsByCategory(categoryId, lessons)
  if (categoryLessons.length === 0) return 0

  const completed = categoryLessons.filter((l) => user.completedLessons.includes(l.id)).length

  return Math.round((completed / categoryLessons.length) * 100)
}

export function getUserRank(userId: string, users: any[]): number {
  const sorted = [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0))
  const index = sorted.findIndex((u) => u.id === userId)
  return index === -1 ? sorted.length : index + 1
}

export function getNextLevel(xp: number) {
  if (xp <= 500) return { name: "Fresher", required: 500 }
  if (xp <= 1500) return { name: "Learner", required: 1500 }
  if (xp <= 3500) return { name: "Expert", required: 3500 }
  return { name: "Champion", required: 5000 }
}

export function getEngagementColor(level: "HIGH" | "MEDIUM" | "LOW") {
  if (level === "HIGH") return "bg-emerald-500/15 border-emerald-400/40"
  if (level === "MEDIUM") return "bg-amber-500/15 border-amber-400/40"
  return "bg-red-500/15 border-red-400/40"
}
