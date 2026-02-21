import { shopApi } from './api/shopClient'
import { API_ENDPOINTS } from '@/constants'
import type { CreateShopPayload, CreateShopResponse, GetShopByOwnerResponse } from '@/types'

export const shopService = {
  createShop: async (payload: CreateShopPayload): Promise<CreateShopResponse> => {
    return shopApi.post<CreateShopResponse>(API_ENDPOINTS.SHOP.CREATE, payload)
  },
  getShopByOwnerId: async (ownerId: string): Promise<GetShopByOwnerResponse> => {
    return shopApi.get<GetShopByOwnerResponse>(API_ENDPOINTS.SHOP.GET_BY_OWNER_ID(ownerId))
  },
}
