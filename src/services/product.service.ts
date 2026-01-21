import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type { Product, ProductListParams, PaginatedResponse } from '@/types'

/**
 * Product service for catalog operations
 */
export const productService = {
  /**
   * Get paginated product list
   */
  getProducts: async (params?: ProductListParams): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS.LIST, { params })
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    return api.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id))
  },

  /**
   * Search products
   */
  searchProducts: async (query: string): Promise<Product[]> => {
    return api.get<Product[]>(API_ENDPOINTS.PRODUCTS.SEARCH, {
      params: { q: query },
    })
  },

  /**
   * Get product categories
   */
  getCategories: async (): Promise<string[]> => {
    return api.get<string[]>(API_ENDPOINTS.PRODUCTS.CATEGORIES)
  },
}
