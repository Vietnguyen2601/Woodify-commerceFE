import { api } from './api/client'
import { API_ENDPOINTS } from '@/constants'
import type {
  GetProvidersParams,
  ShippingProvider,
  ShippingProvidersApiResponse,
} from '@/types'

/**
 * Nhà vận chuyển (Shipment Service), qua gateway `api`.
 *
 * Cùng path `/api/shipment/providers`:
 * - **GET** — danh sách (query `page`, `limit`); `getAllProviders` chỉ gọi GET này lặp trang.
 * - **POST** — tạo nhà vận chuyển (`createProvider`).
 *
 * Cập nhật/xóa theo id dùng route khác — xem `admin.service` (PUT/DELETE trên `/shipment/providers/{id}`).
 */
export const providerService = {
  /**
   * Danh sách có phân trang (`page`, `limit`).
   */
  getProviders: async (params?: GetProvidersParams): Promise<ShippingProvidersApiResponse> => {
    return api.get<ShippingProvidersApiResponse>(API_ENDPOINTS.PROVIDER.LIST, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })
  },

  /**
   * Lấy hết bản ghi: lặp GET danh sách cho đến khi hết trang.
   */
  getAllProviders: async (): Promise<ShippingProvider[]> => {
    const limit = 100
    let page = 1
    const out: ShippingProvider[] = []
    let total = Infinity
    for (let guard = 0; guard < 200; guard += 1) {
      const res = await api.get<ShippingProvidersApiResponse>(API_ENDPOINTS.PROVIDER.LIST, {
        params: { page, limit },
      })
      const batch = res?.providers ?? []
      out.push(...batch)
      total = res?.pagination?.total ?? out.length
      if (batch.length < limit || out.length >= total) break
      page += 1
    }
    return out
  },

  /**
   * Tạo nhà vận chuyển (thường dùng ở admin; POST cùng path với GET list).
   */
  createProvider: async (payload: Partial<ShippingProvider>): Promise<unknown> => {
    return api.post<unknown>(API_ENDPOINTS.PROVIDER.CREATE, payload)
  },
}
