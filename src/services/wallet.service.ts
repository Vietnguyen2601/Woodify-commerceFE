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

interface WalletTransaction {
  transactionId: string
  walletId: string
  transactionType: 'Credit' | 'Debit'
  amount: number
  balanceBefore: number
  balanceAfter: number
  relatedOrderId: string | null
  relatedPaymentId: string | null
  status: 'Completed' | 'Pending' | 'Failed'
  createdAt: string
  completedAt: string | null
  note: string
}

interface TransactionsResponse {
  items: WalletTransaction[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

interface TopupRequest {
  walletId: string
  amount: number
  method: string // 'PayOs', 'Momo', 'VNPay', etc.
}

interface TopupResponse {
  paymentId: string
  orderCode: number
  paymentUrl: string
  qrCodeUrl: string
  amount: number
  status: string
  fee: number
  createdAt: string
  message: string
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
      return response as unknown as WalletData
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
      return response as unknown as WalletData
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể lấy thông tin ví'
      console.error('[walletService] Error fetching wallet:', error)
      throw new Error(errorMsg)
    }
  },

  /**
   * Get wallet transactions by wallet ID
   */
  getWalletTransactions: async (
    walletId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TransactionsResponse> => {
    try {
      const response = await walletClient.get<TransactionsResponse>(
        `/wallets/${walletId}/transactions`,
        {
          params: { page, pageSize }
        }
      )
      // walletClient response interceptor already unwraps to { items, totalCount, page, ... }
      return response as unknown as TransactionsResponse
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể lấy lịch sử giao dịch'
      console.error('[walletService] Error fetching transactions:', error)
      throw new Error(errorMsg)
    }
  },

  /**
   * Top up wallet - create payment request
   */
  topupWallet: async (request: TopupRequest): Promise<TopupResponse> => {
    try {
      const response = await walletClient.post<TopupResponse>(
        '/wallets/topup',
        request
      )
      // walletClient response interceptor already unwraps to { paymentId, orderCode, paymentUrl, ... }
      return response as unknown as TopupResponse
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể tạo yêu cầu nạp tiền'
      console.error('[walletService] Error topup wallet:', error)
      throw new Error(errorMsg)
    }
  },
}
