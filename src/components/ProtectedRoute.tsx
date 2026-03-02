import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Use the auth hook to check if user is authenticated
  const { user, isLoading } = useAuth()

  // While loading, show nothing (prevents redirect during initial auth check)
  if (isLoading) {
    return <div className='flex items-center justify-center min-h-screen'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700'></div>
    </div>
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}
