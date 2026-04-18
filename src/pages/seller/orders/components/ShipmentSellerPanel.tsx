import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderService, shipmentService, providerService } from '@/services'
import type { SellerOrder, SellerOrderStatus, ShipmentDto } from '@/types'
import {
  ORDER_STATUSES_ALLOW_CREATE_SHIPMENT,
  SHIP_QUERY_KEY,
  canMarkPickup,
  hasNonTerminalShipment,
  shipmentStatusBadgeClass,
  shipmentStatusLabel,
  suggestedNextShipmentStatuses,
} from '../shipmentSellerUi'

function errMsg(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) return String((e as { message: string }).message)
  return 'Không thực hiện được. Vui lòng thử lại.'
}

function getErrStatus(e: unknown): number | undefined {
  if (typeof e === 'object' && e !== null && 'status' in e) {
    const s = (e as { status: unknown }).status
    return typeof s === 'number' ? s : undefined
  }
  return undefined
}

const CREATE_RETRY_DELAYS_MS = [800, 1600, 3200]

function shouldRetryCreateShipment400(message: string): boolean {
  const m = message.toLowerCase()
  if (m.includes('validation') || m.includes('invalid') || m.includes('required field')) return false
  return (
    m.includes('cache') ||
    m.includes('shipmentservice') ||
    m.includes('order.created') ||
    m.includes('order') ||
    m.includes('created') ||
    m.includes('sync') ||
    m.includes('chưa') ||
    m.includes('not found') ||
    m.length < 4
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0)
}

