import { useQuery } from '@tanstack/react-query'
import { productService, queryKeys } from '@/services'
import { APP_CONFIG } from '@/constants'
import type { ProductListParams } from '@/types'

/**
 * Hook for fetching products list with filters
 */
export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params as Record<string, unknown> | undefined),
    queryFn: () => productService.getProducts(params),
    staleTime: APP_CONFIG.STALE_TIMES.PRODUCTS,
  })
}

/**
 * Hook for fetching single product
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getProduct(id),
    staleTime: APP_CONFIG.STALE_TIMES.PRODUCTS,
    enabled: !!id, // Only fetch if ID is provided
  })
}

/**
 * Hook for product search with debounce
 */
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['product-search', query],
    queryFn: () => productService.searchProducts(query),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook for fetching product categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories rarely change
  })
}
