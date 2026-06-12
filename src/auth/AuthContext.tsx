import React, { createContext, useContext, useMemo, useState } from 'react'
import { http } from '../services/http'

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER'

export type User = {
  id: number
  username: string
  email?: string
  role: Role
}

type AuthContextValue = {
  token: string | null
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => readJson<User>('user'))

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      user,
      login: async (username, password) => {
        const res = await http.post('/api/auth/login', { username, password })
        const nextToken = res.data?.token as string
        const nextUser = res.data?.user as User
        localStorage.setItem('token', nextToken)
        localStorage.setItem('user', JSON.stringify(nextUser))
        setToken(nextToken)
        setUser(nextUser)
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      },
      hasRole: (...roles) => {
        if (!user) return false
        return roles.includes(user.role)
      },
    }
  }, [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('AuthProvider missing')
  }
  return ctx
}

