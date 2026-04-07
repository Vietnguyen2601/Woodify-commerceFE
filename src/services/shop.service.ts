import { shopApi } from './api/shopClient'
import { API_ENDPOINTS } from '@/constants'
import type { CreateShopPayload, ShopInfo } from '@/types'

/**
 * Shop service for shop management operations
 */
export const shopService = {
  /**
   * Get all shops
   */
  getAllShops: async (): Promise<ShopInfo[]> => {
    return shopApi.get<ShopInfo[]>(API_ENDPOINTS.SHOP.GET_ALL)
  },

  /**
   * Create a new shop
   */
  createShop: async (payload: CreateShopPayload): Promise<ShopInfo> => {
    return shopApi.post<ShopInfo>(API_ENDPOINTS.SHOP.CREATE, payload)
  },

  /**
   * Get shop by shop ID
   */
  getShopById: async (shopId: string): Promise<ShopInfo> => {
    return shopApi.get<ShopInfo>(API_ENDPOINTS.SHOP.GET_BY_ID(shopId))
  },

  /**
   * Get shop by owner ID
   */
  getShopByOwnerId: async (ownerId: string): Promise<ShopInfo> => {
    return shopApi.get<ShopInfo>(API_ENDPOINTS.SHOP.GET_BY_OWNER_ID(ownerId))
  },
}
