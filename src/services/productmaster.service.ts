import { productApi } from './api/productClient'
import { API_ENDPOINTS } from '@/constants'
import type { ProductMaster, ProductDetail, CreateProductMasterRequest } from '@/types'

/** Gộp `sales` (camelCase) và `Sales` (PascalCase) từ Product Service. */
function mergeSalesField<T extends object>(row: T): T {
  const r = row as T & Record<string, unknown>
  const raw = r.sales ?? r.Sales
  if (raw == null || raw === '') return row
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return row
  return { ...row, sales: n }
}

/** Gộp `shopName` / `ShopName` khi list API trả PascalCase. */
function mergeShopNameField<T extends object>(row: T): T {
  const r = row as T & Record<string, unknown>
  if (r.shopName !== undefined) return row
  const raw = r.ShopName
  if (raw === undefined) return row
  return { ...row, shopName: raw == null ? null : String(raw) }
}

/** `averageRating` / `AverageRating`, `reviewCount` / `ReviewCount` từ Product Service. */
function mergeRatingFields<T extends object>(row: T): T {
  const r = row as T & Record<string, unknown>
  let next: T & Record<string, unknown> = { ...r }
  if (next.averageRating === undefined && r.AverageRating !== undefined) {
    const v = r.AverageRating
    next = { ...next, averageRating: v == null ? null : Number(v) }
  }
  if (next.reviewCount === undefined && r.ReviewCount !== undefined) {
    const v = r.ReviewCount
    const n = typeof v === 'number' ? v : Number(v)
    next = { ...next, reviewCount: Number.isFinite(n) ? n : 0 }
  }
  return next as T
}

function mapProductMasters(list: ProductMaster[]): ProductMaster[] {
  return list.map((p) => mergeRatingFields(mergeShopNameField(mergeSalesField(p))) as ProductMaster)
}

export const productMasterService = {
  getAllProducts: async (): Promise<ProductMaster[]> => {
    const rows = await productApi.get<ProductMaster[]>(API_ENDPOINTS.PRODUCTS.LIST)
    return Array.isArray(rows) ? mapProductMasters(rows) : []
  },

  getPublishedProducts: async (): Promise<ProductMaster[]> => {
    const rows = await productApi.get<ProductMaster[]>(API_ENDPOINTS.PRODUCTS.PUBLISHED)
    return Array.isArray(rows) ? mapProductMasters(rows) : []
  },

  getProductDetail: async (productId: string, role: string = 'buyer'): Promise<ProductDetail> => {
    const detail = await productApi.get<ProductDetail>(API_ENDPOINTS.PRODUCTS.DETAIL_BUYER(productId, role))
    return mergeSalesField(detail)
  },

  getProductById: async (productId: string): Promise<ProductMaster> => {
    const pm = await productApi.get<ProductMaster>(API_ENDPOINTS.PRODUCTS.DETAIL(productId))
    return mergeSalesField(pm)
  },

  getProductsByShopId: async (shopId: string): Promise<ProductMaster[]> => {
    try {
      const result = await productApi.get<ProductMaster[]>(API_ENDPOINTS.PRODUCTS.BY_SHOP(shopId))
      return Array.isArray(result) ? mapProductMasters(result) : []
    } catch (err: any) {
      // 404 = shop chưa có sản phẩm nào → trả về mảng rỗng thay vì throw
      if (err?.status === 404) return []
      throw err
    }
  },

  createProduct: async (payload: CreateProductMasterRequest): Promise<ProductMaster> => {
    const pm = await productApi.post<ProductMaster>(API_ENDPOINTS.PRODUCTS.CREATE, payload)
    return mergeSalesField(pm)
  },

  submitForApproval: async (productId: string): Promise<ProductMaster> => {
    const pm = await productApi.patch<ProductMaster>(API_ENDPOINTS.PRODUCTS.SUBMIT_FOR_APPROVAL(productId))
    return mergeSalesField(pm)
  },

  moderateProduct: async (productId: string, moderationStatus: 'APPROVED' | 'REJECTED'): Promise<void> => {
    return productApi.patch<void>(API_ENDPOINTS.PRODUCTS.MODERATE(productId), { moderationStatus })
  },

  publishProduct: async (productId: string): Promise<void> => {
    return productApi.patch<void>(API_ENDPOINTS.PRODUCTS.PUBLISH(productId))
  },
}
