import { api } from './api/client'
import type { CartItemDto, CartResponse, CheckoutPreviewResponse } from '@/types'

const scaleCartMoney = (item: CartItemDto): CartItemDto => ({
  ...item,
})

const scaleCartResponse = (cart: CartResponse): CartResponse => ({
  ...cart,
  items: (cart.items ?? []).map(scaleCartMoney),
  totalPrice: cart.totalPrice ?? 0,
})

const scaleCheckoutPreview = (preview: CheckoutPreviewResponse): CheckoutPreviewResponse => ({
  ...preview,
  items: (preview.items ?? []).map(scaleCartMoney),
  grandTotal: preview.grandTotal ?? 0,
  shops: (preview.shops ?? []).map((shop) => ({
    ...shop,
    items: (shop.items ?? []).map(scaleCartMoney),
    totalPrice: shop.totalPrice ?? 0,
    totalWithShipping:
      shop.totalWithShipping != null ? shop.totalWithShipping : undefined,
  })),
})

function normalizeAddToCartResponse(raw: unknown): CartItemDto {
  if (raw == null || typeof raw !== 'object') {
    throw new Error('Invalid add-to-cart response')
  }
  const r = raw as CartItemDto & { items?: CartItemDto[] }
  if (Array.isArray(r.items) && r.items.length > 0) {
    return scaleCartMoney(r.items[r.items.length - 1])
  }
  if (typeof r.cartItemId === 'string' && typeof r.price === 'number') {
    return scaleCartMoney(r as CartItemDto)
  }
  throw new Error('Invalid add-to-cart response')
}

export const cartService = {
  // Get cart by account ID
  async getCart(accountId: string): Promise<CartResponse> {
    try {
      const cart = await api.get<CartResponse>(
        `/order/Carts/GetCart/${accountId}`,
        { withCredentials: true }
      )
      return scaleCartResponse(cart)
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(
    accountId: string,
    versionId: string,
    shopId: string,
    quantity: number
  ): Promise<CartItemDto> {
    try {
      const raw = await api.post<unknown>(
        `/order/Carts/AddToCart/${accountId}`,
        { versionId, shopId, quantity },
        { withCredentials: true }
      )
      return normalizeAddToCartResponse(raw)
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(
    accountId: string,
    cartItemId: string,
    quantity: number
  ): Promise<CartItemDto> {
    try {
      const item = await api.put<CartItemDto>(
        `/order/Carts/UpdateCartItem/${accountId}`,
        { cartItemId, quantity },
        { withCredentials: true }
      )
      return scaleCartMoney(item)
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeCartItem(
    accountId: string,
    cartItemId: string
  ): Promise<void> {
    try {
      await api.delete(
        `/order/Carts/RemoveCartItem/${accountId}/${cartItemId}`,
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  },

  // Clear entire cart
  async clearCart(accountId: string): Promise<void> {
    try {
      await api.delete(`/order/Carts/ClearCart/${accountId}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  // Get checkout preview
  async getCheckoutPreview(
    accountId: string
  ): Promise<CheckoutPreviewResponse> {
    try {
      const preview = await api.get<CheckoutPreviewResponse>(
        `/order/Carts/GetCheckoutPreview/${accountId}`,
        { withCredentials: true }
      )
      return scaleCheckoutPreview(preview)
    } catch (error) {
      console.error('Failed to fetch checkout preview:', error);
      throw error;
    }
  },
};
