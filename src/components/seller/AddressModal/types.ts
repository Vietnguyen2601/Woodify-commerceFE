import type { SellerAddressPayload } from '@/types'

export interface Province {
  code: number
  name: string
  division_type?: string
}

export interface District {
  code: number
  name: string
  division_type?: string
}

export interface Ward {
  code: number
  name: string
  division_type?: string
}

export interface ProvinceWithDistricts extends Province {
  districts: District[]
}

export interface DistrictWithWards extends District {
  wards: Ward[]
}

export type PickupAddressPayload = SellerAddressPayload

export interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: PickupAddressPayload) => void | Promise<void>
  initialValue?: PickupAddressPayload | null
}

export interface AddressFormState {
  fullName: string
  phone: string
  provinceCode: string
  districtCode: string
  wardCode: string
  detailAddress: string
  isDefault: boolean
}

export type AddressFormField = Exclude<keyof AddressFormState, 'isDefault'>
export type FormErrors = Partial<Record<AddressFormField, string>>
