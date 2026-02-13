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
  },
  
  // Admin
  admin: {
    dashboard: () => [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD] as const,
    sellers: () => 
      [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'sellers'] as const,
    users: () => 
      [APP_CONFIG.QUERY_KEYS.ADMIN_DASHBOARD, 'users'] as const,
  },

  // Categories
  categories: {
    all: () => [APP_CONFIG.QUERY_KEYS.CATEGORIES] as const,
    children: (parentId: string) => [APP_CONFIG.QUERY_KEYS.CATEGORIES, 'children', parentId] as const,
  },
} as const
