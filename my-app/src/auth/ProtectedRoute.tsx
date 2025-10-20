import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

type Props = {
  children: React.ReactNode
  allowEmails?: string[]
  allowRoles?: Array<'admin'|'user'>
  fallbackPath?: string // ex.: '/relatorios/login'
}

export default function ProtectedRoute({
  children, allowEmails, allowRoles, fallbackPath = '/login',
}: Props) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${fallbackPath}?next=${next}`} replace />
  }
  if (allowEmails && allowEmails.length > 0 && !allowEmails.includes(user.email)) {
    return <Navigate to="/" replace />
  }
  if (allowRoles && allowRoles.length > 0 && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
