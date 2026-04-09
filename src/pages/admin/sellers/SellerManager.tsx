import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminService, queryKeys } from '@/services'
import type { AdminShopDto, ShopStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border border-green-200',
  PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
  SUSPENDED: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  UNKNOWN: 'bg-gray-100 text-gray-700 border border-gray-200',
}

const normalizeStatus = (s?: string): keyof typeof STATUS_STYLES => {
  const u = (s || '').toUpperCase()
  if (u in STATUS_STYLES) return u as keyof typeof STATUS_STYLES
  return 'UNKNOWN'
}

const fmtDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function SellerManager() {
  const { isVietnamese } = useAppLanguage()
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string | ''>('')
  const [sortBy, setSortBy] = React.useState<'newest' | 'name'>('newest')

  const { data: shops = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.shops(),
    queryFn: adminService.getAdminShops,
    staleTime: 60 * 1000,
  })

  const ownerIds = React.useMemo(() => [...new Set(shops.map((s) => s.ownerId))], [shops])

  const { data: accounts = [] } = useQuery({
    queryKey: queryKeys.admin.accounts(ownerIds),
    queryFn: () => adminService.getAccountsByIds(ownerIds),
    staleTime: 120 * 1000,
    enabled: ownerIds.length > 0,
  })

  const { data: productRows = [] } = useQuery({
    queryKey: queryKeys.admin.products(),
    queryFn: adminService.getAllProductMasters,
    staleTime: 60 * 1000,
  })

  const ownerName = React.useCallback(
    (ownerId: string) => accounts.find((a) => a.accountId === ownerId)?.name || accounts.find((a) => a.accountId === ownerId)?.username || ownerId.slice(0, 8),
    [accounts]
  )

  const productsByShop = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const p of productRows) {
      const sid = p.shopId
      if (!sid) continue
      m.set(sid, (m.get(sid) ?? 0) + 1)
    }
    return m
  }, [productRows])

  const mutation = useMutation({
    mutationFn: ({ shopId, status }: { shopId: string; status: ShopStatus }) =>
      adminService.updateShopStatus(shopId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.shops() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.snapshot() })
    },
  })

  const filtered = React.useMemo(() => {
    let list = [...shops]
    if (statusFilter) {
      list = list.filter((s) => normalizeStatus(s.status) === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((s) => {
        const owner = ownerName(s.ownerId).toLowerCase()
        return s.name.toLowerCase().includes(q) || owner.includes(q)
      })
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      const da = Date.parse(a.createdAt || '') || 0
      const db = Date.parse(b.createdAt || '') || 0
      return db - da
    })
    return list
  }, [shops, statusFilter, search, sortBy, ownerName])

  const t = React.useMemo(
    () => ({
      title: isVietnamese ? 'Quản lý cửa hàng' : 'Shop Management',
      subtitle: isVietnamese ? 'Quản lý thông tin cửa hàng, trạng thái và tài liệu.' : 'Manage shop information, statuses and documents.',
      searchLabel: isVietnamese ? 'Tìm kiếm cửa hàng' : 'Search Shops',
      searchPlaceholder: isVietnamese
        ? 'Tìm kiếm theo tên cửa hàng hoặc chủ shop...'
        : 'Search by shop name or owner...',
      statusLabel: isVietnamese ? 'Trạng thái' : 'Status',
      statusAll: isVietnamese ? 'Tất cả trạng thái' : 'All statuses',
      sortLabel: isVietnamese ? 'Sắp xếp' : 'Sort By',
      sortNewest: isVietnamese ? 'Mới nhất' : 'Newest',
      sortName: isVietnamese ? 'Theo tên' : 'Name',
      totalShops: isVietnamese ? 'Tổng cửa hàng' : 'Total Shops',
      activeShops: isVietnamese ? 'Cửa hàng hoạt động' : 'Active Shops',
      totalProducts: isVietnamese ? 'Tổng sản phẩm' : 'Total Products',
      avgRating: isVietnamese ? 'Đánh giá TB' : 'Avg Rating',
      avgRatingHint: isVietnamese ? 'Chưa có từ Admin API' : 'Not exposed in Admin API',
      shop: isVietnamese ? 'Cửa hàng' : 'Shop',
      owner: isVietnamese ? 'Chủ shop' : 'Owner',
      rating: isVietnamese ? 'Đánh giá' : 'Rating',
      products: isVietnamese ? 'Sản phẩm' : 'Products',
      created: isVietnamese ? 'Ngày tạo' : 'Created',
      actions: isVietnamese ? 'Thao tác' : 'Actions',
      loading: isVietnamese ? 'Đang tải cửa hàng…' : 'Loading shops…',
      empty: isVietnamese ? 'Không tìm thấy cửa hàng.' : 'No shops found.',
      updateFailed: isVietnamese ? 'Cập nhật thất bại' : 'Update failed',
      errorLoad: isVietnamese ? 'Tải cửa hàng thất bại' : 'Failed to load shops',
    }),
    [isVietnamese]
  )

  const metrics = React.useMemo(() => {
    const total = shops.length
    const active = shops.filter((s) => normalizeStatus(s.status) === 'ACTIVE').length
    const totalProducts = productRows.length
    return [
      { label: t.totalShops, value: String(total), accent: 'text-blue-600', bg: 'bg-blue-50' },
      { label: t.activeShops, value: String(active), accent: 'text-green-600', bg: 'bg-green-50' },
      { label: t.totalProducts, value: String(totalProducts), accent: 'text-purple-600', bg: 'bg-purple-50' },
      { label: t.avgRating, value: '—', accent: 'text-amber-600', bg: 'bg-amber-50', hint: t.avgRatingHint },
    ]
  }, [shops, productRows.length, t])

  return (
    <div className='space-y-6 px-0'>
      <section className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
        <p className='text-sm text-gray-500'>{t.subtitle}</p>
        {isError && (
          <p className='text-sm text-red-600'>{error instanceof Error ? error.message : t.errorLoad}</p>
        )}
      </section>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{isLoading ? '…' : metric.value}</p>
                {'hint' in metric && metric.hint && (
                  <p className='text-[11px] text-gray-400 mt-1'>{metric.hint}</p>
                )}
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.bg}`}>
                <span className={`text-lg font-bold ${metric.accent}`}>·</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='flex gap-4 items-start justify-between'>
          {/* Search - Left */}
          <div className='flex-[0.5] flex flex-col space-y-2'>
            <label className='text-xs font-medium text-gray-700'>{t.searchLabel}</label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='7' />
                  <path d='m16.5 16.5 4 4' strokeLinecap='round' />
                </svg>
              </span>
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className='h-10 w-full appearance-none rounded-xl border border-gray-200 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          {/* Status + Sort By - Right */}
          <div className='flex gap-3 items-start'>
            <div className='w-[120px] rounded-xl border border-gray-200 bg-white p-3'>
              <label className='mb-1 block text-xs font-medium text-gray-600'>{t.statusLabel}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              >
                <option value=''>{t.statusAll}</option>
                <option value='ACTIVE'>ACTIVE</option>
                <option value='PENDING'>PENDING</option>
                <option value='SUSPENDED'>SUSPENDED</option>
                <option value='REJECTED'>REJECTED</option>
              </select>
            </div>
            <div className='w-[120px] rounded-xl border border-gray-200 bg-white p-3'>
              <label className='mb-1 block text-xs font-medium text-gray-600'>{t.sortLabel}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'name')}
                className='h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              >
                <option value='newest'>{t.sortNewest}</option>
                <option value='name'>{t.sortName}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        {t.searchLabel}: <span className='font-semibold text-gray-900'>{filtered.length}</span>
        {mutation.isError && (
          <span className='ml-2 text-red-600 text-sm'>{t.updateFailed}</span>
        )}
      </p>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>{t.shop}</th>
                <th className='px-6 py-3 text-left'>{t.owner}</th>
                <th className='px-6 py-3 text-left'>{t.rating}</th>
                <th className='px-6 py-3 text-left'>{t.products}</th>
                <th className='px-6 py-3 text-left'>{t.statusLabel}</th>
                <th className='px-6 py-3 text-left'>{t.created}</th>
                <th className='px-6 py-3 text-center'>{t.actions}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className='px-6 py-8 text-center text-gray-500'>
                    {t.loading}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className='px-6 py-8 text-center text-gray-500'>
                    {t.empty}
                  </td>
                </tr>
              ) : (
                filtered.map((seller: AdminShopDto) => (
                  <tr key={seller.shopId} className='text-gray-900'>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {seller.logoUrl ? (
                          <img src={seller.logoUrl} alt={seller.name} className='h-12 w-12 rounded-full border border-gray-200 object-cover' />
                        ) : (
                          <div className='h-12 w-12 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500'>
                            {seller.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className='font-medium'>{seller.name}</p>
                          <p className='text-xs text-gray-500 font-mono'>{seller.shopId.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <p className='font-medium text-sm'>{ownerName(seller.ownerId)}</p>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='flex items-center gap-2 text-sm'>
                        {Array.from({ length: 5 }, (_, idx) => (
                          <svg
                            key={idx}
                            className={`h-4 w-4 ${idx < Math.floor(seller.rating || 0) ? 'fill-amber-400 stroke-amber-400' : 'fill-gray-200 stroke-gray-200'}`}
                            viewBox='0 0 24 24'
                            strokeWidth='1.5'
                          >
                            <path d='m12 3.5 2.4 5 5.6.8-4 3.9.9 5.6L12 16.8l-4.9 2.9.9-5.6-4-3.9 5.6-.8z' />
                          </svg>
                        ))}
                        <span className='text-xs font-medium'>{seller.rating ? seller.rating.toFixed(1) : '—'}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>{productsByShop.get(seller.shopId) ?? 0}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[normalizeStatus(seller.status)]}`}>
                        {normalizeStatus(seller.status) === 'UNKNOWN' ? (seller.status || '—') : normalizeStatus(seller.status)}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-gray-700'>{fmtDate(seller.createdAt)}</td>
                    <td className='px-6 py-4'>
                      <div className='flex flex-wrap items-center justify-center gap-2'>
                        {normalizeStatus(seller.status) === 'PENDING' && (
                          <>
                            <button
                              type='button'
                              disabled={mutation.isPending}
                              onClick={() => mutation.mutate({ shopId: seller.shopId, status: 'ACTIVE' })}
                              className='rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50'
                            >
                              Approve
                            </button>
                            <button
                              type='button'
                              disabled={mutation.isPending}
                              onClick={() => mutation.mutate({ shopId: seller.shopId, status: 'REJECTED' })}
                              className='rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50'
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {normalizeStatus(seller.status) === 'ACTIVE' && (
                          <button
                            type='button'
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ shopId: seller.shopId, status: 'SUSPENDED' })}
                            className='rounded-xl border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50'
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
