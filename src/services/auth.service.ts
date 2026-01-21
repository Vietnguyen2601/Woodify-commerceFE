import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types'

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export interface RegisterResponse {
  user: User
  tokens: AuthTokens
}

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>(API_ENDPOINTS.AUTH.ME)
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    return api.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
  },
}
