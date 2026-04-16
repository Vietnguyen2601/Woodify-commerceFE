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
      // Transform to PascalCase for backend
      const payload = {
        Email: credentials.email,
        Password: credentials.password,
      }
      const response = await identityServiceClient.post(API_ENDPOINTS.AUTH.LOGIN, payload)
      return response as unknown as LoginResponse
    },

  /**
   * Register new user (default, non-OTP)
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    // Transform to PascalCase for backend
    const payload = {
      Email: data.email,
      Password: data.password,
      FullName: data.fullName,
      ...(data.phone && { Phone: data.phone }),
    }
    return identityServiceClient.post(API_ENDPOINTS.IDENTITY.REGISTER, payload) as unknown as RegisterResponse
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    // Try to call logout API if it exists for server-side cleanup
    // But continue even if it fails - client-side cleanup is enough
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      // Silently fail - logout continues with client-side cleanup
    }
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
    const payload = {
      Email: request.email,
    }
    return identityServiceClient.post(API_ENDPOINTS.IDENTITY.SEND_OTP, payload) as unknown as SendOtpResponse
  },

  /**
   * Verify OTP code
   */
  verifyOtp: async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const payload = {
      Email: request.email,
      Otp: request.otp,
    }
    return identityServiceClient.post(API_ENDPOINTS.IDENTITY.VERIFY_OTP, payload) as unknown as VerifyOtpResponse
  },

  /**
   * Register new user with OTP verification
   */
  registerWithOtp: async (
    request: RegisterWithOtpRequest
  ): Promise<RegisterWithOtpResponse> => {
    // Transform to PascalCase for backend (it expects PascalCase)
    const payload = {
      Email: request.email,
      Password: request.password,
      ConfirmPassword: request.confirmPassword,
      Username: request.username,
      ...(request.phone && { Phone: request.phone }),
    }
    return identityServiceClient.post(API_ENDPOINTS.IDENTITY.REGISTER, payload) as unknown as RegisterWithOtpResponse
  },
}
