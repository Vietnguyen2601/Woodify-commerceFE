import { walletApi } from './api/walletClient'
import { API_ENDPOINTS } from '@/constants/api.endpoints'

export interface WalletData {
  walletId: string
  accountId: string
  balance: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string
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
}
