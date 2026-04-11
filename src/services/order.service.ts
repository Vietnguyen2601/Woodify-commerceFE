import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type { Order, OrderFilters, PaginatedResponse, SellerOrder, SellerOrderStatus } from '@/types'

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
   * Update order status (for seller/admin)
   */
  updateOrderStatus: async (
    id: string,
    status: string,
    note?: string
  ): Promise<Order> => {
    return api.patch<Order>(API_ENDPOINTS.ORDERS.STATUS(id), { status, note })
  },

  /**
   * Shop orders for seller — GET /order/Orders/Shop/{shopId}
   */
  getShopOrders: async (shopId: string): Promise<SellerOrder[]> => {
    const data = await api.get<SellerOrder[] | null>(API_ENDPOINTS.ORDERS.SHOP_ORDERS(shopId))
    return Array.isArray(data) ? data : []
  },

  /**
   * Cập nhật trạng thái đơn — POST /order/Orders/UpdateStatus
   */
  updateShopOrderStatus: async (orderId: string, status: SellerOrderStatus): Promise<void> => {
    await api.post<unknown>(API_ENDPOINTS.ORDERS.UPDATE_STATUS, { orderId, status })
  },
}
