import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import api from '../lib/api'

export type AuthUser = {
  id: number
  full_name: string
  email: string
  role: 'Patient' | 'Caregiver' | 'Admin'
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshAuthState: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuthState = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await api.get<AuthUser>('/auth/me')
      setUser(response.data)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshAuthState()
  }, [refreshAuthState])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      refreshAuthState,
    }),
    [isLoading, refreshAuthState, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}