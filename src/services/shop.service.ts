import { shopApi } from './api/shopClient'
import { API_ENDPOINTS } from '@/constants'
import type { CreateShopPayload, CreateShopResponse } from '@/types'

export const shopService = {
  createShop: async (payload: CreateShopPayload): Promise<CreateShopResponse> => {
    return shopApi.post<CreateShopResponse>(API_ENDPOINTS.SHOP.CREATE, payload)
  },
}
