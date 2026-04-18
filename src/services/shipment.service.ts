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

/** Chuẩn hóa camelCase + snake_case / PascalCase từ Shipment Service. */
function normalizeShipmentDto<T extends ShipmentDto>(row: T): ShipmentDto {
  const r = row as T & Record<string, unknown>
  const providerCode = r.providerCode ?? r.provider_code
  const shippingProviderName = r.shippingProviderName ?? r.ShippingProviderName
  const next: ShipmentDto = { ...row }
  if (providerCode !== undefined) {
    next.providerCode = providerCode == null || providerCode === '' ? null : String(providerCode)
  }
  if (shippingProviderName !== undefined) {
    next.shippingProviderName =
      shippingProviderName == null || shippingProviderName === '' ? null : String(shippingProviderName)
  }
  return next
}

function mapShipments(list: ShipmentDto[]): ShipmentDto[] {
  return list.map((s) => normalizeShipmentDto(s))
}

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
    return Array.isArray(raw) ? mapShipments(raw) : []
  },

  getShipmentById: async (shipmentId: string): Promise<ShipmentDto> => {
    const row = await api.get<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.BY_ID(shipmentId))
    return normalizeShipmentDto(row)
  },

  getShipmentsByOrder: async (orderId: string): Promise<ShipmentDto[]> => {
    const raw = await api.get<ShipmentDto[] | ShipmentDto>(API_ENDPOINTS.SHIPMENTS.BY_ORDER(orderId))
    if (Array.isArray(raw)) return mapShipments(raw)
    if (raw && typeof raw === 'object' && 'shipmentId' in raw) return [normalizeShipmentDto(raw as ShipmentDto)]
    return []
  },

  createShipment: async (body: CreateShipmentBody): Promise<ShipmentDto> => {
    const row = await api.post<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.CREATE, body)
    return normalizeShipmentDto(row)
  },

  updateShipment: async (shipmentId: string, body: UpdateShipmentBody): Promise<ShipmentDto> => {
    const row = await api.patch<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.UPDATE(shipmentId), body)
    return normalizeShipmentDto(row)
  },

  updateShipmentStatus: async (
    shipmentId: string,
    body: UpdateShipmentStatusBody,
  ): Promise<ShipmentDto> => {
    const row = await api.patch<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.STATUS(shipmentId), body)
    return normalizeShipmentDto(row)
  },

  updateShipmentPickup: async (
    shipmentId: string,
    body?: UpdateShipmentPickupBody,
  ): Promise<ShipmentDto> => {
    const row = await api.patch<ShipmentDto>(API_ENDPOINTS.SHIPMENTS.PICKUP(shipmentId), body ?? {})
    return normalizeShipmentDto(row)
  },

  deleteShipment: async (shipmentId: string): Promise<void> => {
    await api.delete<unknown>(API_ENDPOINTS.SHIPMENTS.DELETE(shipmentId))
  },
}
