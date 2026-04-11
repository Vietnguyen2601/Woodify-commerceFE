import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'

/**
 * Request payload for creating an order
 */
export interface CreateOrderRequest {
  accountId: string
  shopId: string
  cartItemIds: string[]
  deliveryAddress: string
  providerServiceCode: 'STANDARD' | 'EXPRESS' | 'ECONOMY' | 'FAST'
  voucherId?: string | null
}

/**
 * Response from order creation
 * Note: API wraps the actual order data in a 'data' field
 */
export interface CreateOrderResponse {
  status: number
  message: string
  data: {
    orderId: string
    shopId: string
    subtotalCents: number
    shippingFeeCents: number
    commissionCents: number
    totalAmountCents: number
    itemCount: number
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    createdAt: string
  }
  errors: null | string[]
}

/**
 * Request payload for creating a payment
 */
export interface CreatePaymentRequest {
  orderIds: string[]
  paymentMethod: 'COD' | 'WALLET' | 'PAYOS'
  accountId: string
  totalAmountCents: number
  returnUrl?: string
  cancelUrl?: string
}

/**
 * Response from payment creation
 * Note: API wraps the actual payment data in a 'data' field
 */
export interface CreatePaymentResponse {
  status: number  // Changed from statusCode
  message: string
  data:
    | {
        paymentId: string
        orderIds: string[]
        totalAmount: number
        paymentMethod: 'COD' | 'WALLET' | 'PAYOS'
        status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CREATED'
      }
    | {
        paymentId: string
        status: 'SUCCEEDED'
        remainingBalance: number
      }
    | {
        paymentId: string
        status: 'CREATED'
        orderCode: number
        paymentUrl: string
        qrCode: string
      }
  errors: null | string[]
}

export const paymentService = {
  /**
   * Create an order for a specific shop
   * When multiple shops exist, call this once per shop
   */
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse['data']> => {
    // api.post() response interceptor already unwraps data.data for us
    return api.post<CreateOrderResponse['data']>(
      API_ENDPOINTS.ORDERS.CREATE,
      data,
      { withCredentials: true }
    )
  },

  /**
   * Create a payment for one or more orders
   * This gathers all orders from different shops into one payment request
   */
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse['data']> => {
    return api.post<CreatePaymentResponse['data']>(
      API_ENDPOINTS.PAYMENTS.CREATE,
      data,
      { withCredentials: true }
    )
  },
}
