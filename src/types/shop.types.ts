export interface CreateShopPayload {
  ownerAccountId: string
  name: string
  description: string
  logoUrl: string
  coverImageUrl: string
  defaultPickupAddress: string
  defaultProvider: string
}

export interface ShopInfo {
  shopId: string
  ownerId: string
  name: string
  description: string
  logoUrl: string
  coverImageUrl: string
  defaultPickupAddress: string
  defaultProvider: string
  rating: number
  reviewCount: number
  totalProducts: number
  totalOrders: number
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt?: string | null
}

export interface ShopResponse<TData> {
  status: number
  message: string
  data: TData
  errors?: unknown
}

export type CreateShopResponse = ShopResponse<ShopInfo>
export type GetShopByOwnerResponse = ShopResponse<ShopInfo>
