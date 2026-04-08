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

  const [searchTerm, setSearchTerm] = React.useState('')
  const [orderStatus, setOrderStatus] = React.useState('')
  const [shopId, setShopId] = React.useState('')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [page, setPage] = React.useState(1)
  const pageSize = 20

  const t = {
    eyebrow: isVietnamese ? 'Vận hành đơn hàng' : 'Order operations',
    title: isVietnamese ? 'Quản lý đơn hàng' : 'Order Management',
    subtitle: isVietnamese
      ? 'Theo dõi đơn của merchant, trạng thái giao hàng và điểm nghẽn xử lý.'
      : 'Track merchant orders, monitor delivery states and quickly investigate issue clusters.',
    loadFailed: isVietnamese ? 'Không tải được danh sách đơn hàng' : 'Failed to load orders',
    filterTitle: isVietnamese ? 'Lọc đơn hàng' : 'Filter orders',
    filterSub: isVietnamese ? 'Lọc theo trạng thái, shop và khoảng ngày.' : 'Refine by status, shop and date range.',
    clear: isVietnamese ? 'Xóa bộ lọc' : 'Clear filters',
    searchLabel: isVietnamese ? 'Tìm kiếm' : 'Search',
    searchPlaceholder: isVietnamese ? 'Tìm theo mã đơn, shop hoặc trạng thái...' : 'Search by order code, shop, or status...',
    status: isVietnamese ? 'Trạng thái đơn' : 'Order Status',
    shop: isVietnamese ? 'Cửa hàng' : 'Shop',
    from: isVietnamese ? 'Từ ngày' : 'Date From',
    to: isVietnamese ? 'Đến ngày' : 'Date To',
    allStatus: isVietnamese ? 'Tất cả trạng thái' : 'All statuses',
    allShop: isVietnamese ? 'Tất cả cửa hàng' : 'All shops',
    showing: isVietnamese ? 'Đang hiển thị' : 'Showing',
    of: isVietnamese ? 'trong tổng' : 'of',
    orders: isVietnamese ? 'đơn hàng' : 'orders',
    page: isVietnamese ? 'Trang' : 'Page',
    total: isVietnamese ? 'Tổng' : 'Total',
    order: isVietnamese ? 'Đơn hàng' : 'Order',
    amount: isVietnamese ? 'Giá trị' : 'Total',
    placed: isVietnamese ? 'Ngày tạo' : 'Placed',
    details: isVietnamese ? 'Chi tiết' : 'Details',
    loading: isVietnamese ? 'Đang tải...' : 'Loading...',
    noOrders: isVietnamese ? 'Không tìm thấy đơn hàng.' : 'No orders found.',
    apiDetails: isVietnamese ? 'API: dòng sản phẩm trong đơn' : 'API: order line items',
    previous: isVietnamese ? 'Trước' : 'Previous',
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
  const filteredOrders = React.useMemo(() => {
    if (!searchTerm.trim()) return orders
    const q = searchTerm.trim().toLowerCase()
    return orders.filter((order) => {
      const code = String(order.orderCode || order.orderId || '').toLowerCase()
      const shop = String(order.shopName || order.shopId || '').toLowerCase()
      const status = String(order.status || '').toLowerCase()
      return code.includes(q) || shop.includes(q) || status.includes(q)
    })
  }, [orders, searchTerm])

  const metrics = React.useMemo(() => {
    const list = orders
    const revenue = list.reduce((s, o) => s + adminOrderUtils.orderTotal(o), 0)
    const pending = list.filter((o) => (o.status || '').toUpperCase().includes('PEND')).length
    const delivered = list.filter((o) => (o.status || '').toUpperCase().includes('DELIVER')).length
    return [
      { label: isVietnamese ? 'Đơn theo trang' : 'Orders (page)', value: String(list.length), iconBg: 'bg-blue-50' },
      { label: isVietnamese ? 'Doanh thu trang' : 'Page revenue', value: fmtMoney(revenue), iconBg: 'bg-green-50' },
      { label: isVietnamese ? 'Chờ xử lý (trang)' : 'Pending (page)', value: String(pending), iconBg: 'bg-orange-50' },
      { label: isVietnamese ? 'Đã giao (trang)' : 'Delivered (page)', value: String(delivered), iconBg: 'bg-purple-50' },
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
    <div className='space-y-6 px-0'>
      <section className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
        <p className='text-sm text-gray-500'>{t.subtitle}</p>
        <p className='mt-2 text-sm text-gray-400'>{t.sourceInfo}</p>
        {isError && (
          <p className='text-sm text-red-600'>{error instanceof Error ? error.message : t.loadFailed}</p>
        )}
        {data?.source === 'aggregate' && (
          <p className='mt-2 text-xs text-amber-700'>{t.aggregate}</p>
        )}
      </section>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{isLoading ? '…' : metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconBg}`}>
                <span className='text-lg font-bold text-gray-400'>·</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='space-y-6'>
          <div className='flex flex-col space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.searchLabel}</label>
            <div className='relative max-w-md'>
              <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='7' />
                  <path d='m16.5 16.5 4 4' strokeLinecap='round' />
                </svg>
              </span>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className='h-10 w-full appearance-none rounded-xl border border-gray-200 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          {/* Main Filters */}
          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
            {/* Status Box */}
            <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all'>
              <label className='mb-3 block text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.status}</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className='w-full h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50'
              >
                <option value=''>{t.allStatus}</option>
                <option value='PENDING'>PENDING</option>
                <option value='CONFIRMED'>CONFIRMED</option>
                <option value='SHIPPED'>SHIPPED</option>
                <option value='DELIVERED'>DELIVERED</option>
                <option value='CANCELLED'>CANCELLED</option>
              </select>
            </div>

            {/* Shop Box */}
            <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all'>
              <label className='mb-3 block text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.shop}</label>
              <select
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                className='w-full h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50'
              >
                <option value=''>{t.allShop}</option>
                {shops.map((s: AdminShopDto) => (
                  <option key={s.shopId} value={s.shopId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Date From Box */}
            <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all'>
              <label className='mb-3 block text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.from}</label>
              <input
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className='w-full h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50'
              />
            </div>

            {/* Date To Box */}
            <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all'>
              <label className='mb-3 block text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.to}</label>
              <input
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className='w-full h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Active Filters Display */}
      {(orderStatus || shopId || dateFrom || dateTo) && (
        <div className='flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4'>
          {orderStatus && (
            <div className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2'>
              <span className='text-xs font-medium text-gray-600'>{t.status}:</span>
              <span className='text-sm font-semibold text-gray-900'>{orderStatus}</span>
            </div>
          )}
          {shopId && (
            <div className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2'>
              <span className='text-xs font-medium text-gray-600'>{t.shop}:</span>
              <span className='text-sm font-semibold text-gray-900'>{shops.find(s => s.shopId === shopId)?.name || shopId}</span>
            </div>
          )}
          {dateFrom && (
            <div className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2'>
              <span className='text-xs font-medium text-gray-600'>{t.from}:</span>
              <span className='text-sm font-semibold text-gray-900'>{dateFrom}</span>
            </div>
          )}
          {dateTo && (
            <div className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2'>
              <span className='text-xs font-medium text-gray-600'>{t.to}:</span>
              <span className='text-sm font-semibold text-gray-900'>{dateTo}</span>
            </div>
          )}
        </div>
      )}

      <p className='text-sm text-gray-600'>
        {t.showing} <span className='font-semibold text-gray-900'>{filteredOrders.length}</span> {t.of}{' '}
        <span className='font-semibold text-gray-900'>{totalItems}</span> {t.orders}
        {totalPages > 1 && (
          <span className='ml-2'>
            {t.page} {page} / {totalPages}
          </span>
        )}
      </p>

      <section className='rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden'>
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
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    {t.noOrders}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
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
        <div className='flex gap-3 justify-center'>
          <button
            type='button'
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 hover:border-gray-300 disabled:hover:border-gray-200'
          >
            {t.previous}
          </button>
          <span className='flex items-center text-sm text-gray-600'>
            {t.page} {page} / {totalPages}
          </span>
          <button
            type='button'
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 hover:border-gray-300 disabled:hover:border-gray-200'
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  )
}
