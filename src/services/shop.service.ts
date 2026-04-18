import { shopApi } from './api/shopClient'
import { API_ENDPOINTS } from '@/constants'
import type {
  CreateShopPayload,
  UpdateShopInfoPayload,
  ShopBankAccount,
  ShopInfo,
  ShopMonthlyAnalytics,
  ShopQuarterlyAnalytics,
  ShopRevenueTrend,
  ShopYearlyAnalytics,
} from '@/types'

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

  /**
   * Cập nhật hồ sơ shop (PATCH).
   * `/shop/Shops/UpdateShopInfo/{id}`
   */
  updateShopInfo: async (shopId: string, payload: UpdateShopInfoPayload): Promise<ShopInfo> => {
    return shopApi.patch<ShopInfo>(API_ENDPOINTS.SHOP.UPDATE(shopId), payload)
  },

  /**
   * Tài khoản ngân hàng của shop (GET). Trả về null nếu chưa có (404).
   */
  getBankAccount: async (shopId: string): Promise<ShopBankAccount | null> => {
    try {
      return await shopApi.get<ShopBankAccount>(API_ENDPOINTS.SHOP.BANK_ACCOUNT(shopId))
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status
      if (status === 404) return null
      throw e
    }
  },

  /**
   * Cập nhật tài khoản ngân hàng (PATCH).
   */
  updateBankAccount: async (shopId: string, payload: ShopBankAccount): Promise<ShopBankAccount> => {
    return shopApi.patch<ShopBankAccount>(API_ENDPOINTS.SHOP.BANK_ACCOUNT(shopId), payload)
  },

  /**
   * Xu hướng doanh thu theo số ngày (mặc định 7).
   */
  getRevenueTrend: async (shopId: string, days = 7): Promise<ShopRevenueTrend> => {
    return shopApi.get<ShopRevenueTrend>(API_ENDPOINTS.SHOP.REVENUE_TREND(shopId, days))
  },

  getMonthlyAnalytics: async (shopId: string, year: number): Promise<ShopMonthlyAnalytics> => {
    return shopApi.get<ShopMonthlyAnalytics>(API_ENDPOINTS.SHOP.ANALYTICS_MONTHLY(shopId, year))
  },

  getQuarterlyAnalytics: async (shopId: string, year: number): Promise<ShopQuarterlyAnalytics> => {
    return shopApi.get<ShopQuarterlyAnalytics>(API_ENDPOINTS.SHOP.ANALYTICS_QUARTERLY(shopId, year))
  },

  getYearlyAnalytics: async (
    shopId: string,
    startYear: number,
    endYear: number
  ): Promise<ShopYearlyAnalytics> => {
    return shopApi.get<ShopYearlyAnalytics>(
      API_ENDPOINTS.SHOP.ANALYTICS_YEARLY(shopId, startYear, endYear)
    )
  },
}
