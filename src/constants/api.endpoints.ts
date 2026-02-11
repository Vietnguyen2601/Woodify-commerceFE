/**
 * API endpoint constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
export const IDENTITY_SERVICE_URL = import.meta.env.VITE_IDENTITY_SERVICE_URL

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Identity Service (OTP & Email Verification)
  IDENTITY: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REGISTER: '/auth/register',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    STATUS: (id: string) => `/orders/${id}/status`,
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/items',
    UPDATE: (id: string) => `/cart/items/${id}`,
    REMOVE: (id: string) => `/cart/items/${id}`,
    CLEAR: '/cart/clear',
  },

  // Seller
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    ORDERS: '/seller/orders',
    PRODUCTS: '/seller/products',
    ANALYTICS: '/seller/analytics',
    LISTINGS: '/seller/listings',
    INVENTORY: '/seller/inventory',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SELLERS: '/admin/sellers',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    CATEGORIES: '/admin/categories',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    ADDRESSES: '/user/addresses',
    WALLET: '/user/wallet',
    VOUCHERS: '/user/vouchers',
  },
} as const
