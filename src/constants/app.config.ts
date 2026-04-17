/**
 * Application-wide configuration
 */

export const APP_CONFIG = {
  NAME: 'Wood Marketplace',
  DESCRIPTION: 'Sàn thương mại gỗ trực tuyến',
  VERSION: '0.1.0',
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user_data',
    CART: 'cart_items',
    THEME: 'theme_preference',
    LOCALE: 'locale',
  },

  // Query keys for React Query
  QUERY_KEYS: {
    USER: 'user',
    PRODUCTS: 'products',
    PRODUCT: 'product',
    CART: 'cart',
    ORDERS: 'orders',
    ORDER: 'order',
    SELLER_DASHBOARD: 'seller-dashboard',
    ADMIN_DASHBOARD: 'admin-dashboard',
    CATEGORIES: 'categories',
    LOCATION: 'location',
  },

  // Stale times for React Query (in ms)
  STALE_TIMES: {
    USER: 5 * 60 * 1000,       // 5 minutes
    PRODUCTS: 2 * 60 * 1000,   // 2 minutes
    CART: 30 * 1000,           // 30 seconds
    ORDERS: 60 * 1000,         // 1 minute
    CATEGORIES: 5 * 60 * 1000,  // 5 minutes
    LOCATION: 10 * 60 * 1000,   // 10 minutes
  },

  // Marketing image references (stable GUIDs for BANNER/ADS)
  MARKETING: {
    BANNER_REFERENCE_ID:
      import.meta.env.VITE_BANNER_REFERENCE_ID || '11111111-1111-1111-1111-111111111111',
    ADS_REFERENCE_ID:
      import.meta.env.VITE_ADS_REFERENCE_ID || '22222222-2222-2222-2222-222222222222',
  },
} as const
