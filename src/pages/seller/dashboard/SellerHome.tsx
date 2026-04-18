import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DashboardCard from '../components/DashboardCard'
import SellerRevenueTrendChart from './SellerRevenueTrendChart'
import SellerTopSellingProductsChart from './SellerTopSellingProductsChart'
import SellerDashboardAnalytics from './SellerDashboardAnalytics'
import { useShopStore } from '@/store/shopStore'
import { orderService, queryKeys, shipmentService, shopService } from '@/services'
import { SHIP_QUERY_KEY, buildShipmentByOrderIdMap } from '../orders/shipmentSellerUi'
import { resolveSellerOrderStage, type SellerOrderStage } from '../orders/sellerOrderStage'
import type { SellerOrder, ShopRevenueTrend } from '@/types'

const DASHBOARD_REVENUE_DAYS = 7

const vndFull = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

function formatFullVnd(n: number): string {
  return vndFull.format(Math.round(n))
}

/** YYYY-MM-DD theo timezone local (đồng bộ với cách bucket ngày trên UI) */
function localDateKey(d: Date): string {
  return d.toLocaleDateString('en-CA')
}

function revenueOnLocalDay(trend: ShopRevenueTrend | undefined, day: Date): number {
  if (!trend?.dailyRevenue?.length) return 0
  const key = localDateKey(day)
  const row = trend.dailyRevenue.find((r) => localDateKey(new Date(r.date)) === key)
  return row?.revenue ?? 0
}

function todayRevenueTrendCopy(todayVnd: number, yesterdayVnd: number): {
  trend: string
  status: 'positive' | 'negative' | 'neutral'
} {
  if (todayVnd === 0 && yesterdayVnd === 0) {
    return { trend: 'Không có dữ liệu hôm qua', status: 'neutral' }
  }
  if (yesterdayVnd <= 0) {
    if (todayVnd > 0) return { trend: 'Có doanh thu trong ngày', status: 'positive' }
    return { trend: 'So với hôm qua: 0 ₫', status: 'neutral' }
  }
  const pct = ((todayVnd - yesterdayVnd) / yesterdayVnd) * 100
  const rounded = Math.round(pct)
  const sign = rounded > 0 ? '+' : ''
  return {
    trend: `${sign}${rounded}% so với hôm qua`,
    status: rounded >= 0 ? 'positive' : 'negative',
  }
}

/** Gộp đơn theo giai đoạn hiển thị (cùng logic trang Tất cả đơn) */
function countOrdersByWorkStage(
  orders: SellerOrder[],
  shipmentByOrderId: ReturnType<typeof buildShipmentByOrderIdMap>
): Record<'handover' | 'prepare' | 'in_delivery' | 'exception', number> {
  const m = { handover: 0, prepare: 0, in_delivery: 0, exception: 0 }
  for (const o of orders) {
    const ship = shipmentByOrderId.get(o.orderId) ?? null
    const stage = resolveSellerOrderStage(o.status, ship) as SellerOrderStage
    if (stage === 'done') continue
    if (stage === 'handover') m.handover += 1
    else if (stage === 'prepare') m.prepare += 1
    else if (stage === 'in_delivery') m.in_delivery += 1
    else if (stage === 'exception') m.exception += 1
  }
  return m
}

