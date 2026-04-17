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

  /** ProductReviews — PRODUCT_REVIEWS_FEEDBACK_FE_API_GUIDE.md */
  PRODUCT_REVIEWS: {
    GET_VISIBLE: (productId: string) =>
      `/product/ProductReviews/GetVisibleReviews/${encodeURIComponent(productId)}`,
    GET_BY_PRODUCT: (productId: string) =>
      `/product/ProductReviews/GetReviewsByProductId/${encodeURIComponent(productId)}`,
    GET_BY_ID: (reviewId: string) =>
      `/product/ProductReviews/GetReviewById/${encodeURIComponent(reviewId)}`,
    CREATE: '/product/ProductReviews/CreateReview',
    GET_BY_ORDER: (orderId: string) =>
      `/product/ProductReviews/GetReviewsByOrderId/${encodeURIComponent(orderId)}`,
    ADD_SHOP_RESPONSE: (reviewId: string) =>
      `/product/ProductReviews/AddShopResponse/${encodeURIComponent(reviewId)}`,
    HIDE: (reviewId: string) =>
      `/product/ProductReviews/HideReview/${encodeURIComponent(reviewId)}`,
    UNHIDE: (reviewId: string) =>
      `/product/ProductReviews/UnhideReview/${encodeURIComponent(reviewId)}`,
    DELETE: (reviewId: string) =>
      `/product/ProductReviews/DeleteReview/${encodeURIComponent(reviewId)}`,
  },

  // ── Placeholder endpoints — NOT yet confirmed by backend ─────────────────

  ORDERS: {
    /** Legacy / mock — không map sang Order microservice */
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/order/Orders/create',
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    /** Placeholder — cập nhật trạng thái dùng UPDATE_STATUS (PUT) */
    STATUS: (id: string) => `/orders/${id}/status`,
    /** Order service — danh sách đơn theo shop (seller) */
    SHOP_ORDERS: (shopId: string) =>
      `/order/Orders/Shop/${encodeURIComponent(shopId)}`,
    /** Order service — danh sách đơn theo tài khoản (buyer) */
    ACCOUNT_ORDERS: (accountId: string) =>
      `/order/Orders/Account?accountId=${encodeURIComponent(accountId)}`,
    /** Body: { orderId, status } — PUT */
    UPDATE_STATUS: '/order/Orders/UpdateStatus',
    /** POST body: { accountId, shopId, cartItemIds } — preview phí VC theo gói */
    SHIPPING_PREVIEW: '/order/Orders/checkout/shipping-preview',
  },

  // ── Payment Service (5015) ────────────────────────────────────────────────
  PAYMENTS: {
    CREATE: '/payment/Payments/create',
    STATUS: (paymentId: string) => `/payment/${paymentId}`,
    WEBHOOK: '/payment/webhook',
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

  // Admin (legacy / generic — prefer ADMIN_API for gateway routes in ADMIN_API_SPEC.md)
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
    TOPUP: '/wallets/topup',
    TRANSACTIONS: (walletId: string) => `/wallets/${walletId}/transactions`,
  },

  // ── Image Service ─────────────────────────────────────────────────────────
  IMAGES: {
    SAVE: '/product/images/save',
    SAVE_BULK: '/product/images/save-bulk',
    LIST_BY_TYPE: (type: string) => `/product/images/type/${encodeURIComponent(type)}`,
    GET_BY_TYPE_AND_ID: (type: string, referenceId: string) =>
      `/product/images/${type.toLowerCase()}/${referenceId}`,
    GET_PRIMARY: (type: string, referenceId: string) =>
      `/product/images/${type.toLowerCase()}/${referenceId}/primary`,
    DELETE: (imageId: string) => `/product/images/${encodeURIComponent(imageId)}`,
  },

  // ── Shipment Service (5016) ────────────────────────────────────────────────
  PROVIDER: {
    LIST: '/shipment/providers',
    BY_ID: (providerId: string) => `/shipment/providers/${encodeURIComponent(providerId)}`,
    CREATE: '/shipment/providers',
    UPDATE: (providerId: string) => `/shipment/providers/${encodeURIComponent(providerId)}`,
    DELETE: (providerId: string) => `/shipment/providers/${encodeURIComponent(providerId)}`,
  },
  SHIPMENT_SERVICES: {
    BY_SHOP: (shopId: string) => `/shipment/shops/${encodeURIComponent(shopId)}/services`,
    LIST: '/shipment/services',
    BY_ID: (serviceId: string) => `/shipment/services/${encodeURIComponent(serviceId)}`,
    BY_PROVIDER: (providerId: string) => `/shipment/providers/${encodeURIComponent(providerId)}/services`,
    UPDATE: (serviceId: string) => `/shipment/services/${encodeURIComponent(serviceId)}`,
    DELETE: (serviceId: string) => `/shipment/services/${encodeURIComponent(serviceId)}`,
    CREATE: '/shipment/services',
  },
  /** Shipment entity — SHIPMENT_SELLER_FLOW.md (gateway `/api/shipment/shipments/...`) */
  SHIPMENTS: {
    LIST: '/shipment/shipments',
    BY_ID: (id: string) => `/shipment/shipments/${encodeURIComponent(id)}`,
    BY_ORDER: (orderId: string) => `/shipment/shipments/by-order/${encodeURIComponent(orderId)}`,
    BY_SHOP: (shopId: string) => `/shipment/shipments/by-shop/${encodeURIComponent(shopId)}`,
    CREATE: '/shipment/shipments',
    UPDATE: (id: string) => `/shipment/shipments/${encodeURIComponent(id)}`,
    STATUS: (id: string) => `/shipment/shipments/${encodeURIComponent(id)}/status`,
    PICKUP: (id: string) => `/shipment/shipments/${encodeURIComponent(id)}/pickup`,
    DELETE: (id: string) => `/shipment/shipments/${encodeURIComponent(id)}`,
  },
} as const

