import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { IDENTITY_SERVICE_URL } from '@/constants/api.endpoints'
import { APP_CONFIG } from '@/constants/app.config'

/**
 * Create configured Axios instance for Identity Service
 * Reuse main API client for consistency
 */
const createIdentityServiceClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: IDENTITY_SERVICE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - add auth token (same as main client)
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor - return full response (consistent with main client)
  client.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
      // Handle network error (backend not available)
      if (!error.response) {
        const networkError: any = new Error('Lỗi hệ thống, vui lòng thử lại sau')
        networkError.isNetworkError = true
        return Promise.reject(networkError)
      }

      const message =
        (error.response?.data as any)?.message ||
        error.message ||
        'An error occurred'
      return Promise.reject({
        status: error.response?.status,
        message,
        data: error.response?.data,
      })
    }
  )

  return client
}

export const identityServiceClient = createIdentityServiceClient()
