import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminOrderUtils, adminService, queryKeys } from '@/services'
import { ROUTES } from '@/constants'

const iconStroke = 'currentColor'

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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.snapshot(),
    queryFn: adminService.getDashboardSnapshot,
    staleTime: 60 * 1000,
  })

  const metricCards = React.useMemo(() => {
    if (!data) return []
    return [
      {
        label: 'Total Shops',
        value: String(data.totalShops),
        change: 'Live data',
        accent: 'bg-blue-50 text-blue-600',
        icon: 'store' as const,
      },
      {
        label: 'Total Products',
        value: String(data.totalProducts),
        change: 'GetAllProducts',
        accent: 'bg-purple-50 text-purple-600',
        icon: 'package' as const,
      },
      {
        label: 'Pending shop approvals',
        value: String(data.pendingShopApprovals),
        change: 'Status PENDING',
        accent: 'bg-orange-50 text-orange-600',
        icon: 'clipboard' as const,
      },
      {
        label: 'Today orders (sample)',
        value: String(data.ordersToday),
        change: 'Merged from shops',
        accent: 'bg-green-50 text-green-600',
        icon: 'cart' as const,
      },
      {
        label: 'GMV today (sample)',
        value: fmtMoney(data.revenueToday),
        change: 'Sum of order lines',
        accent: 'bg-emerald-50 text-emerald-600',
        icon: 'gmv' as const,
      },
      {
        label: 'Accounts',
        value: String(data.totalUsers),
        change: 'GetAllAccounts',
        accent: 'bg-teal-50 text-teal-600',
        icon: 'users' as const,
      },
    ]
  }, [data])

  const orderTrend = data?.orderTrend ?? []
  const maxOrderValue = Math.max(1, ...orderTrend.map((item) => item.value))
  const topShops = data?.topShopsByRevenue ?? []
  const maxShopRevenue = Math.max(1, ...topShops.map((shop) => shop.revenue))

  return (
    <div className='flex flex-col gap-6 px-6 py-6'>
      <header className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold text-neutral-900'>Dashboard Overview</h1>
        <p className='text-sm text-neutral-500'>Welcome back, here&apos;s what&apos;s happening today</p>
        {isError && (
          <p className='text-sm text-red-600'>
            {error instanceof Error ? error.message : 'Không tải được dữ liệu dashboard.'}
          </p>
        )}
        <p className='text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2'>
          Order statistics use merged shop orders until backend ships{' '}
          <code className='text-[11px]'>GET /orders/admin/*</code> (see API_GAPS_AND_RECOMMENDATIONS.md).
        </p>
      </header>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {(isLoading ? Array.from({ length: 6 }) : metricCards).map((metric, idx) => (
          <article
            key={isLoading ? idx : (metric as { label: string }).label}
            className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/5 flex flex-col gap-3'
          >
            {isLoading ? (
              <div className='h-24 animate-pulse rounded-xl bg-gray-100' />
            ) : (
              <>
                <div className='flex items-center justify-between'>
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${(metric as { accent: string }).accent}`}>
                    <StatIcon variant={(metric as { icon: string }).icon} accent={(metric as { accent: string }).accent} />
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs font-medium text-gray-500'>{(metric as { label: string }).label}</span>
                  <strong className='text-2xl font-bold text-neutral-900'>{(metric as { value: string }).value}</strong>
                  <span className='text-xs font-medium text-emerald-600'>{(metric as { change: string }).change}</span>
                </div>
              </>
            )}
          </article>
        ))}
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/5 flex flex-col gap-4'>
          <header>
            <h2 className='text-base font-semibold text-neutral-900'>Orders (last ~30 days, sample)</h2>
            <p className='text-sm text-neutral-500'>Bucketed counts from merged shop orders</p>
          </header>
          <div className='flex items-end gap-3 h-60 border-b border-gray-100 pb-3 relative'>
            {orderTrend.length === 0 && !isLoading ? (
              <p className='text-sm text-gray-500'>No orders in sample window.</p>
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
        </div>

        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/5 flex flex-col gap-4'>
          <header>
            <h2 className='text-base font-semibold text-neutral-900'>Top shops by revenue (sample)</h2>
            <p className='text-sm text-neutral-500'>From merged orders across shops</p>
          </header>
          <div className='flex flex-col gap-4'>
            {topShops.length === 0 && !isLoading ? (
              <p className='text-sm text-gray-500'>No revenue data yet.</p>
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
        </div>
      </section>

      <section className='flex flex-col gap-6'>
        <div className='rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/5'>
          <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
            <div>
              <h2 className='text-base font-semibold text-neutral-900'>Latest orders</h2>
              <p className='text-sm text-neutral-500'>Recent orders (merged sample)</p>
            </div>
            <Link to={ROUTES.ADMIN_ORDERS} className='text-sm font-medium text-stone-600 hover:text-stone-900'>
              View all
            </Link>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-sm'>
              <thead>
                <tr className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <th className='px-6 py-3'>Order</th>
                  <th className='px-6 py-3'>Shop</th>
                  <th className='px-6 py-3'>Product</th>
                  <th className='px-6 py-3'>Amount</th>
                  <th className='px-6 py-3'>Status</th>
                  <th className='px-6 py-3'>Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                      Loading…
                    </td>
                  </tr>
                ) : (data?.ordersSample.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                      No orders in sample.
                    </td>
                  </tr>
                ) : (
                  data!.ordersSample.map((order) => {
                    const id = order.orderCode || order.orderId
                    const tone = orderStatusTone(order.status)
                    return (
                      <tr key={order.orderId} className='border-b border-gray-100 last:border-b-0'>
                        <td className='px-6 py-4 font-medium text-gray-900'>{id}</td>
                        <td className='px-6 py-4 text-gray-700'>{order.shopName ?? '—'}</td>
                        <td className='px-6 py-4 text-gray-700'>{adminOrderUtils.firstLineItemName(order)}</td>
                        <td className='px-6 py-4 text-gray-900'>{fmtMoney(adminOrderUtils.orderTotal(order))}</td>
                        <td className='px-6 py-4'>
                          <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium ${statusStyles[tone]}`}>
                            {order.status ?? '—'}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-gray-500'>
                          {order.createdDate
                            ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(order.createdDate))
                            : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/5'>
          <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
            <div>
              <h2 className='text-base font-semibold text-neutral-900'>Recent products</h2>
              <p className='text-sm text-neutral-500'>From GetAllProducts — moderation workflow is not yet modeled in API</p>
            </div>
            <Link to={`${ROUTES.ADMIN}/products`} className='text-sm font-medium text-stone-600 hover:text-stone-900'>
              Product list
            </Link>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[780px] text-sm'>
              <thead>
                <tr className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <th className='px-6 py-3'>SKU / ID</th>
                  <th className='px-6 py-3'>Name</th>
                  <th className='px-6 py-3'>Shop</th>
                  <th className='px-6 py-3'>Price</th>
                </tr>
              </thead>
              <tbody>
                {(data?.productsSample ?? []).map((product) => {
                  const pid = product.productId || product.id || '—'
                  const shop =
                    (product.shopId && data?.shopNameById[product.shopId]) || product.shopId || '—'
                  return (
                    <tr key={pid} className='border-b border-gray-100 last:border-b-0'>
                      <td className='px-6 py-4 font-mono text-xs text-gray-600'>{product.globalSku || pid}</td>
                      <td className='px-6 py-4 font-medium text-gray-900'>{product.productName ?? '—'}</td>
                      <td className='px-6 py-4 text-gray-700'>{shop}</td>
                      <td className='px-6 py-4 text-gray-900'>
                        {product.basePrice != null ? fmtMoney(Number(product.basePrice)) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
