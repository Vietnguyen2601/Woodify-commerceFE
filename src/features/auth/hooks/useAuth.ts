import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { authService, queryKeys } from '@/services'
import { APP_CONFIG } from '@/constants'
import { clearStoredUser, persistStoredUser, readStoredUser, type StoredUser } from '@/features/auth/utils/storage'

const isBrowser = typeof window !== 'undefined'

const fetchAuthenticatedUser = async (): Promise<StoredUser | null> => {
  if (!isBrowser) return null

  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
  if (!token) {
    clearStoredUser()
    return null
  }

  const cachedUser = readStoredUser()

  try {
    const profile = await authService.getCurrentUser()
    const normalizedUser: StoredUser = {
      accountId: profile.id,
      email: profile.email,
      username: profile.fullName || profile.email,
      fullName: profile.fullName,
      role: profile.role,
    }
    persistStoredUser(normalizedUser)
    return normalizedUser
  } catch (error) {
    console.warn('Unable to fetch authenticated user profile', error)
    return cachedUser ?? null
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
    queryFn: fetchAuthenticatedUser,
    initialData: () => readStoredUser(),
    staleTime: APP_CONFIG.STALE_TIMES.USER,
    retry: false,
  })

  // Logout
  const logout = useCallback(async () => {
    // Clear tokens & user data
    if (isBrowser) {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
      // Clear old account_id key if it exists
      localStorage.removeItem('account_id')
    }
    clearStoredUser()

    // Clear user from cache
    queryClient.setQueryData(queryKeys.user(), null)
    queryClient.clear()
  }, [queryClient])

  /**
   * Call this after a successful login to update the auth state
   */
  const setUser = useCallback(
    (userData: StoredUser | null) => {
      if (!userData) {
        clearStoredUser()
        queryClient.setQueryData(queryKeys.user(), null)
        return
      }

      persistStoredUser(userData)
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
