import React from 'react'

const METRICS = [
  {
    label: 'Total Orders',
    value: '10',
    iconBg: 'bg-blue-50',
    icon: (
      <svg className='h-5 w-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M4 6h16v12H4z' strokeLinejoin='round' />
        <path d='M4 10h16M9 2v4M15 2v4' strokeLinecap='round' />
      </svg>
    )
  },
  {
    label: 'Total Revenue',
    value: '$6,339.50',
    iconBg: 'bg-green-50',
    icon: (
      <svg className='h-5 w-5 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M12 5v14M8 9h5.5a3.5 3.5 0 1 1 0 7H8' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  },
  {
    label: 'Pending Orders',
    value: '1',
    iconBg: 'bg-orange-50',
    icon: (
      <svg className='h-5 w-5 text-orange-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M12 6v6l3 3' strokeLinecap='round' strokeLinejoin='round' />
        <circle cx='12' cy='12' r='9' />
      </svg>
    )
  },
  {
    label: 'Completed',
    value: '2',
    iconBg: 'bg-purple-50',
    icon: (
      <svg className='h-5 w-5 text-purple-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='m6 12 3 3 9-9' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z' />
      </svg>
    )
  }
]

type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded'
type OrderStatus = 'Delivered' | 'Shipped' | 'Processing' | 'Pending' | 'Cancelled' | 'Refunded' | 'Confirmed'

type OrderRecord = {
  code: string
  customer: string
  email: string
  shop: string
  total: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  placedAt: string
}

const ORDERS: OrderRecord[] = [
  { code: 'ORD-2026-001847', customer: 'Sarah Johnson', email: 'sarah.johnson@email.com', shop: 'Timber Crafts Co', total: '$1245.00', paymentStatus: 'Paid', orderStatus: 'Delivered', placedAt: 'Feb 10, 2026, 02:30 PM' },
  { code: 'ORD-2026-001846', customer: 'Michael Chen', email: 'michael.chen@email.com', shop: 'Heritage Woodworks', total: '$689.50', paymentStatus: 'Paid', orderStatus: 'Shipped', placedAt: 'Feb 10, 2026, 10:15 AM' },
  { code: 'ORD-2026-001845', customer: 'Emma Williams', email: 'emma.williams@email.com', shop: 'Natural Grain', total: '$425.00', paymentStatus: 'Paid', orderStatus: 'Processing', placedAt: 'Feb 10, 2026, 08:45 AM' },
  { code: 'ORD-2026-001844', customer: 'David Martinez', email: 'david.martinez@email.com', shop: 'Oak & Maple Studio', total: '$890.00', paymentStatus: 'Pending', orderStatus: 'Pending', placedAt: 'Feb 9, 2026, 04:20 PM' },
  { code: 'ORD-2026-001843', customer: 'Lisa Anderson', email: 'lisa.anderson@email.com', shop: 'Artisan Wood Co', total: '$1150.00', paymentStatus: 'Paid', orderStatus: 'Delivered', placedAt: 'Feb 9, 2026, 02:00 PM' },
  { code: 'ORD-2026-001842', customer: 'James Wilson', email: 'james.wilson@email.com', shop: 'Timber Crafts Co', total: '$485.00', paymentStatus: 'Paid', orderStatus: 'Shipped', placedAt: 'Feb 9, 2026, 11:30 AM' },
  { code: 'ORD-2026-001841', customer: 'Olivia Brown', email: 'olivia.brown@email.com', shop: 'Heritage Woodworks', total: '$325.00', paymentStatus: 'Failed', orderStatus: 'Cancelled', placedAt: 'Feb 8, 2026, 03:45 PM' },
  { code: 'ORD-2026-001840', customer: 'Robert Taylor', email: 'robert.taylor@email.com', shop: 'Natural Grain', total: '$2150.00', paymentStatus: 'Refunded', orderStatus: 'Refunded', placedAt: 'Feb 8, 2026, 09:20 AM' },
  { code: 'ORD-2026-001839', customer: 'Sophia Davis', email: 'sophia.davis@email.com', shop: 'Oak & Maple Studio', total: '$765.00', paymentStatus: 'Paid', orderStatus: 'Confirmed', placedAt: 'Feb 7, 2026, 01:10 PM' },
  { code: 'ORD-2026-001838', customer: 'William Moore', email: 'william.moore@email.com', shop: 'Artisan Wood Co', total: '$1580.00', paymentStatus: 'Paid', orderStatus: 'Processing', placedAt: 'Feb 7, 2026, 10:00 AM' }
]

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  Paid: 'bg-green-100 text-green-700 border border-green-200',
  Pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Failed: 'bg-red-100 text-red-700 border border-red-200',
  Refunded: 'bg-purple-100 text-purple-700 border border-purple-200'
}

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  Delivered: 'bg-green-100 text-green-700 border border-green-200',
  Shipped: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  Processing: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  Pending: 'bg-gray-100 text-gray-700 border border-gray-200',
  Cancelled: 'bg-red-100 text-red-700 border border-red-200',
  Refunded: 'bg-purple-100 text-purple-700 border border-purple-200',
  Confirmed: 'bg-blue-100 text-blue-700 border border-blue-200'
}

export default function OrderManager() {
  return (
    <div className='space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>Order Management</h1>
        <p className='text-sm text-gray-500'>Monitor and manage all platform orders</p>
      </header>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {METRICS.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconBg}`}>{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='grid gap-4 lg:grid-cols-5'>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Order Status</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All statuses</option>
              <option>Delivered</option>
              <option>Shipped</option>
              <option>Processing</option>
              <option>Pending</option>
              <option>Cancelled</option>
              <option>Refunded</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Payment Status</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All payments</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Failed</option>
              <option>Refunded</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Shop</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All shops</option>
              <option>Timber Crafts Co</option>
              <option>Heritage Woodworks</option>
              <option>Natural Grain</option>
              <option>Oak & Maple Studio</option>
              <option>Artisan Wood Co</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Date From</label>
            <input type='date' className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none' />
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Date To</label>
            <input type='date' className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none' />
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        Showing <span className='font-semibold text-gray-900'>{ORDERS.length}</span> orders
      </p>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>Order Code</th>
                <th className='px-6 py-3 text-left'>Customer</th>
                <th className='px-6 py-3 text-left'>Shop</th>
                <th className='px-6 py-3 text-left'>Total Amount</th>
                <th className='px-6 py-3 text-left'>Payment</th>
                <th className='px-6 py-3 text-left'>Order Status</th>
                <th className='px-6 py-3 text-left'>Placed Date</th>
                <th className='px-6 py-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-900'>
              {ORDERS.map((order) => (
                <tr key={order.code}>
                  <td className='whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900'>{order.code}</td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <p className='font-medium'>{order.customer}</p>
                    <p className='text-xs text-gray-500'>{order.email}</p>
                  </td>
                  <td className='px-6 py-4 text-gray-700'>{order.shop}</td>
                  <td className='px-6 py-4 font-semibold text-gray-900'>{order.total}</td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-gray-700'>{order.placedAt}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center justify-center'>
                      <button
                        type='button'
                        className='inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-stone-500 to-stone-600 px-4 py-2 text-sm font-semibold text-white shadow'
                      >
                        <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                          <path d='M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z' />
                          <circle cx='12' cy='12' r='2' />
                        </svg>
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
