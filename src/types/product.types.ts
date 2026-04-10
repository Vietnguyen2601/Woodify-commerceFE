/**
 * Product and catalog types
 */

export interface Product {
  id: string
  sku: string
  title: string
  description: string
  species: string
  grade: string
  moisture: string
  dimensions: ProductDimensions
  price: number
  unit: ProductUnit
  stock: ProductStock
  certifications: string[]
  images: string[]
  thumbnail: string
  sellerId: string
  createdAt: string
  updatedAt: string
}

export interface ProductDimensions {
  length: number
  width: number
  thickness: number
  unit: 'mm' | 'cm' | 'm'
}

export interface ProductStock {
  available: number
  reserved: number
}

export type ProductUnit = 'm²' | 'tấm' | 'khối' | 'cái'

export interface ProductFilters {
  species?: string
  grade?: string
  minPrice?: number
  maxPrice?: number
  certifications?: string[]
  search?: string
}

export interface ProductListParams {
  page?: number
  pageSize?: number
  sortBy?: 'price' | 'createdAt' | 'title'
  sortOrder?: 'asc' | 'desc'
  filters?: ProductFilters
}

/**
 * Listing types for seller dashboard
 */
export interface Listing {
  sku: string
  title: string
  species: string
  grade: string
  moisture: string
  dims: string
  price: number
  unit: string
  stock: ProductStock
  certifications: string[]
  thumbnail: string
}

export interface InventoryItem {
  sku: string
  species: string
  grade: string
  available: number
  reserved: number
  safety: number
}

// ── ProductMaster (API) ───────────────────────────────────────────────────────

export type ProductStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'REJECTED'
  | 'DELETED'
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ProductImage {
  imageId: string
  imageType: string
  referenceId: string
  sortOrder: number
  originalUrl: string
  publicId: string | null
  createdAt: string
}

export interface ProductDetailVersion {
  versionId: string
  versionNumber: number
  versionName: string
  price: number
  stockQuantity: number
  woodType: string
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
  isActive: boolean
  createdAt: string
  images: ProductImage[]
}

export interface ProductDetail {
  productId: string
  shopId: string
  shopName: string | null
  categoryId: string
  categoryName: string
  name: string
  globalSku: string
  description: string
  status: ProductStatus
  moderationStatus: ModerationStatus | null
  moderatedAt: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  images: ProductImage[]
  versions: ProductDetailVersion[]
}

export interface ProductMaster {
  productId: string
  shopId: string
  shopName: string | null
  categoryId: string
  categoryName: string
  name: string
  globalSku: string
  description: string
  status: ProductStatus
  moderationStatus: ModerationStatus
  moderatedAt: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  thumbnailUrl: string | null
  price: number
  stockQuantity: number
  woodType: string
}

export interface CreateProductMasterRequest {
  shopId: string
  categoryId: string
  name: string
  description: string
}

// ── ProductVersion (API) ──────────────────────────────────────────────────────

export interface ProductVersion {
  versionId: string
  productId: string
  sellerSku: string
  versionNumber: number
  versionName: string
  price: number
  stockQuantity: number
  woodType: string
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  thumbnailUrl: string | null
}

export interface CreateProductVersionRequest {
  productId: string
  sellerSku: string
  versionNumber: number
  versionName: string
  price: number
  stockQuantity: number
  woodType: string
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
  isActive: boolean
}

export interface Certificate {
  id: string
  type: string
  status: 'valid' | 'expired'
  expires: string
  linkedSkus: string[]
}
