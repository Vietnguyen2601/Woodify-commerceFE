/**
 * Shipment microservice DTOs — paths under `/api/shipment/shipments`.
 * See SHIPMENT_SELLER_FLOW.md (Order status vs Shipment status are different).
 */

export type ShipmentLifecycleStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'RETURNING'
  | 'RETURNED'
  | 'CANCELLED'

export interface ShipmentDto {
  shipmentId: string
  orderId: string
  shopId: string
  trackingNumber?: string | null
  providerServiceCode?: string | null
  /** Mã nhà vận chuyển (thường trùng `providerId` từ Provider API). BE có thể gửi `provider_code`. */
  providerCode?: string | null
  shippingProviderName?: string | null
  pickupAddress?: string | null
  deliveryAddress?: string | null
  totalWeightGrams: number
  bulkyType?: string | null
  finalShippingFeeVnd: number
  isFreeShipping: boolean
  pickupScheduledAt?: string | null
  pickedUpAt?: string | null
  deliveryEstimatedAt?: string | null
  status: string
  failureReason?: string | null
  cancelReason?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface CreateShipmentBody {
  shopId: string
  orderId: string
  providerServiceCode?: string | null
  pickupAddress?: string | null
  deliveryAddress?: string | null
  totalWeightGrams?: number | null
  bulkyType?: string | null
  finalShippingFeeVnd?: number | null
  forceFreeShipping?: boolean | null
  pickupScheduledAt?: string | null
  deliveryEstimatedAt?: string | null
}

export interface UpdateShipmentBody {
  trackingNumber?: string | null
  providerServiceId?: string | null
  pickupAddress?: string | null
  deliveryAddress?: string | null
  totalWeightGrams?: number | null
  bulkyType?: string | null
  finalShippingFeeVnd?: number | null
  isFreeShipping?: boolean | null
  pickupScheduledAt?: string | null
  pickedUpAt?: string | null
  deliveryEstimatedAt?: string | null
  failureReason?: string | null
  cancelReason?: string | null
}

export interface UpdateShipmentStatusBody {
  status: string
  failureReason?: string | null
  cancelReason?: string | null
}

export interface UpdateShipmentPickupBody {
  pickedUpAt?: string | null
}
