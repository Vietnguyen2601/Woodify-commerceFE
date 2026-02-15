import { productApi } from './api/productClient'
import { API_ENDPOINTS } from '@/constants'
import type {
  SellerRegistrationPayload,
  SellerRegistrationResponse,
  ShopNameCheckResponse,
} from '@/types'

export const sellerService = {
  checkShopNameAvailability: async (name: string): Promise<ShopNameCheckResponse> => {
    return productApi.get<ShopNameCheckResponse>(API_ENDPOINTS.SELLER.SHOP_NAME_CHECK(name))
  },

  registerSeller: async (payload: SellerRegistrationPayload): Promise<SellerRegistrationResponse> => {
    return productApi.post<SellerRegistrationResponse>(API_ENDPOINTS.SELLER.REGISTER, payload)
  },
}
