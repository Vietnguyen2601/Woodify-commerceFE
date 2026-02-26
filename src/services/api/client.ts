import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/constants'
import { APP_CONFIG } from '@/constants/app.config'

/**
 * Create configured Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - with HttpOnly Cookies, no manual token needed
  client.interceptors.request.use(
    (config) => {
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Handle network error (backend not available)
      if (!error.response) {
        const networkError: any = new Error('Lỗi hệ thống, vui lòng thử lại sau')
        networkError.isNetworkError = true
        return Promise.reject(networkError)
      }

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        const requestUrl = error.config?.url || ''
        
        // For /auth/me endpoint, return empty response instead of rejecting
        // This prevents console error logging while still allowing catch to handle it
        if (requestUrl.includes('/auth/me')) {
          // Return a fake successful response that will resolve as empty
          // The caller will detect this and handle as unauthenticated
          return Promise.resolve({
            data: null,
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config: error.config!
          } as any)
        }
        
        // For other endpoints, redirect to login
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
        window.location.href = '/login'
      }

      return Promise.reject(error)
    }
  )

  return client
}

export const apiClient = createApiClient()

/**
 * Type-safe API wrapper functions
 */
const unwrapNestedData = <T,>(data: any): T => {
  // If response has nested data structure { status, message, data: {...} }, unwrap it
  return data?.data !== undefined ? data.data : data
}

export const api = {
  get: <T,>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => unwrapNestedData<T>(res.data)),

  post: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => unwrapNestedData<T>(res.data)),

  put: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => unwrapNestedData<T>(res.data)),

  patch: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => unwrapNestedData<T>(res.data)),

  delete: <T,>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => unwrapNestedData<T>(res.data)),
}
