/**
 * Cart types
 */

export interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
  thumbnail?: string
  sellerId?: string
  unit?: string
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export type CartStore = CartState & CartActions
