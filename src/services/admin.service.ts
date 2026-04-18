import type { AxiosRequestConfig } from 'axios'
import { api, apiClient } from './api/client'
import { shopApi } from './api/shopClient'
import { productApi } from './api/productClient'
import { ADMIN_API, API_ENDPOINTS } from '@/constants'
import type {
  AccountDto,
  AdminOrderListParams,
  AdminOrderListPayload,
  AdminShopDto,
  AdminShopOrderDto,
  CategoryDto,
  EnrichedAdminOrder,
  ProductApprovalPayload,
  ProductMasterDto,
  ProductModerationDto,
  ProvidersPageDto,
  AdminShipmentDto,
  ShipmentProviderDto,
  ShopStatus,
  UpdateAccountStatusPayload,
  UpdateShopStatusPayload,
  TopCategoryAnalytics,
} from '@/types'
import type { ShippingProvider, ShipmentService } from '@/types/shipping.types'
import type { ImageUrlData } from '@/types/image.types'

function pickData<T>(raw: unknown): T {
  if (raw === null || raw === undefined) return raw as T
  if (typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data !== undefined) {
    return (raw as { data: T }).data
  }
  return raw as T
}

function coerceArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown }).items)) {
    return (raw as { items: T[] }).items
  }
  return []
}

/** GET /shipment/providers trả `providers` + `pagination` (camelCase); map sang DTO tab admin. */
function normalizeShipmentProviderRow(row: Record<string, unknown>): ShipmentProviderDto {
  const providerId = String(row.providerId ?? row.ProviderId ?? '')
  const providerName = String(row.name ?? row.providerName ?? row.ProviderName ?? '')
  const contactPhone =
    row.supportPhone != null && row.supportPhone !== ''
      ? String(row.supportPhone)
      : row.contactPhone != null
        ? String(row.contactPhone)
        : undefined
  const contactEmail =
    row.supportEmail != null && row.supportEmail !== ''
      ? String(row.supportEmail)
      : row.contactEmail != null
        ? String(row.contactEmail)
        : undefined
  const isActive = row.isActive ?? row.IsActive
  return {
    providerId,
    providerName,
    contactPhone,
    contactEmail,
    isActive: typeof isActive === 'boolean' ? isActive : undefined,
    createdDate:
      row.createdAt != null
        ? String(row.createdAt)
        : row.createdDate != null
          ? String(row.createdDate)
          : undefined,
  }
}

