import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { BuyerOrder } from '@/types'
import { productReviewService } from '@/services'
import { ROUTES } from '@/constants/routes'
import { BuyerReviewModal } from '@/components/reviews/BuyerReviewModal'
import { lineEligibleForBuyerReview } from '../../utils/orderReviewEligibility'
import PackageIcon from '@/assets/icons/essential/commerce/package.svg'
import TruckIcon from '@/assets/icons/essential/commerce/truck.svg'

type CustomerOrderBucket = 'all' | 'handling' | 'delivery' | 'completed' | 'closed'

const BUYER_ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Ch\u1edd x\u00e1c nh\u1eadn',
  CONFIRMED: '\u0110\u00e3 x\u00e1c nh\u1eadn',
  PROCESSING: '\u0110ang x\u1eed l\u00fd',
  READY_TO_SHIP: 'S\u1eb5n s\u00e0ng giao',
  SHIPPED: '\u0110ang giao h\u00e0ng',
  DELIVERED: '\u0110\u00e3 giao',
  COMPLETED: 'Ho\u00e0n th\u00e0nh',
  CANCELLED: '\u0110\u00e3 h\u1ee7y',
  REFUNDING: '\u0110ang ho\u00e0n ti\u1ec1n',
  REFUNDED: '\u0110\u00e3 ho\u00e0n ti\u1ec1n',
}

const TIMELINE_STEP_LABELS = ['\u0110\u1eb7t h\u00e0ng', 'Shop x\u1eed l\u00fd', 'V\u1eadn chuy\u1ec3n', 'Ho\u00e0n t\u1ea5t']

function formatOrderMoney(n: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)
}

function providerServiceCodeLabel(code: string | null | undefined): string {
  const u = (code ?? '').trim().toUpperCase()
  if (u === 'ECO') return 'Ti\u1ebft ki\u1ec7m (ECO)'
  if (u === 'STF' || u === 'STD') return 'Ti\u00eau chu\u1ea9n (STD)'
  if (u === 'EXP') return 'Nhanh (EXP)'
  return u || '\u2014'
}

function bucketForStatus(status: string): CustomerOrderBucket {
  const s = status.toUpperCase()
  if (['PENDING', 'CONFIRMED', 'PROCESSING'].includes(s)) return 'handling'
  if (['READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(s)) return 'delivery'
  if (s === 'COMPLETED') return 'completed'
  if (['CANCELLED', 'REFUNDING', 'REFUNDED'].includes(s)) return 'closed'
  return 'handling'
}

function orderMatchesBucket(order: BuyerOrder, bucket: CustomerOrderBucket): boolean {
  if (bucket === 'all') return true
  return bucketForStatus(order.status) === bucket
}

function sortBuyerOrdersByDateDesc(orders: BuyerOrder[]): BuyerOrder[] {
  return [...orders].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta)
  })
}

function fulfillmentSegments(status: string): { filled: number; variant: 'normal' | 'cancel' | 'refund' } {
  const s = status.toUpperCase()
  if (s === 'CANCELLED') return { filled: 0, variant: 'cancel' }
  if (s === 'REFUNDING' || s === 'REFUNDED') return { filled: 0, variant: 'refund' }
  if (s === 'PENDING') return { filled: 1, variant: 'normal' }
  if (['CONFIRMED', 'PROCESSING', 'READY_TO_SHIP'].includes(s)) return { filled: 2, variant: 'normal' }
  if (s === 'SHIPPED') return { filled: 3, variant: 'normal' }
  if (s === 'DELIVERED' || s === 'COMPLETED') return { filled: 4, variant: 'normal' }
  return { filled: 1, variant: 'normal' }
}

function paymentStatusLabel(ps?: string | null): string {
  if (ps == null || ps === '') return '\u2014'
  const u = ps.toUpperCase()
  if (u === 'PENDING') return 'Ch\u1edd thanh to\u00e1n'
  if (['PAID', 'SUCCEEDED', 'COMPLETED', 'SUCCESS'].includes(u)) return '\u0110\u00e3 thanh to\u00e1n'
  if (['FAILED', 'CANCELLED'].includes(u)) return 'Thanh to\u00e1n th\u1ea5t b\u1ea1i'
  return ps
}

