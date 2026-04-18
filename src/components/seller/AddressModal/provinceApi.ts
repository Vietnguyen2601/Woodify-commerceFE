import type { District, DistrictWithWards, Province, ProvinceWithDistricts, Ward } from './types'
import { getProvincesOpenApiBase } from '@/constants/externalUrls'

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${getProvincesOpenApiBase()}${path}`, { signal })

  if (!response.ok) {
    throw new Error(`Province API request failed for ${path}`)
  }

  return (await response.json()) as T
}

async function getProvinces(signal?: AbortSignal): Promise<Province[]> {
  return fetchJson<Province[]>('/p/', signal)
}

async function getDistricts(provinceCode: number, signal?: AbortSignal): Promise<District[]> {
  if (!Number.isFinite(provinceCode)) {
    return []
  }

  const data = await fetchJson<ProvinceWithDistricts>(`/p/${provinceCode}?depth=2`, signal)
  return data.districts ?? []
}

async function getWards(districtCode: number, signal?: AbortSignal): Promise<Ward[]> {
  if (!Number.isFinite(districtCode)) {
    return []
  }

  const data = await fetchJson<DistrictWithWards>(`/d/${districtCode}?depth=2`, signal)
  return data.wards ?? []
}

export const provinceApi = {
  getProvinces,
  getDistricts,
  getWards,
}
