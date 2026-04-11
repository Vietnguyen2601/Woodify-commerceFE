import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type { ShipmentService, ShipmentServicesApiResponse } from '@/types'

export const shipmentService = {
  /**
   * Get shipment services for a specific shop
   */
  getServicesByShopId: async (shopId: string): Promise<ShipmentService[]> => {
    try {
      const endpoint = API_ENDPOINTS.SHIPMENT_SERVICES.BY_SHOP(shopId)
      const response = await api.get<ShipmentServicesApiResponse>(endpoint, {
        withCredentials: true,
      })
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch shipment services:', error)
      throw error
    }
  },
}
