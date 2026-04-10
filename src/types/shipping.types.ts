/**
 * Shipping Provider Types
 */

export interface ShippingProvider {
  providerId: string
  name: string
  supportPhone: string
  supportEmail: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ShippingPaginationInfo {
  page: number
  limit: number
  total: number
}

export interface ShippingProvidersApiResponse {
  providers: ShippingProvider[]
  pagination: ShippingPaginationInfo
}

export interface GetProvidersParams {
  page?: number
  limit?: number
}

/**
 * Shipment Service Types
 */

export interface ShipmentService {
  serviceId: string
  providerId: string
  providerName: string
  code: string
  name: string
  speedLevel: 'STANDARD' | 'EXPRESS' | 'ECONOMY'
  estimatedDaysMin: number
  estimatedDaysMax: number
  isActive: boolean
  multiplierFee: number
  createdAt: string
  updatedAt: string
}

export interface ShipmentServicesApiResponse {
  status: number
  message: string
  data: ShipmentService[]
  errors: null | string[]
}
