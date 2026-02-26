import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/constants'
import { SHOP_SERVICE_URL } from '@/constants/api.endpoints'
import { APP_CONFIG } from '@/constants/app.config'

const resolveBaseUrl = () => SHOP_SERVICE_URL || API_BASE_URL

const createShopServiceClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: resolveBaseUrl(),
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

  // Response interceptor - handle 401 (cookie expired)
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
        window.location.href = '/login'
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
