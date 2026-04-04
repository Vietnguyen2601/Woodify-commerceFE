import { productApi } from './api/productClient'
import { API_ENDPOINTS } from '@/constants'
import type { ProductVersion, CreateProductVersionRequest } from '@/types'

export const productVersionService = {
  getVersionsByProductId: async (productId: string): Promise<ProductVersion[]> => {
    return productApi.get<ProductVersion[]>(API_ENDPOINTS.PRODUCT_VERSIONS.BY_PRODUCT(productId))
  },

  getVersionById: async (versionId: string): Promise<ProductVersion> => {
    return productApi.get<ProductVersion>(API_ENDPOINTS.PRODUCT_VERSIONS.DETAIL(versionId))
  },

  createVersion: async (payload: CreateProductVersionRequest): Promise<ProductVersion> => {
    return productApi.post<ProductVersion>(API_ENDPOINTS.PRODUCT_VERSIONS.CREATE, payload)
  },
}
