import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService, queryKeys } from '@/services'
import type { ProductMasterDto } from '@/types'

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

export default function ProductModeration() {
  const [search, setSearch] = React.useState('')
  const [shopFilter, setShopFilter] = React.useState('')

  const { data: shops = [] } = useQuery({
    queryKey: queryKeys.admin.shops(),
    queryFn: adminService.getAdminShops,
    staleTime: 120 * 1000,
  })

  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.products(),
    queryFn: adminService.getAllProductMasters,
    staleTime: 60 * 1000,
  })

  const shopNameById = React.useMemo(
    () => Object.fromEntries(shops.map((s) => [s.shopId, s.shopName])),
    [shops]
  )

  const filtered = React.useMemo(() => {
    let list = [...products]
    if (shopFilter) {
      list = list.filter((p) => p.shopId === shopFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => (p.productName || '').toLowerCase().includes(q) || (p.globalSku || '').toLowerCase().includes(q))
    }
    return list
  }, [products, shopFilter, search])

  return (
    <div className='space-y-6'>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Product catalog (admin)</h1>
          <p className='text-sm text-gray-500'>
            Data from <code className='text-xs'>GetAllProducts</code>. Dedicated moderation status is not in ADMIN_API_SPEC — use archive/delete when backend supports it.
          </p>
          {isError && (
            <p className='text-sm text-red-600 mt-1'>{error instanceof Error ? error.message : 'Error'}</p>
          )}
        </div>
        <span className='inline-flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700'>
          {products.length} products
        </span>
      </header>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='space-y-2 md:col-span-2'>
            <label className='text-xs font-medium text-gray-700'>Search</label>
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Product name or SKU'
              className='h-10 w-full rounded-xl border border-gray-200 px-4 text-sm'
            />
          </div>
          <div className='space-y-2 md:col-span-2'>
            <label className='text-xs font-medium text-gray-700'>Shop</label>
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm'
            >
              <option value=''>All shops</option>
              {shops.map((s) => (
                <option key={s.shopId} value={s.shopId}>
                  {s.shopName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600'>
        <p>
          Showing <span className='font-semibold text-gray-900'>{filtered.length}</span> products
        </p>
      </div>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>Product</th>
                <th className='px-6 py-3 text-left'>Shop</th>
                <th className='px-6 py-3 text-left'>Category id</th>
                <th className='px-6 py-3 text-left'>Price</th>
                <th className='px-6 py-3 text-left'>Archived</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                    No products.
                  </td>
                </tr>
              ) : (
                filtered.map((product: ProductMasterDto) => {
                  const id = product.productId || product.id || ''
                  const shop = product.shopId ? shopNameById[product.shopId] || product.shopId : '—'
                  return (
                    <tr key={id || product.globalSku} className='text-gray-900'>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-12 w-12 rounded-xl border border-gray-200 bg-gray-50' />
                          <div>
                            <p className='font-medium'>{product.productName ?? '—'}</p>
                            <p className='text-xs text-gray-500 font-mono'>{product.globalSku || id}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-gray-700'>{shop}</td>
                      <td className='px-6 py-4 font-mono text-xs'>{product.categoryId ?? '—'}</td>
                      <td className='px-6 py-4 font-semibold'>
                        {product.basePrice != null ? fmtMoney(Number(product.basePrice)) : '—'}
                      </td>
                      <td className='px-6 py-4'>{product.isArchived ? 'Yes' : 'No'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
