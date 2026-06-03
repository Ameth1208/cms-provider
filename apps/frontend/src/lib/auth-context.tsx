'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthUser {
  id: string
  email: string
  name: string
  organizationId: string
  organizationName: string
  permissions: { resource: string; action: string }[]
  roles: string[]
  modulesEnabled: string[]
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'cms_auth'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({ token: null, user: null, isLoading: true })

  // Load from localStorage on mount + sync roles if missing
  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.token && parsed.user) {
            const user = {
              ...parsed.user,
              roles: parsed.user.roles || [],
              modulesEnabled: parsed.user.modulesEnabled || [],
            }

            // If roles missing (old token), fetch fresh profile
            if (!user.roles.length) {
              try {
                const fresh = await fetch(`${API_URL}/auth/me`, {
                  headers: { Authorization: `Bearer ${parsed.token}` },
                }).then((r) => (r.ok ? r.json() : null))
                if (fresh && fresh.roles) {
                  user.roles = fresh.roles
                  user.permissions = fresh.permissions
                  user.modulesEnabled = fresh.modulesEnabled || []
                  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: parsed.token, user }))
                }
              } catch {
                // ignore fetch error, use localStorage data
              }
            }

            setState({ token: parsed.token, user, isLoading: false })
            return
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
      setState((s) => ({ ...s, isLoading: false }))
    }

    init()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Credenciales inválidas' }))
        return { success: false, error: err.message || 'Credenciales inválidas' }
      }

      const data = await res.json()
      const authData = {
        token: data.accessToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          organizationId: data.user.organizationId,
          organizationName: data.user.organizationName,
          permissions: data.user.permissions,
          roles: data.user.roles || [],
          modulesEnabled: data.user.modulesEnabled || [],
        },
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
      setState({ token: authData.token, user: authData.user, isLoading: false })
      return { success: true }
    } catch (e) {
      return { success: false, error: 'Error de conexión' }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ token: null, user: null, isLoading: false })
    router.push('/login')
  }, [router])

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    isAuthenticated: !!state.token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