function buyerStatusBadgeClass(status: string): { bg: string; text: string } {
  const s = status.toUpperCase()
  if (s === 'PENDING') return { bg: 'bg-amber-100', text: 'text-amber-800' }
  if (['CONFIRMED', 'PROCESSING', 'READY_TO_SHIP'].includes(s)) return { bg: 'bg-blue-100', text: 'text-blue-800' }
  if (['SHIPPED', 'DELIVERED'].includes(s)) return { bg: 'bg-orange-100', text: 'text-orange-800' }
  if (s === 'COMPLETED') return { bg: 'bg-green-100', text: 'text-green-800' }
  if (s === 'CANCELLED') return { bg: 'bg-red-100', text: 'text-red-800' }
  if (['REFUNDING', 'REFUNDED'].includes(s)) return { bg: 'bg-violet-100', text: 'text-violet-800' }
  return { bg: 'bg-gray-100', text: 'text-gray-700' }
}

function lineItemStatusLabel(st: string): string {
  const u = st.toUpperCase()
  if (u === 'UNFULFILLED') return 'Ch\u01b0a giao h\u00e0ng'
  if (u === 'FULFILLED') return '\u0110\u00e3 giao'
  return st
}

const BUCKET_TABS: Array<{ id: CustomerOrderBucket; label: string }> = [
  { id: 'all', label: 'T\u1ea5t c\u1ea3' },
  { id: 'handling', label: 'Ch\u1edd v\u00e0 \u0111ang x\u1eed l\u00fd' },
  { id: 'delivery', label: 'Chu\u1ea9n b\u1ecb v\u00e0 giao h\u00e0ng' },
  { id: 'completed', label: 'Ho\u00e0n t\u1ea5t' },
  { id: 'closed', label: 'H\u1ee7y \u00b7 Ho\u00e0n ti\u1ec1n' },
]

export interface BuyerOrdersPanelProps {
  orders: BuyerOrder[]
  isLoading: boolean
  isError: boolean
  orderBucket: CustomerOrderBucket
  onBucketChange: (b: CustomerOrderBucket) => void
  expandedOrderId: string | null
  onToggleExpand: (orderId: string) => void
}

