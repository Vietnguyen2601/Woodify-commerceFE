export interface ShopNameCheckResponse {
  status: number
  message: string
  data: {
    available: boolean
    suggestion?: string
  }
  errors: unknown
}

export interface SellerRegistrationPayload {
  shopName: string
  pickupAddress: SellerAddressPayload
}

export interface SellerAddressPayload {
  fullName: string
  phone: string
  provinceCode: number
  provinceName: string
  districtCode: number
  districtName: string
  wardCode: number
  wardName: string
  detailAddress: string
  isDefault: boolean
}

export interface SellerRegistrationResponse {
  status: number
  message: string
  data: {
    shopId: string
    sellerId: string
  }
  errors: unknown
}
