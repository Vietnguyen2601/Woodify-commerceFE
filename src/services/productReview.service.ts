import { API_ENDPOINTS } from '@/constants/api.endpoints'
import type { CreateReviewRequest, ProductReviewDto } from '@/types/productReview.types'
import { productApi } from './api/productClient'

function getErrStatus(e: unknown): number | undefined {
  return typeof e === 'object' && e && 'status' in e ? (e as { status?: number }).status : undefined
}

async function safeGetReviewsByOrder(orderId: string): Promise<ProductReviewDto[]> {
  try {
    return await productApi.get<ProductReviewDto[]>(
      API_ENDPOINTS.PRODUCT_REVIEWS.GET_BY_ORDER(orderId)
    )
  } catch (e: unknown) {
    if (getErrStatus(e) === 404) return []
    throw e
  }
}

async function safeGetReviewsByProduct(productId: string): Promise<ProductReviewDto[]> {
  try {
    return await productApi.get<ProductReviewDto[]>(
      API_ENDPOINTS.PRODUCT_REVIEWS.GET_BY_PRODUCT(productId)
    )
  } catch (e: unknown) {
    if (getErrStatus(e) === 404) return []
    throw e
  }
}

export const productReviewService = {
  getVisibleReviews: (productId: string) =>
    productApi.get<ProductReviewDto[]>(API_ENDPOINTS.PRODUCT_REVIEWS.GET_VISIBLE(productId)),

  /** Seller / quản trị — có thể gồm review ẩn */
  getReviewsByProductId: (productId: string) => safeGetReviewsByProduct(productId),

  createReview: (body: CreateReviewRequest) =>
    productApi.post<ProductReviewDto>(API_ENDPOINTS.PRODUCT_REVIEWS.CREATE, body),

  getReviewsByOrderId: (orderId: string) => safeGetReviewsByOrder(orderId),

  addShopResponse: (reviewId: string, shopResponse: string) =>
    productApi.post<ProductReviewDto>(API_ENDPOINTS.PRODUCT_REVIEWS.ADD_SHOP_RESPONSE(reviewId), {
      shopResponse,
    }),

  hideReview: (reviewId: string) =>
    productApi.post<ProductReviewDto>(API_ENDPOINTS.PRODUCT_REVIEWS.HIDE(reviewId), {}),

  unhideReview: (reviewId: string) =>
    productApi.post<ProductReviewDto>(API_ENDPOINTS.PRODUCT_REVIEWS.UNHIDE(reviewId), {}),

  deleteReview: (reviewId: string) =>
    productApi.delete<ProductReviewDto>(API_ENDPOINTS.PRODUCT_REVIEWS.DELETE(reviewId)),
}
