import { create } from 'zustand'
import type { ShopInfo } from '@/types'

interface ShopState {
  shop: ShopInfo | null
  isLoading: boolean
  setShop: (shop: ShopInfo | null) => void
  setLoading: (loading: boolean) => void
  clearShop: () => void
}

export const useShopStore = create<ShopState>((set) => ({
  shop: null,
  isLoading: false,
  setShop: (shop) => set({ shop }),
  setLoading: (isLoading) => set({ isLoading }),
  clearShop: () => set({ shop: null }),
}))
