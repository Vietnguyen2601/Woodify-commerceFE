import React from 'react'
import { Navigate } from 'react-router-dom'
import { APP_CONFIG } from '@/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if user is logged in by checking for auth token
  const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
  const isAuthenticated = !!authToken

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}
