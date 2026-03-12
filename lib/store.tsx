'use client'

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { MOCK_USERS, MOCK_LESSONS, MOCK_CATEGORIES, MOCK_BADGES, User, Lesson, Notification, MOCK_NOTIFICATIONS } from './mock-data'

export interface AppState {
  currentUser: User | null
  users: User[]
  lessons: Lesson[]
  categories: typeof MOCK_CATEGORIES
  badges: typeof MOCK_BADGES
  notifications: Notification[]
  isLoggedIn: boolean
  sessionStreak: number
}

type AppAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'COMPLETE_LESSON'; payload: string }
  | { type: 'EARN_XP'; payload: number }
  | { type: 'EARN_BADGE'; payload: string }
  | { type: 'UPDATE_STREAK' }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'INIT_FROM_STORAGE' }

const initialState: AppState = {
  currentUser: null,
  users: MOCK_USERS,
  lessons: MOCK_LESSONS,
  categories: MOCK_CATEGORIES,
  badges: MOCK_BADGES,
  notifications: MOCK_NOTIFICATIONS,
  isLoggedIn: false,
  sessionStreak: 0,
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | undefined>(undefined)

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isLoggedIn: true,
      }

    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isLoggedIn: false,
      }

    case 'COMPLETE_LESSON':
      return {
        ...state,
        currentUser: state.currentUser
          ? {
              ...state.currentUser,
              completedLessons: [...new Set([...state.currentUser.completedLessons, action.payload])],
            }
          : null,
        lessons: state.lessons.map((lesson) =>
          lesson.id === action.payload
            ? { ...lesson, isCompleted: true, progress: 100 }
            : lesson
        ),
      }

    case 'EARN_XP':
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, xp: state.currentUser.xp + action.payload }
          : null,
      }

    case 'EARN_BADGE':
      return {
        ...state,
        currentUser: state.currentUser
          ? {
              ...state.currentUser,
              badges: [...new Set([...state.currentUser.badges, action.payload])],
            }
          : null,
      }

    case 'UPDATE_STREAK':
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, streak: state.currentUser.streak + 1 }
          : null,
      }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, isRead: true } : notif
        ),
      }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((notif) => ({ ...notif, isRead: true })),
      }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      }

    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, ...action.payload }
          : null,
      }

    case 'INIT_FROM_STORAGE': {
      if (typeof window === 'undefined') return state
      const storedUser = localStorage.getItem('arambh_user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          return { ...state, currentUser: user, isLoggedIn: true }
        } catch {
          return state
        }
      }
      return state
    }

    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    dispatch({ type: 'INIT_FROM_STORAGE' })
  }, [])

  useEffect(() => {
    if (state.currentUser && state.isLoggedIn) {
      localStorage.setItem('arambh_user', JSON.stringify(state.currentUser))
    }
  }, [state.currentUser, state.isLoggedIn])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
