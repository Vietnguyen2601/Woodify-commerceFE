/**
 * API endpoint constants
 * All requests go through the API Gateway (YARP) at port 5000.
 * YARP strips the service prefix and forwards to the correct microservice.
 *   Identity (5010), Shop (5011), Product+Category (5012),
 *   Order (5014), Payment (5015), Shipment (5016)
 *
 * Rule: FE only calls http://localhost:5000 — never direct service ports.
 * withCredentials: true is mandatory (JWT stored in HttpOnly Cookie).
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Service URLs — all pointing to the unified API Gateway (YARP) on port 5000
export const IDENTITY_SERVICE_URL = import.meta.env.VITE_IDENTITY_SERVICE_URL || API_BASE_URL
export const SHOP_SERVICE_URL = import.meta.env.VITE_SHOP_SERVICE_URL || API_BASE_URL
export const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || API_BASE_URL
export const SHIPMENT_SERVICE_URL = import.meta.env.VITE_SHIPMENT_SERVICE_URL || API_BASE_URL
export const WALLET_SERVICE_URL = import.meta.env.VITE_WALLET_SERVICE_URL || API_BASE_URL

export const API_ENDPOINTS = {
  // ── Identity Service (5010) ────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // OTP / email verification — same service as AUTH
  IDENTITY: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REGISTER: '/auth/register',
  },

  // ── Product Service (5012) ────────────────────────────────────────────────
  PRODUCTS: {
    LIST: '/product/ProductMasters/GetAllProducts',
    PUBLISHED: '/product/ProductMasters/GetPublishedProducts',
    DETAIL: (id: string) => `/product/ProductMasters/GetProductById/${id}`,
    DETAIL_BUYER: (id: string, role: string) => `/product/ProductMasters/GetProductDetail/${id}?role=${role}`,
    BY_SHOP: (shopId: string) => `/product/ProductMasters/GetProductByShopId/${shopId}`,
    CREATE: '/product/ProductMasters/CreateProduct',
    SUBMIT_FOR_APPROVAL: (id: string) => `/product/ProductMasters/SubmitForApproval/${id}`,
    MODERATE: (id: string) => `/product/ProductMasters/ModerateProduct/${id}`,
    PUBLISH: (id: string) => `/product/ProductMasters/PublishProduct/${id}`,
  },

  PRODUCT_VERSIONS: {
    BY_PRODUCT: (productId: string) => `/product/ProductVersions/GetVersionsByProductId/${productId}`,
    DETAIL: (versionId: string) => `/product/ProductVersions/GetVersionById/${versionId}`,
    CREATE: '/product/ProductVersions/CreateVersion',
  },

  // ── Placeholder endpoints — NOT yet confirmed by backend ─────────────────

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

  // ── Shop Service (5011) ────────────────────────────────────────────────────
  SHOP: {
    CREATE: '/shop/Shops/CreateShop',
    GET_ALL: '/shop/Shops/GetAllShops',
    GET_BY_ID: (id: string) => `/shop/Shops/GetShopById/${encodeURIComponent(id)}`,
    GET_BY_OWNER_ID: (ownerId: string) => `/shop/Shops/GetShopByOwnerId/${encodeURIComponent(ownerId)}`,
    UPDATE: (id: string) => `/shop/Shops/UpdateShopInfo/${encodeURIComponent(id)}`,
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SELLERS: '/admin/sellers',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    CATEGORIES: '/admin/categories',
  },

  // ── Category Service (5012 — same service as Product) ─────────────────────
  CATEGORIES: {
    GET_ALL: '/product/Categories/GetAllCategories',
    GET_ACTIVE: '/product/Categories/GetActiveCategories',
    GET_ROOT: '/product/Categories/GetRootCategories',
    GET_SUB_CATEGORIES: (parentId: string) => `/product/Categories/GetSubCategories/${parentId}`,
    GET_BY_NAME: (name: string) => `/product/Categories/GetCategoryByName/${encodeURIComponent(name)}`,
    CREATE: '/product/Categories/CreateCategory',
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

  // ── Wallet Service ────────────────────────────────────────────────────────
  WALLET: {
    GET_BY_ACCOUNT_ID: (accountId: string) => `/wallets/account/${accountId}`,
    GET_BY_ID: (walletId: string) => `/wallets/${walletId}`,
  },

  // ── Image Service ─────────────────────────────────────────────────────────
  IMAGES: {
    SAVE: '/product/images/save',
    SAVE_BULK: '/product/images/save-bulk',
    GET_BY_TYPE_AND_ID: (type: string, referenceId: string) =>
      `/product/images/${type.toLowerCase()}/${referenceId}`,
    GET_PRIMARY: (type: string, referenceId: string) =>
      `/product/images/${type.toLowerCase()}/${referenceId}/primary`,
  },

  // ── Shipment Service (5016) ────────────────────────────────────────────────
  PROVIDER: {
    LIST: '/shipment/providers',
  },
} as const
