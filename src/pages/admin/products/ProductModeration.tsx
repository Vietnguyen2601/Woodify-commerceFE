import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productMasterService } from '@/services'
import type { ProductMaster, ProductStatus } from '@/types'

const STATUS_TABS: { label: string; value: ProductStatus | 'ALL' }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chờ duyệt', value: 'PENDING_APPROVAL' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Đã đăng', value: 'PUBLISHED' },
]

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'border border-orange-200 bg-orange-50 text-orange-700',
  PENDING_APPROVAL: 'border border-amber-300 bg-amber-50 text-amber-800',
  APPROVED: 'border border-blue-200 bg-blue-50 text-blue-700',
  PUBLISHED: 'border border-green-200 bg-green-50 text-green-700',
  REJECTED: 'border border-red-200 bg-red-50 text-red-700',
  ARCHIVED: 'border border-gray-200 bg-gray-50 text-gray-500',
  DELETED: 'border border-gray-200 bg-gray-50 text-gray-400',
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PUBLISHED: 'Đã đăng',
  REJECTED: 'Từ chối',
  ARCHIVED: 'Lưu trữ',
  DELETED: 'Đã xóa',
}

export default function ProductModeration() {
  const [activeTab, setActiveTab] = useState<ProductStatus | 'ALL'>('PENDING_APPROVAL')
  const [search, setSearch] = useState('')

  const { data: allProducts = [], isLoading, isError } = useQuery({
    queryKey: ['admin-all-products'],
    queryFn: () => productMasterService.getAllProducts(),
  })

  const tabFiltered = activeTab === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.status === activeTab)

  const filtered = search.trim()
    ? tabFiltered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.globalSku?.toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered

  const tabCount = (val: ProductStatus | 'ALL') =>
    val === 'ALL' ? allProducts.length : allProducts.filter(p => p.status === val).length

  const pendingCount = tabCount('PENDING_APPROVAL')

  return (
    <div className='space-y-6'>
      {/* Header */}
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Kiểm duyệt sản phẩm</h1>
          <p className='text-sm text-gray-500'>Xem xét và phê duyệt sản phẩm do người bán gửi lên</p>
        </div>
        {pendingCount > 0 && (
          <span className='inline-flex items-center rounded-2xl border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700'>
            {pendingCount} sản phẩm chờ duyệt
          </span>
        )}
      </header>

      {/* Summary cards */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {[
          { label: 'Chờ duyệt', count: tabCount('PENDING_APPROVAL'), color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Đã duyệt', count: tabCount('APPROVED'), color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Đã đăng', count: tabCount('PUBLISHED'), color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Từ chối', count: tabCount('REJECTED'), color: 'text-red-700 bg-red-50 border-red-200' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border px-4 py-3 ${color}`}>
            <p className='text-2xl font-bold'>{count}</p>
            <p className='text-xs font-medium'>{label}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className='relative max-w-sm'>
        <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
          <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
            <circle cx='11' cy='11' r='7' />
            <path d='m16.5 16.5 4 4' strokeLinecap='round' />
          </svg>
        </span>
        <input
          type='search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Tìm kiếm tên sản phẩm...'
          className='h-10 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none'
        />
      </div>

      {/* Status tabs */}
      <div className='flex flex-wrap gap-2'>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            type='button'
            onClick={() => setActiveTab(tab.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              activeTab === tab.value
                ? 'border-gray-700 bg-gray-700 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tabCount(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className='flex items-center justify-center py-20'>
          <div className='flex flex-col items-center gap-3'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-transparent' />
            <p className='text-xs text-gray-400'>Đang tải sản phẩm...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className='rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700'>
          Không thể tải danh sách sản phẩm. Vui lòng thử lại.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-16'>
          <p className='text-sm text-gray-400'>
            {activeTab === 'ALL'
              ? 'Chưa có sản phẩm nào.'
              : `Không có sản phẩm ở trạng thái "${STATUS_LABEL[activeTab] ?? activeTab}".`}
          </p>
        </div>
      )}

      {/* Product table */}
      {!isLoading && !isError && filtered.length > 0 && (
        <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-100 text-sm'>
              <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                <tr>
                  <th className='px-6 py-3 text-left'>Sản phẩm</th>
                  <th className='px-6 py-3 text-left'>Danh mục</th>
                  <th className='px-6 py-3 text-left'>Trạng thái</th>
                  <th className='px-6 py-3 text-left'>Kiểm duyệt</th>
                  <th className='px-6 py-3 text-left'>Ngày tạo</th>
                  <th className='px-6 py-3 text-center'>Hành động</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {filtered.map((product) => (
                  <ProductRow key={product.productId} product={product} />
                ))}
              </tbody>
            </table>
          </div>
          <div className='border-t border-gray-100 px-6 py-3 text-xs text-gray-400'>
            Hiển thị {filtered.length} / {allProducts.length} sản phẩm
          </div>
        </section>
      )}

    </div>
  )
}

function ProductRow({ product }: { product: ProductMaster }) {
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const { mutate: moderate, isPending } = useMutation({
    mutationFn: (status: 'APPROVED' | 'REJECTED') =>
      productMasterService.moderateProduct(product.productId, status),
    onSuccess: (_data, status) => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] })
      showToast(
        status === 'APPROVED' ? 'Đã duyệt sản phẩm thành công.' : 'Đã từ chối sản phẩm.',
        status === 'APPROVED',
      )
    },
    onError: (_err, status) => {
      showToast(
        status === 'APPROVED' ? 'Duyệt sản phẩm thất bại.' : 'Từ chối sản phẩm thất bại.',
        false,
      )
    },
  })

  const createdAt = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('vi-VN')
    : '—'

  const moderatedAt = product.moderatedAt
    ? new Date(product.moderatedAt).toLocaleDateString('vi-VN')
    : '—'

  const alreadyApproved = product.moderationStatus === 'APPROVED'
  const alreadyRejected = product.moderationStatus === 'REJECTED'

  return (
    <tr className='text-gray-900 hover:bg-gray-50 transition'>
      <td className='whitespace-nowrap px-6 py-4'>
        <div className='flex items-center gap-3'>
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className='h-12 w-12 rounded-xl border border-gray-200 object-cover'
            />
          ) : (
            <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-100'>
              <svg className='h-5 w-5 text-gray-300' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                <rect x='3' y='3' width='18' height='18' rx='2' />
                <path d='M3 9l4-4 4 4 4-4 4 4' strokeLinecap='round' strokeLinejoin='round' />
                <circle cx='8.5' cy='13.5' r='1.5' />
              </svg>
            </div>
          )}
          <div className='min-w-0'>
            <p className='max-w-[200px] truncate font-medium'>{product.name}</p>
            <p className='text-xs text-gray-400'>{product.globalSku || product.productId.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 text-gray-600'>{product.categoryName || '—'}</td>
      <td className='px-6 py-4'>
        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[product.status] ?? ''}`}>
          {STATUS_LABEL[product.status] ?? product.status}
        </span>
      </td>
      <td className='px-6 py-4'>
        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
          product.moderationStatus === 'APPROVED'
            ? 'border border-blue-200 bg-blue-50 text-blue-700'
            : product.moderationStatus === 'REJECTED'
            ? 'border border-red-200 bg-red-50 text-red-700'
            : 'border border-amber-200 bg-amber-50 text-amber-700'
        }`}>
          {product.moderationStatus === 'APPROVED' ? 'Đã duyệt'
            : product.moderationStatus === 'REJECTED' ? 'Từ chối'
            : 'Chờ xử lý'} {product.moderatedAt ? `(${moderatedAt})` : ''}
        </span>
      </td>
      <td className='px-6 py-4 text-xs text-gray-500'>{createdAt}</td>
      <td className='px-6 py-4'>
        <div className='flex flex-col items-center gap-1.5'>
          <div className='flex items-center justify-center gap-2'>
            {/* Approve */}
            <button
              type='button'
              onClick={() => moderate('APPROVED')}
              disabled={isPending || alreadyApproved}
              title={alreadyApproved ? 'Sản phẩm đã được duyệt' : 'Duyệt sản phẩm'}
              className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                alreadyApproved
                  ? 'cursor-default border-green-200 bg-green-50 text-green-600'
                  : isPending
                  ? 'cursor-wait border-gray-200 bg-gray-50 text-gray-400'
                  : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='m6 12 3 3 9-9' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              Duyệt
            </button>

            {/* Reject */}
            <button
              type='button'
              onClick={() => moderate('REJECTED')}
              disabled={isPending || alreadyRejected}
              title={alreadyRejected ? 'Sản phẩm đã bị từ chối' : 'Từ chối sản phẩm'}
              className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                alreadyRejected
                  ? 'cursor-default border-red-200 bg-red-50 text-red-500'
                  : isPending
                  ? 'cursor-wait border-gray-200 bg-gray-50 text-gray-400'
                  : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='m6 6 12 12M6 18 18 6' strokeLinecap='round' />
              </svg>
              Từ chối
            </button>
          </div>

          {/* Inline toast feedback */}
          {toast && (
            <span className={`text-[10px] font-medium ${
              toast.ok ? 'text-green-600' : 'text-red-600'
            }`}>
              {toast.msg}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}
