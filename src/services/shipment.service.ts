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
      // api client unwraps `{ data: T }` to `T` — success is often the array itself
      const response = await api.get<ShipmentService[] | ShipmentServicesApiResponse>(endpoint, {
        withCredentials: true,
      })
      if (Array.isArray(response)) return response
      if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        Array.isArray((response as ShipmentServicesApiResponse).data)
      ) {
        return (response as ShipmentServicesApiResponse).data
      }
      return []
    } catch {
      return []
    }
  },
}