function parseShipmentProvidersPage(raw: unknown, page: number, limit: number): ProvidersPageDto | null {
  if (raw === null || raw === undefined) return null
  if (Array.isArray(raw)) {
    const items = (raw as Record<string, unknown>[]).map((p) =>
      normalizeShipmentProviderRow(p && typeof p === 'object' ? (p as Record<string, unknown>) : {}),
    )
    return { items, totalItems: items.length, pageNumber: page, pageSize: limit }
  }
  if (typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (Array.isArray(o.providers)) {
    const items = (o.providers as Record<string, unknown>[]).map((p) => normalizeShipmentProviderRow(p))
    const pag = o.pagination as { total?: number; page?: number; limit?: number } | undefined
    const total = typeof pag?.total === 'number' ? pag.total : items.length
    return {
      items,
      totalItems: total,
      pageNumber: typeof pag?.page === 'number' ? pag.page : page,
      pageSize: typeof pag?.limit === 'number' ? pag.limit : limit,
    }
  }
  if (Array.isArray(o.items)) {
    const items = (o.items as Record<string, unknown>[]).map((p) => normalizeShipmentProviderRow(p))
    return {
      items,
      totalItems: typeof o.totalItems === 'number' ? o.totalItems : items.length,
      pageNumber: typeof o.pageNumber === 'number' ? o.pageNumber : page,
      pageSize: typeof o.pageSize === 'number' ? o.pageSize : limit,
    }
  }
  return null
}

async function getFirstOk<T>(
  paths: readonly string[],
  config?: AxiosRequestConfig
): Promise<T> {
  let lastErr: unknown
  for (const url of paths) {
    try {
      const data = await apiClient.get(url, config)
      // apiClient.interceptors already unwraps .data, so 'data' is the actual data
      return data as T
    } catch (e: unknown) {
      lastErr = e
      const status = (e as { response?: { status?: number } })?.response?.status
      // Try next path on 404 (not found) or 5xx (server errors)
      // Only throw on 4xx client errors (except 404)
      if (status === 404 || (status && status >= 500)) continue
      throw e
    }
  }
  throw lastErr ?? new Error('Request failed')
}

async function getFirstOkOrEmpty<T>(paths: readonly string[], config?: AxiosRequestConfig): Promise<T> {
  try {
    return await getFirstOk<T>(paths, config)
  } catch {
    return [] as T
  }
}

async function patchFirstOk<T>(paths: readonly string[], body: unknown): Promise<T> {
  let lastErr: unknown
  for (const url of paths) {
    try {
      const data = await shopApi.patch<unknown>(url, body)
      // shopApi interceptor already unwraps, so return directly
      return data as T
    } catch (e: unknown) {
      lastErr = e
      const status = (e as { response?: { status?: number } })?.response?.status
      // Try next path on 404 (not found) or 5xx (server errors)
      if (status === 404 || (status && status >= 500)) continue
      throw e
    }
  }
  throw lastErr ?? new Error('PATCH failed')
}

function parseDate(value?: string): number {
  if (!value) return 0
  const t = Date.parse(value)
  return Number.isNaN(t) ? 0 : t
}

function orderTotal(o: AdminShopOrderDto): number {
  if (typeof o.totalAmountVnd === 'number') return o.totalAmountVnd
  if (typeof o.subtotalVnd === 'number') return o.subtotalVnd
  if (typeof o.totalPrice === 'number') return o.totalPrice
  const items = o.orderItems ?? o.items ?? []
  return items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
}

function firstLineItemName(o: AdminShopOrderDto): string {
  const items = o.orderItems ?? o.items ?? []
  return items[0]?.productName ?? '—'
}

function applyOrderFilters(orders: EnrichedAdminOrder[], p: AdminOrderListParams): EnrichedAdminOrder[] {
  let list = [...orders]
  if (p.status) {
    list = list.filter((o) => (o.status || '').toUpperCase() === p.status!.toUpperCase())
  }
  if (p.shopId) {
    list = list.filter((o) => o.shopId === p.shopId)
  }
  if (p.dateFrom) {
    const from = Date.parse(p.dateFrom)
    if (!Number.isNaN(from)) list = list.filter((o) => parseDate(o.createdDate) >= from)
  }
  if (p.dateTo) {
    const to = Date.parse(p.dateTo)
    if (!Number.isNaN(to)) list = list.filter((o) => parseDate(o.createdDate) <= to + 86400000)
  }
  if (p.minAmount !== undefined) {
    list = list.filter((o) => orderTotal(o) >= p.minAmount!)
  }
  if (p.maxAmount !== undefined) {
    list = list.filter((o) => orderTotal(o) <= p.maxAmount!)
  }
  const sortBy = p.sortBy || 'date'
  const order = p.sortOrder === 'asc' ? 1 : -1
  list.sort((a, b) => {
    if (sortBy === 'amount') return (orderTotal(a) - orderTotal(b)) * order
    if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '') * order
    return (parseDate(a.createdDate) - parseDate(b.createdDate)) * order
  })
  return list
}

async function fetchOrdersByShopId(shopId: string): Promise<AdminShopOrderDto[]> {
  const raw = await getFirstOkOrEmpty<unknown>(ADMIN_API.ORDERS.BY_SHOP(shopId), {
    validateStatus: () => true, // Accept all status codes for P0 endpoints
  })
  return coerceArray<AdminShopOrderDto>(raw)
}

