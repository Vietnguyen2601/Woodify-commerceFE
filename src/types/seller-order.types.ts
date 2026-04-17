/**
 * Order API — seller shop orders (`/order/Orders/Shop/{shopId}`)
 */

export type SellerOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED'

export interface SellerOrderItem {
  orderItemId: string
  orderId: string
  versionId: string
  unitPriceVnd: number
  quantity: number
  discountVnd: number
  taxVnd: number
  lineTotalVnd: number
  shipmentId: string | null
  status: string
  createdAt: string
  productName: string
  productDescription: string
  sellerSku: string
  versionName: string
  woodType: string
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface SellerOrder {
  orderId: string
  accountId: string
  accountName: string
  accountEmail: string
  shopId: string
  subtotalVnd: number
  totalAmountVnd: number
  voucherId: string | null
  payment: unknown | null
  status: SellerOrderStatus | string
  deliveryAddress: string
  /** Mã dịch vụ vận chuyển (ví dụ ECO, STD, EXP) */
  providerServiceCode?: string | null
  createdAt: string
  updatedAt: string | null
  orderItems: SellerOrderItem[]
}

/** GET /order/Orders/Account — buyer order list (same items shape, + paymentStatus) */
export interface BuyerOrder {
  orderId: string
  accountId: string
  accountName: string
  accountEmail: string
  shopId: string
  subtotalVnd: number
  totalAmountVnd: number
  voucherId: string | null
  payment: unknown | null
  status: SellerOrderStatus | string
  deliveryAddress: string
  paymentStatus?: string | null
  /** Mã dịch vụ vận chuyển (ví dụ ECO, STD, EXP) */
  providerServiceCode?: string | null
  createdAt: string
  updatedAt: string | null
  orderItems: SellerOrderItem[]
}
