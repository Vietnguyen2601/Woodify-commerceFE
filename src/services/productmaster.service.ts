import { productApi } from './api/productClient'
import { API_ENDPOINTS } from '@/constants'
import type { ProductMaster, ProductDetail, CreateProductMasterRequest } from '@/types'

export const productMasterService = {
  getAllProducts: async (): Promise<ProductMaster[]> => {
    return productApi.get<ProductMaster[]>(API_ENDPOINTS.PRODUCTS.LIST)
  },

  getPublishedProducts: async (): Promise<ProductMaster[]> => {
    return productApi.get<ProductMaster[]>(API_ENDPOINTS.PRODUCTS.PUBLISHED)
  },

  getProductDetail: async (productId: string, role: string = 'buyer'): Promise<ProductDetail> => {
    return productApi.get<ProductDetail>(API_ENDPOINTS.PRODUCTS.DETAIL_BUYER(productId, role))
  },

  getProductById: async (productId: string): Promise<ProductMaster> => {
    return productApi.get<ProductMaster>(API_ENDPOINTS.PRODUCTS.DETAIL(productId))
  },

  getProductsByShopId: async (shopId: string): Promise<ProductMaster[]> => {
    try {
      const result = await productApi.get<ProductMaster[]>(API_ENDPOINTS.PRODUCTS.BY_SHOP(shopId))
      return Array.isArray(result) ? result : []
    } catch (err: any) {
      // 404 = shop chưa có sản phẩm nào → trả về mảng rỗng thay vì throw
      if (err?.status === 404) return []
      throw err
    }
  },

  createProduct: async (payload: CreateProductMasterRequest): Promise<ProductMaster> => {
    return productApi.post<ProductMaster>(API_ENDPOINTS.PRODUCTS.CREATE, payload)
  },

  submitForApproval: async (productId: string): Promise<ProductMaster> => {
    return productApi.patch<ProductMaster>(API_ENDPOINTS.PRODUCTS.SUBMIT_FOR_APPROVAL(productId))
  },

  moderateProduct: async (productId: string, moderationStatus: 'APPROVED' | 'REJECTED'): Promise<void> => {
    return productApi.patch<void>(API_ENDPOINTS.PRODUCTS.MODERATE(productId), { moderationStatus })
  },

  publishProduct: async (productId: string): Promise<void> => {
    return productApi.patch<void>(API_ENDPOINTS.PRODUCTS.PUBLISH(productId))
  },
}
