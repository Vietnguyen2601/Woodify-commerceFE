import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { authService, queryKeys } from '@/services'
import { APP_CONFIG } from '@/constants'
import type { LoginCredentials, RegisterData, User } from '@/types'

/**
 * Hook for managing authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient()

  // Get current user query
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: authService.getCurrentUser,
    staleTime: APP_CONFIG.STALE_TIMES.USER,
    retry: false, // Don't retry on 401
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.tokens.accessToken)
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken)
      
      // Update user in cache
      queryClient.setQueryData(queryKeys.user(), data.user)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.tokens.accessToken)
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken)
      
      // Update user in cache
      queryClient.setQueryData(queryKeys.user(), data.user)
    },
  })

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout errors
    } finally {
      // Clear tokens
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
      
      // Clear user from cache
      queryClient.setQueryData(queryKeys.user(), null)
      queryClient.clear()
    }
  }, [queryClient])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
  }
}
