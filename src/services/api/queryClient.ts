import { QueryClient } from '@tanstack/react-query'
import { APP_CONFIG } from '@/constants/app.config'

/**
 * Create QueryClient with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: APP_CONFIG.STALE_TIMES.PRODUCTS,
      
      // Cache time - how long inactive data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'response' in error) {
          const status = (error as { response?: { status?: number } }).response?.status
          if (status && status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
      
      // Refetch on window focus (useful for dashboards)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})

/**
 * Query key factory for type-safe query keys
 */
export const queryKeys = {
  // Auth
  user: () => [APP_CONFIG.QUERY_KEYS.USER] as const,
  
  // Products
  products: {
    all: () => [APP_CONFIG.QUERY_KEYS.PRODUCTS] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.products.all(), 'list', filters] as const,
    detail: (id: string) => 
      [...queryKeys.products.all(), 'detail', id] as const,
  },
  
  // Cart
  cart: () => [APP_CONFIG.QUERY_KEYS.CART] as const,
  
  // Orders
  orders: {
    all: () => [APP_CONFIG.QUERY_KEYS.ORDERS] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.orders.all(), 'list', filters] as const,
    detail: (id: string) => 
      [...queryKeys.orders.all(), 'detail', id] as const,
  },
  
  // Seller
  seller: {
    dashboard: () => [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD] as const,
    orders: (filters?: Record<string, unknown>) => 
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'orders', filters] as const,
    products: () => 
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'products'] as const,
    analytics: () => 
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'analytics'] as const,
    bankAccount: (shopId: string) =>
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'bank-account', shopId] as const,
    wallet: (accountId: string) =>
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'wallet', accountId] as const,
    walletTransactions: (accountId: string, page: number, pageSize: number) =>
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'wallet-transactions', accountId, page, pageSize] as const,
    revenueTrend: (shopId: string, days: number) =>
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'revenue-trend', shopId, days] as const,
    topSellingProducts: (shopId: string, limit: number) =>
      [APP_CONFIG.QUERY_KEYS.SELLER_DASHBOARD, 'top-selling-products', shopId, limit] as const,
  },
  
  // Admin
  admin: {
    dashboard: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD] as const,
    sellers: () => 
      [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'sellers'] as const,
    users: () => 
      [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'users'] as const,
    shops: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'shops'] as const,
    accounts: (ids?: string[]) => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'accounts', ids] as const,
    orders: (filters?: Record<string, unknown>) =>
      [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'orders', filters] as const,
    shipments: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'shipments'] as const,
    products: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'product-masters'] as const,
    snapshot: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'snapshot'] as const,
    revenue: (range: string) => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'revenue', range] as const,
    topCategories: (topN: number) =>
      [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'top-categories', topN] as const,
    categories: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'categories'] as const,
    banners: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'banners'] as const,
    withdrawalTickets: (filters: { status?: string; page: number; pageSize: number }) =>
      [
        APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD,
        'withdrawal-tickets',
        filters.status ?? 'all',
        filters.page,
        filters.pageSize,
      ] as const,
  },

  // Admin shortcuts
  ADMIN_ACCOUNTS: [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'accounts'] as const,
  ADMIN_SHOPS: [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'shops'] as const,
  ADMIN_CATEGORIES: [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'categories'] as const,
  ADMIN_BANNERS: [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'banners'] as const,

  // Home (public)
  home: {
    /** GET /product/images/type/BANNER — hero slider */
    banners: () => ['home', 'marketing-banners'] as const,
    /** GET /product/images/type/ADS — trang khuyến mãi / quảng cáo */
    ads: () => ['home', 'marketing-ads'] as const,
  },

  // Categories
  categories: {
    all: () => [APP_CONFIG.QUERY_KEYS.CATEGORIES] as const,
    children: (parentId: string) => [APP_CONFIG.QUERY_KEYS.CATEGORIES, 'children', parentId] as const,
  },

  // Location
  location: {
    all: () => [APP_CONFIG.QUERY_KEYS.LOCATION] as const,
    provinces: () => [APP_CONFIG.QUERY_KEYS.LOCATION, 'provinces'] as const,
    districts: (provinceCode: string) => [APP_CONFIG.QUERY_KEYS.LOCATION, 'districts', provinceCode] as const,
    wards: (districtCode: string) => [APP_CONFIG.QUERY_KEYS.LOCATION, 'wards', districtCode] as const,
  },
} as const
