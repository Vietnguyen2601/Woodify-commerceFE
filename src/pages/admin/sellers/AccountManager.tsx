import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminService, queryKeys } from '@/services'
import type { AccountDto } from '@/types'

const fmtDateTime = (iso: string | undefined, locale: 'vi-VN' | 'en-US') => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso || '—'
  }
}

export default function AccountManager() {
  const { isVietnamese } = useAppLanguage()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterRole, setFilterRole] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('') // 'active' | 'banned'

  const t = {
    eyebrow: isVietnamese ? 'Người dùng' : 'Users',
    title: isVietnamese ? 'Quản lý Tài Khoản' : 'Account Management',
    subtitle: isVietnamese ? 'Xem danh sách người dùng, dừng hoặc kích hoạt lại tài khoản.' : 'View all user accounts, ban or unban users.',
    loadFailed: isVietnamese ? 'Không tải được danh sách tài khoản' : 'Failed to load accounts',
    filters: isVietnamese ? 'Lọc tài khoản' : 'Filter accounts',
    search: isVietnamese ? 'Tìm kiếm...' : 'Search...',
    searchPlaceholder: isVietnamese ? 'Email, username hoặc tên' : 'Email, username or name',
    noResults: isVietnamese ? 'Không tìm thấy tài khoản' : 'No accounts found',
    loading: isVietnamese ? 'Đang tải...' : 'Loading...',
    email: isVietnamese ? 'Email' : 'Email',
    username: isVietnamese ? 'Username' : 'Username',
    name: isVietnamese ? 'Tên' : 'Name',
    role: isVietnamese ? 'Vai trò' : 'Role',
    status: isVietnamese ? 'Trạng thái' : 'Status',
    createdAt: isVietnamese ? 'Tạo lúc' : 'Created',
    actions: isVietnamese ? 'Hành động' : 'Actions',
    ban: isVietnamese ? 'Dừng tài khoản' : 'Ban Account',
    unban: isVietnamese ? 'Kích hoạt lại' : 'Unban',
    banned: isVietnamese ? 'Đã dừng' : 'Banned',
    active: isVietnamese ? 'Hoạt động' : 'Active',
    confirm: isVietnamese ? 'Xác nhận?' : 'Confirm?',
    confirmBan: (email: string) => isVietnamese ? `Bạn có chắc muốn dừng ${email}?` : `Are you sure you want to ban ${email}?`,
    confirmUnban: (email: string) => isVietnamese ? `Bạn có chắc muốn kích hoạt lại ${email}?` : `Are you sure you want to unban ${email}?`,
    success: isVietnamese ? 'Thành công' : 'Success',
    error: isVietnamese ? 'Lỗi' : 'Error',
    customer: isVietnamese ? 'Khách hàng' : 'Customer',
    seller: isVietnamese ? 'Bán hàng' : 'Seller',
    admin: isVietnamese ? 'Quản trị' : 'Admin',
  }

  // Fetch all accounts
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.ADMIN_ACCOUNTS],
    queryFn: () => adminService.getAllAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Ban/Unban mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.updateAccountStatus(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.ADMIN_ACCOUNTS] })
    },
  })

  // Filter accounts
  const filtered = React.useMemo(() => {
    let list = accounts
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(
        (a) =>
          a.email?.toLowerCase().includes(term) ||
          a.username?.toLowerCase().includes(term) ||
          a.name?.toLowerCase().includes(term)
      )
    }
    if (filterRole) {
      list = list.filter((a) => a.role?.toLowerCase() === filterRole.toLowerCase())
    }
    if (filterStatus === 'active') {
      list = list.filter((a) => a != null) // Assume no isActive field means active
    } else if (filterStatus === 'banned') {
      list = list.filter((a) => a == null) // Would need isActive field from API
    }
    return list
  }, [accounts, searchTerm, filterRole, filterStatus])

  const handleToggleStatus = (account: AccountDto) => {
    // For now, assume accounts without isActive field are active
    // This would be better with actual isActive field in AccountDto
    const shouldActivate = true // Toggle logic would go here
    const msg = shouldActivate
      ? `${t.confirmBan} ${account.email}`
      : `${t.confirmUnban} ${account.email}`

    if (window.confirm(msg)) {
      updateStatusMutation.mutate({
        id: account.accountId,
        isActive: !shouldActivate,
      })
    }
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

          {/* Filters - Right */}
          <div className='flex gap-4 items-start'>
            <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm hover:border-gray-300 hover:shadow-md transition-all min-w-max'>
              <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.role}</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className='h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50 hover:border-gray-300 transition-colors'
              >
                <option value=''>All Roles</option>
                <option value='customer'>{t.customer}</option>
                <option value='seller'>{t.seller}</option>
                <option value='admin'>{t.admin}</option>
              </select>
            </div>
            <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm hover:border-gray-300 hover:shadow-md transition-all min-w-max'>
              <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600'>{t.status}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50 hover:border-gray-300 transition-colors'
              >
                <option value=''>All Status</option>
                <option value='active'>{t.active}</option>
                <option value='banned'>{t.banned}</option>
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

      {/* Accounts table */}
      {!isLoading && filtered.length > 0 && (
        <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
          <table className='w-full'>
            <thead className='border-b border-gray-200 bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.email}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.username}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.name}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.role}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.status}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.createdAt}</th>
                <th className='px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700'>{t.actions}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filtered.map((account) => (
                <tr key={account.accountId} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 text-sm text-gray-900'>{account.email || '—'}</td>
                  <td className='px-6 py-4 text-sm text-gray-700'>{account.username || '—'}</td>
                  <td className='px-6 py-4 text-sm text-gray-700'>{account.name || '—'}</td>
                  <td className='px-6 py-4 text-sm'>
                    <span className='rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700'>
                      {account.role || '—'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'>
                      {t.active}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-500'>
                    {fmtDateTime(account.dob, isVietnamese ? 'vi-VN' : 'en-US')}
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    <button
                      onClick={() => handleToggleStatus(account)}
                      disabled={updateStatusMutation.isPending}
                      className='rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50'
                    >
                      {t.ban}
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
    </div>
  )
}
