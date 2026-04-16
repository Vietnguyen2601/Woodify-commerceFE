// Common utility types for the application

/**
 * API response wrapper type
 */
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Common status types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Nullable utility type
 */
export type Nullable<T> = T | null

/**
 * Optional utility type for partial updates
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * ID type - consistent across the app
 */
export type ID = string | number
