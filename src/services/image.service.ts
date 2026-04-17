import { productApi as api } from './api/productClient'
import { API_ENDPOINTS } from '@/constants/api.endpoints'
import type {
  ImageType,
  ImageUrlData,
  ImageApiResponse,
  ImageListApiResponse,
  ImagesBulkApiResponse,
  SaveImageRequest,
  SaveImagesBulkRequest,
} from '@/types'

export const imageService = {
  /**
   * List images by type (BANNER / ADS), sorted by sort_order ASC.
   * GET /api/product/images/type/{TYPE}
   */
  listByType: async (type: 'BANNER' | 'ADS'): Promise<ImageUrlData[]> => {
    const response = await api.get<ImageListApiResponse | ImageUrlData[]>(API_ENDPOINTS.IMAGES.LIST_BY_TYPE(type))
    return (response as unknown as ImageListApiResponse).data ?? (response as unknown as ImageUrlData[])
  },

  /**
   * Save a single image metadata after Cloudinary upload.
   * POST /api/images/save
   */
  save: async (payload: SaveImageRequest): Promise<ImageUrlData> => {
    const response = await api.post<ImageApiResponse>(API_ENDPOINTS.IMAGES.SAVE, payload)
    return (response as unknown as ImageApiResponse).data ?? (response as unknown as ImageUrlData)
  },

  /**
   * Save multiple images at once.
   * POST /api/images/save-bulk
   */
  saveBulk: async (images: SaveImageRequest[]): Promise<ImageUrlData[]> => {
    const payload: SaveImagesBulkRequest = { images }
    const response = await api.post<ImagesBulkApiResponse>(API_ENDPOINTS.IMAGES.SAVE_BULK, payload)
    return (response as unknown as ImagesBulkApiResponse).data ?? (response as unknown as ImageUrlData[])
  },

  /**
   * Get all images for a given entity, sorted by sort_order ASC.
   * GET /api/images/{type}/{referenceId}
   */
  getByTypeAndId: async (
    type: ImageType,
    referenceId: string
  ): Promise<ImageUrlData[]> => {
    const response = await api.get<ImageListApiResponse>(
      API_ENDPOINTS.IMAGES.GET_BY_TYPE_AND_ID(type, referenceId)
    )
    return (response as unknown as ImageListApiResponse).data ?? (response as unknown as ImageUrlData[])
  },

  /**
   * Get the primary image (lowest sort_order) for a given entity.
   * GET /api/images/{type}/{referenceId}/primary
   * Returns null if no image exists.
   */
  getPrimary: async (
    type: ImageType,
    referenceId: string
  ): Promise<ImageUrlData | null> => {
    try {
      const response = await api.get<ImageApiResponse>(
        API_ENDPOINTS.IMAGES.GET_PRIMARY(type, referenceId)
      )
      return (response as unknown as ImageApiResponse).data ?? (response as unknown as ImageUrlData)
    } catch (error: any) {
      if (error?.status === 404) return null
      throw error
    }
  },

  /**
   * Delete image metadata record in DB.
   * DELETE /api/product/images/{imageId}
   */
  deleteById: async (imageId: string): Promise<void> => {
    await api.delete<unknown>(API_ENDPOINTS.IMAGES.DELETE(imageId))
  },
}
