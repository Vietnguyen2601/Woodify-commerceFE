/**
 * User authentication types
 */

export interface User {
  id?: string
  accountId?: string
  email: string
  fullName?: string
  username?: string
  phone?: string
  avatarUrl?: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export type UserRole = 'customer' | 'seller' | 'admin'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

/**
 * OTP & Email Verification Types
 */
export interface SendOtpRequest {
  email: string
}

export interface SendOtpResponse {
  message: string
  expiresIn: number
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  message: string
  verified: boolean
}

export interface RegisterWithOtpRequest {
  email: string
  password: string
  confirmPassword: string
  username: string
  phone?: string
}

export interface RegisterWithOtpResponse {
  user: User
  tokens: AuthTokens
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
}
