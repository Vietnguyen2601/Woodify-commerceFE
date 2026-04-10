import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { authService, queryKeys } from '@/services'
import { APP_CONFIG } from '@/constants'
import { clearStoredUser, persistStoredUser, readStoredUser, type StoredUser } from '@/features/auth/utils/storage'
import { ROUTES } from '@/constants/routes'

const isBrowser = typeof window !== 'undefined'

const fetchAuthenticatedUser = async (): Promise<StoredUser | null> => {
  if (!isBrowser) return null

  // Return cached user from localStorage if exists
  // Login response already provides accountId, so getCurrentUser() is not needed
  const cachedUser = readStoredUser()
  if (cachedUser) {
    return cachedUser
  }

  return null
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
    // Don't use initialData - let queryFn always run to ensure fresh data with accountId
    staleTime: APP_CONFIG.STALE_TIMES.USER,
    retry: false,
  })

  // Logout
  const logout = useCallback(async () => {
    try {
      // Call backend logout API to clear HttpOnly cookie
      await authService.logout()
    } catch (error) {
      // Silently continue - logout is not critical
    }

    // Clear tokens & user data BEFORE navigating — window.location.href stops
    // JS execution so any cleanup placed after it never runs.
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

    if (isBrowser) {
      // Use replaceState to remove protected pages from browser history
      // so user can't back into protected pages after logout
      window.history.replaceState({}, '', ROUTES.HOME)
      window.location.href = ROUTES.HOME
    }
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
    accountId: user?.accountId || '',
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
    setUser,
  }
}
