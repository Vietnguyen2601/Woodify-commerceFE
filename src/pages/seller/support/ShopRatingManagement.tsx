import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productMasterService, productReviewService } from '@/services'
import { useShopStore } from '@/store/shopStore'
import type { ProductMaster } from '@/types'
import type { ProductReviewDto } from '@/types/productReview.types'

/** Gộp review + metadata sản phẩm; thứ tự mới → cũ từ API từng SP, sau đó sort lại khi merge */
export type SellerReviewRow = ProductReviewDto & {
  productName: string
  productThumbnailUrl: string | null
  globalSku: string
}

async function loadMergedShopReviews(products: ProductMaster[]): Promise<SellerReviewRow[]> {
  if (!products.length) return []
  const chunks = await Promise.all(
    products.map(async (p) => {
      const list = await productReviewService.getReviewsByProductId(p.productId)
      return (Array.isArray(list) ? list : []).map(
        (r): SellerReviewRow => ({
          ...r,
          productName: p.name,
          productThumbnailUrl: p.thumbnailUrl ?? null,
          globalSku: p.globalSku,
        })
      )
    })
  )
  const flat = chunks.flat()
  flat.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return flat
}

function reviewerLabel(accountId: string): string {
  const id = (accountId ?? '').trim()
  if (id.length < 4) return 'Người mua'
  return `Người mua · …${id.slice(-4)}`
}

const RatingStars = ({ value }: { value: number }) => (
  <div className='flex items-center gap-0.5 text-amber-500' aria-hidden>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < value ? 'text-amber-500' : 'text-stone-300'}>
        ★
      </span>
    ))}
  </div>
)

type FilterTab = 'all' | 'needs_response' | 'responded'

