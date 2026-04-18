import { categoryApi } from './api/categoryClient'
import { API_ENDPOINTS } from '@/constants'
import type {
  CategoryDTO,
  CreateCategoryRequest,
  CategoryListApiResponse,
  CategorySearchApiResponse,
} from '@/types'

/**
 * Category service exposes helper functions for category management
 */
export const categoryService = {
  /**
   * Fetch all categories with hierarchy info
   */
  getAllCategories: async (): Promise<CategoryListApiResponse> => {
    return categoryApi.get<CategoryListApiResponse>(API_ENDPOINTS.CATEGORIES.GET_ALL)
  },

  /**
   * Fetch category suggestions by keyword
   */
  searchCategoryByName: async (keyword: string): Promise<CategorySearchApiResponse> => {
    return categoryApi.get<CategorySearchApiResponse>(API_ENDPOINTS.CATEGORIES.GET_BY_NAME(keyword))
  },

    /**
     * Fetch direct child categories for a given parent
     */
    getSubCategories: async (parentId: string): Promise<CategoryListApiResponse> => {
      return categoryApi.get<CategoryListApiResponse>(
        API_ENDPOINTS.CATEGORIES.GET_SUB_CATEGORIES(parentId)
      )
    },

  /**
   * Create a new category. Root level categories must send parentCategoryId = null.
   */
  /** Response is unwrapped by categoryClient (inner `data` only). */
  createCategory: async (payload: CreateCategoryRequest): Promise<CategoryDTO> => {
    const normalizedPayload = {
      ...payload,
      parentCategoryId:
        payload.parentCategoryId === undefined || payload.parentCategoryId === ''
          ? null
          : payload.parentCategoryId,
      description: payload.description ?? null,
    }

    return categoryApi.post<CategoryDTO>(API_ENDPOINTS.CATEGORIES.CREATE, normalizedPayload)
  },
}
