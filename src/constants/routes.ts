/**
 * Application route paths
 * Centralized route management for type-safe navigation
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: (id: string) => `/product/${id}`,
  SHOP: (shopId: string) => `/shop/${shopId}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_MULTISHOP: '/checkout-multishop',

  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',

  // Profile routes
  PROFILE: '/profile',
  PROFILE_ACCOUNT: '/profile/account',
  PROFILE_ORDERS: '/profile/orders',
  PROFILE_SETTINGS: '/profile/settings',
  PROFILE_WALLET: '/profile/wallet',
  PROFILE_VOUCHERS: '/profile/vouchers',

  // Seller routes
  SELLER: '/seller',
  SELLER_REGISTRATION: '/seller/registration',
  SELLER_REGISTER: '/seller/register',
  SELLER_DASHBOARD: '/seller/dashboard',
  SELLER_ORDERS: '/seller/orders',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_ANALYTICS: '/seller/analytics',
  SELLER_FINANCE: '/seller/finance',
  SELLER_SHOP: '/seller/shop',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SELLERS: '/admin/sellers',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_MARKETING: '/admin/marketing',
} as const

export type RouteKey = keyof typeof ROUTES
