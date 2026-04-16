import { walletApi } from './api/walletClient'
import { API_ENDPOINTS } from '@/constants/api.endpoints'

export interface WalletData {
  walletId: string
  accountId: string
  /** Wallet balance (VND) */
  balanceVnd?: number
  /** @deprecated Prefer balanceVnd; kept if API still returns `balance` */
  balance?: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string
}

/** Backend expects PascalCase method names, e.g. PayOs */
export type WalletTopUpMethod = 'Momo' | 'PayOs' | 'VNPay'

export interface WalletTopUpRequest {
  walletId: string
  /** Top-up amount (VND) */
  amount: number
  method: WalletTopUpMethod
}

export interface WalletTopUpResult {
  paymentId: string
  orderCode: number
  paymentUrl: string
  qrCodeUrl?: string
  amount: number
  status: string
  fee: number
  createdAt: string
  message?: string
}

/** Raw item from GET /wallets/{id}/transactions — shape may vary by backend */
export type WalletTransactionItem = {
  id?: string
  paymentId?: string
  transactionId?: string
  type?: string
  transactionType?: string
  description?: string
  note?: string
  title?: string
  /** Amount in VND */
  amountVnd?: number
  amount?: number
  status?: string
  createdAt?: string
  balanceAfterVnd?: number
  balanceAfter?: number
  [key: string]: unknown
}

export interface WalletTransactionsPage {
  items: WalletTransactionItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export const walletService = {
  /**
   * Get wallet details by account ID
   */
  getWalletByAccountId: async (accountId: string): Promise<WalletData> => {
    return walletApi.get<WalletData>(API_ENDPOINTS.WALLET.GET_BY_ACCOUNT_ID(accountId))
  },

  /**
   * Get wallet details by ID
   */
  getWalletById: async (walletId: string): Promise<WalletData> => {
    return walletApi.get<WalletData>(API_ENDPOINTS.WALLET.GET_BY_ID(walletId))
  },

  /**
   * Create top-up payment link (redirect user to paymentUrl)
   */
  topUp: async (body: WalletTopUpRequest): Promise<WalletTopUpResult> => {
    return walletApi.post<WalletTopUpResult>(API_ENDPOINTS.WALLET.TOPUP, body)
  },

  /**
   * Paginated wallet transaction history
   */
  getWalletTransactions: async (
    walletId: string,
    params: { page?: number; pageSize?: number } = {}
  ): Promise<WalletTransactionsPage> => {
    const { page = 1, pageSize = 20 } = params
    return walletApi.get<WalletTransactionsPage>(API_ENDPOINTS.WALLET.TRANSACTIONS(walletId), {
      params: { page, pageSize },
    })
  },
}