async function aggregateOrdersFromShops(maxShops = 40): Promise<EnrichedAdminOrder[]> {
  const shops = await adminService.getAdminShops()
  const limited = shops.slice(0, maxShops)
  const batches = await Promise.all(
    limited.map(async (shop) => {
      try {
        const rows = await fetchOrdersByShopId(shop.shopId)
        return rows.map((o) => ({
          ...o,
          shopId: o.shopId ?? shop.shopId,
          shopName: shop.name || 'Unknown',
        }))
      } catch {
        return []
      }
    })
  )
  return batches.flat()
}

async function tryAdminOrderList(params: AdminOrderListParams): Promise<AdminOrderListPayload | null> {
  const query: Record<string, string | number | undefined> = {}
  if (params.page !== undefined) query.page = params.page
  if (params.limit !== undefined) query.limit = params.limit
  if (params.status) query.status = params.status
  if (params.dateFrom) query.dateFrom = params.dateFrom
  if (params.dateTo) query.dateTo = params.dateTo
  if (params.shopId) query.shopId = params.shopId
  if (params.accountId) query.accountId = params.accountId
  if (params.minAmount !== undefined) query.minAmount = params.minAmount
  if (params.maxAmount !== undefined) query.maxAmount = params.maxAmount
  if (params.sortBy) query.sortBy = params.sortBy
  if (params.sortOrder) query.sortOrder = params.sortOrder

  for (const path of ADMIN_API.ORDERS.ADMIN_ALL) {
    try {
      const res = await apiClient.get(path, {
        params: query,
        validateStatus: () => true, // Accept all status codes for P0 endpoints
      })
      const body = pickData<unknown>(res.data)
      if (body && typeof body === 'object') {
        const obj = body as AdminOrderListPayload
        if (Array.isArray(obj.items) || typeof obj.totalItems === 'number') {
          return obj
        }
      }
      const asArr = coerceArray<AdminShopOrderDto>(body)
      if (asArr.length) {
        return { items: asArr, totalItems: asArr.length, pageNumber: 1, pageSize: asArr.length }
      }
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 404) continue
    }
  }
  return null
}

export type AdminOrdersResult = {
  source: 'admin' | 'aggregate'
  orders: EnrichedAdminOrder[]
  totalItems: number
  pageNumber: number
  pageSize: number
}

export type RevenueTrendRange = 'day' | 'month' | 'quarter' | 'year'
export type RevenueTrendSeries = {
  labels: string[]
  gross: number[]
  commission: number[]
  net: number[]
}

