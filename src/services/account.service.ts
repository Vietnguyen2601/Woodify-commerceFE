import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type { UpdateCustomerAccountPayload } from '@/types'

/**
 * Tài khoản khách (Identity / Accounts gateway)
 */
export const accountService = {
  getById: async (accountId: string): Promise<Record<string, unknown>> => {
    return api.get<Record<string, unknown>>(API_ENDPOINTS.ACCOUNT.GET_BY_ID(accountId))
  },

  update: async (accountId: string, payload: UpdateCustomerAccountPayload): Promise<unknown> => {
    return api.put(API_ENDPOINTS.ACCOUNT.UPDATE(accountId), payload)
  },
}
