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
  unitPriceCents: number
  quantity: number
  discountCents: number
  taxCents: number
  lineTotalCents: number
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
  shopId: string
  subtotalCents: number
  totalAmountCents: number
  voucherId: string | null
  payment: unknown | null
  status: SellerOrderStatus | string
  deliveryAddress: string
  createdAt: string
  updatedAt: string | null
  orderItems: SellerOrderItem[]
}
