import React, { createContext, useContext, useEffect, useState } from 'react'

type User = { id: number; name?: string | null; email: string; role: 'admin' | 'user' }
type AuthCtx = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  }, [])

  const login = (u: User) => {
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
