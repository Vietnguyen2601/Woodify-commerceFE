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
  receiverName: string
  phone: string
  provinceCode: string
  provinceName: string
  districtCode: string
  districtName: string
  wardCode: string
  wardName: string
  addressLine: string
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
