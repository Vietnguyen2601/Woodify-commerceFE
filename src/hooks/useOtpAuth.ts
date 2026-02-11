import { useState, useCallback } from 'react'
import { authService } from '@/services/auth.service'
import type {
  SendOtpRequest,
  VerifyOtpRequest,
  RegisterWithOtpRequest,
} from '@/types'

interface UseOtpAuthState {
  step: 'email' | 'otp' | 'register' | 'success' | 'error'
  email: string
  otp: string
  loading: boolean
  error: string | null
  otpExpires: number | null
  verified: boolean
}

/**
 * Custom hook to handle OTP-based registration flow
 */
export const useOtpAuth = () => {
  const [state, setState] = useState<UseOtpAuthState>({
    step: 'email',
    email: '',
    otp: '',
    loading: false,
    error: null,
    otpExpires: null,
    verified: false,
  })

  /**
   * Step 1: Send OTP to email
   */
  const sendOtp = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await authService.sendOtp({ email } as SendOtpRequest)
      setState((prev) => ({
        ...prev,
        email,
        step: 'otp',
        loading: false,
        otpExpires: response.expiresIn,
      }))
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP'
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        step: 'error',
      }))
      throw error
    }
  }, [])

  /**
   * Step 2: Verify OTP
   */
  const verifyOtp = useCallback(
    async (otp: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await authService.verifyOtp({
          email: state.email,
          otp,
        } as VerifyOtpRequest)

        setState((prev) => ({
          ...prev,
          otp,
          step: 'register',
          loading: false,
          verified: true,
        }))
        return response
      } catch (error: any) {
        const errorMessage = error.message || 'Invalid OTP'
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }))
        throw error
      }
    },
    [state.email]
  )

  /**
   * Step 3: Register with verified email
   */
  const register = useCallback(
    async (formData: Omit<RegisterWithOtpRequest, 'email'>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await authService.registerWithOtp({
          email: state.email,
          ...formData,
        } as RegisterWithOtpRequest)

        setState((prev) => ({
          ...prev,
          loading: false,
          step: 'success',
        }))
        return response
      } catch (error: any) {
        const errorMessage = error.message || 'Registration failed'
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          step: 'error',
        }))
        throw error
      }
    },
    [state.email]
  )

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState({
      step: 'email',
      email: '',
      otp: '',
      loading: false,
      error: null,
      otpExpires: null,
      verified: false,
    })
  }, [])

  return {
    ...state,
    sendOtp,
    verifyOtp,
    register,
    reset,
  }
}
