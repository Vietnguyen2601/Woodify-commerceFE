import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminOrderUtils, adminService, queryKeys } from '@/services'
import { ROUTES } from '@/constants'

const iconStroke = 'currentColor'

type MetricCard = {
  label: string
  value: string
  hint: string
  accent: string
  icon: 'store' | 'package' | 'clipboard' | 'cart' | 'gmv' | 'users'
}

const StatIcon: React.FC<{ variant: string; accent: string }> = ({ variant, accent }) => {
  const strokeWidth = 1.5
  const colorClass = accent.split(' ').find((item) => item.startsWith('text-'))?.replace('text-', 'text-') || 'text-stone-500'

  const commonProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round' as const }

  switch (variant) {
    case 'store':
      return (
        <svg {...commonProps} className={colorClass}>
          <path d='M3 10h18l-2-6H5z' />
          <path d='M4 10v9h16v-9' />
          <path d='M10 14v5' />
          <path d='M14 14v5' />
        </svg>
      )
    case 'package':
      return (
        <svg {...commonProps} className={colorClass}>
          <path d='M3 7l9-4 9 4-9 4-9-4z' />
          <path d='M3 7v10l9 4 9-4V7' />
          <path d='M12 11v10' />
        </svg>
      )
    case 'clipboard':
      return (
        <svg {...commonProps} className={colorClass}>
          <rect x='6' y='4' width='12' height='16' rx='2' />
          <path d='M9 4V2h6v2' />
          <path d='M9 10h6' />
          <path d='M9 14h4' />
        </svg>
      )
    case 'cart':
      return (
        <svg {...commonProps} className={colorClass}>
          <path d='M4 5h2l2 12h10l2-8H8' />
          <path d='M10 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' />
          <path d='M18 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' />
        </svg>
      )
    case 'gmv':
      return (
        <svg {...commonProps} className={colorClass}>
          <path d='M4 17h5V7H4z' />
          <path d='M10 17h5V4h-5z' />
          <path d='M16 17h4V9h-4z' />
        </svg>
      )
    case 'users':
      return (
        <svg {...commonProps} className={colorClass}>
          <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
          <circle cx='9' cy='7' r='4' />
          <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
          <path d='M16 3.13a4 4 0 0 1 0 7.75' />
        </svg>
      )
    default:
      return null
  }
}

const statusStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const orderStatusTone = (status?: string): keyof typeof statusStyles => {
  const s = (status || '').toUpperCase()
  if (s.includes('DELIVER')) return 'success'
  if (s.includes('SHIP')) return 'info'
  if (s.includes('CONFIRM')) return 'info'
  if (s.includes('PEND')) return 'pending'
  if (s.includes('CANCEL')) return 'warning'
  return 'pending'
}

