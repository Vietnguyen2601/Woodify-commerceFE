import { providerApi } from './api/providerClient'
import { API_ENDPOINTS } from '@/constants'
import type { ShippingProvidersApiResponse, GetProvidersParams } from '@/types'

/**
 * Provider service for shipping provider operations
 */
export const providerService = {
  /**
   * Get list of available shipping providers with pagination
   * @param params - Pagination parameters (page, limit)
   * @returns Promise with providers list and pagination info
   */
  getProviders: async (params?: GetProvidersParams): Promise<ShippingProvidersApiResponse> => {
    return providerApi.get<ShippingProvidersApiResponse>(API_ENDPOINTS.PROVIDER.LIST, {
      params,
    })
  },
}
