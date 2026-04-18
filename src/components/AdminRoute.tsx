import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Requires an authenticated user whose stored role is `admin`.
 * Blocks direct navigation to `/admin` for customers/sellers or missing role.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-amber-700' />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />
  }

  if (user.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}
