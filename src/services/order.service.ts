import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type {
  BuyerOrder,
  Order,
  OrderFilters,
  PaginatedResponse,
  SellerOrder,
  SellerOrderStatus,
  TopSellingProduct,
} from '@/types'

export interface CheckoutShippingPreviewOption {
  providerServiceCode: string
  displayLabel: string
  totalAmountVnd: number
  isFreeShipping: boolean
}

export interface CheckoutShippingPreviewResult {
  shopId: string
  subtotalVnd: number
  totalWeightGrams?: number
  freeShippingThresholdVnd?: number
  subtotalQualifiesForFreeShipping?: boolean
  options: CheckoutShippingPreviewOption[]
}

export interface CheckoutShippingPreviewRequest {
  accountId: string
  shopId: string
  cartItemIds: string[]
}

export interface CreateOrderData {
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    district: string
    ward: string
  }
  paymentMethod: 'cod' | 'bank_transfer' | 'payos'
  note?: string
}

/**
 * Order service for order operations
 */
export const orderService = {
  /**
   * Get paginated order list
   */
  getOrders: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    return api.get<PaginatedResponse<Order>>(API_ENDPOINTS.ORDERS.LIST, {
      params: filters,
    })
  },

  /**
   * Get single order by ID
   */
  getOrder: async (id: string): Promise<Order> => {
    return api.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id))
  },

  /**
   * Create new order
   */
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    return api.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data)
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: string, reason: string): Promise<Order> => {
    return api.post<Order>(API_ENDPOINTS.ORDERS.CANCEL(id), { reason })
  },

  /**
   * Update order status — PUT /order/Orders/UpdateStatus
   */
  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    await api.put<unknown>(API_ENDPOINTS.ORDERS.UPDATE_STATUS, { orderId, status })
  },

  /**
   * Shop orders for seller — GET /order/Orders/Shop/{shopId}
   */
  getShopOrders: async (shopId: string): Promise<SellerOrder[]> => {
    const data = await api.get<SellerOrder[] | null>(API_ENDPOINTS.ORDERS.SHOP_ORDERS(shopId))
    return Array.isArray(data) ? data : []
  },

  /**
   * Buyer orders — GET /order/Orders/Account?accountId=
   */
  getAccountOrders: async (accountId: string): Promise<BuyerOrder[]> => {
    const data = await api.get<BuyerOrder[] | null>(API_ENDPOINTS.ORDERS.ACCOUNT_ORDERS(accountId))
    return Array.isArray(data) ? data : []
  },

  /**
   * Cập nhật trạng thái đơn — PUT /order/Orders/UpdateStatus
   */
  updateShopOrderStatus: async (orderId: string, status: SellerOrderStatus): Promise<void> => {
    await api.put<unknown>(API_ENDPOINTS.ORDERS.UPDATE_STATUS, { orderId, status })
  },

  /**
   * Preview phí vận chuyển checkout — POST /order/Orders/checkout/shipping-preview
   */
  previewCheckoutShipping: async (
    body: CheckoutShippingPreviewRequest
  ): Promise<CheckoutShippingPreviewResult> => {
    return api.post<CheckoutShippingPreviewResult>(API_ENDPOINTS.ORDERS.SHIPPING_PREVIEW, body)
  },

  /**
   * Top sản phẩm bán chạy — GET .../analytics/top-selling-products
   */
  getTopSellingProducts: async (shopId: string, limit = 5): Promise<TopSellingProduct[]> => {
    const data = await api.get<TopSellingProduct[] | null>(API_ENDPOINTS.ORDERS.TOP_SELLING_PRODUCTS, {
      params: { limit, shopId },
    })
    return Array.isArray(data) ? data : []
  },
}
