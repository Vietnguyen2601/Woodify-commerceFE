import { api } from './api/client'
import { identityServiceClient } from './api/identityClient'
import { API_ENDPOINTS } from '@/constants'
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  RegisterWithOtpRequest,
  RegisterWithOtpResponse,
} from '@/types'

export interface LoginResponseData {
  success: boolean
  message: string
  accountId: string
  email: string
  username: string
  token: string
  refreshToken: string
}

export interface LoginResponse {
  status: number
  message: string
  data: LoginResponseData
  errors: unknown
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
      return identityServiceClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials) as unknown as LoginResponse
    },

  /**
   * Register new user (default, non-OTP)
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    return identityServiceClient.post<RegisterResponse>(API_ENDPOINTS.IDENTITY.REGISTER, data)
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

  /**
   * Send OTP to email for email verification
   */
  sendOtp: async (request: SendOtpRequest): Promise<SendOtpResponse> => {
    return identityServiceClient.post<SendOtpResponse>(
      API_ENDPOINTS.IDENTITY.SEND_OTP,
      request
    )
  },

  /**
   * Verify OTP code
   */
  verifyOtp: async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    return identityServiceClient.post<VerifyOtpResponse>(
      API_ENDPOINTS.IDENTITY.VERIFY_OTP,
      request
    )
  },

  /**
   * Register new user with OTP verification
   */
  registerWithOtp: async (
    request: RegisterWithOtpRequest
  ): Promise<RegisterWithOtpResponse> => {
    return identityServiceClient.post<RegisterWithOtpResponse>(
      API_ENDPOINTS.IDENTITY.REGISTER,
      request
    )
  },
}
