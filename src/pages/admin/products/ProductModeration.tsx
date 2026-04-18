import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productMasterService } from '@/services'
import { useAppLanguage } from '@/hooks'
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

const MODERATION_STATUS_STYLES: Record<string, string> = {
  PENDING: 'border border-amber-200 bg-amber-50 text-amber-700',
  APPROVED: 'border border-blue-200 bg-blue-50 text-blue-700',
  REJECTED: 'border border-red-200 bg-red-50 text-red-700',
}

const MODERATION_PAGE_SIZE = 5

export default function ProductModeration() {
  const { isVietnamese } = useAppLanguage()
  const [activeTab, setActiveTab] = useState<ProductStatus | 'ALL'>('PENDING_APPROVAL')
  const [search, setSearch] = useState('')
  const [moderationPage, setModerationPage] = useState(1)

  const t = useMemo(
    () => ({
      title: isVietnamese ? 'Kiểm duyệt sản phẩm' : 'Product Moderation',
      subtitle: isVietnamese ? 'Xem xét và phê duyệt sản phẩm do người bán gửi lên' : 'Review and approve products from sellers',
      searchLabel: isVietnamese ? 'Tìm kiếm' : 'Search',
      searchPlaceholder: isVietnamese ? 'Tìm kiếm tên sản phẩm...' : 'Search product name...',
      pendingLabel: isVietnamese ? 'Chờ duyệt' : 'Pending',
      allLabel: isVietnamese ? 'Tất cả' : 'All',
      approvedLabel: isVietnamese ? 'Đã duyệt' : 'Approved',
      publishedLabel: isVietnamese ? 'Đã đăng' : 'Published',
      rejectedLabel: isVietnamese ? 'Từ chối' : 'Rejected',
    }),
    [isVietnamese]
  )

  const tabLabelMap = useMemo<Record<ProductStatus | 'ALL', string>>(
    () => ({
      ALL: t.allLabel,
      DRAFT: STATUS_LABEL.DRAFT,
      PENDING_APPROVAL: t.pendingLabel,
      APPROVED: t.approvedLabel,
      PUBLISHED: t.publishedLabel,
      REJECTED: t.rejectedLabel,
      ARCHIVED: STATUS_LABEL.ARCHIVED,
      DELETED: STATUS_LABEL.DELETED,
    }),
    [t]
  )

  const { data: allProducts = [], isLoading, isError } = useQuery({
    queryKey: ['admin-all-products'],
    queryFn: () => productMasterService.getAllProducts(),
  })

  const searchKeyword = search.trim().toLowerCase()
  const matchesSearch = (p: ProductMaster) =>
    !searchKeyword ||
    p.name.toLowerCase().includes(searchKeyword) ||
    p.globalSku?.toLowerCase().includes(searchKeyword)

  const tabFiltered = activeTab === 'ALL' ? allProducts : allProducts.filter((p) => p.status === activeTab)
  const filtered = tabFiltered.filter(matchesSearch)
  const moderationFiltered = allProducts.filter(matchesSearch)
  const moderationTotalPages = Math.max(1, Math.ceil(moderationFiltered.length / MODERATION_PAGE_SIZE))
  const currentModerationPage = Math.min(moderationPage, moderationTotalPages)
  const moderationStartIndex = (currentModerationPage - 1) * MODERATION_PAGE_SIZE
  const moderationPageItems = moderationFiltered.slice(moderationStartIndex, moderationStartIndex + MODERATION_PAGE_SIZE)

  React.useEffect(() => {
    setModerationPage(1)
  }, [searchKeyword])

  React.useEffect(() => {
    if (moderationPage > moderationTotalPages) {
      setModerationPage(moderationTotalPages)
    }
  }, [moderationPage, moderationTotalPages])

  const counts = useMemo(() => ({
    all: allProducts.length,
    pending: allProducts.filter((p) => p.moderationStatus === 'PENDING').length,
    approved: allProducts.filter((p) => p.moderationStatus === 'APPROVED').length,
    published: allProducts.filter(p => p.status === 'PUBLISHED').length,
    rejected: allProducts.filter(p => p.status === 'REJECTED').length,
  }), [allProducts])

  const pendingCount = counts.pending

  return (
    <div className='space-y-6'>
      {/* Header */}
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
          <p className='text-sm text-gray-500'>{t.subtitle}</p>
        </div>
        {pendingCount > 0 && (
          <span className='inline-flex items-center rounded-2xl border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700'>
            {pendingCount} sản phẩm chờ duyệt
          </span>
        )}
      </header>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {[
          { label: t.allLabel, value: counts.all, accent: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t.pendingLabel, value: counts.pending, accent: 'text-amber-600', bg: 'bg-amber-50' },
          { label: t.approvedLabel, value: counts.approved, accent: 'text-green-600', bg: 'bg-green-50' },
          { label: t.publishedLabel, value: counts.published, accent: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: t.rejectedLabel, value: counts.rejected, accent: 'text-red-600', bg: 'bg-red-50' },
        ].map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{isLoading ? '…' : metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.bg}`}>
                <span className={`text-lg font-bold ${metric.accent}`}>·</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
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

          {/* Status - Right */}
          <div className='flex gap-3 items-start'>
            <div className='w-[140px] rounded-xl border border-gray-200 bg-white p-3'>
              <label className='mb-1 block text-xs font-medium text-gray-600'>{isVietnamese ? 'Trạng thái' : 'Status'}</label>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as ProductStatus | 'ALL')}
                className='h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              >
                {STATUS_TABS.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tabLabelMap[tab.value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
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
          <header className='border-b border-gray-100 px-6 py-4'>
            <h3 className='text-sm font-semibold text-gray-900'>
              {isVietnamese ? 'Danh sách kiểm duyệt' : 'Moderation list'}
            </h3>
          </header>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-100 text-sm'>
              <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                <tr>
                  <th className='px-6 py-3 text-left'>Sản phẩm</th>
                  <th className='px-6 py-3 text-left'>Danh mục</th>
                  <th className='px-6 py-3 text-left'>Trạng thái</th>
                  <th className='px-6 py-3 text-left'>Kiểm duyệt</th>
                  <th className='px-6 py-3 text-right'>Lượt bán</th>
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

      {/* Moderation status table */}
      {!isLoading && !isError && (
        <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <header className='border-b border-gray-100 px-6 py-4'>
            <h3 className='text-sm font-semibold text-gray-900'>
              {isVietnamese ? 'Tổng hợp trạng thái kiểm duyệt' : 'Moderation status overview'}
            </h3>
          </header>
          <div className='overflow-x-auto'>
            <table className='min-w-[2200px] w-full divide-y divide-gray-100 text-sm'>
              <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                <tr>
                  <th className='sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left font-mono normal-case shadow-[1px_0_0_0_rgb(243_244_246)]'>
                    thumbnailUrl
                  </th>
                  <th className='px-3 py-3 text-left font-mono normal-case'>shopName</th>
                  <th className='px-3 py-3 text-left font-mono normal-case'>categoryName</th>
                  <th className='min-w-[140px] px-3 py-3 text-left font-mono normal-case'>name</th>
                  <th className='px-3 py-3 text-left font-mono normal-case'>globalSku</th>
                  <th className='min-w-[200px] px-3 py-3 text-left font-mono normal-case'>description</th>
                  <th className='px-3 py-3 text-left font-mono normal-case'>status</th>
                  <th className='px-3 py-3 text-left font-mono normal-case'>moderationStatus</th>
                  <th className='whitespace-nowrap px-3 py-3 text-left font-mono normal-case'>createdAt</th>
                  <th className='whitespace-nowrap px-3 py-3 text-left font-mono normal-case'>publishedAt</th>
                  <th className='px-3 py-3 text-right font-mono normal-case'>price</th>
                  <th className='px-3 py-3 text-right font-mono normal-case'>stockQuantity</th>
                  <th className='px-3 py-3 text-left font-mono normal-case'>woodType</th>
                  <th className='px-3 py-3 text-right font-mono normal-case'>averageRating</th>
                  <th className='px-3 py-3 text-right font-mono normal-case'>reviewCount</th>
                  <th className='px-3 py-3 text-right font-mono normal-case'>sales</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {moderationPageItems.length === 0 ? (
                  <tr>
                    <td colSpan={16} className='px-6 py-8 text-center text-gray-500'>
                      {isVietnamese ? 'Không có sản phẩm phù hợp.' : 'No matching products found.'}
                    </td>
                  </tr>
                ) : (
                  moderationPageItems.map((product) => {
                    const locale = isVietnamese ? 'vi-VN' : 'en-US'
                    const fmtDt = (iso: string | null | undefined) =>
                      iso ? new Date(iso).toLocaleString(locale) : '—'
                    return (
                      <tr key={`moderation-${product.productId}`} className='group text-gray-900 transition hover:bg-gray-50'>
                        <td className='sticky left-0 z-[1] bg-white px-3 py-2 shadow-[1px_0_0_0_rgb(243_244_246)] group-hover:bg-gray-50'>
                          {product.thumbnailUrl ? (
                            <img
                              src={product.thumbnailUrl}
                              alt=''
                              className='h-12 w-12 rounded-lg border border-gray-200 object-cover'
                            />
                          ) : (
                            <div className='flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-[10px] text-gray-400'>
                              —
                            </div>
                          )}
                        </td>
                        <td className='px-3 py-3 text-gray-700'>{product.shopName?.trim() || '—'}</td>
                        <td className='px-3 py-3 text-gray-700'>{product.categoryName || '—'}</td>
                        <td className='max-w-[200px] px-3 py-3 font-medium text-gray-900'>
                          <span className='line-clamp-2' title={product.name}>
                            {product.name || '—'}
                          </span>
                        </td>
                        <td className='px-3 py-3 font-mono text-xs text-gray-600'>{product.globalSku || '—'}</td>
                        <td className='max-w-[240px] px-3 py-3 text-gray-600'>
                          <span className='line-clamp-2 text-xs' title={product.description || undefined}>
                            {product.description?.trim() || '—'}
                          </span>
                        </td>
                        <td className='px-3 py-3'>
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[product.status] ?? ''}`}>
                            {STATUS_LABEL[product.status] ?? product.status}
                          </span>
                        </td>
                        <td className='px-3 py-3'>
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              MODERATION_STATUS_STYLES[product.moderationStatus] ?? 'border border-gray-200 bg-gray-50 text-gray-600'
                            }`}
                          >
                            {product.moderationStatus}
                          </span>
                        </td>
                        <td className='whitespace-nowrap px-3 py-3 text-xs text-gray-600'>{fmtDt(product.createdAt)}</td>
                        <td className='whitespace-nowrap px-3 py-3 text-xs text-gray-600'>{fmtDt(product.publishedAt)}</td>
                        <td className='px-3 py-3 text-right font-medium text-gray-900'>
                          {typeof product.price === 'number' ? product.price.toLocaleString(locale) : '—'}
                        </td>
                        <td className='px-3 py-3 text-right tabular-nums text-gray-700'>{product.stockQuantity ?? '—'}</td>
                        <td className='px-3 py-3 text-gray-700'>{product.woodType || '—'}</td>
                        <td className='px-3 py-3 text-right tabular-nums text-gray-700'>
                          {product.averageRating != null && typeof product.averageRating === 'number'
                            ? product.averageRating.toFixed(1)
                            : '—'}
                        </td>
                        <td className='px-3 py-3 text-right tabular-nums text-gray-700'>
                          {typeof product.reviewCount === 'number' ? product.reviewCount.toLocaleString(locale) : '—'}
                        </td>
                        <td className='px-3 py-3 text-right tabular-nums text-gray-800'>
                          {typeof product.sales === 'number' ? product.sales.toLocaleString(locale) : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-3 text-xs text-gray-500'>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setModerationPage((prev) => Math.max(1, prev - 1))}
                disabled={currentModerationPage <= 1}
                className='rounded-md border border-gray-200 px-3 py-1 font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isVietnamese ? 'Trước' : 'Prev'}
              </button>
              <span className='font-medium text-gray-700'>
                {isVietnamese ? 'Trang' : 'Page'} {currentModerationPage}/{moderationTotalPages}
              </span>
              <button
                type='button'
                onClick={() => setModerationPage((prev) => Math.min(moderationTotalPages, prev + 1))}
                disabled={currentModerationPage >= moderationTotalPages}
                className='rounded-md border border-gray-200 px-3 py-1 font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isVietnamese ? 'Sau' : 'Next'}
              </button>
            </div>
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
      <td className='px-6 py-4 text-right tabular-nums text-gray-800'>
        {typeof product.sales === 'number' ? product.sales.toLocaleString('vi-VN') : '—'}
      </td>
      <td className='px-6 py-4 text-xs text-gray-500'>{createdAt}</td>
      <td className='px-6 py-4'>
        <div className='flex flex-col items-center gap-1.5'>
          <div className='flex items-center justify-center gap-2'>
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
