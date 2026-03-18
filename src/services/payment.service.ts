import axios, { AxiosInstance } from 'axios'
import { API_BASE_URL } from '@/constants/api.endpoints'
import { APP_CONFIG } from '@/constants/app.config'

interface PaymentData {
  paymentId: string
  orderCode: number
  amount: number
  amountPaid: number
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'
  provider: string
  createdAt: string
  updatedAt: string
}

interface PaymentResponse {
  status: number
  message: string
  data: PaymentData
  errors: null | unknown
}

/**
 * Create configured Axios instance for Payment Service
 */
const createPaymentClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - add auth token
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

  // Response interceptor - unwrap nested data structure
  client.interceptors.response.use(
    (response) => {
      const data = response.data
      return data?.data !== undefined ? data.data : data
    },
    (error) => Promise.reject(error)
  )

  return client
}

const paymentClient = createPaymentClient()

export const paymentService = {
  /**
   * Get payment details by payment ID
   */
  getPaymentById: async (paymentId: string): Promise<PaymentData> => {
    try {
      const response = await paymentClient.get<PaymentData>(
        `/payments/${paymentId}`
      )
      return response as unknown as PaymentData
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể lấy thông tin thanh toán'
      console.error('[paymentService] Error fetching payment by ID:', error)
      throw new Error(errorMsg)
    }
  },

  /**
   * Get payment details by order code
   */
  getPaymentByOrderCode: async (orderCode: number): Promise<PaymentData> => {
    try {
      const response = await paymentClient.get<PaymentData>(
        `/payments/payos/${orderCode}`
      )
      return response as unknown as PaymentData
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể lấy thông tin thanh toán'
      console.error('[paymentService] Error fetching payment by order code:', error)
      throw new Error(errorMsg)
    }
  },

  /**
   * Poll payment status until it's resolved (PAID, FAILED, CANCELLED)
   * @param paymentId - Payment ID to poll
   * @param options - Polling options
   */
  pollPaymentStatus: async (
    paymentId: string,
    options?: {
      maxAttempts?: number
      interval?: number // milliseconds
    }
  ): Promise<PaymentData> => {
    const maxAttempts = options?.maxAttempts || 100 // ~5 minutes with 3s interval
    const interval = options?.interval || 3000 // 3 seconds

    let attempts = 0

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++
          const payment = await paymentService.getPaymentById(paymentId)

          // Check if payment is resolved
          if (payment.status === 'PAID') {
            resolve(payment)
          } else if (payment.status === 'FAILED' || payment.status === 'CANCELLED') {
            reject(new Error(`Thanh toán ${payment.status}`))
          } else if (attempts >= maxAttempts) {
            // Timeout after max attempts
            reject(new Error('Hết thời gian chờ xác nhận thanh toán. Vui lòng thử lại sau.'))
          } else {
            // Continue polling
            setTimeout(poll, interval)
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error)
          } else {
            // Continue polling even if request failed
            setTimeout(poll, interval)
          }
        }
      }

      // Start polling
      poll()
    })
  },

  /**
   * Poll payment status by order code
   */
  pollPaymentStatusByOrderCode: async (
    orderCode: number,
    options?: {
      maxAttempts?: number
      interval?: number
    }
  ): Promise<PaymentData> => {
    const maxAttempts = options?.maxAttempts || 100
    const interval = options?.interval || 3000

    let attempts = 0

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++
          const payment = await paymentService.getPaymentByOrderCode(orderCode)

          if (payment.status === 'PAID') {
            resolve(payment)
          } else if (payment.status === 'FAILED' || payment.status === 'CANCELLED') {
            reject(new Error(`Thanh toán ${payment.status}`))
          } else if (attempts >= maxAttempts) {
            reject(new Error('Hết thời gian chờ xác nhận thanh toán. Vui lòng thử lại sau.'))
          } else {
            setTimeout(poll, interval)
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error)
          } else {
            setTimeout(poll, interval)
          }
        }
      }

      poll()
    })
  },
}
