import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type { Order, OrderFilters, PaginatedResponse } from '@/types'

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
}
