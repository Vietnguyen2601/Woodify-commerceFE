import axios, { AxiosInstance } from 'axios'
import { WALLET_SERVICE_URL } from '@/constants/api.endpoints'
import { APP_CONFIG } from '@/constants/app.config'

interface WalletData {
  walletId: string
  accountId: string
  balance: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string
}

interface WalletResponse {
  status: number
  message: string
  data: WalletData
  errors: null | unknown
}

/**
 * Create configured Axios instance for Wallet Service
 */
const createWalletClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: WALLET_SERVICE_URL,
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
      // If response has nested data structure { status, message, data: {...} }, unwrap it
      const data = response.data
      return data?.data !== undefined ? data.data : data
    },
    (error) => Promise.reject(error)
  )

  return client
}

const walletClient = createWalletClient()

export const walletService = {
  /**
   * Get wallet details by account ID
   */
  getWalletByAccountId: async (accountId: string): Promise<WalletData> => {
    try {
      const response = await walletClient.get<WalletData>(`/wallets/account/${accountId}`)
      // walletClient response interceptor already unwraps to { walletId, accountId, balance, ... }
      return response
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể lấy thông tin ví'
      console.error('[walletService] Error fetching wallet by account:', error)
      throw new Error(errorMsg)
    }
  },

  /**
   * Get wallet details by ID
   */
  getWalletById: async (walletId: string): Promise<WalletData> => {
    try {
      const response = await walletClient.get<WalletData>(`/wallets/${walletId}`)
      // walletClient response interceptor already unwraps to { walletId, accountId, balance, ... }
      return response
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể lấy thông tin ví'
      console.error('[walletService] Error fetching wallet:', error)
      throw new Error(errorMsg)
    }
  },
}