export default function ShopRatingManagement() {
  const queryClient = useQueryClient()
  const { shop } = useShopStore()
  const shopId = shop?.shopId ?? ''

  const [search, setSearch] = React.useState('')
  const [filterTab, setFilterTab] = React.useState<FilterTab>('all')
  const [ratingPick, setRatingPick] = React.useState<number | null>(null)
  const [productFilter, setProductFilter] = React.useState<string>('all')
  const [replyTextById, setReplyTextById] = React.useState<Record<string, string>>({})
  const [openReplyId, setOpenReplyId] = React.useState<string | null>(null)

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products', shopId],
    queryFn: () => productMasterService.getProductsByShopId(shopId),
    enabled: !!shopId,
  })

  const productIdsKey = React.useMemo(
    () =>
      [...products]
        .map((p) => p.productId)
        .sort()
        .join('|'),
    [products]
  )

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch,
  } = useQuery({
    queryKey: ['seller-shop-reviews', shopId, productIdsKey],
    queryFn: () => loadMergedShopReviews(products),
    enabled: !!shopId && !productsLoading,
  })

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return reviews.filter((r) => {
      if (productFilter !== 'all' && r.productId !== productFilter) return false
      if (ratingPick != null && Math.round(r.rating) !== ratingPick) return false
      if (filterTab === 'needs_response') {
        if ((r.shopResponse ?? '').trim().length > 0) return false
      }
      if (filterTab === 'responded') {
        if (!(r.shopResponse ?? '').trim()) return false
      }
      if (!q) return true
      return (
        r.productName.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.globalSku.toLowerCase().includes(q) ||
        reviewerLabel(r.accountId).toLowerCase().includes(q) ||
        (r.content ?? '').toLowerCase().includes(q)
      )
    })
  }, [reviews, search, filterTab, ratingPick, productFilter])

  const stats = React.useMemo(() => {
    const needsResponse = reviews.filter((r) => !(r.shopResponse ?? '').trim()).length
    const weekMs = 7 * 24 * 60 * 60 * 1000
    const since = Date.now() - weekMs
    const newLast7 = reviews.filter((r) => new Date(r.createdAt).getTime() >= since).length
    const positive =
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 1000) / 10
        : 0
    return { needsResponse, newLast7, positive }
  }, [reviews])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['seller-shop-reviews', shopId] })
  }

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, text }: { reviewId: string; text: string }) =>
      productReviewService.addShopResponse(reviewId, text.trim()),
    onSuccess: () => {
      invalidate()
      setOpenReplyId(null)
    },
  })

  const hideMutation = useMutation({
    mutationFn: (reviewId: string) => productReviewService.hideReview(reviewId),
    onSuccess: invalidate,
  })

  const unhideMutation = useMutation({
    mutationFn: (reviewId: string) => productReviewService.unhideReview(reviewId),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => productReviewService.deleteReview(reviewId),
    onSuccess: invalidate,
  })

  const loading = productsLoading || reviewsLoading
  const shopRating = shop?.rating ?? 0
  const shopReviewCount = shop?.reviewCount ?? 0

  const startReply = (r: SellerReviewRow) => {
    setOpenReplyId(r.reviewId)
    setReplyTextById((prev) => ({
      ...prev,
      [r.reviewId]: prev[r.reviewId] ?? r.shopResponse ?? '',
    }))
  }

  const submitReply = (reviewId: string) => {
    const text = replyTextById[reviewId] ?? ''
    if (!text.trim()) return
    respondMutation.mutate({ reviewId, text })
  }

  const handleDelete = (reviewId: string) => {
    if (!window.confirm('Xóa đánh giá này? Hành động có thể không hoàn tác.')) return
    deleteMutation.mutate(reviewId)
  }

  return (
    <div className='space-y-6'>
      <header className='rounded-3xl border border-amber-900/15 bg-white px-5 py-4 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-start gap-3'>
            {shop?.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt=''
                className='h-14 w-14 shrink-0 rounded-2xl border border-amber-900/15 object-cover'
              />
            ) : (
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-900/15 bg-stone-100 text-lg font-bold text-stone-500'>
                {(shop?.name ?? 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className='text-base font-bold text-stone-900'>{shop?.name ?? 'Cửa hàng'}</p>
              <p className='mt-0.5 text-xs text-stone-500'>
                Quản lý đánh giá theo từng sản phẩm — hiển thị ảnh, phản hồi và trạng thái hiển thị công khai.
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={() => void refetch()}
              className='rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100'
            >
              Làm mới
            </button>
          </div>
        </div>
      </header>

      <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <article className='rounded-3xl border border-amber-900/15 bg-white p-5 shadow-sm'>
          <p className='text-xs font-medium text-stone-500'>Điểm trung bình (shop)</p>
          <div className='mt-2 flex items-baseline gap-2'>
            <p className='text-2xl font-semibold text-amber-900'>{shopRating.toFixed(1)}</p>
            <span className='text-sm text-stone-500'>/ 5</span>
          </div>
          <p className='mt-1 text-xs text-stone-500'>Theo Shop Service (rating)</p>
        </article>
        <article className='rounded-3xl border border-amber-900/15 bg-white p-5 shadow-sm'>
          <p className='text-xs font-medium text-stone-500'>Tổng review (shop)</p>
          <p className='mt-2 text-2xl font-semibold text-stone-900'>{shopReviewCount}</p>
          <p className='mt-1 text-xs text-stone-500'>Tổng hợp cấp shop — không phải số dòng list</p>
        </article>
        <article className='rounded-3xl border border-amber-900/15 bg-white p-5 shadow-sm'>
          <p className='text-xs font-medium text-stone-500'>Cần phản hồi</p>
          <p className='mt-2 text-2xl font-semibold text-orange-800'>{stats.needsResponse}</p>
          <p className='mt-1 text-xs text-stone-500'>Chưa có shopResponse</p>
        </article>
        <article className='rounded-3xl border border-amber-900/15 bg-white p-5 shadow-sm'>
          <p className='text-xs font-medium text-stone-500'>Tích cực (4–5★) · danh sách đã tải</p>
          <p className='mt-2 text-2xl font-semibold text-emerald-800'>{stats.positive}%</p>
          <p className='mt-1 text-xs text-stone-500'>
            {stats.newLast7} đánh giá mới trong 7 ngày
          </p>
        </article>
      </section>

      <section className='space-y-4 rounded-3xl border border-amber-900/15 bg-white p-5 shadow-sm'>
        <h3 className='text-base font-semibold text-stone-900'>Lọc đánh giá</h3>
        <div className='flex flex-wrap gap-2'>
          {(
            [
              ['all', 'Tất cả'],
              ['needs_response', 'Chưa phản hồi'],
              ['responded', 'Đã phản hồi'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type='button'
              onClick={() => setFilterTab(id)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                filterTab === id
                  ? 'bg-amber-900 text-white shadow'
                  : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-xs font-semibold text-stone-600'>Số sao:</span>
          <button
            type='button'
            onClick={() => setRatingPick(null)}
            className={`rounded-xl px-3 py-1 text-xs font-semibold ${
              ratingPick == null ? 'bg-stone-800 text-white' : 'border border-stone-200 text-stone-700'
            }`}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              type='button'
              onClick={() => setRatingPick(n)}
              className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold ${
                ratingPick === n
                  ? 'border-amber-800 bg-amber-100 text-amber-950'
                  : 'border-stone-200 text-stone-700'
              }`}
            >
              <span className='text-amber-500'>★</span> {n}
            </button>
          ))}
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <label className='text-xs font-semibold text-stone-600'>Sản phẩm:</label>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className='max-w-md rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800'
          >
            <option value='all'>Tất cả sản phẩm ({products.length})</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className='relative'>
          <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400'>⌕</span>
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Tìm theo tên SP, mã đơn, SKU, nội dung...'
            className='w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:outline-none'
          />
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-amber-900/15 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <h3 className='text-base font-semibold text-stone-900'>
            Danh sách đánh giá ({filtered.length}
            {filtered.length !== reviews.length ? ` / ${reviews.length}` : ''})
          </h3>
          {reviewsError && (
            <span className='text-xs font-medium text-red-600'>Không tải được một phần dữ liệu.</span>
          )}
        </div>

        {loading ? (
          <div className='flex justify-center py-16'>
            <div className='h-10 w-10 animate-spin rounded-full border-2 border-amber-900 border-t-transparent' />
          </div>
        ) : products.length === 0 ? (
          <p className='py-8 text-center text-sm text-stone-500'>Chưa có sản phẩm nào — không có đánh giá để hiển thị.</p>
        ) : filtered.length === 0 ? (
          <p className='py-8 text-center text-sm text-stone-500'>Không có đánh giá phù hợp bộ lọc.</p>
        ) : (
          <ul className='space-y-6'>
            {filtered.map((r) => (
              <li
                key={r.reviewId}
                className='border-b border-amber-900/10 pb-6 last:border-none last:pb-0'
              >
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start'>
                  <div className='flex min-w-0 flex-1 gap-3'>
                    <div className='h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100'>
                      {r.productThumbnailUrl ? (
                        <img src={r.productThumbnailUrl} alt='' className='h-full w-full object-cover' />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-[10px] text-stone-400'>
                          Ảnh
                        </div>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-semibold text-stone-900'>{r.productName}</p>
                      <p className='text-xs text-stone-500'>
                        SKU {r.globalSku} · Đơn #{r.orderId.slice(0, 8)}…
                      </p>
                      <div className='mt-2 flex flex-wrap items-center gap-2'>
                        <RatingStars value={Math.round(r.rating)} />
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            r.rating <= 2 ? 'bg-rose-600 text-white' : 'bg-amber-900 text-white'
                          }`}
                        >
                          {r.rating} / 5
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            r.isVisible
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {r.isVisible ? 'Đang hiển thị' : 'Đã ẩn (storefront)'}
                        </span>
                      </div>
                      {r.content ? (
                        <p className='mt-3 text-sm leading-relaxed text-stone-700'>{r.content}</p>
                      ) : (
                        <p className='mt-3 text-sm italic text-stone-400'>(Không có nội dung chữ)</p>
                      )}

                      {(r.imageUrls?.length ?? 0) > 0 && (
                        <div className='mt-3'>
                          <p className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500'>
                            Ảnh khách hàng ({r.imageUrls.length})
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {r.imageUrls.map((url, idx) => (
                              <a
                                key={`${r.reviewId}-img-${idx}`}
                                href={url}
                                target='_blank'
                                rel='noreferrer'
                                className='group relative h-24 w-24 overflow-hidden rounded-xl border border-stone-200 bg-stone-50'
                              >
                                <img
                                  src={url}
                                  alt=''
                                  className='h-full w-full object-cover transition group-hover:opacity-90'
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className='mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-500'>
                        <span>{reviewerLabel(r.accountId)}</span>
                        <span>·</span>
                        <span>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex shrink-0 flex-col gap-2 border-t border-stone-100 pt-4 lg:w-52 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0'>
                    {r.isVisible ? (
                      <button
                        type='button'
                        disabled={hideMutation.isPending}
                        onClick={() => hideMutation.mutate(r.reviewId)}
                        className='rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50'
                      >
                        Ẩn khỏi storefront
                      </button>
                    ) : (
                      <button
                        type='button'
                        disabled={unhideMutation.isPending}
                        onClick={() => unhideMutation.mutate(r.reviewId)}
                        className='rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50'
                      >
                        Hiện lại
                      </button>
                    )}
                    <button
                      type='button'
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(r.reviewId)}
                      className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50'
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div className='mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4'>
                  {(r.shopResponse || openReplyId === r.reviewId) && (
                    <p className='mb-2 text-[11px] font-semibold text-stone-600'>Phản hồi từ shop</p>
                  )}
                  {r.shopResponse && openReplyId !== r.reviewId ? (
                    <div>
                      <p className='text-sm text-stone-800'>{r.shopResponse}</p>
                      {r.shopResponseAt && (
                        <p className='mt-2 text-xs text-stone-500'>
                          {new Date(r.shopResponseAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                      <button
                        type='button'
                        onClick={() => startReply(r)}
                        className='mt-3 rounded-xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white hover:opacity-95'
                      >
                        Sửa phản hồi
                      </button>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={replyTextById[r.reviewId] ?? ''}
                        onChange={(e) =>
                          setReplyTextById((prev) => ({ ...prev, [r.reviewId]: e.target.value }))
                        }
                        onFocus={() => setOpenReplyId(r.reviewId)}
                        rows={3}
                        placeholder='Viết phản hồi tới khách…'
                        className='w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:outline-none'
                      />
                      <button
                        type='button'
                        disabled={respondMutation.isPending || !(replyTextById[r.reviewId] ?? '').trim()}
                        onClick={() => submitReply(r.reviewId)}
                        className='mt-2 rounded-xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50'
                      >
                        {respondMutation.isPending ? 'Đang gửi…' : r.shopResponse ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
