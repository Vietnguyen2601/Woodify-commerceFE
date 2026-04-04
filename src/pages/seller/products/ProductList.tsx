import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { productMasterService, productVersionService } from '@/services'
import { useShopStore } from '@/store/shopStore'
import { ROUTES } from '@/constants/routes'
import type { ProductMaster, ProductStatus } from '@/types'

const STATUS_TABS: { label: string; value: ProductStatus | 'ALL' }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Chờ duyệt', value: 'PENDING_APPROVAL' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Đã đăng', value: 'PUBLISHED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Lưu trữ', value: 'ARCHIVED' },
]

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-orange-100 text-stone-700 border-yellow-800/20',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800 border-amber-300',
  APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
  PUBLISHED: 'bg-yellow-800 text-white border-yellow-900',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  ARCHIVED: 'bg-stone-200 text-stone-500 border-stone-300',
  DELETED: 'bg-stone-100 text-stone-400 border-stone-200',
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

export default function ProductList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { shop } = useShopStore()
  const [activeTab, setActiveTab] = useState<ProductStatus | 'ALL'>('ALL')
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['seller-products', shop?.shopId],
    queryFn: () => productMasterService.getProductsByShopId(shop!.shopId),
    enabled: !!shop?.shopId,
  })

  const { data: versionCounts = {} } = useQuery({
    queryKey: ['seller-product-version-counts', products.map(p => p.productId)],
    queryFn: async () => {
      if (!products.length) return {}
      const draftOrRejected = products.filter(p => p.status === 'DRAFT' || p.status === 'REJECTED')
      const entries = await Promise.all(
        draftOrRejected.map(async (p) => {
          try {
            const versions = await productVersionService.getVersionsByProductId(p.productId)
            const activeCount = Array.isArray(versions) ? versions.filter((v) => v.isActive).length : 0
            return [p.productId, activeCount] as [string, number]
          } catch {
            return [p.productId, 0] as [string, number]
          }
        })
      )
      return Object.fromEntries(entries)
    },
    enabled: products.some(p => p.status === 'DRAFT' || p.status === 'REJECTED'),
  })

  const submitMutation = useMutation({
    mutationFn: (productId: string) => productMasterService.submitForApproval(productId),
    onMutate: (productId) => setSubmittingId(productId),
    onSettled: () => setSubmittingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products', shop?.shopId] })
    },
    onError: (err: any) => {
      alert(`Gửi duyệt thất bại: ${err?.message || 'Lỗi không xác định'}`)
    },
  })

  const publishMutation = useMutation({
    mutationFn: (productId: string) => productMasterService.publishProduct(productId),
    onMutate: (productId) => setPublishingId(productId),
    onSettled: () => setPublishingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products', shop?.shopId] })
    },
    onError: (err: any) => {
      alert(`Mở bán thất bại: ${err?.message || 'Lỗi không xác định'}`)
    },
  })

  const filtered = activeTab === 'ALL' ? products : products.filter(p => p.status === activeTab)

  const tabCount = (val: ProductStatus | 'ALL') =>
    val === 'ALL' ? products.length : products.filter(p => p.status === val).length

  if (!shop) return null

  return (
    <div className="min-h-screen bg-stone-100 font-['Arimo'] text-stone-900">
      <div className='mx-auto max-w-6xl px-4 py-10'>
        {/* Header */}
        <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-2xl font-bold leading-7'>Quản lý sản phẩm</p>
            <p className='text-xs text-stone-600'>Quản lý danh mục sản phẩm và tồn kho của bạn</p>
          </div>
          <button
            type='button'
            onClick={() => navigate(ROUTES.SELLER_PRODUCTS + '/add')}
            className='inline-flex items-center gap-2 rounded bg-yellow-800 px-5 py-2 text-xs font-medium text-white shadow-[0px_1px_3px_rgba(0,0,0,0.20)]'
          >
            <span className='text-sm leading-none'>+</span>
            Tạo sản phẩm
          </button>
        </div>

        {/* Status tabs */}
        <div className='mb-5 flex flex-wrap gap-2'>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              type='button'
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                activeTab === tab.value
                  ? 'border-yellow-800 bg-yellow-800 text-white'
                  : 'border-yellow-800/20 bg-white text-stone-600 hover:border-yellow-800/40'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
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
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-yellow-800 border-t-transparent' />
              <p className='text-xs text-stone-500'>Đang tải sản phẩm...</p>
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
          <div className='flex flex-col items-center justify-center gap-4 rounded-xl border border-yellow-800/20 bg-white py-16'>
            <p className='text-sm text-stone-500'>
              {activeTab === 'ALL'
                ? 'Bạn chưa có sản phẩm nào.'
                : `Không có sản phẩm ở trạng thái "${STATUS_LABEL[activeTab] ?? activeTab}".`}
            </p>
            {activeTab === 'ALL' && (
              <button
                type='button'
                onClick={() => navigate(ROUTES.SELLER_PRODUCTS + '/add')}
                className='rounded bg-yellow-800 px-5 py-2 text-xs font-medium text-white'
              >
                Tạo sản phẩm đầu tiên
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className='grid gap-6 lg:grid-cols-3'>
            {filtered.map(product => (
              <ProductCard
                key={product.productId}
                product={product}
                activeVersionCount={versionCounts[product.productId] ?? -1}
                isSubmitting={submittingId === product.productId}
                isPublishing={publishingId === product.productId}
                onSubmit={() => submitMutation.mutate(product.productId)}
                onPublish={() => publishMutation.mutate(product.productId)}
              />
            ))}
          </div>
        )}

        <div className='mt-6 rounded-xl border border-yellow-800/20 bg-orange-100/40 px-5 py-3 text-xs text-stone-600 shadow-[0px_1px_3px_rgba(0,0,0,0.10)]'>
          <span className='font-semibold text-stone-700'>Phiên bản sản phẩm:</span> Mỗi sản phẩm có thể có nhiều phiên bản với thông số khác nhau. Phiên bản sẽ bị khóa sau khi có đơn hàng đầu tiên.
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  activeVersionCount,
  isSubmitting,
  isPublishing,
  onSubmit,
  onPublish,
}: {
  product: ProductMaster
  activeVersionCount: number
  isSubmitting: boolean
  isPublishing: boolean
  onSubmit: () => void
  onPublish: () => void
}) {
  const canSubmit = (product.status === 'DRAFT' || product.status === 'REJECTED') && activeVersionCount > 0
  const showSubmitBtn = product.status === 'DRAFT' || product.status === 'REJECTED'

  return (
    <article className='overflow-hidden rounded-xl border border-yellow-800/20 bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.10)]'>
      <div className='relative h-40 w-full bg-orange-100'>
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} className='h-full w-full object-cover' />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <span className='text-xs text-stone-400'>Chưa có ảnh</span>
          </div>
        )}
        <span className={`absolute right-4 top-3 rounded border px-3 py-1 text-[9.75px] font-semibold ${STATUS_BADGE[product.status] ?? 'bg-stone-100 text-stone-500'}`}>
          {STATUS_LABEL[product.status] ?? product.status}
        </span>
      </div>
      <div className='space-y-4 px-5 pb-6 pt-5'>
        <div>
          <p className='text-sm font-medium line-clamp-1'>{product.name}</p>
          <div className='mt-1 flex items-center justify-between text-xs text-stone-600'>
            <span className='line-clamp-1'>{product.categoryName}</span>
            <span className='rounded border border-yellow-800/20 px-2 py-0.5 text-[9.75px] font-mono text-stone-900'>{product.globalSku}</span>
          </div>
        </div>

        {showSubmitBtn && (
          <div>
            {canSubmit ? (
              <button
                type='button'
                disabled={isSubmitting}
                onClick={onSubmit}
                className='w-full rounded bg-amber-700 py-2 text-xs font-medium text-white disabled:opacity-60'
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi Admin duyệt'}
              </button>
            ) : (
              <div className='rounded border border-orange-200 bg-orange-50 px-3 py-2 text-[10px] text-orange-700'>
                {activeVersionCount === 0
                  ? '⚠ Cần tạo ít nhất 1 phiên bản Active trước khi gửi duyệt'
                  : 'Đang kiểm tra phiên bản...'}
              </div>
            )}
          </div>
        )}

        {product.status === 'REJECTED' && (
          <div className='rounded border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700'>
            Sản phẩm đã bị từ chối. Chỉnh sửa và gửi lại để duyệt.
          </div>
        )}

        {product.status === 'APPROVED' && (
          <button
            type='button'
            disabled={isPublishing}
            onClick={onPublish}
            className='w-full rounded bg-green-700 py-2 text-xs font-medium text-white disabled:opacity-60 hover:bg-green-800 transition-colors'
          >
            {isPublishing ? 'Đang mở bán...' : 'Mở bán ngay'}
          </button>
        )}

        <div className='flex items-center gap-2'>
          <button type='button' className='flex-1 rounded border border-yellow-800/20 bg-stone-100 px-3 py-2 text-center text-xs text-stone-900'>
            Chỉnh sửa
          </button>
          <button type='button' className='flex-1 rounded bg-yellow-800 px-3 py-2 text-center text-xs text-white'>
            Phiên bản
          </button>
        </div>
      </div>
    </article>
  )
}

