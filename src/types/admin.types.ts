/**
 * Admin dashboard DTOs aligned with ADMIN_API_SPEC.md (gateway base: /api)
 */

export type ShopStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'REJECTED'

export interface AdminShopDto {
  shopId: string
  shopName: string
  ownerId: string
  description?: string | null
  status?: ShopStatus | string
  createdDate?: string
  createdAt?: string
  logo?: string | null
  coverImage?: string | null
  address?: string | null
}

export interface UpdateShopStatusPayload {
  status: ShopStatus
  reason?: string
}

export interface AccountDto {
  accountId: string
  email: string
  username?: string
  name?: string
  gender?: string
  dob?: string
  address?: string
  phoneNumber?: string
  role?: string
}

export type OrderStatusApi = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string

export interface AdminShopOrderItemDto {
  productName?: string
  sellerSku?: string
  quantity?: number
  price?: number
}

/** GET /orders/Shop/{shopId} item shape (spec §4.3) */
export interface AdminShopOrderDto {
  orderId: string
  shopId?: string
  orderItems?: AdminShopOrderItemDto[]
  items?: AdminShopOrderItemDto[]
  status?: OrderStatusApi
  createdDate?: string
  totalPrice?: number
  orderCode?: string
  accountId?: string
}

/** Order row enriched when merging per-shop lists (ADMIN_API_SPEC gap workaround) */
export interface EnrichedAdminOrder extends AdminShopOrderDto {
  shopName?: string
}

export interface AdminOrderListParams {
  page?: number
  limit?: number
  status?: string
  dateFrom?: string
  dateTo?: string
  shopId?: string
  accountId?: string
  minAmount?: number
  maxAmount?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AdminOrderListPayload {
  items?: AdminShopOrderDto[]
  totalItems?: number
  pageNumber?: number
  pageSize?: number
  totalAmount?: number
  averageAmount?: number
}

export interface ProductMasterDto {
  productId?: string
  id?: string
  productName?: string
  description?: string
  globalSku?: string
  shopId?: string
  categoryId?: string
  basePrice?: number
  createdDate?: string
  createdAt?: string
  isArchived?: boolean
}

export interface ShipmentDto {
  shipmentId?: string
  id?: string
  orderId?: string
  providerId?: string
  serviceId?: string
  trackingNumber?: string
  status?: string
  estimatedDelivery?: string
  createdDate?: string
  createdAt?: string
  notes?: string
}

export interface ShipmentProviderDto {
  providerId: string
  providerName: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  isActive?: boolean
  createdDate?: string
}

export interface ProvidersPageDto {
  items: ShipmentProviderDto[]
  totalItems: number
  pageNumber: number
  pageSize: number
}
