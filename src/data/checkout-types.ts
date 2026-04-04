// Checkout Types for Multi-Shop Marketplace

export interface CartItem {
  cart_item_id: string
  product_id: string
  shop_id: string
  product_name: string
  product_image: string
  variant_name?: string
  price: number
  quantity: number
  subtotal: number
}

export interface ShippingMethod {
  id: 'ECONOMY' | 'STANDARD' | 'EXPRESS'
  name: string
  description: string
  estimated_days: string
  fee: number
}

export interface ShopCart {
  shop_id: string
  shop_name: string
  shop_avatar?: string
  items: CartItem[]
  selected_shipping_method: 'ECONOMY' | 'STANDARD' | 'EXPRESS'
  shipping_methods: ShippingMethod[]
  shipping_fee: number
  note_to_seller?: string
  subtotal: number
  total: number
}

export interface DeliveryAddress {
  address_id: string
  recipient_name: string
  phone: string
  address_line: string
  ward: string
  district: string
  city: string
  is_default: boolean
}

export interface Voucher {
  voucher_id: string
  code: string
  title: string
  discount_type: 'PERCENTAGE' | 'FIXED'
  discount_value: number
  max_discount?: number
  min_order?: number
}

export interface CheckoutSummary {
  merchandise_subtotal: number
  total_shipping_fee: number
  voucher_discount: number
  total_payment: number
}

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'WALLET'
