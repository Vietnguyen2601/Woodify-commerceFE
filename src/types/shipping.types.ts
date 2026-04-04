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
