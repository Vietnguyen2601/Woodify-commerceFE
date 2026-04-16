import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { productVersionService, productMasterService } from '@/services'
import { ROUTES } from '@/constants/routes'
import type { ProductVersion } from '@/types'
import { VersionFormPanel } from './VersionFormPanel'

const sectionWrapper =
  'rounded-xl border border-yellow-800/20 bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.10)]'

export default function ProductVersionList() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showAddPanel, setShowAddPanel] = useState(false)

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-master', productId],
    queryFn: () => productMasterService.getProductsByShopId('').then(() => {
      // Fallback: get basic info via versions query
      return null
    }),
    enabled: false,
  })

  const {
    data: versions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product-versions', productId],
    queryFn: () => productVersionService.getVersionsByProductId(productId!),
    enabled: !!productId,
  })

  const nextVersionNumber = versions.length > 0
    ? Math.max(...versions.map((v) => v.versionNumber)) + 1
    : 1

  const handleAddSuccess = (version: ProductVersion) => {
    queryClient.invalidateQueries({ queryKey: ['product-versions', productId] })
    queryClient.invalidateQueries({ queryKey: ['seller-products'] })
    setShowAddPanel(false)
  }

  return (
    <div className="min-h-screen bg-stone-100 font-['Arimo'] text-stone-900">
      <div className='mx-auto max-w-5xl px-4 py-10'>

        {/* Header */}
        <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <button
              type='button'
              onClick={() => navigate(ROUTES.SELLER_PRODUCTS)}
              className='mb-1 inline-flex items-center gap-1.5 text-[10px] text-stone-500 hover:text-stone-700'
            >
              <svg viewBox='0 0 16 16' fill='none' className='h-3 w-3'>
                <path d='M10 4L6 8L10 12' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              Quay lại danh sách sản phẩm
            </button>
            <p className='text-2xl font-bold leading-7'>Quản lý phiên bản</p>
            {productId && (
              <p className='mt-1 font-mono text-[10px] text-stone-500'>
                Product ID: {productId}
              </p>
            )}
          </div>
          <button
            type='button'
            onClick={() => setShowAddPanel(true)}
            className='inline-flex items-center gap-2 rounded bg-yellow-800 px-5 py-2 text-xs font-medium text-white shadow-[0px_1px_3px_rgba(0,0,0,0.20)]'
          >
            <span className='text-sm leading-none'>+</span>
            Thêm phiên bản
          </button>
        </div>

        {/* Add Version Slide Panel */}
        {showAddPanel && (
          <div className='fixed inset-0 z-50 flex items-start justify-end'>
            {/* Backdrop */}
            <div
              className='absolute inset-0 bg-black/30'
              onClick={() => setShowAddPanel(false)}
            />
            {/* Panel */}
            <div className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto bg-stone-100 font-['Arimo'] shadow-2xl">
              <div className='flex items-center justify-between border-b border-yellow-800/20 bg-white px-5 py-4'>
                <div>
                  <p className='text-sm font-bold text-stone-900'>
                    Thêm phiên bản #{nextVersionNumber}
                  </p>
                  <p className='text-[10px] text-stone-500'>
                    Phiên bản mới cho sản phẩm này
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setShowAddPanel(false)}
                  className='flex h-7 w-7 items-center justify-center rounded-full border border-yellow-800/20 bg-stone-100 text-xs text-stone-600 hover:bg-stone-200'
                >
                  ✕
                </button>
              </div>
              <div className='flex-1 px-5 py-6'>
                <VersionFormPanel
                  productId={productId!}
                  versionNumber={nextVersionNumber}
                  onSuccess={handleAddSuccess}
                  onCancel={() => setShowAddPanel(false)}
                  submitLabel='Thêm phiên bản'
                />
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className='flex items-center justify-center py-20'>
            <div className='flex flex-col items-center gap-3'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-yellow-800 border-t-transparent' />
              <p className='text-xs text-stone-500'>Đang tải phiên bản...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className='rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700'>
            Không thể tải danh sách phiên bản. Vui lòng thử lại.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && versions.length === 0 && (
          <div className='flex flex-col items-center justify-center gap-4 rounded-xl border border-yellow-800/20 bg-white py-16'>
            <p className='text-sm text-stone-500'>Sản phẩm này chưa có phiên bản nào.</p>
            <button
              type='button'
              onClick={() => setShowAddPanel(true)}
              className='rounded bg-yellow-800 px-5 py-2 text-xs font-medium text-white'
            >
              Tạo phiên bản đầu tiên
            </button>
          </div>
        )}

        {/* Version grid */}
        {!isLoading && !isError && versions.length > 0 && (
          <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {versions.map((version) => (
              <VersionCard key={version.versionId} version={version} />
            ))}
          </div>
        )}

        {/* Info note */}
        {versions.length > 0 && (
          <div className='mt-6 rounded-xl border border-yellow-800/20 bg-orange-100/40 px-5 py-3 text-xs text-stone-600 shadow-[0px_1px_3px_rgba(0,0,0,0.10)]'>
            <span className='font-semibold text-stone-700'>Lưu ý:</span> Phiên bản sẽ bị khóa
            sau khi có đơn hàng đầu tiên. Chỉ phiên bản Active mới được tính khi gửi duyệt.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Version Card ──────────────────────────────────────────────────────────────
function VersionCard({ version }: { version: ProductVersion }) {
  return (
    <article className={`overflow-hidden ${sectionWrapper}`}>
      {/* Thumbnail */}
      <div className='relative h-36 w-full bg-orange-50'>
        {version.thumbnailUrl ? (
          <img
            src={version.thumbnailUrl}
            alt={version.versionName}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <svg
              className='h-8 w-8 text-stone-300'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
            >
              <rect x='3' y='3' width='18' height='18' rx='3' />
              <circle cx='8.5' cy='8.5' r='1.5' />
              <path d='m21 15-5-5L5 21' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </div>
        )}
        {/* Active badge */}
        <span
          className={`absolute right-3 top-2.5 rounded border px-2.5 py-0.5 text-[9.75px] font-semibold ${
            version.isActive
              ? 'border-lime-300 bg-lime-100 text-lime-800'
              : 'border-stone-200 bg-stone-100 text-stone-500'
          }`}
        >
          {version.isActive ? 'Active' : 'Inactive'}
        </span>
        {/* Version number */}
        <span className='absolute left-3 top-2.5 rounded bg-yellow-800/80 px-2 py-0.5 text-[9px] font-bold text-white'>
          #{version.versionNumber}
        </span>
      </div>

      {/* Content */}
      <div className='space-y-3 px-4 py-4'>
        <div>
          <p className='text-sm font-semibold line-clamp-1'>{version.versionName}</p>
          <p className='mt-0.5 font-mono text-[9.75px] text-stone-400 line-clamp-1'>
            {version.sellerSku}
          </p>
        </div>

        {/* Price + Stock */}
        <div className='flex items-center justify-between'>
          <span className='text-sm font-bold text-yellow-900'>
            {version.price.toLocaleString('vi-VN')}₫
          </span>
          <span className='rounded border border-yellow-800/20 bg-orange-50 px-2 py-0.5 text-[9.75px] text-stone-700'>
            Kho: {version.stockQuantity}
          </span>
        </div>

        {/* Specs */}
        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-md border border-yellow-800/10 bg-orange-50/60 px-3 py-2.5 text-[9.75px]'>
          <div>
            <span className='text-stone-400'>Loại gỗ</span>
            <p className='font-medium text-stone-800'>{version.woodType}</p>
          </div>
          <div>
            <span className='text-stone-400'>Khối lượng</span>
            <p className='font-medium text-stone-800'>
              {(version.weightGrams / 1000).toFixed(1)} kg
            </p>
          </div>
          <div>
            <span className='text-stone-400'>Kích thước</span>
            <p className='font-medium text-stone-800'>
              {version.lengthCm}×{version.widthCm}×{version.heightCm} cm
            </p>
          </div>
          <div>
            <span className='text-stone-400'>Ngày tạo</span>
            <p className='font-medium text-stone-800'>
              {new Date(version.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