export function BuyerOrdersPanel({
  orders,
  isLoading,
  isError,
  orderBucket,
  onBucketChange,
  expandedOrderId,
  onToggleExpand,
}: BuyerOrdersPanelProps) {
  const navigate = useNavigate()
  const [reviewTarget, setReviewTarget] = React.useState<null | {
    orderId: string
    versionId: string
    orderItemId: string
    productName: string
  }>(null)

  const { data: expandedOrderReviews = [] } = useQuery({
    queryKey: ['order-reviews', expandedOrderId],
    queryFn: () => productReviewService.getReviewsByOrderId(expandedOrderId!),
    enabled: !!expandedOrderId,
  })

  const reviewedOrderItemIds = React.useMemo(
    () => new Set(expandedOrderReviews.map((r) => r.orderItemId)),
    [expandedOrderReviews]
  )

  const sorted = sortBuyerOrdersByDateDesc(orders)
  const filtered = sorted.filter((o) => orderMatchesBucket(o, orderBucket))
  const counts: Record<CustomerOrderBucket, number> = {
    all: sorted.length,
    handling: 0,
    delivery: 0,
    completed: 0,
    closed: 0,
  }
  for (const o of sorted) {
    counts[bucketForStatus(o.status)]++
  }

  if (isError) {
    return (
      <div
        className='rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'
        style={{ fontFamily: 'Arimo, sans-serif' }}
      >
        {'Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c danh s\u00e1ch \u0111\u01a1n h\u00e0ng. Vui l\u00f2ng th\u1eed l\u1ea1i sau.'}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <div className='inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-amber-700' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2'>
        {BUCKET_TABS.map(({ id, label }) => (
          <button
            key={id}
            type='button'
            onClick={() => onBucketChange(id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              orderBucket === id
                ? 'border-[#BE9C73] bg-amber-50 text-[#6C5B50]'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Arimo, sans-serif' }}
          >
            {label}
            <span className='ml-1 text-xs text-gray-500'>({counts[id]})</span>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className='space-y-4'>
          {filtered.map((order) => {
            const st = String(order.status).toUpperCase()
            const badge = buyerStatusBadgeClass(order.status)
            const { filled, variant } = fulfillmentSegments(order.status)
            const expanded = expandedOrderId === order.orderId
            const created = order.createdAt
              ? new Date(order.createdAt).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '\u2014'
            const statusText = BUYER_ORDER_STATUS_LABEL[st] || order.status
            const firstItem = order.orderItems[0]
            const moreItems = Math.max(0, order.orderItems.length - 1)

            return (
              <div
                key={order.orderId}
                className='bg-white rounded-[20px] shadow-md p-6 transition-shadow hover:shadow-lg'
              >
                <div className='mb-4 flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-2 flex flex-wrap items-center gap-2'>
                      <h3
                        className='text-lg font-bold'
                        style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}
                        title={order.orderId}
                      >
                        #{order.orderId.slice(0, 8).toUpperCase()}…
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        {statusText}
                      </span>
                      {order.paymentStatus != null && order.paymentStatus !== '' && (
                        <span
                          className='rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700'
                          style={{ fontFamily: 'Arimo, sans-serif' }}
                        >
                          {paymentStatusLabel(order.paymentStatus)}
                        </span>
                      )}
                      {order.providerServiceCode != null && order.providerServiceCode !== '' && (
                        <span
                          className='rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-900'
                          style={{ fontFamily: 'Arimo, sans-serif' }}
                          title={order.providerServiceCode}
                        >
                          {providerServiceCodeLabel(order.providerServiceCode)}
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      {'Ng\u00e0y \u0111\u1eb7t: '}
                      {created}
                    </p>
                    {order.shopName != null && String(order.shopName).trim() !== '' ? (
                      <p
                        className='mt-1 text-sm font-semibold text-[#6C5B50]'
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {String(order.shopName).trim()}
                      </p>
                    ) : null}
                    <button
                      type='button'
                      onClick={() => navigate(ROUTES.SHOP(order.shopId, order.shopName))}
                      className='mt-1 text-xs font-medium text-amber-800 underline-offset-2 hover:underline'
                      style={{ fontFamily: 'Arimo, sans-serif' }}
                    >
                      {'Xem c\u1eeda h\u00e0ng'}
                    </button>
                  </div>
                  <div className='text-left sm:text-right'>
                    <p className='mb-1 text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      {'T\u1ed5ng thanh to\u00e1n'}
                    </p>
                    <p
                      className='text-xl font-bold'
                      style={{ fontFamily: 'Poppins, sans-serif', color: '#BE9C73' }}
                    >
                      {formatOrderMoney(order.totalAmountVnd)}
                    </p>
                    <p className='mt-1 text-xs text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      {'T\u1ea1m t\u00ednh: '}
                      {formatOrderMoney(order.subtotalVnd)}
                    </p>
                  </div>
                </div>

                {variant === 'cancel' && (
                  <p className='mb-3 text-sm font-medium text-red-700' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    {'\u0110\u01a1n h\u00e0ng \u0111\u00e3 b\u1ecb h\u1ee7y.'}
                  </p>
                )}
                {variant === 'refund' && (
                  <p className='mb-3 text-sm font-medium text-violet-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    {st === 'REFUNDING'
                      ? '\u0110\u01a1n h\u00e0ng \u0111ang trong quy tr\u00ecnh ho\u00e0n ti\u1ec1n.'
                      : '\u0110\u01a1n h\u00e0ng \u0111\u00e3 ho\u00e0n ti\u1ec1n.'}
                  </p>
                )}
                {variant === 'normal' && (
                  <div className='mb-4'>
                    <div className='mb-2 flex gap-1'>
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className='flex flex-1 flex-col items-center gap-1'>
                          <div
                            className={`h-2 w-full rounded-full ${i < filled ? 'bg-[#BE9C73]' : 'bg-gray-200'}`}
                          />
                          <span
                            className='text-center text-[10px] leading-tight text-gray-600'
                            style={{ fontFamily: 'Arimo, sans-serif' }}
                          >
                            {TIMELINE_STEP_LABELS[i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {firstItem && (
                  <div className='mb-4 flex gap-3 rounded-[10px] bg-gray-50 px-4 py-3'>
                    {firstItem.thumbnailUrl != null && String(firstItem.thumbnailUrl).trim() !== '' ? (
                      <img
                        src={String(firstItem.thumbnailUrl).trim()}
                        alt=''
                        className='h-16 w-16 flex-shrink-0 rounded-lg border border-gray-200 object-cover'
                      />
                    ) : (
                      <div
                        className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-[10px] text-gray-400'
                        aria-hidden
                      >
                        —
                      </div>
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        {firstItem.productName}
                      </p>
                      <p className='text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        {firstItem.versionName}
                        {moreItems > 0 ? ' · +' + moreItems + ' s\u1ea3n ph\u1ea9m kh\u00e1c' : ''}
                      </p>
                    </div>
                  </div>
                )}

                <div className='flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-end sm:justify-between'>
                  <div className='min-w-0'>
                    <p className='mb-1 text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      <img src={TruckIcon} alt='' className='mr-1 inline h-4 w-4' />
                      {'\u0110\u1ecba ch\u1ec9 giao h\u00e0ng'}
                    </p>
                    <p className='text-sm font-medium text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      {order.deliveryAddress}
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      type='button'
                      onClick={() => onToggleExpand(order.orderId)}
                      className='rounded-[10px] border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50'
                      style={{
                        fontFamily: 'Arimo, sans-serif',
                        borderColor: '#D4B896',
                        color: '#6C5B50',
                      }}
                    >
                      {expanded
                        ? 'Thu g\u1ecdn'
                        : 'Chi ti\u1ebft s\u1ea3n ph\u1ea9m'}
                    </button>
                    {st === 'COMPLETED' && (
                      <button
                        type='button'
                        onClick={() => navigate(ROUTES.CATALOG)}
                        className='rounded-[10px] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90'
                        style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}
                      >
                        {'Mua s\u1eafm ti\u1ebfp'}
                      </button>
                    )}
                  </div>
                </div>
                {(st === 'DELIVERED' || st === 'COMPLETED') && !expanded && (
                  <p
                    className='mt-2 text-xs text-gray-600'
                    style={{ fontFamily: 'Arimo, sans-serif' }}
                  >
                    {
                      'M\u1edf \u201cChi ti\u1ebft s\u1ea3n ph\u1ea9m\u201d \u0111\u1ec3 \u0111\u00e1nh gi\u00e1 t\u1eebng m\u1eb7t h\u00e0ng \u0111\u00e3 giao.'
                    }
                  </p>
                )}

                {expanded && (
                  <div className='mt-4 space-y-3 border-t border-dashed border-gray-200 pt-4'>
                    <p
                      className='text-xs font-semibold uppercase text-gray-500'
                      style={{ fontFamily: 'Arimo, sans-serif' }}
                    >
                      {'Chi ti\u1ebft m\u1eb7t h\u00e0ng'}
                    </p>
                    <ul className='space-y-3'>
                      {order.orderItems.map((it) => (
                        <li
                          key={it.orderItemId}
                          className='rounded-[10px] border border-gray-100 bg-stone-50/80 p-4'
                        >
                          <div className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
                            <div className='flex min-w-0 gap-3'>
                              {it.thumbnailUrl != null && String(it.thumbnailUrl).trim() !== '' ? (
                                <img
                                  src={String(it.thumbnailUrl).trim()}
                                  alt=''
                                  className='h-20 w-20 flex-shrink-0 rounded-lg border border-gray-200 object-cover'
                                />
                              ) : (
                                <div
                                  className='flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-xs text-gray-400'
                                  aria-hidden
                                >
                                  —
                                </div>
                              )}
                              <div className='min-w-0 flex-1'>
                              <p className='font-semibold text-gray-900' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                {it.productName}
                              </p>
                              <p className='text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                {it.versionName}
                              </p>
                              <p
                                className='mt-1 text-xs text-gray-500'
                                style={{ fontFamily: 'Arimo, sans-serif' }}
                              >
                                {'SKU: '}
                                {it.sellerSku}
                                {' \u00b7 G\u1ed7: '}
                                {it.woodType}
                                {' \u00b7 K\u00edch th\u01b0\u1edbc: '}
                                {it.lengthCm}×{it.widthCm}×{it.heightCm} cm · {it.weightGrams} g
                              </p>
                              {it.productDescription ? (
                                <p
                                  className='mt-1 text-xs text-gray-500'
                                  style={{ fontFamily: 'Arimo, sans-serif' }}
                                >
                                  {it.productDescription}
                                </p>
                              ) : null}
                              </div>
                            </div>
                            <div className='text-left sm:text-right'>
                              <p className='text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                {'SL: '}
                                {it.quantity} × {formatOrderMoney(it.unitPriceVnd)}
                              </p>
                              <p
                                className='font-bold text-[#6C5B50]'
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                              >
                                {formatOrderMoney(it.lineTotalVnd)}
                              </p>
                              <span
                                className='mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-600'
                                style={{ fontFamily: 'Arimo, sans-serif' }}
                              >
                                {lineItemStatusLabel(it.status)}
                              </span>
                              {lineEligibleForBuyerReview(order.status, it.status) && (
                                <div className='mt-2'>
                                  {reviewedOrderItemIds.has(it.orderItemId) ? (
                                    <span
                                      className='text-xs font-medium text-emerald-700'
                                      style={{ fontFamily: 'Arimo, sans-serif' }}
                                    >
                                      {'\u0110\u00e3 \u0111\u00e1nh gi\u00e1'}
                                    </span>
                                  ) : (
                                    <button
                                      type='button'
                                      className='rounded-[8px] bg-[#BE9C73] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90'
                                      style={{ fontFamily: 'Arimo, sans-serif' }}
                                      onClick={() =>
                                        setReviewTarget({
                                          orderId: order.orderId,
                                          versionId: it.versionId,
                                          orderItemId: it.orderItemId,
                                          productName: it.productName,
                                        })
                                      }
                                    >
                                      {'\u0110\u00e1nh gi\u00e1'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : sorted.length === 0 ? (
        <div className='rounded-[20px] bg-white p-16 text-center shadow-md'>
          <img src={PackageIcon} alt='' className='mx-auto mb-4 h-24 w-24 opacity-30' />
          <h3 className='mb-2 text-xl font-bold text-gray-800' style={{ fontFamily: 'Poppins, sans-serif' }}>
            {'Ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng'}
          </h3>
          <p className='mb-6 text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
            {'B\u1ea1n ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o. Kh\u00e1m ph\u00e1 s\u1ea3n ph\u1ea9m g\u1ed7 ch\u1ea5t l\u01b0\u1ee3ng!'}
          </p>
          <button
            type='button'
            onClick={() => navigate(ROUTES.CATALOG)}
            className='rounded-[10px] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90'
            style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}
          >
            {'Mua s\u1eafm ngay'}
          </button>
        </div>
      ) : (
        <div
          className='rounded-[20px] bg-white p-10 text-center text-gray-600 shadow-md'
          style={{ fontFamily: 'Arimo, sans-serif' }}
        >
          {
            'Kh\u00f4ng c\u00f3 \u0111\u01a1n h\u00e0ng trong m\u1ee5c n\u00e0y. Th\u1eed ch\u1ecdn m\u1ee5c kh\u00e1c.'
          }
        </div>
      )}
      {reviewTarget ? (
        <BuyerReviewModal
          open
          onClose={() => setReviewTarget(null)}
          orderId={reviewTarget.orderId}
          versionId={reviewTarget.versionId}
          orderItemId={reviewTarget.orderItemId}
          productName={reviewTarget.productName}
        />
      ) : null}
    </div>
  )
}

export type { CustomerOrderBucket }
