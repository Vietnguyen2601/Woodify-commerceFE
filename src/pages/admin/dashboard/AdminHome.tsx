import React from 'react'

const metricCards = [
  {
    label: 'Total Shops',
    value: '847',
    change: '+12.5%',
    accent: 'bg-blue-50 text-blue-600',
    icon: 'store'
  },
  {
    label: 'Total Products',
    value: '12,483',
    change: '+8.2%',
    accent: 'bg-purple-50 text-purple-600',
    icon: 'package'
  },
  {
    label: 'Pending Approvals',
    value: '23',
    change: '-5 from yesterday',
    accent: 'bg-orange-50 text-orange-600',
    icon: 'clipboard'
  },
  {
    label: 'Today Orders',
    value: '156',
    change: '+18.3%',
    accent: 'bg-green-50 text-green-600',
    icon: 'cart'
  },
  {
    label: 'GMV Today',
    value: '$24,589',
    change: '+22.1%',
    accent: 'bg-emerald-50 text-emerald-600',
    icon: 'gmv'
  },
  {
    label: 'Platform Revenue',
    value: '$3,688',
    change: '+15.8%',
    accent: 'bg-teal-50 text-teal-600',
    icon: 'revenue'
  }
]

const orderTrend = [
  { day: 'Jan 12', value: 68 },
  { day: 'Jan 17', value: 92 },
  { day: 'Jan 22', value: 75 },
  { day: 'Jan 27', value: 110 },
  { day: 'Feb 1', value: 135 },
  { day: 'Feb 6', value: 160 }
]

const topShops = [
  { name: 'Timber Crafts Co', revenue: 20500 },
  { name: 'Oak & Maple Studio', revenue: 17800 },
  { name: 'Heritage Woodworks', revenue: 16400 },
  { name: 'Natural Grain', revenue: 15200 },
  { name: 'Artisan Wood Co', revenue: 15200 }
]

const latestOrders = [
  {
    id: 'ORD-2847',
    customer: 'Sarah Johnson',
    shop: 'Timber Crafts Co',
    product: 'Oak Dining Table Set',
    amount: '$1,245.00',
    status: 'Delivered',
    statusTone: 'success',
    date: 'Feb 10, 2026'
  },
  {
    id: 'ORD-2846',
    customer: 'Michael Chen',
    shop: 'Heritage Woodworks',
    product: 'Walnut Bookshelf',
    amount: '$689.50',
    status: 'Shipped',
    statusTone: 'info',
    date: 'Feb 10, 2026'
  },
  {
    id: 'ORD-2845',
    customer: 'Emma Williams',
    shop: 'Natural Grain',
    product: 'Maple Coffee Table',
    amount: '$425.00',
    status: 'Processing',
    statusTone: 'warning',
    date: 'Feb 10, 2026'
  },
  {
    id: 'ORD-2844',
    customer: 'David Martinez',
    shop: 'Oak & Maple Studio',
    product: 'Cherry Wood Desk',
    amount: '$890.00',
    status: 'Pending',
    statusTone: 'pending',
    date: 'Feb 9, 2026'
  },
  {
    id: 'ORD-2843',
    customer: 'Lisa Anderson',
    shop: 'Artisan Wood Co',
    product: 'Pine Bed Frame',
    amount: '$1,150.00',
    status: 'Delivered',
    statusTone: 'success',
    date: 'Feb 9, 2026'
  },
  {
    id: 'ORD-2842',
    customer: 'James Wilson',
    shop: 'Timber Crafts Co',
    product: 'Teak Garden Bench',
    amount: '$485.00',
    status: 'Shipped',
    statusTone: 'info',
    date: 'Feb 9, 2026'
  }
]

const moderationQueue = [
  {
    id: 'PROD-5621',
    name: 'Reclaimed Barn Wood Shelves',
    shop: 'Rustic Revival Co',
    category: 'Shelving & Storage',
    price: '$285.00',
    submitted: 'Feb 10, 2026',
    assets: '4 images'
  },
  {
    id: 'PROD-5620',
    name: 'Live Edge Walnut Slab Table',
    shop: 'Natural Edge Studio',
    category: 'Tables',
    price: '$1,850.00',
    submitted: 'Feb 10, 2026',
    assets: '6 images'
  },
  {
    id: 'PROD-5619',
    name: 'Handcrafted Cedar Chest',
    shop: 'Heritage Woodworks',
    category: 'Storage & Chests',
    price: '$445.00',
    submitted: 'Feb 9, 2026',
    assets: '5 images'
  },
  {
    id: 'PROD-5618',
    name: 'Mahogany Executive Desk',
    shop: 'Executive Timber',
    category: 'Desks & Workstations',
    price: '$2,150.00',
    submitted: 'Feb 9, 2026',
    assets: '7 images'
  },
  {
    id: 'PROD-5617',
    name: 'Bamboo Floating Nightstand',
    shop: 'Eco Wood Designs',
    category: 'Bedroom Furniture',
    price: '$165.00',
    submitted: 'Feb 9, 2026',
    assets: '3 images'
  }
]

const statusStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pending: 'bg-orange-100 text-orange-700 border-orange-200'
}

const iconStroke = 'currentColor'

const StatIcon: React.FC<{ variant: string; accent: string }> = ({ variant, accent }) => {
  const strokeWidth = 1.5
  const stroke = accent.includes('text-') ? accent.split(' ')[1]?.replace('text-', '') : iconStroke
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
    case 'revenue':
      return (
        <svg {...commonProps} className={colorClass}>
          <path d='M6 18h12' />
          <path d='M12 6v8' />
          <path d='M9 9h6' />
          <path d='M9 13h6' />
        </svg>
      )
    default:
      return null
  }
}