function readNumField(obj: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

function normalizeRevenueTrendPayload(raw: unknown): RevenueTrendSeries {
  const source = pickData<unknown>(raw)
  const unwrapObject = (input: unknown): Record<string, unknown> => {
    let cur: unknown = input
    for (let i = 0; i < 4; i += 1) {
      if (!cur || typeof cur !== 'object' || Array.isArray(cur)) break
      const obj = cur as Record<string, unknown>
      const nested =
        (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data) ? obj.data : null) ??
        (obj.result && typeof obj.result === 'object' && !Array.isArray(obj.result) ? obj.result : null) ??
        (obj.payload && typeof obj.payload === 'object' && !Array.isArray(obj.payload) ? obj.payload : null)
      if (!nested) return obj
      cur = nested
    }
    return (cur && typeof cur === 'object' && !Array.isArray(cur) ? cur : {}) as Record<string, unknown>
  }
  const root = unwrapObject(source)

  const labels = Array.isArray(root.labels) ? root.labels.map((x) => String(x)) : null
  const gross = Array.isArray(root.gross) ? root.gross.map((x) => Number(x) || 0) : null
  const commission = Array.isArray(root.commission) ? root.commission.map((x) => Number(x) || 0) : null
  const net = Array.isArray(root.net) ? root.net.map((x) => Number(x) || 0) : null
  if (labels && gross && commission && net && labels.length) {
    return { labels, gross, commission, net }
  }

  const candidateArrays = [
    root.chartData,
    root.items,
    root.data,
    root.rows,
    root.points,
    root.series,
    root.values,
    source,
  ]
  const arr = candidateArrays.find((v) => Array.isArray(v)) as unknown[] | undefined
  if (arr && arr.length > 0) {
    const mapped = arr
      .map((item, idx) => {
        if (!item || typeof item !== 'object') return null
        const o = item as Record<string, unknown>
        const label =
          String(
            o.label ??
              o.period ??
              o.date ??
              o.day ??
              o.month ??
              o.quarter ??
              o.year ??
              o.name ??
              `#${idx + 1}`
          )
        const grossValue = readNumField(o, [
          'gross',
          'grossRevenue',
          'grossRevenueVnd',
          'grossRevenueCents',
          'totalRevenue',
          'revenue',
        ])
        const commissionValue = readNumField(o, [
          'commission',
          'commissionRevenue',
          'commissionVnd',
          'commissionCents',
          'platformCommission',
        ])
        const netValue = readNumField(o, ['net', 'netRevenue', 'netToShop', 'sellerNet'])
        return {
          label,
          gross: grossValue,
          commission: commissionValue,
          net: netValue || Math.max(0, grossValue - commissionValue),
        }
      })
      .filter(Boolean) as Array<{ label: string; gross: number; commission: number; net: number }>

    if (mapped.length > 0) {
      return {
        labels: mapped.map((x) => x.label),
        gross: mapped.map((x) => x.gross),
        commission: mapped.map((x) => x.commission),
        net: mapped.map((x) => x.net),
      }
    }
  }

  const grossSingle = readNumField(root, ['grossRevenue', 'gross', 'revenueToday', 'totalRevenue'])
  const commissionSingle = readNumField(root, ['commissionRevenue', 'commission', 'totalCommission', 'commissionToday'])
  const netSingle = readNumField(root, ['netRevenue', 'net', 'netToday'])
  if (grossSingle || commissionSingle || netSingle) {
    return {
      labels: ['Today'],
      gross: [grossSingle],
      commission: [commissionSingle],
      net: [netSingle || Math.max(0, grossSingle - commissionSingle)],
    }
  }

  const summary =
    root.summary && typeof root.summary === 'object'
      ? (root.summary as Record<string, unknown>)
      : null
  if (summary) {
    const grossFromSummary = readNumField(summary, ['totalGrossRevenue'])
    const commissionFromSummary = readNumField(summary, ['totalCommissionRevenue'])
    const netFromSummary = readNumField(summary, ['totalNetRevenue'])
    return {
      labels: ['Summary'],
      gross: [grossFromSummary],
      commission: [commissionFromSummary],
      net: [netFromSummary || Math.max(0, grossFromSummary - commissionFromSummary)],
    }
  }

  return { labels: [], gross: [], commission: [], net: [] }
}

