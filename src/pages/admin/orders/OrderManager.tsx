import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminOrderUtils, adminService, queryKeys } from '@/services'
import type { AdminShopDto } from '@/types'

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const fmtDateTime = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
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
  const [orderStatus, setOrderStatus] = React.useState('')
  const [shopId, setShopId] = React.useState('')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [page, setPage] = React.useState(1)
  const pageSize = 20

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
      { label: 'Orders (page)', value: String(list.length), iconBg: 'bg-blue-50' },
      { label: 'Page revenue', value: fmtMoney(revenue), iconBg: 'bg-green-50' },
      { label: 'Pending (page)', value: String(pending), iconBg: 'bg-orange-50' },
      { label: 'Delivered (page)', value: String(delivered), iconBg: 'bg-purple-50' },
    ]
  }, [orders])

  React.useEffect(() => {
    setPage(1)
  }, [orderStatus, shopId, dateFrom, dateTo])

  return (
    <div className='space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>Order Management</h1>
        <p className='text-sm text-gray-500'>
          Uses admin order list when available; otherwise merges <code className='text-xs'>GET /orders/Shop/&#123;shopId&#125;</code> (see API gaps).
        </p>
        {data?.source === 'aggregate' && (
          <p className='text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2'>
            Showing aggregated data — filters & pagination run on the client for this mode.
          </p>
        )}
        {isError && (
          <p className='text-sm text-red-600'>{error instanceof Error ? error.message : 'Failed to load orders'}</p>
        )}
      </header>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{isLoading ? '…' : metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconBg}`} />
            </div>
          </div>
        ))}
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='grid gap-4 lg:grid-cols-5'>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Order Status</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
            >
              <option value=''>All statuses</option>
              <option value='PENDING'>PENDING</option>
              <option value='CONFIRMED'>CONFIRMED</option>
              <option value='SHIPPED'>SHIPPED</option>
              <option value='DELIVERED'>DELIVERED</option>
              <option value='CANCELLED'>CANCELLED</option>
            </select>
          </div>
          <div className='space-y-2 lg:col-span-2'>
            <label className='text-xs font-medium text-gray-700'>Shop</label>
            <select
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
            >
              <option value=''>All shops</option>
              {shops.map((s: AdminShopDto) => (
                <option key={s.shopId} value={s.shopId}>
                  {s.shopName}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Date From</label>
            <input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Date To</label>
            <input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
            />
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        Showing <span className='font-semibold text-gray-900'>{orders.length}</span> of{' '}
        <span className='font-semibold text-gray-900'>{totalItems}</span> orders
        {totalPages > 1 && (
          <span className='ml-2'>
            Page {page} / {totalPages}
          </span>
        )}
      </p>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>Order</th>
                <th className='px-6 py-3 text-left'>Shop</th>
                <th className='px-6 py-3 text-left'>Total</th>
                <th className='px-6 py-3 text-left'>Order Status</th>
                <th className='px-6 py-3 text-left'>Placed</th>
                <th className='px-6 py-3 text-center'>Details</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-900'>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    Loading…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId}>
                    <td className='whitespace-nowrap px-6 py-4 font-mono text-sm'>
                      {order.orderCode || order.orderId}
                    </td>
                    <td className='px-6 py-4 text-gray-700'>{order.shopName ?? order.shopId ?? '—'}</td>
                    <td className='px-6 py-4 font-semibold'>{fmtMoney(adminOrderUtils.orderTotal(order))}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${styleForStatus(order.status)}`}>
                        {order.status ?? '—'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-gray-700'>{fmtDateTime(order.createdDate)}</td>
                    <td className='px-6 py-4 text-center text-xs text-gray-500'>API: order line items</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 && (
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className='rounded-xl border border-gray-200 px-4 py-2 text-sm disabled:opacity-40'
          >
            Previous
          </button>
          <button
            type='button'
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className='rounded-xl border border-gray-200 px-4 py-2 text-sm disabled:opacity-40'
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