export default function AdminHome() {
  const maxOrderValue = Math.max(...orderTrend.map((item) => item.value))
  const maxShopRevenue = Math.max(...topShops.map((shop) => shop.revenue))

  return (
    <div className='flex flex-col gap-6 px-6 py-6'>
      <header className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold text-neutral-900'>Dashboard Overview</h1>
        <p className='text-sm text-neutral-500'>Welcome back, here&apos;s what&apos;s happening today</p>
      </header>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {metricCards.map((metric) => (
          <article key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/5 flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${metric.accent}`}>
                <StatIcon variant={metric.icon} accent={metric.accent} />
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-medium text-gray-500'>{metric.label}</span>
              <strong className='text-2xl font-bold text-neutral-900'>{metric.value}</strong>
              <span className='text-xs font-medium text-emerald-600'>{metric.change}</span>
            </div>
          </article>
        ))}
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/5 flex flex-col gap-4'>
          <header>
            <h2 className='text-base font-semibold text-neutral-900'>Orders Last 30 Days</h2>
            <p className='text-sm text-neutral-500'>Daily order volume trend</p>
          </header>
          <div className='flex items-end gap-3 h-60 border-b border-gray-100 pb-3 relative'>
            {orderTrend.map((point) => (
              <div key={point.day} className='flex flex-1 flex-col items-center gap-2'>
                <div className='w-full rounded-full bg-gradient-to-b from-stone-500 to-stone-400' style={{ height: `${(point.value / maxOrderValue) * 100}%` }} />
                <span className='text-xs text-gray-400'>{point.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/5 flex flex-col gap-4'>
          <header>
            <h2 className='text-base font-semibold text-neutral-900'>Top 5 Shops by Revenue</h2>
            <p className='text-sm text-neutral-500'>Last 30 days performance</p>
          </header>
          <div className='flex flex-col gap-4'>
            {topShops.map((shop) => (
              <div key={shop.name} className='flex flex-col gap-2'>
                <div className='flex items-center justify-between text-sm text-gray-600'>
                  <span>{shop.name}</span>
                  <span>${(shop.revenue / 1000).toFixed(1)}k</span>
                </div>
                <div className='h-3 rounded-full bg-gray-100'>
                  <div
                    className='h-full rounded-full bg-gradient-to-r from-stone-500 to-stone-400'
                    style={{ width: `${(shop.revenue / maxShopRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='flex flex-col gap-6'>
        <div className='rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/5'>
          <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
            <div>
              <h2 className='text-base font-semibold text-neutral-900'>Latest Orders</h2>
              <p className='text-sm text-neutral-500'>Recent orders across all shops</p>
            </div>
            <button type='button' className='text-sm font-medium text-stone-500'>View All</button>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-sm'>
              <thead>
                <tr className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <th className='px-6 py-3'>Order ID</th>
                  <th className='px-6 py-3'>Customer</th>
                  <th className='px-6 py-3'>Shop</th>
                  <th className='px-6 py-3'>Product</th>
                  <th className='px-6 py-3'>Amount</th>
                  <th className='px-6 py-3'>Status</th>
                  <th className='px-6 py-3'>Date</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr key={order.id} className='border-b border-gray-100 last:border-b-0'>
                    <td className='px-6 py-4 font-medium text-gray-900'>{order.id}</td>
                    <td className='px-6 py-4 text-gray-700'>{order.customer}</td>
                    <td className='px-6 py-4 text-gray-700'>{order.shop}</td>
                    <td className='px-6 py-4 text-gray-700'>{order.product}</td>
                    <td className='px-6 py-4 text-gray-900'>{order.amount}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium ${statusStyles[order.statusTone]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-gray-500'>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/5'>
          <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
            <div>
              <h2 className='text-base font-semibold text-neutral-900'>Products Pending Moderation</h2>
              <p className='text-sm text-neutral-500'>Review and approve new product listings</p>
            </div>
            <span className='rounded-xl border border-orange-200 bg-orange-100 px-4 py-1 text-sm font-medium text-orange-700'>5 Pending</span>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[780px] text-sm'>
              <thead>
                <tr className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <th className='px-6 py-3'>Product ID</th>
                  <th className='px-6 py-3'>Product Name</th>
                  <th className='px-6 py-3'>Shop</th>
                  <th className='px-6 py-3'>Category</th>
                  <th className='px-6 py-3'>Price</th>
                  <th className='px-6 py-3'>Submitted</th>
                  <th className='px-6 py-3 text-center'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {moderationQueue.map((product) => (
                  <tr key={product.id} className='border-b border-gray-100 last:border-b-0'>
                    <td className='px-6 py-4 font-medium text-gray-900'>{product.id}</td>
                    <td className='px-6 py-4'>
                      <div className='flex flex-col'>
                        <span className='font-medium text-gray-900'>{product.name}</span>
                        <span className='text-xs text-gray-500'>{product.assets}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-gray-700'>{product.shop}</td>
                    <td className='px-6 py-4 text-gray-700'>{product.category}</td>
                    <td className='px-6 py-4 text-gray-900'>{product.price}</td>
                    <td className='px-6 py-4 text-gray-500'>{product.submitted}</td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button type='button' className='flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50' aria-label='Preview product'>
                          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                            <circle cx='12' cy='12' r='3' />
                            <path d='M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z' />
                          </svg>
                        </button>
                        <button type='button' className='flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50' aria-label='Approve product'>
                          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                            <path d='M5 13l4 4L19 7' />
                          </svg>
                        </button>
                        <button type='button' className='flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50' aria-label='Reject product'>
                          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                            <path d='M6 18L18 6M6 6l12 12' />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