export const adminService = {
  // ── Marketing images (BANNER / ADS) ────────────────────────────────────────
  getAllBanners: async (): Promise<ImageUrlData[]> => {
    const raw = await productApi.get<unknown>(API_ENDPOINTS.IMAGES.LIST_BY_TYPE('BANNER'))
    return coerceArray<ImageUrlData>(raw)
  },

  getAllAds: async (): Promise<ImageUrlData[]> => {
    const raw = await productApi.get<unknown>(API_ENDPOINTS.IMAGES.LIST_BY_TYPE('ADS'))
    return coerceArray<ImageUrlData>(raw)
  },

  deleteBanner: async (imageId: string): Promise<void> => {
    await productApi.delete<unknown>(API_ENDPOINTS.IMAGES.DELETE(imageId))
  },

  deleteAd: async (imageId: string): Promise<void> => {
    await productApi.delete<unknown>(API_ENDPOINTS.IMAGES.DELETE(imageId))
  },
  getRevenueTrend: async (range: RevenueTrendRange): Promise<RevenueTrendSeries> => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const today = `${yyyy}-${mm}-${dd}`
    const monthStart = `${yyyy}-${mm}-01`

    const fetchTodayFallback = async (): Promise<RevenueTrendSeries> => {
      const todayMetrics = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.METRICS_TODAY)
      return normalizeRevenueTrendPayload(todayMetrics)
    }

    if (range === 'day') {
      const todayMetrics = await fetchTodayFallback()
      const normalizedToday = normalizeRevenueTrendPayload(todayMetrics)
      if (normalizedToday.labels.length > 0) return normalizedToday

      const daily = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.REVENUE_DAILY, {
        params: { startDate: today, endDate: today },
      })
      return normalizeRevenueTrendPayload(daily)
    }

    if (range === 'month') {
      const monthly = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.REVENUE_CUSTOM, {
        params: { startDate: monthStart, endDate: today, granularity: 'DAILY' },
      })
      const normalizedMonthly = normalizeRevenueTrendPayload(monthly)
      if (normalizedMonthly.labels.length > 0) return normalizedMonthly

      const daily = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.REVENUE_DAILY, {
        params: { startDate: monthStart, endDate: today },
      })
      const normalizedDaily = normalizeRevenueTrendPayload(daily)
      if (normalizedDaily.labels.length > 0) return normalizedDaily

      return fetchTodayFallback()
    }

    if (range === 'quarter') {
      const quarterly = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.REVENUE_QUARTERLY)
      const normalizedQuarterly = normalizeRevenueTrendPayload(quarterly)
      if (normalizedQuarterly.labels.length > 0) return normalizedQuarterly

      const customQuarterly = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.REVENUE_CUSTOM, {
        params: { startDate: monthStart, endDate: today, granularity: 'QUARTERLY' },
      })
      const normalizedCustomQuarterly = normalizeRevenueTrendPayload(customQuarterly)
      if (normalizedCustomQuarterly.labels.length > 0) return normalizedCustomQuarterly

      return fetchTodayFallback()
    }

    const yearly = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.REVENUE_YEARLY)
    const normalizedYearly = normalizeRevenueTrendPayload(yearly)
    if (normalizedYearly.labels.length > 0) return normalizedYearly

    const customYearly = await getFirstOkOrEmpty<unknown>(ADMIN_API.DASHBOARD.REVENUE_CUSTOM, {
      params: { startDate: `${yyyy}-01-01`, endDate: today, granularity: 'YEARLY' },
    })
    const normalizedCustomYearly = normalizeRevenueTrendPayload(customYearly)
    if (normalizedCustomYearly.labels.length > 0) return normalizedCustomYearly

    return fetchTodayFallback()
  },

  /**
   * Top danh mục theo lượng bán (GET Order service analytics).
   * Gateway: /api/order/analytics/top-categories?topN= hoặc /api/analytics/top-categories?topN=
   */
  getTopCategories: async (topN = 10): Promise<TopCategoryAnalytics[]> => {
    const raw = await getFirstOkOrEmpty<unknown>(ADMIN_API.ANALYTICS_TOP_CATEGORIES(topN))
    return coerceArray<TopCategoryAnalytics>(raw)
  },

  getAdminShops: async (): Promise<AdminShopDto[]> => {
    const raw = await getFirstOkOrEmpty<unknown>(ADMIN_API.SHOPS.GET_ALL_ADMIN)
    return coerceArray<AdminShopDto>(raw)
  },

  updateShopStatus: async (shopId: string, payload: UpdateShopStatusPayload): Promise<unknown> => {
    const paths = ADMIN_API.SHOPS.PATCH_STATUS(shopId) as unknown as readonly string[]
    return patchFirstOk(paths, payload)
  },

  getAllAccounts: async (): Promise<AccountDto[]> => {
    const raw = await getFirstOkOrEmpty<unknown>([ADMIN_API.ACCOUNTS.GET_ALL])
    return coerceArray<AccountDto>(raw)
  },

  getAccountsByIds: async (accountIds: string[]): Promise<AccountDto[]> => {
    if (accountIds.length === 0) return []
    const unique = [...new Set(accountIds)]
    try {
      const results = await Promise.allSettled(
        unique.map((id) =>
          apiClient.get<AccountDto>(ADMIN_API.ACCOUNTS.GET_BY_ID(id)).catch(() => null)
        )
      )
      return results
        .filter((r) => r.status === 'fulfilled' && r.value)
        .map((r) => (r as PromiseFulfilledResult<AccountDto | null>).value)
        .filter(Boolean) as AccountDto[]
    } catch {
      return []
    }
  },

  updateAccountStatus: async (accountId: string, payload: UpdateAccountStatusPayload): Promise<unknown> => {
    const paths = ADMIN_API.ACCOUNTS.UPDATE_STATUS(accountId) as unknown as readonly string[]
    return patchFirstOk(paths, payload)
  },

  getAllProductMasters: async (): Promise<ProductMasterDto[]> => {
    const raw = await getFirstOkOrEmpty<unknown>(ADMIN_API.PRODUCT_MASTERS.GET_ALL)
    return coerceArray<ProductMasterDto>(raw)
  },

  getProductsByShopId: async (shopId: string): Promise<ProductMasterDto[]> => {
    const raw = await getFirstOkOrEmpty<unknown>(ADMIN_API.PRODUCT_MASTERS.BY_SHOP(shopId))
    return coerceArray<ProductMasterDto>(raw)
  },

  getAllShipments: async (): Promise<AdminShipmentDto[]> => {
    const raw = await api.get<unknown>(API_ENDPOINTS.SHIPMENTS.LIST)
    return coerceArray<AdminShipmentDto>(raw)
  },

  getShipmentProviders: async (page = 1, limit = 50): Promise<ProvidersPageDto> => {
    try {
      const raw = await getFirstOk<unknown>(ADMIN_API.SHIPMENT_PROVIDERS.LIST, {
        params: { page, limit },
      })
      const parsed = parseShipmentProvidersPage(raw, page, limit)
      if (parsed) return parsed
      const fallbackItems = coerceArray<ShipmentProviderDto>(raw)
      if (fallbackItems.length) {
        return {
          items: fallbackItems,
          totalItems: fallbackItems.length,
          pageNumber: page,
          pageSize: limit,
        }
      }
    } catch {
      /* try direct gateway path */
    }
    try {
      const raw = await api.get<unknown>(API_ENDPOINTS.PROVIDER.LIST, { params: { page, limit } })
      const parsed = parseShipmentProvidersPage(raw, page, limit)
      if (parsed) return parsed
    } catch {
      /* optional */
    }
    return { items: [], totalItems: 0, pageNumber: page, pageSize: limit }
  },

  // ── ShipmentService (admin config) ─────────────────────────────────────────
  getShippingProviders: async (page = 1, limit = 50): Promise<ProvidersPageDto> => {
    return adminService.getShipmentProviders(page, limit)
  },

  createShippingProvider: async (payload: Partial<ShippingProvider>): Promise<unknown> => {
    return api.post<unknown>(API_ENDPOINTS.PROVIDER.CREATE, payload)
  },

  updateShippingProvider: async (providerId: string, payload: Partial<ShippingProvider>): Promise<unknown> => {
    return api.put<unknown>(API_ENDPOINTS.PROVIDER.UPDATE(providerId), payload)
  },

  deleteShippingProvider: async (providerId: string): Promise<unknown> => {
    return api.delete<unknown>(API_ENDPOINTS.PROVIDER.DELETE(providerId))
  },

  listProviderServices: async (): Promise<ShipmentService[]> => {
    const raw = await api.get<unknown>(API_ENDPOINTS.SHIPMENT_SERVICES.LIST)
    return coerceArray<ShipmentService>(raw)
  },

  listProviderServicesByProvider: async (providerId: string): Promise<ShipmentService[]> => {
    const raw = await api.get<unknown>(API_ENDPOINTS.SHIPMENT_SERVICES.BY_PROVIDER(providerId))
    return coerceArray<ShipmentService>(raw)
  },

  updateProviderService: async (serviceId: string, payload: Partial<ShipmentService>): Promise<unknown> => {
    return api.patch<unknown>(API_ENDPOINTS.SHIPMENT_SERVICES.UPDATE(serviceId), payload)
  },

  deleteProviderService: async (serviceId: string): Promise<unknown> => {
    return api.delete<unknown>(API_ENDPOINTS.SHIPMENT_SERVICES.DELETE(serviceId))
  },

  /**
   * Resolves platform orders: prefers P0 admin list when backend exposes it; otherwise merges GET /orders/Shop/{shopId} per shop (documented gap).
   */
  getAdminOrders: async (params: AdminOrderListParams = {}): Promise<AdminOrdersResult> => {
    const pageSize = params.limit ?? 20
    const pageNumber = params.page ?? 1

    const admin = await tryAdminOrderList(params)
    if (admin?.items && (admin.items.length > 0 || admin.totalItems !== undefined)) {
      const enriched = (admin.items ?? []).map((o) => ({ ...o })) as EnrichedAdminOrder[]
      return {
        source: 'admin',
        orders: enriched,
        totalItems: admin.totalItems ?? enriched.length,
        pageNumber: admin.pageNumber ?? pageNumber,
        pageSize: admin.pageSize ?? pageSize,
      }
    }

    const merged = await aggregateOrdersFromShops()
    const filtered = applyOrderFilters(merged, params)
    const totalItems = filtered.length
    const start = (pageNumber - 1) * pageSize
    const orders = filtered.slice(start, start + pageSize)
    return {
      source: 'aggregate',
      orders,
      totalItems,
      pageNumber,
      pageSize,
    }
  },

  /** KPIs for dashboard when dedicated statistics APIs are not available */
  getDashboardSnapshot: async () => {
    const [shops, products, accounts] = await Promise.all([
      adminService.getAdminShops(),
      adminService.getAllProductMasters(),
      adminService.getAllAccounts().catch(() => [] as AccountDto[]),
    ])

    const pendingShops = shops.filter((s) => (s.status as ShopStatus | undefined) === 'PENDING').length
    const ordersMerged = await aggregateOrdersFromShops(25)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const todayOrders = ordersMerged.filter((o) => parseDate(o.createdDate) >= startOfDay)
    const revenueToday = todayOrders.reduce((s, o) => s + orderTotal(o), 0)
    const revenueAll = ordersMerged.reduce((s, o) => s + orderTotal(o), 0)

    const shopRevenueMap = new Map<string, { name: string; revenue: number }>()
    for (const o of ordersMerged) {
      const sid = o.shopId || ''
      const name = o.shopName || '—'
      const cur = shopRevenueMap.get(sid) || { name, revenue: 0 }
      cur.revenue += orderTotal(o)
      cur.name = name
      shopRevenueMap.set(sid, cur)
    }
    const topShops = [...shopRevenueMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const dayMs = 86400000
    const thirtyDaysAgo = startOfDay - 30 * dayMs
    const recentWindow = ordersMerged.filter((o) => parseDate(o.createdDate) >= thirtyDaysAgo)
    const orderTrend = Array.from({ length: 6 }, (_, i) => {
      const from = thirtyDaysAgo + i * 5 * dayMs
      const to = from + 5 * dayMs
      const value = recentWindow.filter((o) => {
        const t = parseDate(o.createdDate)
        return t >= from && t < to
      }).length
      const labelDate = new Date(from + 2 * dayMs)
      const day = labelDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return { day, value }
    })

    const shopNameById: Record<string, string> = Object.fromEntries(
      shops.map((s) => [s.shopId, s.name || 'Unknown'])
    )

    return {
      totalShops: shops.length,
      totalProducts: products.length,
      totalUsers: accounts.length,
      pendingShopApprovals: pendingShops,
      ordersToday: todayOrders.length,
      revenueToday,
      revenueAll,
      shopNameById,
      ordersSample: ordersMerged
        .slice()
        .sort((a, b) => parseDate(b.createdDate) - parseDate(a.createdDate))
        .slice(0, 8),
      topShopsByRevenue: topShops,
      productsSample: products.slice(0, 5),
      orderTrend,
    }
  },
}

export const adminOrderUtils = {
  orderTotal,
  firstLineItemName,
}
