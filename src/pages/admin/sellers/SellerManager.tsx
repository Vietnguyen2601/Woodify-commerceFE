import React from 'react'

const METRICS = [
  {
    label: 'Total Shops',
    value: '8',
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: (
      <svg className='h-5 w-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M4 10.5h16M6 7l6-4 6 4M6 10.5v7.5h12v-7.5' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M9.5 18.5v-4h5v4' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  },
  {
    label: 'Active Shops',
    value: '5',
    accent: 'text-green-600',
    bg: 'bg-green-50',
    icon: (
      <svg className='h-5 w-5 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='m6 12 3 3 9-9' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  },
  {
    label: 'Total Products',
    value: '649',
    accent: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: (
      <svg className='h-5 w-5 text-purple-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M4 7h16v10H4z' strokeLinejoin='round' />
        <path d='M9 3v4M15 3v4M9 17v4M15 17v4' strokeLinecap='round' />
      </svg>
    )
  },
  {
    label: 'Avg Rating',
    value: '4.5 ★',
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: (
      <svg className='h-5 w-5 text-amber-500' viewBox='0 0 24 24' fill='currentColor'>
        <path d='m12 3.5 2.4 5 5.6.8-4 3.9.9 5.6L12 16.8l-4.9 2.9.9-5.6-4-3.9 5.6-.8z' />
      </svg>
    )
  }
]

const SELLERS = [
  {
    shop: 'Modern Wood Design',
    code: 'SHP-007',
    owner: 'Michael Lee',
    email: 'michael@modernwood.com',
    rating: 4.2,
    reviews: 87,
    products: 43,
    orders: 198,
    status: 'Inactive',
    joined: 'Jan 20, 2025',
    avatar: 'https://placehold.co/48x48'
  },
  {
    shop: 'Wood & Iron Works',
    code: 'SHP-008',
    owner: 'Thomas Brown',
    email: 'thomas@woodiron.com',
    rating: 3.8,
    reviews: 45,
    products: 28,
    orders: 89,
    status: 'Banned',
    joined: 'Nov 10, 2024',
    avatar: 'https://placehold.co/48x48'
  },
  {
    shop: 'Rustic Revival',
    code: 'SHP-006',
    owner: 'Emily Anderson',
    email: 'emily@rusticrevival.com',
    rating: 4.4,
    reviews: 124,
    products: 52,
    orders: 321,
    status: 'Suspended',
    joined: 'Aug 5, 2024',
    avatar: 'https://placehold.co/48x48'
  },
  {
    shop: 'Natural Grain',
    code: 'SHP-003',
    owner: 'David Martinez',
    email: 'david@naturalgrain.com',
    rating: 4.6,
    reviews: 156,
    products: 68,
    orders: 543,
    status: 'Active',
    joined: 'Jul 10, 2024',
    avatar: 'https://placehold.co/48x48'
  },
  {
    shop: 'Artisan Wood Co',
    code: 'SHP-005',
    owner: 'James Patterson',
    email: 'james@artisanwood.com',
    rating: 4.5,
    reviews: 198,
    products: 81,
    orders: 678,
    status: 'Active',
    joined: 'Jun 12, 2024',
    avatar: 'https://placehold.co/48x48'
  },
  {
    shop: 'Heritage Woodworks',
    code: 'SHP-002',
    owner: 'Margaret Chen',
    email: 'margaret@heritagewood.com',
    rating: 4.9,
    reviews: 289,
    products: 94,
    orders: 987,
    status: 'Active',
    joined: 'May 20, 2024',
    avatar: 'https://placehold.co/48x48'
  },
  {
    shop: 'Timber Crafts Co',
    code: 'SHP-001',
    owner: 'Robert Wilson',
    email: 'robert@timbercrafts.com',
    rating: 4.8,
    reviews: 342,
    products: 127,
    orders: 1456,
    status: 'Active',
    joined: 'Mar 15, 2024',
    avatar: 'https://placehold.co/48x48'
  },
  {
    shop: 'Oak & Maple Studio',
    code: 'SHP-004',
    owner: 'Sarah Johnson',
    email: 'sarah@oakmaple.com',
    rating: 4.7,
    reviews: 412,
    products: 156,
    orders: 1823,
    status: 'Active',
    joined: 'Feb 1, 2024',
    avatar: 'https://placehold.co/48x48'
  }
]

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 border border-green-200',
  Suspended: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Banned: 'bg-red-100 text-red-700 border border-red-200',
  Inactive: 'bg-gray-100 text-gray-700 border border-gray-200'
}

const starArray = Array.from({ length: 5 })

export default function SellerManager() {
  return (
    <div className='space-y-6 px-0'>
      <section className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>Shop Management</h1>
        <p className='text-sm text-gray-500'>Monitor and manage all shops on the platform</p>
      </section>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {METRICS.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.bg}`}>
                {metric.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='grid gap-4 lg:grid-cols-[2fr_1fr_1fr]'>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Search Shops</label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='7' />
                  <path d='m16.5 16.5 4 4' strokeLinecap='round' />
                </svg>
              </span>
              <input
                type='search'
                placeholder='Search by shop name or owner...'
                className='h-10 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Status</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All statuses</option>
              <option>Active</option>
              <option>Suspended</option>
              <option>Banned</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Sort By</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>Newest</option>
              <option>Rating</option>
              <option>Orders</option>
              <option>Products</option>
            </select>
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        Showing <span className='font-semibold text-gray-900'>{SELLERS.length}</span> shops
      </p>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>Shop</th>
                <th className='px-6 py-3 text-left'>Owner</th>
                <th className='px-6 py-3 text-left'>Rating</th>
                <th className='px-6 py-3 text-left'>Products</th>
                <th className='px-6 py-3 text-left'>Orders</th>
                <th className='px-6 py-3 text-left'>Status</th>
                <th className='px-6 py-3 text-left'>Created</th>
                <th className='px-6 py-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {SELLERS.map((seller) => (
                <tr key={seller.shop} className='text-gray-900'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <img src={seller.avatar} alt={seller.shop} className='h-12 w-12 rounded-full border border-gray-200' />
                      <div>
                        <p className='font-medium'>{seller.shop}</p>
                        <p className='text-xs text-gray-500'>{seller.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <p className='font-medium'>{seller.owner}</p>
                    <p className='text-xs text-gray-500'>{seller.email}</p>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center gap-2 text-sm'>
                      <div className='flex items-center gap-1 text-amber-500'>
                        {starArray.map((_, idx) => (
                          <svg
                            key={idx}
                            className={`h-4 w-4 ${idx < Math.round(seller.rating) ? 'fill-amber-400 stroke-amber-400' : 'fill-none stroke-gray-300'}`}
                            viewBox='0 0 24 24'
                            strokeWidth='1.5'
                          >
                            <path d='m12 3.5 2.4 5 5.6.8-4 3.9.9 5.6L12 16.8l-4.9 2.9.9-5.6-4-3.9 5.6-.8z' />
                          </svg>
                        ))}
                      </div>
                      <span className='font-medium text-gray-900'>{seller.rating.toFixed(1)}</span>
                      <span className='text-xs text-gray-500'>{seller.reviews} reviews</span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>{seller.products}</td>
                  <td className='px-6 py-4'>{seller.orders.toLocaleString()}</td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[seller.status]}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-gray-700'>{seller.joined}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center justify-center gap-2'>
                      <button type='button' className='rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50'>
                        <span className='sr-only'>View details</span>
                        <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                          <path d='M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z' />
                          <circle cx='12' cy='12' r='2.5' />
                        </svg>
                      </button>
                      <button type='button' className='rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50'>
                        <span className='sr-only'>Contact shop</span>
                        <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                          <path d='M4 5h16v12H5.17L4 18.17z' strokeLinejoin='round' />
                          <path d='m4 5 8 7 8-7' />
                        </svg>
                      </button>
                      <button type='button' className='rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50'>
                        <span className='sr-only'>More actions</span>
                        <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                          <circle cx='6' cy='12' r='1.5' />
                          <circle cx='12' cy='12' r='1.5' />
                          <circle cx='18' cy='12' r='1.5' />
                        </svg>
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
