import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { authService, queryKeys } from '@/services'
import { APP_CONFIG } from '@/constants'
import { clearStoredUser, persistStoredUser, readStoredUser, type StoredUser } from '@/features/auth/utils/storage'
import { ROUTES } from '@/constants/routes'

const isBrowser = typeof window !== 'undefined'

const fetchAuthenticatedUser = async (): Promise<StoredUser | null> => {
  if (!isBrowser) return null

  const cachedUser = readStoredUser()

  try {
    // Fetch full user data from backend
    const response = await authService.getCurrentUser()
    
    // If response is null (from 401 handling), user is not authenticated
    if (!response) {
      clearStoredUser()
      return null
    }
    
    // The API client interceptor already unwraps { status, message, data: {...} }
    // so `response` is already the inner User object.
    const profile = response
    
    // Extract only non-sensitive data for localStorage
    const normalizedUser: StoredUser = {
      email: profile.email,
      username: profile.fullName || profile.username || profile.email,
      fullName: profile.fullName,
      role: profile.role,
      accountId: profile.accountId || profile.id, // Store accountId for Profile page access
    }
    persistStoredUser(normalizedUser)
    
    // Store full user data (including accountId) in sessionStorage for reference
    // This is temporary and cleared on browser close
    if (isBrowser) {
      try {
        const fullUserWithId = {
          ...profile,
          accountId: profile.accountId || profile.id
        }
        sessionStorage.setItem('_full_user_data', JSON.stringify(fullUserWithId))
      } catch (e) {
        // Silent fail
      }
    }
    
    return normalizedUser
  } catch (error: any) {
    // 401 (Unauthorized) is expected on public pages for unauthenticated users
    // Silently return null instead of throwing
    if (error?.response?.status === 401) {
      clearStoredUser()
      return null
    }
    // For other errors, return null
    return null
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
