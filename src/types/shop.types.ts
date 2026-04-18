export interface CreateShopPayload {
  ownerAccountId: string
  name: string
  description: string
  logoUrl: string
  coverImageUrl: string
  defaultPickupAddress: string
  defaultProvider: string
}

/** PATCH /shop/Shops/UpdateShopInfo/{shopId} */
export interface UpdateShopInfoPayload {
  name: string
  description: string
  logoUrl: string
  coverImageUrl: string
  defaultPickupAddress: string
  defaultProvider: string
}

/** Điểm doanh thu theo ngày — Shop dashboard API */
export interface ShopDailyRevenuePoint {
  date: string
  revenue: number
  ordersCount: number
  completedOrdersCount: number
}

export interface ShopRevenueTrend {
  dailyRevenue: ShopDailyRevenuePoint[]
  totalRevenue: number
  totalOrders: number
  averageDailyRevenue: number
  startDate: string
  endDate: string
}

/** GET .../analytics/monthly?year= */
export interface ShopMonthlyAnalyticsRow {
  month: number
  monthName: string
  revenue: number
  ordersCount: number
  completedOrdersCount: number
  avgOrderValue: number
}

export interface ShopMonthlyAnalytics {
  year: number
  monthlyData: ShopMonthlyAnalyticsRow[]
  totalRevenue: number
  totalOrders: number
  averageMonthlyRevenue: number
  highestRevenueMonth: number
  lowestRevenueMonth: number
}

/** GET .../analytics/quarterly?year= */
export interface ShopQuarterlyAnalyticsRow {
  quarter: number
  quarterName: string
  revenue: number
  ordersCount: number
  avgMonthlyInQuarter: number
  growthPercent: number
}

export interface ShopQuarterlyAnalytics {
  year: number
  quarterlyData: ShopQuarterlyAnalyticsRow[]
  totalRevenue: number
  /** Cùng shape một dòng quarterlyData */
  highestQuarter: ShopQuarterlyAnalyticsRow
  lowestQuarter: ShopQuarterlyAnalyticsRow
}

/** GET .../analytics/yearly?startYear=&endYear= */
export interface ShopYearlyAnalyticsRow {
  year: number
  revenue: number
  ordersCount: number
  growthPercent: number
  avgMonthlyRevenue: number
}

export interface ShopYearlyAnalytics {
  startYear: number
  endYear: number
  yearlyData: ShopYearlyAnalyticsRow[]
  totalRevenue: number
  averageYearlyRevenue: number
  /** Cùng shape một dòng yearlyData */
  highestYear: ShopYearlyAnalyticsRow
  lowestYear: ShopYearlyAnalyticsRow
}

/** Thông tin tài khoản ngân hàng nhận tiền (Shop service) */
export interface ShopBankAccount {
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
}

export interface ShopInfo {
  shopId: string
  ownerId: string
  name: string
  description: string
  logoUrl: string
  coverImageUrl: string
  defaultPickupAddress: string
  defaultProvider: string
  rating: number
  reviewCount: number
  totalProducts: number
  totalOrders: number
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt?: string | null
}

export interface ShopResponse<TData> {
  status: number
  message: string
  data: TData
  errors?: unknown
}

export type CreateShopResponse = ShopResponse<ShopInfo>
export type GetShopByOwnerResponse = ShopResponse<ShopInfo>