function formatDt(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function resolveShippingProviderLabel(
  shipment: ShipmentDto,
  providers: { providerId: string; name: string }[],
): string {
  const direct = shipment.shippingProviderName?.trim()
  if (direct) return direct
  const code = shipment.providerCode?.trim()
  if (!code) return '—'
  const p = providers.find((x) => x.providerId === code)
  return p?.name ?? code
}

type Props = {
  shopId: string
  order: SellerOrder
  shipment: ShipmentDto | null
  compact?: boolean
  onToast?: (ok: boolean, msg: string) => void
}

/**
 * Thao tác vận đơn bổ sung sau khi đổi trạng thái đơn (UpdateStatus + orchestrate tạo vận đơn ở AllOrders).
 * Dùng khi cần lấy hàng, chuyển bước vận chuyển, hoặc tạo tay nếu tự động thất bại.
 */
export default function ShipmentSellerPanel({ shopId, order, shipment, compact, onToast }: Props) {
  const queryClient = useQueryClient()
  const { data: providersData } = useQuery({
    queryKey: ['shipping-providers', 'list'],
    queryFn: () => providerService.getAllProviders(),
    staleTime: 5 * 60 * 1000,
  })
  const providers = providersData?.filter((p) => p.isActive !== false) ?? []
  const providerDisplayName = React.useMemo(
    () => (shipment ? resolveShippingProviderLabel(shipment, providers) : null),
    [shipment, providers],
  )

  const [reasonOpen, setReasonOpen] = React.useState<'failure' | 'cancel' | null>(null)
  const [reasonText, setReasonText] = React.useState('')
  const [pendingNext, setPendingNext] = React.useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['seller-shop-orders', shopId] })
    void queryClient.invalidateQueries({ queryKey: [SHIP_QUERY_KEY, shopId] })
  }

  const createMu = useMutation({
    mutationFn: async () => {
      const body = {
        shopId,
        orderId: order.orderId,
        providerServiceCode: order.providerServiceCode ?? undefined,
      }
      const maxAttempts = 1 + CREATE_RETRY_DELAYS_MS.length
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return await shipmentService.createShipment(body)
        } catch (e) {
          const st = getErrStatus(e)
          if (st === 409) throw e
          const msg = errMsg(e)
          const canRetry =
            st === 400 && attempt < maxAttempts - 1 && shouldRetryCreateShipment400(msg)
          if (canRetry) {
            await sleep(CREATE_RETRY_DELAYS_MS[attempt]!)
            continue
          }
          throw e
        }
      }
      throw new Error('Không tạo được vận đơn.')
    },
    onSuccess: () => {
      invalidate()
      onToast?.(true, 'Đã tạo vận đơn.')
    },
    onError: (e) => {
      const st = getErrStatus(e)
      if (st === 409) {
        invalidate()
        onToast?.(
          false,
          'Đã có vận đơn đang hoạt động cho đơn này (409). Đã làm mới dữ liệu.',
        )
        return
      }
      onToast?.(false, errMsg(e))
    },
  })

  const pickupMu = useMutation({
    mutationFn: () => shipmentService.updateShipmentPickup(shipment!.shipmentId),
    onSuccess: () => {
      invalidate()
      onToast?.(true, 'Đã đánh dấu đã lấy hàng.')
    },
    onError: (e) => onToast?.(false, errMsg(e)),
  })

  const statusMu = useMutation({
    mutationFn: (body: { status: string; failureReason?: string; cancelReason?: string }) =>
      shipmentService.updateShipmentStatus(shipment!.shipmentId, body),
    onSuccess: () => {
      invalidate()
      setReasonOpen(null)
      setReasonText('')
      setPendingNext(null)
      onToast?.(true, 'Đã cập nhật trạng thái vận đơn.')
    },
    onError: (e) => onToast?.(false, errMsg(e)),
  })

  const deleteMu = useMutation({
    mutationFn: () => shipmentService.deleteShipment(shipment!.shipmentId),
    onSuccess: () => {
      invalidate()
      onToast?.(true, 'Đã xóa vận đơn.')
    },
    onError: (e) => onToast?.(false, errMsg(e)),
  })

  const syncOrderMu = useMutation({
    mutationFn: (status: SellerOrderStatus) => orderService.updateShopOrderStatus(order.orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller-shop-orders', shopId] })
      onToast?.(true, 'Đã đồng bộ trạng thái đơn hàng.')
    },
    onError: (e) => onToast?.(false, errMsg(e)),
  })

  const ost = (order.status || '').toUpperCase()
  const sst = (shipment?.status || '').toUpperCase()

  const hasLiveShipment = hasNonTerminalShipment(shipment)

  const canCreate =
    !hasLiveShipment && ORDER_STATUSES_ALLOW_CREATE_SHIPMENT.has(ost)

  const nextOptions = shipment ? suggestedNextShipmentStatuses(shipment.status) : []
  const busy =
    createMu.isPending ||
    pickupMu.isPending ||
    statusMu.isPending ||
    deleteMu.isPending ||
    syncOrderMu.isPending

  const submitReason = () => {
    if (!shipment || !pendingNext) return
    const trimmed = reasonText.trim()
    if (pendingNext === 'DELIVERY_FAILED' && !trimmed) {
      onToast?.(false, 'Nhập lý do giao thất bại.')
      return
    }
    if (pendingNext === 'CANCELLED' && !trimmed) {
      onToast?.(false, 'Nhập lý do hủy vận đơn.')
      return
    }
    statusMu.mutate({
      status: pendingNext,
      ...(pendingNext === 'DELIVERY_FAILED' ? { failureReason: trimmed } : {}),
      ...(pendingNext === 'CANCELLED' ? { cancelReason: trimmed } : {}),
    })
  }

  const tilePrimary =
    'flex min-h-[42px] w-full items-center justify-center rounded border-2 border-yellow-800 bg-yellow-800 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-yellow-900 disabled:opacity-50 sm:min-h-[44px]'
  const tileSecondary =
    'flex min-h-[42px] w-full items-center justify-center rounded border-2 border-amber-400/80 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-stone-900 shadow-sm transition hover:border-amber-500 hover:bg-amber-100 disabled:opacity-50 sm:min-h-[44px]'
  const tileNext =
    'flex min-h-[42px] w-full items-center justify-center rounded border-2 border-yellow-800/35 bg-white px-3 py-2 text-center text-xs font-semibold leading-snug text-stone-800 shadow-sm transition hover:border-yellow-800/70 hover:bg-stone-50 disabled:opacity-50 sm:min-h-[44px]'
  const tileDanger =
    'flex min-h-[40px] w-full items-center justify-center rounded border-2 border-red-300 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-800 shadow-sm transition hover:bg-red-100 disabled:opacity-50'

  const panelBody = (
    <>
      <p className='text-xs text-stone-600'>
        Ở bước Sẵn sàng giao hàng, nút trên danh sách đã gộp: tạo vận đơn (nếu chưa có) rồi chuyển đơn sang Đang
        giao. Phần dưới dùng cho lấy hàng, chuyển bước vận chuyển, hoặc tạo tay nếu tự động lỗi.
      </p>

      {!shipment && (
        <p className='mt-2 text-xs text-stone-600'>
          Chưa có vận đơn trên danh sách — có thể đợi làm mới sau khi đổi trạng thái đơn, hoặc tạo tay bên dưới.
        </p>
      )}

      {shipment && (
        <div className='mt-2 space-y-2 text-xs text-stone-700'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-mono text-[11px] text-stone-500'>{shipment.shipmentId}</span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${shipmentStatusBadgeClass(shipment.status)}`}
            >
              {shipmentStatusLabel(shipment.status)}
            </span>
          </div>
          <p>
            <span className='text-stone-500'>Nhà cung cấp:</span>{' '}
            <span className='font-semibold text-stone-900'>{providerDisplayName ?? '—'}</span>
          </p>
          {shipment.trackingNumber && (
            <p>
              <span className='text-stone-500'>Tracking:</span>{' '}
              <span className='font-mono font-semibold'>{shipment.trackingNumber}</span>
            </p>
          )}
          <p>
            Phí VC: <strong>{formatVnd(shipment.finalShippingFeeVnd)}</strong>
            {shipment.isFreeShipping ? (
              <span className='ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800'>
                Miễn phí
              </span>
            ) : null}
          </p>
          {shipment.pickupScheduledAt && (
            <p className='text-stone-600'>Hẹn lấy: {formatDt(shipment.pickupScheduledAt)}</p>
          )}
          {shipment.pickedUpAt && <p className='text-stone-600'>Đã lấy: {formatDt(shipment.pickedUpAt)}</p>}
          {shipment.failureReason && (
            <p className='text-orange-800'>Lỗi giao: {shipment.failureReason}</p>
          )}
          {shipment.cancelReason && <p className='text-stone-700'>Hủy: {shipment.cancelReason}</p>}
        </div>
      )}

      <div className={`${compact ? 'mt-2' : 'mt-3'} space-y-3`}>
        {(canCreate || (shipment && canMarkPickup(shipment.status))) && (
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {canCreate && (
              <button type='button' disabled={busy} onClick={() => createMu.mutate()} className={tilePrimary}>
                Tạo vận đơn
              </button>
            )}
            {shipment && canMarkPickup(shipment.status) && (
              <button type='button' disabled={busy} onClick={() => pickupMu.mutate()} className={tileSecondary}>
                Đã lấy hàng
              </button>
            )}
          </div>
        )}

        {shipment && nextOptions.length > 0 && (
          <div>
            <p className='mb-2 text-[10px] font-semibold uppercase tracking-wide text-stone-500'>
              Chuyển trạng thái tiếp theo
            </p>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {nextOptions.map((ns) => (
                <button
                  key={ns}
                  type='button'
                  disabled={busy}
                  onClick={() => {
                    if (ns === 'DELIVERY_FAILED' || ns === 'CANCELLED') {
                      setPendingNext(ns)
                      setReasonOpen(ns === 'DELIVERY_FAILED' ? 'failure' : 'cancel')
                      setReasonText('')
                      return
                    }
                    statusMu.mutate({ status: ns })
                  }}
                  className={tileNext}
                >
                  {shipmentStatusLabel(ns)}
                </button>
              ))}
            </div>
          </div>
        )}

        {shipment && ['DRAFT', 'CANCELLED', 'RETURNED', 'DELIVERY_FAILED'].includes(sst) && (
          <button
            type='button'
            disabled={busy}
            onClick={() => {
              if (!window.confirm('Xóa vận đơn này? Chỉ hợp lệ với một số trạng thái.')) return
              deleteMu.mutate()
            }}
            className={tileDanger}
          >
            Xóa vận đơn
          </button>
        )}
      </div>

      {shipment && (ost === 'READY_TO_SHIP' || ost === 'PROCESSING') && sst === 'PICKED_UP' && (
        <div className='mt-2'>
          <button
            type='button'
            disabled={busy}
            onClick={() => syncOrderMu.mutate('SHIPPED')}
            className='text-xs font-semibold text-sky-800 underline hover:text-sky-950'
          >
            Đồng bộ đơn → Đang giao (SHIPPED)
          </button>
          <p className='mt-0.5 text-[10px] text-stone-500'>
            Gợi ý: khi đã giao cho ĐVVC, cập nhật đơn để khách thấy trạng thái giao hàng.
          </p>
        </div>
      )}

      {reasonOpen && (
        <div className='mt-3 rounded-lg border border-orange-200 bg-orange-50/50 p-3'>
          <p className='text-xs font-medium text-stone-800'>
            {reasonOpen === 'failure' ? 'Lý do giao thất bại' : 'Lý do hủy vận đơn'}
          </p>
          <textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            rows={2}
            className='mt-2 w-full rounded border border-orange-200 px-2 py-1.5 text-xs'
            placeholder='Nhập lý do...'
          />
          <div className='mt-2 flex gap-2'>
            <button
              type='button'
              disabled={busy}
              onClick={submitReason}
              className='rounded-lg bg-yellow-800 px-3 py-1.5 text-xs font-semibold text-white'
            >
              Xác nhận
            </button>
            <button
              type='button'
              onClick={() => {
                setReasonOpen(null)
                setPendingNext(null)
                setReasonText('')
              }}
              className='text-xs text-stone-600'
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </>
  )

  if (compact) {
    return <div className='text-xs'>{panelBody}</div>
  }

  return (
    <section className='rounded-lg border border-yellow-800/20 bg-white px-3 py-3 shadow-sm'>
      <h3 className='text-xs font-bold uppercase tracking-wide text-stone-500'>Vận đơn (Shipment)</h3>
      {panelBody}
    </section>
  )
}
