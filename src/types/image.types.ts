// Valid image types matching backend ImageUrl entity
export type ImageType =
  | 'PRODUCT'
  | 'PRODUCT_VERSION'
  | 'REVIEW'
  | 'AVATAR'
  | 'SHOP_LOGO'
  | 'SHOP_COVER'
  | 'CATEGORY'
  | 'BANNER'
  | 'ADS'

// Single image metadata stored in DB
export interface ImageUrlData {
  imageId: string
  imageType: ImageType
  referenceId: string
  sortOrder: number
  originalUrl: string
  publicId: string | null
  createdAt: string
}

// POST /api/images/save — request body
export interface SaveImageRequest {
  imageType: ImageType
  referenceId: string
  originalUrl: string
  publicId?: string | null
  sortOrder?: number | null
}

// POST /api/images/save-bulk — request body
export interface SaveImagesBulkRequest {
  images: SaveImageRequest[]
}

// Standard API envelope
export interface ImageApiResponse {
  status: number
  message: string
  data: ImageUrlData
  errors: unknown
}

export interface ImageListApiResponse {
  status: number
  message: string
  data: ImageUrlData[]
  errors: unknown
}

export interface ImagesBulkApiResponse {
  status: number
  message: string
  data: ImageUrlData[]
  errors: unknown
}
