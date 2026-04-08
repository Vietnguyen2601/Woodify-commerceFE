import { api } from './api/client'
import type { CartItemDto, CartResponse, CheckoutPreviewResponse } from '@/types';

export const cartService = {
  // Get cart by account ID
  async getCart(accountId: string): Promise<CartResponse> {
    try {
      return api.get<CartResponse>(
        `/order/Carts/GetCart/${accountId}`,
        { withCredentials: true }
      );
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
      return api.post<CartItemDto>(
        `/order/Carts/AddToCart/${accountId}`,
        { versionId, shopId, quantity },
        { withCredentials: true }
      );
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
      return api.put<CartItemDto>(
        `/order/Carts/UpdateCartItem/${accountId}`,
        { cartItemId, quantity },
        { withCredentials: true }
      );
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
      return api.get<CheckoutPreviewResponse>(
        `/order/Carts/GetCheckoutPreview/${accountId}`,
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to fetch checkout preview:', error);
      throw error;
    }
  },
};
