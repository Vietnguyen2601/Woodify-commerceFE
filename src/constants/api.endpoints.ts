/**
 * API endpoint constants
 * All services now use the unified API Gateway (YARP) on port 5000
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Service URLs (all pointing to unified API Gateway)
export const IDENTITY_SERVICE_URL = import.meta.env.VITE_IDENTITY_SERVICE_URL || API_BASE_URL
export const SHOP_SERVICE_URL = import.meta.env.VITE_SHOP_SERVICE_URL || API_BASE_URL
export const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || API_BASE_URL
export const WALLET_SERVICE_URL = import.meta.env.VITE_WALLET_SERVICE_URL || API_BASE_URL

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
    REGISTER: '/seller/register',
    SHOP_NAME_CHECK: (name: string) => `/seller/shops/check-name?name=${encodeURIComponent(name)}`,
  },

  // Shop Management
  SHOP: {
    CREATE: '/Shops/CreateShop',
    GET_BY_OWNER_ID: (ownerId: string) => `/Shops/GetShopByOwnerId/${encodeURIComponent(ownerId)}`,
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SELLERS: '/admin/sellers',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    CATEGORIES: '/admin/categories',
  },

  // Categories
  CATEGORIES: {
    CREATE: '/Categories/CreateCategory',
    GET_ALL: '/Categories/GetAllCategories',
    GET_SUB_CATEGORIES: (parentId: string) => `/Categories/GetSubCategories/${parentId}`,
    GET_BY_NAME: (name: string) => `/Categories/GetCategoryByName/${encodeURIComponent(name)}`,
  },

  // Locations
  LOCATION: {
    PROVINCES: '/locations/provinces',
    DISTRICTS: (provinceCode: string) => `/locations/provinces/${provinceCode}/districts`,
    WARDS: (districtCode: string) => `/locations/districts/${districtCode}/wards`,
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
