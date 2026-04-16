import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { PRODUCT_SERVICE_URL } from '@/constants/api.endpoints'
import { APP_CONFIG } from '@/constants/app.config'

const createProductServiceClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: PRODUCT_SERVICE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })

  // Request interceptor - HttpOnly Cookies, no manual token needed
  client.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  )

  // Response interceptor - unwrap data, handle errors
  client.interceptors.response.use(
    (response) => {
      const data = response.data
      return data?.data !== undefined ? data.data : data
    },
    (error: AxiosError) => {
      if (!error.response) {
        const networkError: any = new Error(
          error.code === 'ECONNABORTED'
            ? 'Hết thời gian chờ. Backend không phản hồi.'
            : `Lỗi hệ thống: ${error.message}. Vui lòng kiểm tra kết nối hoặc liên hệ hỗ trợ.`
        )
        networkError.isNetworkError = true
        return Promise.reject(networkError)
      }

      if (error.response?.status === 401) {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
        window.location.href = '/login'
      }

      const message =
        (error.response?.data as any)?.message || error.message || 'An error occurred'
      return Promise.reject({
        status: error.response?.status,
        message,
        data: error.response?.data,
      })
    }
  )

  return client
}

export const productServiceClient = createProductServiceClient()

/**
 * Type-safe API wrapper — interceptor already unwraps data.data.
 */
export const productApi = {
  get: <T,>(url: string, config?: AxiosRequestConfig) =>
    productServiceClient.get<T>(url, config) as unknown as Promise<T>,

  post: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    productServiceClient.post<T>(url, data, config) as unknown as Promise<T>,

  put: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    productServiceClient.put<T>(url, data, config) as unknown as Promise<T>,

  patch: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    productServiceClient.patch<T>(url, data, config) as unknown as Promise<T>,

  delete: <T,>(url: string, config?: AxiosRequestConfig) =>
    productServiceClient.delete<T>(url, config) as unknown as Promise<T>,
}