export default function SellerHome() {
  const shopId = useShopStore((s) => s.shop?.shopId ?? '')

  const { data: shopOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-shop-orders', shopId],
    queryFn: () => orderService.getShopOrders(shopId),
    enabled: !!shopId,
  })

  const { data: shopShipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: [SHIP_QUERY_KEY, shopId],
    queryFn: () => shipmentService.listShipmentsByShop(shopId),
    enabled: !!shopId,
  })

  const shipmentByOrderId = React.useMemo(
    () => buildShipmentByOrderIdMap(shopShipments),
    [shopShipments]
  )

  const workCounts = React.useMemo(
    () => countOrdersByWorkStage(shopOrders, shipmentByOrderId),
    [shopOrders, shipmentByOrderId]
  )

  const workQueueItems = React.useMemo(
    () => [
      {
        id: 'handover',
        label: 'Chờ lấy hàng',
        count: workCounts.handover,
        severity: 'high' as const,
      },
      {
        id: 'prepare',
        label: 'Đã xử lý',
        count: workCounts.prepare,
        severity: 'medium' as const,
      },
      {
        id: 'in_delivery',
        label: 'Đơn hàng đang giao',
        count: workCounts.in_delivery,
        severity: 'medium' as const,
      },
      {
        id: 'exception',
        label: 'Trả / Hoàn / Hủy',
        count: workCounts.exception,
        severity: 'high' as const,
      },
    ],
    [workCounts]
  )

  const workLoading = ordersLoading || shipmentsLoading

  const { data: revenueTrend, isLoading: revenueLoading, isError: revenueError } = useQuery({
    queryKey: queryKeys.seller.revenueTrend(shopId, DASHBOARD_REVENUE_DAYS),
    queryFn: () => shopService.getRevenueTrend(shopId, DASHBOARD_REVENUE_DAYS),
    enabled: !!shopId,
  })

  const todayRev = React.useMemo(() => {
    if (!shopId) return 0
    return revenueOnLocalDay(revenueTrend, new Date())
  }, [shopId, revenueTrend])

  const yesterdayRev = React.useMemo(() => {
    if (!shopId) return 0
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return revenueOnLocalDay(revenueTrend, d)
  }, [shopId, revenueTrend])

  const todayCard = React.useMemo(() => {
    if (!shopId) {
      return { title: 'Doanh thu hôm nay', value: '—', trend: 'Chưa có shop', status: 'neutral' as const }
    }
    if (revenueError) {
      return {
        title: 'Doanh thu hôm nay',
        value: '—',
        trend: 'Không tải được dữ liệu doanh thu',
        status: 'neutral' as const,
      }
    }
    if (revenueLoading && revenueTrend === undefined) {
      return { title: 'Doanh thu hôm nay', value: '…', trend: 'Đang tải…', status: 'neutral' as const }
    }
    const { trend, status } = todayRevenueTrendCopy(todayRev, yesterdayRev)
    return {
      title: 'Doanh thu hôm nay',
      value: `${formatFullVnd(todayRev)} ₫`,
      trend,
      status,
    }
  }, [shopId, revenueError, revenueLoading, revenueTrend, todayRev, yesterdayRev])

  return (
    <div className='seller-home'>
      <section className='seller-home__workbench'>
        <div className='seller-home__section-header'>
          <div>
            <p className='seller-home__eyebrow'>Danh sách cần làm</p>
            <h2>Xử lý các đầu việc ưu tiên trong ngày</h2>
          </div>
          <Link
            to='/seller/orders'
            className='rounded-2xl border border-amber-900/25 bg-white px-4 py-2 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50'
          >
            Xem tất cả
          </Link>
        </div>
        <div className='seller-home__work-grid'>
          {workQueueItems.map((item) => (
            <article key={item.id} className={`seller-home__work-card seller-home__work-card--${item.severity}`}>
              <header>
                <p>{item.label}</p>
                <strong>{workLoading ? '…' : item.count}</strong>
              </header>
            </article>
          ))}
        </div>
      </section>

      <section className='seller-home__kpi seller-home__kpi--split'>
        <DashboardCard
          key={todayCard.title}
          title={todayCard.title}
          value={todayCard.value}
          trend={todayCard.trend}
          status={todayCard.status}
          highlight={todayCard.status === 'positive'}
        />
        {shopId ? <SellerDashboardAnalytics shopId={shopId} /> : null}
      </section>

      <section className='seller-home__charts'>
        {shopId ? <SellerRevenueTrendChart shopId={shopId} /> : null}

        {shopId ? <SellerTopSellingProductsChart shopId={shopId} /> : null}
      </section>
    </div>
  )
}
