import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminService, queryKeys } from '@/services'
import type { AdminShopDto, ShopStatus } from '@/types'

const fmtDateTime = (iso: string | undefined, locale: 'vi-VN' | 'en-US') => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso || '—'
  }
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-gray-100 text-gray-700',
}

export default function ShopManager() {
  const { isVietnamese } = useAppLanguage()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('')
  const [selectedShop, setSelectedShop] = React.useState<AdminShopDto | null>(null)
  const [newStatus, setNewStatus] = React.useState<ShopStatus>('ACTIVE')
  const [suspendReason, setSuspendReason] = React.useState('')

  const t = {
    eyebrow: isVietnamese ? 'Cửa hàng' : 'Shops',
    title: isVietnamese ? 'Quản lý Cửa Hàng' : 'Shop Management',
    subtitle: isVietnamese ? 'Xem, phê duyệt hoặc tạm dừng các cửa hàng.' : 'View, approve or suspend shops.',
    search: isVietnamese ? 'Tìm kiếm...' : 'Search...',
    searchPlaceholder: isVietnamese ? 'Tên cửa hàng hoặc ID chủ sở hữu' : 'Shop name or owner ID',
    name: isVietnamese ? 'Tên cửa hàng' : 'Shop Name',
    owner: isVietnamese ? 'Chủ sở hữu' : 'Owner',
    status: isVietnamese ? 'Trạng thái' : 'Status',
    created: isVietnamese ? 'Tạo lúc' : 'Created',
    actions: isVietnamese ? 'Hành động' : 'Actions',
    view: isVietnamese ? 'Xem' : 'View',
    approve: isVietnamese ? 'Phê duyệt' : 'Approve',
    suspend: isVietnamese ? 'Tạm dừng' : 'Suspend',
    resume: isVietnamese ? 'Khôi phục' : 'Resume',
    noResults: isVietnamese ? 'Không tìm thấy cửa hàng' : 'No shops found',
    loading: isVietnamese ? 'Đang tải...' : 'Loading...',
    loadFailed: isVietnamese ? 'Không tải được danh sách cửa hàng' : 'Failed to load shops',
    active: isVietnamese ? 'Hoạt động' : 'Active',
    suspended: isVietnamese ? 'Tạm dừng' : 'Suspended',
    pending: isVietnamese ? 'Chờ duyệt' : 'Pending',
    rejected: isVietnamese ? 'Từ chối' : 'Rejected',
    reason: isVietnamese ? 'Lý do' : 'Reason',
    reasonPlaceholder: isVietnamese ? 'Lý do tạm dừng (tuỳ chọn)' : 'Reason for suspension (optional)',
    update: isVietnamese ? 'Cập nhật' : 'Update',
    cancel: isVietnamese ? 'Hủy' : 'Cancel',
  }

  const { data: shops = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.ADMIN_SHOPS],
    queryFn: () => adminService.getAdminShops(),
    staleTime: 0, // Always fresh
    gcTime: 1000, // Clear cache after 1 second
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({
      shopId,
      status,
      reason,
    }: {
      shopId: string
      status: ShopStatus
      reason?: string
    }) => adminService.updateShopStatus(shopId, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.ADMIN_SHOPS] })
      setSelectedShop(null)
    },
  })

  const filtered = React.useMemo(() => {
    let list = shops
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(term) ||
          s.ownerId?.toLowerCase().includes(term)
      )
    }
    if (filterStatus) {
      list = list.filter((s) => (s.status || '').toUpperCase() === filterStatus.toUpperCase())
    }
    return list
  }, [shops, searchTerm, filterStatus])

  const handleUpdateStatus = () => {
    if (!selectedShop) return
    updateStatusMutation.mutate({
      shopId: selectedShop.shopId,
      status: newStatus,
      reason: suspendReason,
    })
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <p className='text-sm font-semibold uppercase tracking-wider text-gray-500'>{t.eyebrow}</p>
        <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
        <p className='text-gray-600'>{t.subtitle}</p>
      </div>

      {/* Filters */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
        <div className='flex gap-4 items-start justify-between'>
          {/* Search - Left */}
          <div className='flex-[0.5] flex flex-col space-y-2'>
            <label className='text-xs font-medium text-gray-700'>{t.search}</label>
            <div className='relative'>
              <svg className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className='w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm appearance-none focus:border-blue-500 focus:outline-none'
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          {/* Status - Right */}
          <div className='flex gap-4 items-start'>
            <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm hover:border-gray-300 hover:shadow-md transition-all min-w-max'>
              <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.status}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50 hover:border-gray-300 transition-colors'
              >
                <option value=''>All Status</option>
                <option value='ACTIVE'>{t.active}</option>
                <option value='SUSPENDED'>{t.suspended}</option>
                <option value='PENDING'>{t.pending}</option>
                <option value='REJECTED'>{t.rejected}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          {t.loadFailed}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className='flex justify-center py-8'>
          <div className='text-gray-500'>{t.loading}</div>
        </div>
      )}

      {/* Shops table */}
      {!isLoading && filtered.length > 0 && (
        <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
          <table className='w-full'>
            <thead className='border-b border-gray-200 bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.name}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.owner}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.status}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.created}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.actions}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filtered.map((shop) => (
                <tr key={shop.shopId} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 text-sm font-medium text-gray-900'>{shop.name || '—'}</td>
                  <td className='px-6 py-4 text-sm text-gray-700'>{shop.ownerId || '—'}</td>
                  <td className='px-6 py-4 text-sm'>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[shop.status || 'PENDING']}`}>
                      {shop.status || 'PENDING'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-500'>
                    {fmtDateTime(shop.createdAt, isVietnamese ? 'vi-VN' : 'en-US')}
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    <button
                      onClick={() => {
                        setSelectedShop(shop)
                        setNewStatus((shop.status as ShopStatus) || 'ACTIVE')
                        setSuspendReason('')
                      }}
                      className='rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200'
                    >
                      {t.view}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && !error && (
        <div className='flex justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12'>
          <div className='text-center'>
            <p className='text-gray-500'>{t.noResults}</p>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedShop && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-lg font-bold text-gray-900'>{selectedShop.name}</h2>
            <div className='mb-4 space-y-3 text-sm'>
              <div>
                <p className='text-gray-600'>{t.owner}</p>
                <p className='font-medium text-gray-900'>{selectedShop.ownerId || '—'}</p>
              </div>
              <div>
                <p className='text-gray-600'>{t.status}</p>
                <p className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedShop.status || 'PENDING']}`}>
                  {selectedShop.status || 'PENDING'}
                </p>
              </div>
            </div>

            <div className='mb-4 space-y-3'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>{t.status}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ShopStatus)}
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none'
                >
                  <option value='ACTIVE'>{t.active}</option>
                  <option value='SUSPENDED'>{t.suspended}</option>
                  <option value='PENDING'>{t.pending}</option>
                  <option value='REJECTED'>{t.rejected}</option>
                </select>
              </div>
              {newStatus === 'SUSPENDED' && (
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>{t.reason}</label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder={t.reasonPlaceholder}
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none'
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className='flex gap-2'>
              <button
                onClick={() => setSelectedShop(null)}
                className='flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'
              >
                {t.cancel}
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className='flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
              >
                {t.update}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
