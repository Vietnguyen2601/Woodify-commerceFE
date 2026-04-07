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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.snapshot(),
    queryFn: adminService.getDashboardSnapshot,
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
        <div className='admin-home__hero-meta'>
          <div className='admin-home__chip'>{isVietnamese ? `Mẫu đơn: ${ordersCount}` : `Orders sample: ${ordersCount}`}</div>
          <div className='admin-home__chip'>{isVietnamese ? `Mẫu sản phẩm: ${productsCount}` : `Products sample: ${productsCount}`}</div>
          <Link to={ROUTES.ADMIN_ORDERS} className='admin-home__hero-link'>
            {isVietnamese ? 'Mở quản lý đơn hàng' : 'Open Order Manager'}
          </Link>
        </div>
      </header>

      {isError && (
        <p className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          {error instanceof Error ? error.message : isVietnamese ? 'Không tải được dữ liệu dashboard.' : 'Failed to load dashboard data.'}
        </p>
      )}

      <p className='rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700'>
        {isVietnamese ? 'Thống kê đơn hàng đang dùng dữ liệu gộp từ các shop cho đến khi backend có API' : 'Order statistics use merged shop orders until backend ships'}{' '}
        <code className='text-[11px]'>GET /orders/admin/*</code> (see API_GAPS_AND_RECOMMENDATIONS.md).
      </p>

      <section className='admin-home__metrics'>
        {(isLoading ? skeletonMetrics : metricCards).map((metric, idx) => (
          <article key={isLoading ? idx : metric.label} className='admin-home__metric-card'>
            {isLoading ? (
              <div className='h-24 animate-pulse rounded-xl bg-gray-100' />
            ) : (
              <>
                <div className='flex items-center justify-between'>
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${metric.accent}`}>
                    <StatIcon variant={metric.icon} accent={metric.accent} />
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs font-medium text-gray-500'>{metric.label}</span>
                  <strong className='text-2xl font-bold text-neutral-900'>{metric.value}</strong>
                  <span className='text-xs font-medium text-emerald-600'>{metric.hint}</span>
                </div>
              </>
            )}
          </article>
        ))}
      </section>

      <section className='admin-home__insights'>
        <article className='admin-home__panel'>
          <header className='admin-home__panel-head'>
            <h2>{isVietnamese ? 'Đơn hàng (~30 ngày gần nhất, mẫu)' : 'Orders (last ~30 days, sample)'}</h2>
            <p>{isVietnamese ? 'Số lượng theo cụm từ dữ liệu đơn gộp' : 'Bucketed counts from merged shop orders'}</p>
          </header>
          <div className='admin-home__chart'>
            {orderTrend.length === 0 && !isLoading ? (
              <p className='text-sm text-gray-500'>{isVietnamese ? 'Không có đơn trong khoảng dữ liệu mẫu.' : 'No orders in sample window.'}</p>
            ) : (
              orderTrend.map((point) => (
                <div key={point.day} className='flex flex-1 flex-col items-center gap-2'>
                  <div
                    className='w-full rounded-full bg-gradient-to-b from-stone-500 to-stone-400 min-h-[4px]'
                    style={{ height: `${(point.value / maxOrderValue) * 100}%` }}
                  />
                  <span className='text-xs text-gray-400'>{point.day}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className='admin-home__panel'>
          <header className='admin-home__panel-head'>
            <h2>{isVietnamese ? 'Top cửa hàng theo doanh thu (mẫu)' : 'Top shops by revenue (sample)'}</h2>
            <p>{isVietnamese ? 'Từ đơn hàng gộp toàn bộ shop' : 'From merged orders across shops'}</p>
          </header>
          <div className='flex flex-col gap-4'>
            {topShops.length === 0 && !isLoading ? (
              <p className='text-sm text-gray-500'>{isVietnamese ? 'Chưa có dữ liệu doanh thu.' : 'No revenue data yet.'}</p>
            ) : (
              topShops.map((shop) => (
                <div key={shop.name} className='flex flex-col gap-2'>
                  <div className='flex items-center justify-between text-sm text-gray-600'>
                    <span>{shop.name}</span>
                    <span>{fmtMoney(shop.revenue)}</span>
                  </div>
                  <div className='h-3 rounded-full bg-gray-100'>
                    <div
                      className='h-full rounded-full bg-gradient-to-r from-stone-500 to-stone-400'
                      style={{ width: `${(shop.revenue / maxShopRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
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
                          {order.createdDate
                            ? new Intl.DateTimeFormat(isVietnamese ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(new Date(order.createdDate))
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
                  return (
                    <tr key={pid} className='border-b border-gray-100 last:border-b-0'>
                      <td className='px-6 py-4 font-mono text-xs text-gray-600'>{product.globalSku || pid}</td>
                      <td className='px-6 py-4 font-medium text-gray-900'>{product.productName ?? '-'}</td>
                      <td className='px-6 py-4 text-gray-700'>{shop}</td>
                      <td className='px-6 py-4 text-gray-900'>
                        {product.basePrice != null ? fmtMoney(Number(product.basePrice)) : '-'}
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
