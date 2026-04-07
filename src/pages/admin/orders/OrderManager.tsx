import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminOrderUtils, adminService, queryKeys } from '@/services'
import type { AdminShopDto } from '@/types'

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const fmtDateTime = (iso: string | undefined, locale: 'vi-VN' | 'en-US') => {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700 border border-green-200',
  SHIPPED: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border border-blue-200',
  PENDING: 'bg-gray-100 text-gray-700 border border-gray-200',
  CANCELLED: 'bg-red-100 text-red-700 border border-red-200',
  DEFAULT: 'bg-stone-100 text-stone-800 border border-stone-200',
}

const styleForStatus = (status?: string) => {
  const u = (status || '').toUpperCase()
  if (u in ORDER_STATUS_STYLES) return ORDER_STATUS_STYLES[u]
  return ORDER_STATUS_STYLES.DEFAULT
}

export default function OrderManager() {
  const { isVietnamese } = useAppLanguage()

  const [orderStatus, setOrderStatus] = React.useState('')
  const [shopId, setShopId] = React.useState('')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [page, setPage] = React.useState(1)
  const pageSize = 20

  const t = {
    eyebrow: isVietnamese ? 'V?n hành don hàng' : 'Order operations',
    title: isVietnamese ? 'Qu?n lý don hàng' : 'Order Management',
    subtitle: isVietnamese
      ? 'Theo dõi don c?a merchant, tr?ng thái giao hàng và di?m ngh?n x? lý.'
      : 'Track merchant orders, monitor delivery states and quickly investigate issue clusters.',
    sourceInfo: isVietnamese
      ? 'Uu tiên API admin orders; n?u chua có s? g?p t? GET /orders/Shop/{shopId} (xem API gaps).'
      : 'Uses admin order list when available; otherwise merges GET /orders/Shop/{shopId} (see API gaps).',
    aggregate: isVietnamese
      ? 'Ðang hi?n th? d? li?u g?p - b? l?c và phân trang ch?y phía client.'
      : 'Showing aggregated data - filters and pagination run on the client for this mode.',
    loadFailed: isVietnamese ? 'Không t?i du?c danh sách don hàng' : 'Failed to load orders',
    filterTitle: isVietnamese ? 'L?c don hàng' : 'Filter orders',
    filterSub: isVietnamese ? 'L?c theo tr?ng thái, shop và kho?ng ngày.' : 'Refine by status, shop and date range.',
    clear: isVietnamese ? 'Xóa b? l?c' : 'Clear filters',
    status: isVietnamese ? 'Tr?ng thái don' : 'Order Status',
    shop: isVietnamese ? 'C?a hàng' : 'Shop',
    from: isVietnamese ? 'T? ngày' : 'Date From',
    to: isVietnamese ? 'Ð?n ngày' : 'Date To',
    allStatus: isVietnamese ? 'T?t c? tr?ng thái' : 'All statuses',
    allShop: isVietnamese ? 'T?t c? c?a hàng' : 'All shops',
    showing: isVietnamese ? 'Ðang hi?n th?' : 'Showing',
    of: isVietnamese ? 'trong t?ng' : 'of',
    orders: isVietnamese ? 'don hàng' : 'orders',
    page: isVietnamese ? 'Trang' : 'Page',
    total: isVietnamese ? 'T?ng' : 'Total',
    order: isVietnamese ? 'Ðon hàng' : 'Order',
    amount: isVietnamese ? 'Giá tr?' : 'Total',
    placed: isVietnamese ? 'Ngày t?o' : 'Placed',
    details: isVietnamese ? 'Chi ti?t' : 'Details',
    loading: isVietnamese ? 'Ðang t?i...' : 'Loading...',
    noOrders: isVietnamese ? 'Không tìm th?y don hàng.' : 'No orders found.',
    apiDetails: isVietnamese ? 'API: dòng s?n ph?m trong don' : 'API: order line items',
    previous: isVietnamese ? 'Tru?c' : 'Previous',
    next: isVietnamese ? 'Sau' : 'Next',
  }

  const { data: shops = [] } = useQuery({
    queryKey: queryKeys.admin.shops(),
    queryFn: adminService.getAdminShops,
    staleTime: 120 * 1000,
  })

  const filters = React.useMemo(
    () => ({
      page,
      limit: pageSize,
      status: orderStatus || undefined,
      shopId: shopId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy: 'date',
      sortOrder: 'desc' as const,
    }),
    [page, orderStatus, shopId, dateFrom, dateTo]
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.orders(filters as Record<string, unknown>),
    queryFn: () => adminService.getAdminOrders(filters),
    staleTime: 30 * 1000,
  })

  const orders = data?.orders ?? []
  const totalItems = data?.totalItems ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const metrics = React.useMemo(() => {
    const list = orders
    const revenue = list.reduce((s, o) => s + adminOrderUtils.orderTotal(o), 0)
    const pending = list.filter((o) => (o.status || '').toUpperCase().includes('PEND')).length
    const delivered = list.filter((o) => (o.status || '').toUpperCase().includes('DELIVER')).length
    return [
      { label: isVietnamese ? 'Ðon theo trang' : 'Orders (page)', value: String(list.length), iconBg: 'bg-blue-50' },
      { label: isVietnamese ? 'Doanh thu trang' : 'Page revenue', value: fmtMoney(revenue), iconBg: 'bg-green-50' },
      { label: isVietnamese ? 'Ch? x? lý (trang)' : 'Pending (page)', value: String(pending), iconBg: 'bg-orange-50' },
      { label: isVietnamese ? 'Ðã giao (trang)' : 'Delivered (page)', value: String(delivered), iconBg: 'bg-purple-50' },
    ]
  }, [orders, isVietnamese])

  React.useEffect(() => {
    setPage(1)
  }, [orderStatus, shopId, dateFrom, dateTo])

  const clearFilters = () => {
    setOrderStatus('')
    setShopId('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className='admin-order'>
      <header className='admin-order__hero'>
        <div>
          <p className='admin-order__eyebrow'>{t.eyebrow}</p>
          <h1 className='admin-order__title'>{t.title}</h1>
          <p className='admin-order__subtitle'>{t.subtitle}</p>
          <p className='mt-2 text-sm text-gray-500'>{t.sourceInfo}</p>
        </div>
        <div className='admin-order__hero-badges'>
          <span className='admin-order__badge'>{t.page} {page} / {totalPages}</span>
          <span className='admin-order__badge'>{t.total} {totalItems} {t.orders}</span>
        </div>
        {data?.source === 'aggregate' && (
          <p className='w-full rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800'>
            {t.aggregate}
          </p>
        )}
        {isError && (
          <p className='w-full rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600'>
            {error instanceof Error ? error.message : t.loadFailed}
          </p>
        )}
      </header>

      <section className='admin-order__metrics'>
        {metrics.map((metric) => (
          <article key={metric.label} className='admin-order__metric-card'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{isLoading ? '...' : metric.value}</p>
              </div>
              <span className={`admin-order__metric-dot ${metric.iconBg}`} />
            </div>
          </article>
        ))}
      </section>

      <section className='admin-order__filters'>
        <div className='admin-order__filter-head'>
          <div>
            <h2 className='text-base font-semibold text-gray-900'>{t.filterTitle}</h2>
            <p className='text-sm text-gray-500'>{t.filterSub}</p>
          </div>
          <button type='button' onClick={clearFilters} className='admin-order__clear-btn'>
            {t.clear}
          </button>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
          <div className='space-y-2 xl:col-span-1'>
            <label className='text-xs font-medium text-gray-700'>{t.status}</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className='admin-order__field'
            >
              <option value=''>{t.allStatus}</option>
              <option value='PENDING'>PENDING</option>
              <option value='CONFIRMED'>CONFIRMED</option>
              <option value='SHIPPED'>SHIPPED</option>
              <option value='DELIVERED'>DELIVERED</option>
              <option value='CANCELLED'>CANCELLED</option>
            </select>
          </div>
          <div className='space-y-2 xl:col-span-2'>
            <label className='text-xs font-medium text-gray-700'>{t.shop}</label>
            <select
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className='admin-order__field'
            >
              <option value=''>{t.allShop}</option>
              {shops.map((s: AdminShopDto) => (
                <option key={s.shopId} value={s.shopId}>
                  {s.shopName}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>{t.from}</label>
            <input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='admin-order__field'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>{t.to}</label>
            <input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='admin-order__field'
            />
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        {t.showing} <span className='font-semibold text-gray-900'>{orders.length}</span> {t.of}{' '}
        <span className='font-semibold text-gray-900'>{totalItems}</span> {t.orders}
        {totalPages > 1 && (
          <span className='ml-2'>
            {t.page} {page} / {totalPages}
          </span>
        )}
      </p>

      <section className='admin-order__table-wrap'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>{t.order}</th>
                <th className='px-6 py-3 text-left'>{t.shop}</th>
                <th className='px-6 py-3 text-left'>{t.amount}</th>
                <th className='px-6 py-3 text-left'>{t.status}</th>
                <th className='px-6 py-3 text-left'>{t.placed}</th>
                <th className='px-6 py-3 text-center'>{t.details}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-900'>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    {t.loading}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    {t.noOrders}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId} className='hover:bg-gray-50/75'>
                    <td className='whitespace-nowrap px-6 py-4 font-mono text-sm'>
                      {order.orderCode || order.orderId}
                    </td>
                    <td className='px-6 py-4 text-gray-700'>{order.shopName ?? order.shopId ?? ''}</td>
                    <td className='px-6 py-4 font-semibold'>{fmtMoney(adminOrderUtils.orderTotal(order))}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${styleForStatus(order.status)}`}>
                        {order.status ?? ''}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-gray-700'>{fmtDateTime(order.createdDate, isVietnamese ? 'vi-VN' : 'en-US')}</td>
                    <td className='px-6 py-4 text-center text-xs text-gray-500'>{t.apiDetails}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 && (
        <div className='admin-order__pager'>
          <button
            type='button'
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className='admin-order__pager-btn'
          >
            {t.previous}
          </button>
          <button
            type='button'
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className='admin-order__pager-btn'
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  )
}
