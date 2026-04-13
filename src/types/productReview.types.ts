/**
 * Product Service — ProductReviews (public + buyer CreateReview)
 * @see docs/PRODUCT_REVIEWS_FEEDBACK_FE_API_GUIDE.md
 */

export interface ProductReviewDto {
  reviewId: string
  versionId: string
  productId: string
  orderId: string
  orderItemId: string
  accountId: string
  rating: number
  content: string | null
  isVisible: boolean
  shopResponse: string | null
  shopResponseAt: string | null
  createdAt: string
  updatedAt: string
  imageUrls: string[]
}

export interface CreateReviewRequest {
  versionId: string
  orderId: string
  orderItemId: string
  accountId: string
  rating: number
  content?: string
  imageUrls?: string[]
}
