export interface CreateShopPayload {
  shopName: string
  description: string
  address: string
  phoneNumber: string
  ownerId: string
}

export interface ShopInfo {
  shopId: string
  shopName: string
  description?: string | null
  address?: string | null
  phoneNumber?: string | null
  ownerId: string
  isActive?: boolean
  createdAt?: string
}

export interface ShopResponse<TData> {
  status: number
  message: string
  data: TData
  errors?: unknown
}

export type CreateShopResponse = ShopResponse<ShopInfo | null>
export type GetShopByOwnerResponse = ShopResponse<ShopInfo | null>
