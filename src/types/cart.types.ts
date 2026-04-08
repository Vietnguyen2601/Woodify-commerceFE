/**
 * Cart types - Aligned with Backend CART_SYSTEM_DOCUMENTATION.md
 */

export interface CartItemDto {
  cartItemId: string
  versionId: string
  shopId: string
  quantity: number
  price: number
  totalPrice: number
  productMasterName: string
  productVersionName: string
  thumbnailUrl: string
  shopName: string
  isOutOfStock?: boolean
  errorMessage?: string
}

export interface CartResponse {
  items: CartItemDto[]
  totalPrice: number
  totalQuantity: number
  message?: string
}

export interface CheckoutPreviewResponse {
  items: CartItemDto[]
  shops: {
    shopId: string
    shopName: string
    items: CartItemDto[]
    totalPrice: number
    deliveryAddress?: {
      id: string
      street: string
      ward: string
      district: string
      city: string
    }
    shippingMethod?: string
    totalWithShipping?: number
  }[]
  grandTotal: number
  message?: string
}

export interface CartState {
  items: CartItemDto[]
  totalPrice: number
  totalQuantity: number
  isLoading: boolean
  error: string | null
}

export interface CartActions {
  setItems: (items: CartItemDto[]) => void
  addItem: (item: CartItemDto) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetCart: () => void
}

export type CartStore = CartState & CartActions
