export interface CreateShopPayload {
  shopName: string
  description: string
  address: string
  phoneNumber: string
  ownerId: string
}

export interface ShopInfo {
  shopId?: string
  ownerId?: string
  [key: string]: unknown
}

export interface CreateShopResponse {
  status: number
  message: string
  data?: ShopInfo
  errors?: unknown
}
