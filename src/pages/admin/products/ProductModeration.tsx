import React from 'react'

const PENDING_BADGE = {
  label: '5 Pending Review',
  classes: 'inline-flex items-center rounded-2xl border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700'
}

type ProductStatus = 'Pending' | 'Approved' | 'Rejected'

type ProductRecord = {
  id: string
  name: string
  image: string
  shop: string
  category: string
  price: string
  status: ProductStatus
  submittedAt: string
}

const PRODUCTS: ProductRecord[] = [
  { id: 'PROD-5621', name: 'Reclaimed Barn Wood Shelves', image: 'https://placehold.co/64x64', shop: 'Rustic Revival Co', category: 'Shelving & Storage', price: '$285.00', status: 'Pending', submittedAt: 'Feb 10, 2026' },
  { id: 'PROD-5620', name: 'Live Edge Walnut Slab Table', image: 'https://placehold.co/64x64', shop: 'Natural Edge Studio', category: 'Tables', price: '$1,850.00', status: 'Pending', submittedAt: 'Feb 10, 2026' },
  { id: 'PROD-5619', name: 'Handcrafted Cedar Chest', image: 'https://placehold.co/64x64', shop: 'Heritage Woodworks', category: 'Storage & Chests', price: '$445.00', status: 'Pending', submittedAt: 'Feb 9, 2026' },
  { id: 'PROD-5618', name: 'Mahogany Executive Desk', image: 'https://placehold.co/64x64', shop: 'Executive Timber', category: 'Desks & Workstations', price: '$2,150.00', status: 'Approved', submittedAt: 'Feb 9, 2026' },
  { id: 'PROD-5617', name: 'Bamboo Floating Nightstand', image: 'https://placehold.co/64x64', shop: 'Eco Wood Designs', category: 'Bedroom Furniture', price: '$165.00', status: 'Rejected', submittedAt: 'Feb 9, 2026' },
  { id: 'PROD-5616', name: 'Oak Wine Cabinet', image: 'https://placehold.co/64x64', shop: 'Timber Crafts Co', category: 'Cabinets', price: '$725.00', status: 'Pending', submittedAt: 'Feb 8, 2026' },
  { id: 'PROD-5615', name: 'Maple Cutting Board Set', image: 'https://placehold.co/64x64', shop: 'Artisan Wood Co', category: 'Kitchen & Dining', price: '$89.00', status: 'Pending', submittedAt: 'Feb 8, 2026' },
  { id: 'PROD-5614', name: 'Teak Outdoor Bench', image: 'https://placehold.co/64x64', shop: 'Garden & Grove', category: 'Outdoor Furniture', price: '$565.00', status: 'Approved', submittedAt: 'Feb 7, 2026' }
]

const STATUS_STYLES: Record<ProductStatus, string> = {
  Pending: 'border border-orange-200 bg-orange-100 text-orange-700',
  Approved: 'border border-green-200 bg-green-100 text-green-700',
  Rejected: 'border border-red-200 bg-red-100 text-red-700'
}

const ACTION_BUTTON_BASE = 'rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900'

export default function ProductModeration() {
  return (
    <div className='space-y-6'>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Product Moderation</h1>
          <p className='text-sm text-gray-500'>Review and approve products submitted by sellers</p>
        </div>
        <span className={PENDING_BADGE.classes}>{PENDING_BADGE.label}</span>
      </header>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='space-y-2 md:col-span-2'>
            <label className='text-xs font-medium text-gray-700'>Search Product</label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='7' />
                  <path d='m16.5 16.5 4 4' strokeLinecap='round' />
                </svg>
              </span>
              <input
                type='search'
                placeholder='Product name...'
                className='h-10 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Status</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All statuses</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Shop</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All shops</option>
              <option>Rustic Revival Co</option>
              <option>Heritage Woodworks</option>
              <option>Timber Crafts Co</option>
              <option>Artisan Wood Co</option>
            </select>
          </div>
          <div className='space-y-2 md:col-span-2 lg:col-span-1'>
            <label className='text-xs font-medium text-gray-700'>Date Range</label>
            <input type='date' className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none' />
          </div>
        </div>
      </section>

      <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600'>
        <p>
          Showing <span className='font-semibold text-gray-900'>{PRODUCTS.length}</span> products
        </p>
        <div className='flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-gray-700'>
          <svg className='h-4 w-4 text-gray-500' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
            <path d='m6 10 6-6 6 6M6 14l6 6 6-6' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          <span>Sort by: Recent</span>
        </div>
      </div>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>Product</th>
                <th className='px-6 py-3 text-left'>Shop Name</th>
                <th className='px-6 py-3 text-left'>Category</th>
                <th className='px-6 py-3 text-left'>Price</th>
                <th className='px-6 py-3 text-left'>Status</th>
                <th className='px-6 py-3 text-left'>Submitted</th>
                <th className='px-6 py-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {PRODUCTS.map((product) => (
                <tr key={product.id} className='text-gray-900'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <img src={product.image} alt={product.name} className='h-12 w-12 rounded-xl border border-gray-200 object-cover' />
                      <div>
                        <p className='font-medium'>{product.name}</p>
                        <p className='text-xs text-gray-500'>{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-gray-700'>{product.shop}</td>
                  <td className='px-6 py-4 text-gray-700'>{product.category}</td>
                  <td className='px-6 py-4 font-semibold text-gray-900'>{product.price}</td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-gray-600'>{product.submittedAt}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center justify-center gap-2'>
                      <button type='button' className={ACTION_BUTTON_BASE}>
                        <span className='sr-only'>View details</span>
                        <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                          <path d='M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z' />
                          <circle cx='12' cy='12' r='2' />
                        </svg>
                      </button>
                      <button type='button' className={ACTION_BUTTON_BASE}>
                        <span className='sr-only'>Approve product</span>
                        <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                          <path d='m6 12 3 3 9-9' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                      </button>
                      <button type='button' className={ACTION_BUTTON_BASE}>
                        <span className='sr-only'>Reject product</span>
                        <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                          <path d='m6 6 12 12M6 18 18 6' strokeLinecap='round' />
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
