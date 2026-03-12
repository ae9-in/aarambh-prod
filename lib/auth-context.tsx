'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'VIEWER' | string

interface OrgSummary {
  id: string
  name: string
  logo_url?: string | null
  primary_color?: string | null
  plan?: string | null
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  orgId?: string | null
  org?: OrgSummary | null
  xpPoints: number
  level: string
  streakDays: number
  score: number
  avatarUrl?: string | null
  department?: string | null
  status: string
}

type LoginResult = { error?: string; pending?: boolean }
type RegisterPayload = Record<string, any>

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  register: (data: RegisterPayload) => Promise<LoginResult>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  isAdmin: boolean
  isManager: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function mapProfileToAuthUser(profile: any): AuthUser {
  const org =
    profile?.organizations ??
    profile?.org ??
    (profile?.org_id && profile?.org_name
      ? {
          id: profile.org_id,
          name: profile.org_name,
          logo_url: profile.org_logo_url ?? null,
          primary_color: profile.org_primary_color ?? null,
          plan: profile.org_plan ?? null,
        }
      : null)

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name ?? '',
    role: profile.role ?? 'EMPLOYEE',
    orgId: profile.org_id ?? profile.orgId ?? org?.id ?? null,
    org,
    xpPoints: profile.xp_points ?? profile.xpPoints ?? 0,
    level: profile.level ?? 'Fresher',
    streakDays: profile.streak_days ?? profile.streakDays ?? 0,
    score: profile.score ?? 0,
    avatarUrl: profile.avatar_url ?? profile.avatarUrl ?? null,
    department: profile.department ?? null,
    status: profile.status ?? 'active',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (!res.ok) {
          return
        }

        const data = await res.json().catch(() => null)
        if (!data || cancelled) return

        const profile = data.profile ?? data.user ?? data
        if (profile) {
          setUser(mapProfileToAuthUser(profile))
        }
      } catch (e) {
        console.error('AuthProvider bootstrap error:', e)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data) {
        return { error: data?.error || 'Unable to login. Please try again.' }
      }

      const profile = data.profile ?? data.user ?? data
      setUser(mapProfileToAuthUser(profile))

      return {}
    } catch (e) {
      console.error('login error:', e)
      return { error: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
    } catch (e) {
      console.error('logout error:', e)
      // Even if logout request fails, clear local state to avoid keeping a stale session.
    } finally {
      setUser(null)
      router.push('/login')
    }
  }

  const register = async (data: RegisterPayload): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok || !body) {
        return { error: body?.error || 'Unable to register. Please try again.' }
      }

      if (body.pending) {
        return { pending: true }
      }

      const profile = body.profile ?? body.user ?? body
      if (profile?.id) {
        setUser(mapProfileToAuthUser(profile))
        router.push('/onboarding')
      }

      return {}
    } catch (e) {
      console.error('register error:', e)
      return { error: 'Network error. Please try again.' }
    }
  }

  const updateProfile = async (data: Partial<AuthUser>): Promise<void> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        console.error('updateProfile failed with status', res.status)
        return
      }

      const body = await res.json().catch(() => null)
      const profile = body?.profile ?? body?.user ?? body

      if (profile) {
        setUser(mapProfileToAuthUser(profile))
      } else if (user) {
        // Fallback: merge locally if API does not return full profile
        setUser({ ...user, ...data })
      }
    } catch (e) {
      console.error('updateProfile error:', e)
    }
  }

  const value: AuthContextValue = useMemo(() => {
    const role = user?.role
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const isManager = role === 'MANAGER'
    const isEmployee = role === 'EMPLOYEE'

    return {
      user,
      loading,
      login,
      logout,
      register,
      updateProfile,
      isAdmin,
      isManager,
      isEmployee,
    }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

