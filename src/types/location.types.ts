export interface ProvinceDTO {
  code: string
  name: string
}

export interface DistrictDTO {
  code: string
  name: string
  provinceCode: string
}

export interface WardDTO {
  code: string
  name: string
  districtCode: string
}

export interface LocationListResponse<T> {
  status: number
  message: string
  data: T[]
  errors: unknown
}
