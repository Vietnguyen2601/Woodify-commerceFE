import { productApi } from './api/productClient'
import { API_ENDPOINTS } from '@/constants'
import type { DistrictDTO, LocationListResponse, ProvinceDTO, WardDTO } from '@/types'

export const locationService = {
  getProvinces: async (): Promise<LocationListResponse<ProvinceDTO>> => {
    return productApi.get<LocationListResponse<ProvinceDTO>>(API_ENDPOINTS.LOCATION.PROVINCES)
  },

  getDistricts: async (provinceCode: string): Promise<LocationListResponse<DistrictDTO>> => {
    return productApi.get<LocationListResponse<DistrictDTO>>(API_ENDPOINTS.LOCATION.DISTRICTS(provinceCode))
  },

  getWards: async (districtCode: string): Promise<LocationListResponse<WardDTO>> => {
    return productApi.get<LocationListResponse<WardDTO>>(API_ENDPOINTS.LOCATION.WARDS(districtCode))
  },
}
