import { create } from 'zustand'
import { CartStore, CartItemDto, CartState, CartActions } from '@/types'

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
  isLoading: false,
  error: null,
}

export const useCart = create<CartStore>((set) => ({
  ...initialState,

  setItems: (items: CartItemDto[]) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)
    set({
      items,
      totalQuantity,
      totalPrice,
      error: null,
    })
  },

  addItem: (item: CartItemDto) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.cartItemId === item.cartItemId
      )

      let newItems: CartItemDto[]
      if (existingItem) {
        newItems = state.items.map((i) =>
          i.cartItemId === item.cartItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      } else {
        newItems = [...state.items, item]
      }

      const totalQuantity = newItems.reduce((sum, i) => sum + i.quantity, 0)
      const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0)

      return { items: newItems, totalQuantity, totalPrice, error: null }
    }),

  removeItem: (cartItemId: string) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.cartItemId !== cartItemId)
      const totalQuantity = newItems.reduce((sum, i) => sum + i.quantity, 0)
      const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0)

      return { items: newItems, totalQuantity, totalPrice }
    }),

  updateQuantity: (cartItemId: string, quantity: number) =>
    set((state) => {
      if (quantity <= 0) {
        return state.removeItem(cartItemId)
      }

      const newItems = state.items.map((i) =>
        i.cartItemId === cartItemId
          ? {
              ...i,
              quantity,
              totalPrice: i.price * quantity,
            }
          : i
      )

      const totalQuantity = newItems.reduce((sum, i) => sum + i.quantity, 0)
      const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0)

      return { items: newItems, totalQuantity, totalPrice }
    }),

  clearCart: () => set({ ...initialState }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  resetCart: () => set({ ...initialState }),
}))
