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

export interface Certificate {
  id: string
  type: string
  status: 'valid' | 'expired'
  expires: string
  linkedSkus: string[]
}