export default function AdminHome() {
  const { isVietnamese } = useAppLanguage()
  const [revenueRange, setRevenueRange] = React.useState<'day' | 'month' | 'quarter' | 'year'>('month')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.snapshot(),
    queryFn: adminService.getDashboardSnapshot,
    staleTime: 60 * 1000,
  })
  const { data: revenueFromApi, isLoading: isRevenueLoading } = useQuery({
    queryKey: queryKeys.admin.revenue(revenueRange),
    queryFn: () => adminService.getRevenueTrend(revenueRange),
    staleTime: 60 * 1000,
  })

  const metricCards = React.useMemo(() => {
    if (!data) return [] as MetricCard[]
    return [
      {
        label: isVietnamese ? 'Tổng cửa hàng' : 'Total Shops',
        value: String(data.totalShops),
        hint: isVietnamese ? 'Dữ liệu realtime' : 'Live data',
        accent: 'bg-blue-50 text-blue-600',
        icon: 'store' as const,
      },
      {
        label: isVietnamese ? 'Tổng sản phẩm' : 'Total Products',
        value: String(data.totalProducts),
        hint: 'GetAllProducts',
        accent: 'bg-purple-50 text-purple-600',
        icon: 'package' as const,
      },
      {
        label: isVietnamese ? 'Chờ duyệt cửa hàng' : 'Pending shop approvals',
        value: String(data.pendingShopApprovals),
        hint: 'Status PENDING',
        accent: 'bg-orange-50 text-orange-600',
        icon: 'clipboard' as const,
      },
      {
        label: isVietnamese ? 'Đơn hôm nay (mẫu)' : 'Today orders (sample)',
        value: String(data.ordersToday),
        hint: isVietnamese ? 'Gộp từ cửa hàng' : 'Merged from shops',
        accent: 'bg-green-50 text-green-600',
        icon: 'cart' as const,
      },
      {
        label: isVietnamese ? 'GMV hôm nay (mẫu)' : 'GMV today (sample)',
        value: fmtMoney(data.revenueToday),
        hint: isVietnamese ? 'Tổng dòng đơn hàng' : 'Sum of order lines',
        accent: 'bg-emerald-50 text-emerald-600',
        icon: 'gmv' as const,
      },
      {
        label: isVietnamese ? 'Tài khoản' : 'Accounts',
        value: String(data.totalUsers),
        hint: 'GetAllAccounts',
        accent: 'bg-teal-50 text-teal-600',
        icon: 'users' as const,
      },
    ]
  }, [data, isVietnamese])

  const orderTrend = data?.orderTrend ?? []
  const maxOrderValue = Math.max(1, ...orderTrend.map((item) => item.value))
  const topShops = data?.topShopsByRevenue ?? []
  const maxShopRevenue = Math.max(1, ...topShops.map((shop) => shop.revenue))
  const ordersCount = data?.ordersSample.length ?? 0
  const productsCount = data?.productsSample.length ?? 0
  const skeletonMetrics = Array.from({ length: 6 })
  const revenueSeries = React.useMemo(() => {
    if (revenueFromApi && revenueFromApi.labels.length > 0) {
      return revenueFromApi
    }

    if (revenueRange === 'day' && data) {
      const gross = Number(data.revenueToday ?? 0)
      return {
        labels: [isVietnamese ? 'Hôm nay' : 'Today'],
        gross: [gross],
        commission: [0],
        net: [gross],
      }
    }

    return { labels: [], gross: [], commission: [], net: [] }
  }, [revenueFromApi, revenueRange, data, isVietnamese])
  const isSinglePointSeries = revenueSeries.labels.length === 1
  const shouldUseDonut = isSinglePointSeries || revenueRange === 'month'
  const singlePointLabel = revenueSeries.labels[0] ?? (isVietnamese ? 'Hôm nay' : 'Today')
  const displaySinglePointLabel = React.useMemo(() => {
    if (!singlePointLabel) return isVietnamese ? 'Hôm nay' : 'Today'
    const parsed = Date.parse(singlePointLabel)
    if (!Number.isNaN(parsed)) {
      return new Intl.DateTimeFormat(isVietnamese ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(parsed))
    }
    return singlePointLabel
  }, [singlePointLabel, isVietnamese])
  const singlePointValues = React.useMemo(() => {
    if (revenueRange === 'month' && revenueSeries.labels.length > 0) {
      return {
        gross: revenueSeries.gross.reduce((s, v) => s + (Number(v) || 0), 0),
        commission: revenueSeries.commission.reduce((s, v) => s + (Number(v) || 0), 0),
        net: revenueSeries.net.reduce((s, v) => s + (Number(v) || 0), 0),
      }
    }
    return {
      gross: revenueSeries.gross[0] ?? 0,
      commission: revenueSeries.commission[0] ?? 0,
      net: revenueSeries.net[0] ?? 0,
    }
  }, [revenueRange, revenueSeries])
  const singlePointTotal = Math.max(
    1,
    singlePointValues.gross + singlePointValues.commission + singlePointValues.net
  )
  const grossPct = (singlePointValues.gross / singlePointTotal) * 100
  const commissionPct = (singlePointValues.commission / singlePointTotal) * 100
  const netPct = Math.max(0, 100 - grossPct - commissionPct)
  const donutRadius = 42
  const donutCircumference = 2 * Math.PI * donutRadius
  const donutSegments = React.useMemo(() => {
    const rows = [
      { key: 'gross', color: '#10b981', pct: grossPct },
      { key: 'commission', color: '#f59e0b', pct: commissionPct },
      { key: 'net', color: '#3b82f6', pct: netPct },
    ]
    let offset = 0
    return rows.map((row) => {
      const length = (Math.max(0, row.pct) / 100) * donutCircumference
      const segment = { ...row, length, offset }
      offset += length
      return segment
    })
  }, [grossPct, commissionPct, netPct, donutCircumference])
  const chartSeries = React.useMemo(() => {
    if (revenueSeries.labels.length >= 2) return revenueSeries
    return {
      labels: [isVietnamese ? 'Chưa có dữ liệu' : 'No data', isVietnamese ? 'Chưa có dữ liệu' : 'No data'],
      gross: [0, 0],
      commission: [0, 0],
      net: [0, 0],
    }
  }, [revenueSeries, isVietnamese])
  const revenueChart = React.useMemo(() => {
    const width = Math.max(600, (chartSeries.labels.length - 1) * 160)
    const height = 140
    const pad = 8
    const max = Math.max(1, ...chartSeries.gross, ...chartSeries.net, ...chartSeries.commission)
    const step = (width - pad * 2) / (chartSeries.labels.length - 1)
    const toPath = (values: number[]) =>
      values
        .map((v, i) => {
          const x = pad + i * step
          const y = height - pad - (v / max) * (height - pad * 2)
          return `${i === 0 ? 'M' : 'L'}${x},${y}`
        })
        .join(' ')
    const toArea = (values: number[]) => {
      const line = toPath(values)
      const lastX = pad + (values.length - 1) * step
      const baseY = height - pad
      return `${line} L${lastX},${baseY} L${pad},${baseY} Z`
    }
    return { width, height, toPath, toArea }
  }, [chartSeries])

  return (
    <div className='admin-home'>
      <header className='admin-home__hero'>
        <div>
          <p className='admin-home__eyebrow'>{isVietnamese ? 'Trung tâm vận hành' : 'Operations Center'}</p>
          <h1 className='admin-home__title'>{isVietnamese ? 'Tổng quan Dashboard' : 'Dashboard Overview'}</h1>
          <p className='admin-home__subtitle'>
            {isVietnamese
              ? 'Theo dõi nhanh sức khỏe sàn, đơn hàng và doanh thu trong ngày.'
              : "Quickly monitor marketplace health, orders, and daily revenue."}
          </p>
        </div>
      </header>

      {isError && (
        <p className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          {error instanceof Error ? error.message : isVietnamese ? 'Không tải được dữ liệu dashboard.' : 'Failed to load dashboard data.'}
        </p>
      )}

      <section className='admin-home__insights grid grid-cols-1 gap-6 xl:grid-cols-2'>
        <article className='admin-home__panel'>
          <header className='admin-home__panel-head'>
            <div>
              <h2>{isVietnamese ? 'Xu hướng doanh thu' : 'Revenue trend'}</h2>
              <p>{isVietnamese ? 'Tổng tiền hàng, hoa hồng và trả về shop' : 'Gross, commission, and net to shop'}</p>
            </div>
            <div className='ml-auto flex items-center gap-2'>
              {([
                { key: 'day', label: isVietnamese ? 'Ngày' : 'Day' },
                { key: 'month', label: isVietnamese ? 'Tháng' : 'Month' },
                { key: 'quarter', label: isVietnamese ? 'Quý' : 'Quarter' },
                { key: 'year', label: isVietnamese ? 'Năm' : 'Year' },
              ] as const).map((range) => (
                <button
                  key={range.key}
                  type='button'
                  onClick={() => setRevenueRange(range.key)}
                  className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                    revenueRange === range.key
                      ? 'border-stone-800 bg-stone-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </header>
          <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-4 text-xs text-gray-500'>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
                <span>{isVietnamese ? 'Tổng tiền hàng' : 'Gross revenue'}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-amber-500' />
                <span>{isVietnamese ? 'Hoa hồng' : 'Commission'}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-blue-500' />
                <span>{isVietnamese ? 'Trả về shop' : 'Net to shop'}</span>
              </div>
            </div>
            <div className='rounded-xl border border-gray-100 bg-white p-2'>
              {shouldUseDonut ? (
                <div className='flex flex-col items-start gap-4 px-2 py-2 sm:flex-row sm:items-center'>
                  <div className='ml-7 flex w-40 shrink-0 flex-col items-center gap-1 sm:mx-0 sm:ml-8'>
                    <div className='w-full aspect-square'>
                      <svg viewBox='0 0 120 120' className='h-full w-full -rotate-90'>
                        <circle cx='60' cy='60' r={donutRadius} fill='none' stroke='#e5e7eb' strokeWidth='14' />
                        {donutSegments.map((segment) => (
                          <circle
                            key={segment.key}
                            cx='60'
                            cy='60'
                            r={donutRadius}
                            fill='none'
                            stroke={segment.color}
                            strokeWidth='14'
                            strokeLinecap='butt'
                            strokeDasharray={`${segment.length} ${Math.max(0, donutCircumference - segment.length)}`}
                            strokeDashoffset={-segment.offset}
                          />
                        ))}
                      </svg>
                    </div>
                    <div className='text-center text-xs text-gray-500 sm:text-[11px]'>
                      {revenueRange === 'month' ? (isVietnamese ? 'Tháng này' : 'This month') : displaySinglePointLabel}
                    </div>
                  </div>

                  <div className='ml-auto w-full max-w-[210px] space-y-1.5'>
                    {[
                      { key: 'gross', label: isVietnamese ? 'Tổng tiền hàng' : 'Gross revenue', color: 'bg-emerald-500', value: singlePointValues.gross },
                      { key: 'commission', label: isVietnamese ? 'Hoa hồng' : 'Commission', color: 'bg-amber-500', value: singlePointValues.commission },
                      { key: 'net', label: isVietnamese ? 'Trả về shop' : 'Net to shop', color: 'bg-blue-500', value: singlePointValues.net },
                    ].map((row) => (
                      <div key={row.key} className='rounded-lg border border-gray-100 px-2 py-1.5 text-[11px]'>
                        <div className='flex items-center gap-2 text-gray-600'>
                          <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                          <span>{row.label}</span>
                        </div>
                        <div className='mt-1 text-right font-semibold text-gray-800'>{fmtMoney(row.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <svg viewBox={`0 0 ${revenueChart.width} ${revenueChart.height}`} className='h-36 w-full'>
                    <path d={revenueChart.toArea(chartSeries.gross)} fill='rgba(16, 185, 129, 0.12)' />
                    <path d={revenueChart.toArea(chartSeries.net)} fill='rgba(59, 130, 246, 0.1)' />
                    <path d={revenueChart.toPath(chartSeries.gross)} stroke='#10b981' strokeWidth='2.25' fill='none' />
                    <path d={revenueChart.toPath(chartSeries.net)} stroke='#3b82f6' strokeWidth='2.25' fill='none' />
                    <path d={revenueChart.toPath(chartSeries.commission)} stroke='#f59e0b' strokeWidth='2.25' fill='none' />
                  </svg>
                  <div className='mt-2 flex justify-between px-1 text-[11px] text-gray-400'>
                    {chartSeries.labels.map((label, idx) => (
                      <span key={`${label}-${idx}`}>{label}</span>
                    ))}
                  </div>
                </>
              )}
              {isRevenueLoading && (
                <p className='px-1 pb-1 text-[11px] text-gray-400'>
                  {isVietnamese ? 'Đang tải dữ liệu doanh thu...' : 'Loading revenue data...'}
                </p>
              )}
            </div>
          </div>
        </article>

        <article className='admin-home__panel'>
          <header className='admin-home__panel-head'>
            <div>
              <h2>{isVietnamese ? 'Biểu đồ 2' : 'Chart 2'}</h2>
              <p>{isVietnamese ? 'Khu vực biểu đồ mở rộng' : 'Secondary chart area'}</p>
            </div>
          </header>
          <div className='flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-4'>
            <div className='text-center text-sm text-gray-400'>
              {isVietnamese ? 'Khu vực biểu đồ 2 (50%)' : 'Second chart area (50%)'}
            </div>
          </div>
        </article>
      </section>

      <section className='admin-home__tables'>
        <article className='admin-home__table-panel'>
          <div className='admin-home__table-head'>
            <div>
              <h2>{isVietnamese ? 'Đơn hàng gần đây' : 'Latest orders'}</h2>
              <p>{isVietnamese ? 'Đơn mới nhất (dữ liệu mẫu gộp)' : 'Recent orders (merged sample)'}</p>
            </div>
            <Link to={ROUTES.ADMIN_ORDERS} className='text-sm font-medium text-stone-600 hover:text-stone-900'>
              {isVietnamese ? 'Xem tất cả' : 'View all'}
            </Link>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-sm'>
              <thead>
                <tr className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <th className='px-6 py-3'>{isVietnamese ? 'Đơn hàng' : 'Order'}</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Cửa hàng' : 'Shop'}</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Sản phẩm' : 'Product'}</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Giá trị' : 'Amount'}</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Trạng thái' : 'Status'}</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Ngày tạo' : 'Date'}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                      {isVietnamese ? 'Đang tải...' : 'Loading...'}
                    </td>
                  </tr>
                ) : (data?.ordersSample.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                      {isVietnamese ? 'Không có đơn trong dữ liệu mẫu.' : 'No orders in sample.'}
                    </td>
                  </tr>
                ) : (
                  data!.ordersSample.map((order) => {
                    const id = order.orderCode || order.orderId
                    const tone = orderStatusTone(order.status)
                    const createdOn = order.createdAt || order.createdDate
                    return (
                      <tr key={order.orderId} className='border-b border-gray-100 last:border-b-0'>
                        <td className='px-6 py-4 font-medium text-gray-900'>{id}</td>
                        <td className='px-6 py-4 text-gray-700'>{order.shopName ?? '-'}</td>
                        <td className='px-6 py-4 text-gray-700'>{adminOrderUtils.firstLineItemName(order)}</td>
                        <td className='px-6 py-4 text-gray-900'>{fmtMoney(adminOrderUtils.orderTotal(order))}</td>
                        <td className='px-6 py-4'>
                          <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium ${statusStyles[tone]}`}>
                            {order.status ?? '-'}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-gray-500'>
                          {createdOn
                            ? new Intl.DateTimeFormat(isVietnamese ? 'vi-VN' : 'en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              }).format(new Date(createdOn))
                            : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className='admin-home__table-panel'>
          <div className='admin-home__table-head'>
            <div>
              <h2>{isVietnamese ? 'Sản phẩm gần đây' : 'Recent products'}</h2>
              <p>
                {isVietnamese
                  ? 'Từ GetAllProducts - luồng kiểm duyệt chưa được backend mô hình hóa đầy đủ'
                  : 'From GetAllProducts - moderation workflow is not yet modeled in API'}
              </p>
            </div>
            <Link to={`${ROUTES.ADMIN}/products`} className='text-sm font-medium text-stone-600 hover:text-stone-900'>
              {isVietnamese ? 'Danh sách sản phẩm' : 'Product list'}
            </Link>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[780px] text-sm'>
              <thead>
                <tr className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <th className='px-6 py-3'>SKU / ID</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Tên' : 'Name'}</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Cửa hàng' : 'Shop'}</th>
                  <th className='px-6 py-3'>{isVietnamese ? 'Giá' : 'Price'}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.productsSample ?? []).map((product) => {
                  const pid = product.productId || product.id || '-'
                  const shop = (product.shopId && data?.shopNameById[product.shopId]) || product.shopId || '-'
                  const productName =
                    (product as { productName?: string; name?: string; title?: string }).productName ||
                    (product as { productName?: string; name?: string; title?: string }).name ||
                    (product as { productName?: string; name?: string; title?: string }).title ||
                    '-'
                  const rawPrice =
                    (product as { basePrice?: number; price?: number }).basePrice ??
                    (product as { basePrice?: number; price?: number }).price
                  return (
                    <tr key={pid} className='border-b border-gray-100 last:border-b-0'>
                      <td className='px-6 py-4 font-mono text-xs text-gray-600'>{product.globalSku || pid}</td>
                      <td className='px-6 py-4 font-medium text-gray-900'>{productName}</td>
                      <td className='px-6 py-4 text-gray-700'>{shop}</td>
                      <td className='px-6 py-4 text-gray-900'>
                        {rawPrice != null ? fmtMoney(Number(rawPrice)) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}
