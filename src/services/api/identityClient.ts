import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { IDENTITY_SERVICE_URL } from '@/constants/api.endpoints'

/**
 * Create configured Axios instance for Identity Service
 */
const createIdentityServiceClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: IDENTITY_SERVICE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
      // Handle network error (backend not available)
      if (!error.response) {
        return Promise.reject({
          status: 0,
          message: 'Lỗi hệ thống, vui lòng thử lại sau',
          data: null,
        })
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