/**
 * Admin dashboard — paths relative to API_BASE_URL (already includes `/api`).
 * Matches ADMIN_API_SPEC.md; alternate PascalCase paths are tried in admin.service when needed.
 */
export const ADMIN_API = {
  DASHBOARD: {
    OVERVIEW: ['/admin/dashboard/overview', '/order/admin/dashboard/overview'],
    METRICS_TODAY: ['/admin/dashboard/metrics/today', '/order/admin/dashboard/metrics/today'],
    REVENUE_DAILY: ['/admin/dashboard/revenue/daily', '/order/admin/dashboard/revenue/daily'],
    REVENUE_QUARTERLY: ['/admin/dashboard/revenue/quarterly', '/order/admin/dashboard/revenue/quarterly'],
    REVENUE_YEARLY: ['/admin/dashboard/revenue/yearly', '/order/admin/dashboard/revenue/yearly'],
    REVENUE_CUSTOM: ['/admin/dashboard/revenue/custom', '/order/admin/dashboard/revenue/custom'],
  },
  ACCOUNTS: {
    GET_ALL: '/accounts/GetAllAccounts',
    GET_BY_ID: (id: string) => `/accounts/GetAccountById/${encodeURIComponent(id)}`,
    UPDATE_STATUS: (id: string) => [`/accounts/UpdateAccountStatus/${encodeURIComponent(id)}`, `/accounts/${encodeURIComponent(id)}/status`],
  },
  SHOPS: {
    GET_ALL_ADMIN: ['/shop/shops/GetAllShops', '/shop/shops/admin/GetAllShops', '/Shops/GetAllShops', '/Shops/admin/GetAllShops'],
    GET_BY_ID: (id: string) => [`/shop/shops/GetShopById/${encodeURIComponent(id)}`, `/Shops/GetShopById/${encodeURIComponent(id)}`],
    PATCH_STATUS: (shopId: string) => [`/shop/shops/${encodeURIComponent(shopId)}/status`, `/Shops/${encodeURIComponent(shopId)}/status`],
  },
  PRODUCT_MASTERS: {
    GET_ALL: ['/product/productmasters/GetAllProducts', '/ProductMasters/GetAllProducts'],
    GET_ALL_ADMIN: ['/product/productmasters/GetAllProductDetails?role=admin', '/ProductMasters/GetAllProductDetails?role=admin'],
    BY_SHOP: (shopId: string) => [
      `/product/productmasters/GetProductByShopId/${encodeURIComponent(shopId)}`,
      `/ProductMasters/GetProductByShopId/${encodeURIComponent(shopId)}`,
    ],
    PENDING_APPROVAL: ['/product/productmasters/GetPendingApprovalProducts', '/ProductMasters/GetPendingApprovalProducts'],
    GET_DETAIL: (id: string) => [
      `/product/productmasters/GetProductDetail/${encodeURIComponent(id)}?role=admin`,
      `/ProductMasters/GetProductDetail/${encodeURIComponent(id)}?role=admin`,
    ],
    MODERATE: (id: string) => [
      `/product/productmasters/ModerateProduct/${encodeURIComponent(id)}`,
      `/ProductMasters/ModerateProduct/${encodeURIComponent(id)}`,
    ],
  },
  CATEGORIES: {
    GET_ALL: ['/product/categories/GetAllCategories', '/categories/GetAllCategories'],
    GET_ROOT: ['/product/categories/GetRootCategories', '/categories/GetRootCategories'],
    GET_CHILDREN: (parentId: string) => [
      `/product/categories/GetSubCategories/${encodeURIComponent(parentId)}`,
      `/categories/GetSubCategories/${encodeURIComponent(parentId)}`,
    ],
    POST_CREATE: ['/product/categories/CreateCategory', '/categories/CreateCategory'],
    PUT_UPDATE: (id: string) => [
      `/product/categories/UpdateCategory/${encodeURIComponent(id)}`,
      `/categories/UpdateCategory/${encodeURIComponent(id)}`,
    ],
    DELETE: (id: string) => [
      `/product/categories/DeleteCategory/${encodeURIComponent(id)}`,
      `/categories/DeleteCategory/${encodeURIComponent(id)}`,
    ],
  },
  ORDERS: {
    /** P0 endpoints from API_GAPS — may not exist yet on backend; returns empty gracefully if unavailable */
    ADMIN_ALL: [
      '/orders/admin/all',
      '/orders/admin/list',
      '/order/admin/GetAllOrders',
      '/Order/Admin/GetAllOrders',
    ],
    BY_SHOP: (shopId: string) => [
      `/order/Orders/Shop/${encodeURIComponent(shopId)}`,
      `/orders/Shop/${encodeURIComponent(shopId)}`,
      `/Orders/Shop/${encodeURIComponent(shopId)}`,
      `/order/GetOrdersByShopId/${encodeURIComponent(shopId)}`,
      `/Order/GetOrdersByShopId/${encodeURIComponent(shopId)}`,
    ],
    DETAIL: (orderId: string) => `/orders/${encodeURIComponent(orderId)}`,
  },
  SHIPMENTS: {
    GET_ALL: ['/shipment/shipments/GetAllShipments', '/Shipment/Shipments/GetAllShipments'],
  },
  SHIPMENT_PROVIDERS: {
    LIST: ['/shipment/providers', '/Shipment/providers'],
  },
  BANNERS: {
    GET_ALL: ['/product/images/type/BANNER', '/images/type/BANNER'],
  },
  IMAGES: {
    SAVE: ['/product/images/save', '/images/save'],
    DELETE: (id: string) => [
      `/product/images/${encodeURIComponent(id)}`,
      `/images/${encodeURIComponent(id)}`,
    ],
  },
} as const
