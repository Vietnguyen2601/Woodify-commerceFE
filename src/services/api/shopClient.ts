import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/constants'
import { SHOP_SERVICE_URL } from '@/constants/api.endpoints'
import { APP_CONFIG } from '@/constants/app.config'

const resolveBaseUrl = () => SHOP_SERVICE_URL || API_BASE_URL

const createShopServiceClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: resolveBaseUrl(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

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

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            })

            const { accessToken } = response.data
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, accessToken)

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
            }
            return client(originalRequest)
          }
        } catch (refreshError) {
          localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
          localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
          window.location.href = '/login'
        }
      }

      return Promise.reject(error)
    }
  )

  return client
}

export const shopServiceClient = createShopServiceClient()

export const shopApi = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    shopServiceClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    shopServiceClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    shopServiceClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    shopServiceClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    shopServiceClient.delete<T>(url, config).then((res) => res.data),
}
