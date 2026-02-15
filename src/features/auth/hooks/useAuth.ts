import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { authService, queryKeys } from '@/services'
import { APP_CONFIG } from '@/constants'
import type { LoginCredentials, RegisterData, UserRole } from '@/types'

/**
 * User info stored in localStorage after login
 */
export interface StoredUser {
  accountId: string
  email: string
  username: string
  role?: UserRole
}

const VALID_USER_ROLES: UserRole[] = ['customer', 'seller', 'admin']

/**
 * Read user from localStorage
 */
function getStoredUser(): StoredUser | null {
  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
  const username = localStorage.getItem('user_name')
  const email = localStorage.getItem('user_email')
  const storedRole = localStorage.getItem('user_role')

  if (!token || !username) return null

  return {
    accountId: '',
    email: email || '',
    username,
    role: storedRole && VALID_USER_ROLES.includes(storedRole as UserRole) ? (storedRole as UserRole) : undefined,
  }
}

/**
 * Hook for managing authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient()

  // Get current user from localStorage (no API call)
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => Promise.resolve(getStoredUser()),
    staleTime: APP_CONFIG.STALE_TIMES.USER,
    retry: false,
  })

  // Logout
  const logout = useCallback(async () => {
    // Clear tokens & user data
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')

    // Clear user from cache
    queryClient.setQueryData(queryKeys.user(), null)
    queryClient.clear()
  }, [queryClient])

  /**
   * Call this after a successful login to update the auth state
   */
  const setUser = useCallback(
    (userData: StoredUser) => {
      queryClient.setQueryData(queryKeys.user(), userData)
    },
    [queryClient]
  )

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
    setUser,
  }
}
