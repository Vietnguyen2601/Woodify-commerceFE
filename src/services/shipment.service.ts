import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type {
  CreateShipmentBody,
  ShipmentDto,
  ShipmentService,
  ShipmentServicesApiResponse,
  UpdateShipmentBody,
  UpdateShipmentPickupBody,
  UpdateShipmentStatusBody,
} from '@/types'

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

  // ── Shipment entity (SHIPMENT_SELLER_FLOW.md) ─────────────────────────────

  listShipmentsByShop: async (shopId: string, status?: string): Promise<ShipmentDto[]> => {
    const raw = await api.get<ShipmentDto[]>(API_ENDPOINTS.SHIPMENTS.BY_SHOP(shopId), {
      params: status ? { status } : undefined,
    })
    return Array.isArray(raw) ? raw : []
  },

  getShipmentById: async (shipmentId: string): Promise<ShipmentDto> => {
    return api.get<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.BY_ID(shipmentId))
  },

  getShipmentsByOrder: async (orderId: string): Promise<ShipmentDto[]> => {
    const raw = await api.get<ShipmentDto[] | ShipmentDto>(API_ENDPOINTS.SHIPMENTS.BY_ORDER(orderId))
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object' && 'shipmentId' in raw) return [raw as ShipmentDto]
    return []
  },

  createShipment: async (body: CreateShipmentBody): Promise<ShipmentDto> => {
    return api.post<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.CREATE, body)
  },

  updateShipment: async (shipmentId: string, body: UpdateShipmentBody): Promise<ShipmentDto> => {
    return api.patch<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.UPDATE(shipmentId), body)
  },

  updateShipmentStatus: async (
    shipmentId: string,
    body: UpdateShipmentStatusBody,
  ): Promise<ShipmentDto> => {
    return api.patch<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.STATUS(shipmentId), body)
  },

  updateShipmentPickup: async (
    shipmentId: string,
    body?: UpdateShipmentPickupBody,
  ): Promise<ShipmentDto> => {
    return api.patch<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.PICKUP(shipmentId), body ?? {})
  },

  deleteShipment: async (shipmentId: string): Promise<void> => {
    await api.delete<unknown>(API_ENDPOINTS.SHIPMENTS.DELETE(shipmentId))
  },
}
