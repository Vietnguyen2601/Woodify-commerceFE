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

  // Response interceptor - return full response (consistent with main client)
  client.interceptors.response.use(
    (response) => {
      // If response has nested data structure, unwrap it
      const data = response.data
      return data?.data !== undefined ? data.data : data
    },
    (error: AxiosError) => {
      // Handle network error (backend not available)
      if (!error.response) {
        const networkError: any = new Error(
          error.code === 'ECONNABORTED' 
            ? 'Hết thời gian chờ. Backend không phản hồi.' 
            : `Lỗi hệ thống: ${error.message}. Vui lòng kiểm tra kết nối hoặc liên hệ hỗ trợ.`
        )
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
