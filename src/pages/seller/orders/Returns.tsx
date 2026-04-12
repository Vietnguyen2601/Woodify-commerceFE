import React from 'react'
import { useSellerOrdersAndShipments } from './hooks/useSellerOrdersAndShipments'
import ShipmentSellerPanel from './components/ShipmentSellerPanel'
import { shipmentStatusBadgeClass, shipmentStatusLabel } from './shipmentSellerUi'
import type { ShipmentDto } from '@/types'

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0)
}

const RETURN_SHIPMENT = new Set([
  'DELIVERY_FAILED',
  'RETURNING',
  'RETURNED',
  'CANCELLED',
])

const REFUND_ORDER = new Set(['REFUNDING', 'REFUNDED'])

function isReturnShipment(s: ShipmentDto): boolean {
  return RETURN_SHIPMENT.has((s.status || '').toUpperCase())
}

export default function Returns() {
  const { shopId, orders, shipments, shipmentByOrderId, isLoading, isError, error, refetch } =
    useSellerOrdersAndShipments()
  const [banner, setBanner] = React.useState<{ ok: boolean; msg: string } | null>(null)

  React.useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => setBanner(null), 4000)
    return () => window.clearTimeout(t)
  }, [banner])

  const returnShipments = React.useMemo(() => {
    return shipments
      .filter(isReturnShipment)
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
      )
  }, [shipments])

  const refundOrdersOnly = React.useMemo(() => {
    return orders.filter((o) => {
      const st = (o.status || '').toUpperCase()
      if (!REFUND_ORDER.has(st)) return false
      const sh = shipmentByOrderId.get(o.orderId) ?? null
      if (sh && RETURN_SHIPMENT.has((sh.status || '').toUpperCase())) return false
      return true
    })
  }, [orders, shipmentByOrderId])

  const orderMap = React.useMemo(() => new Map(orders.map((o) => [o.orderId, o])), [orders])

  if (!shopId) return null

  return (
    <div className='min-h-[60vh] font-["Arimo"] text-stone-900'>
      <header className='mb-6'>
        <h1 className='text-xl font-bold text-stone-900'>Trả hàng & hoàn tiền</h1>
        <p className='mt-1 max-w-2xl text-sm text-stone-600'>
          Vận đơn lỗi giao / hoàn kho và đơn ở trạng thái hoàn tiền. Cập nhật trạng thái vận đơn theo quy tắc backend
          (ví dụ từ <strong>Giao thất bại</strong> → <strong>Đang hoàn hàng</strong> → <strong>Đã hoàn kho</strong>).
        </p>
      </header>

      {banner && (
        <div
          role='status'
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            banner.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {banner.msg}
        </div>
      )}

      <div className='mb-4'>
        <button
          type='button'
          onClick={() => void refetch()}
          className='rounded-lg border border-yellow-800/30 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50'
        >
          Làm mới
        </button>
      </div>

      {isLoading && (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-yellow-800/20 bg-white py-16'>
          <div className='h-9 w-9 animate-spin rounded-full border-4 border-yellow-800 border-t-transparent' />
          <p className='text-sm text-stone-600'>Đang tải…</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className='rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800'>
          {(error as { message?: string })?.message || 'Không tải được dữ liệu.'}
        </div>
      )}

      {!isLoading && !isError && (
        <div className='space-y-10'>
          <section>
            <h2 className='mb-3 text-sm font-bold uppercase tracking-wide text-stone-500'>
              Vận đơn — lỗi / hoàn / hủy ({returnShipments.length})
            </h2>
            {returnShipments.length === 0 ? (
              <p className='rounded-xl border border-dashed border-yellow-800/25 bg-white px-4 py-8 text-center text-sm text-stone-600'>
                Không có vận đơn ở nhóm trạng thái hoàn trả.
              </p>
            ) : (
              <ul className='space-y-4'>
                {returnShipments.map((s) => {
                  const order = orderMap.get(s.orderId)
                  return (
                    <li
                      key={s.shipmentId}
                      className='overflow-hidden rounded-xl border border-yellow-800/20 bg-white shadow-sm'
                    >
                      <div className='flex flex-wrap items-center gap-2 border-b border-orange-100 bg-orange-50/50 px-4 py-2'>
                        <span className='font-mono text-xs font-semibold'>{s.shipmentId}</span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${shipmentStatusBadgeClass(s.status)}`}
                        >
                          {shipmentStatusLabel(s.status)}
                        </span>
                      </div>
                      <div className='p-4'>
                        {order ? (
                          <ShipmentSellerPanel
                            shopId={shopId}
                            order={order}
                            shipment={shipmentByOrderId.get(s.orderId) ?? s}
                            onToast={(ok, msg) => setBanner({ ok, msg })}
                          />
                        ) : (
                          <p className='text-sm text-stone-600'>Đơn {s.orderId}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className='mb-3 text-sm font-bold uppercase tracking-wide text-stone-500'>
              Đơn hàng — hoàn tiền (chưa gắn vận đơn lỗi trên danh sách) ({refundOrdersOnly.length})
            </h2>
            {refundOrdersOnly.length === 0 ? (
              <p className='rounded-xl border border-dashed border-yellow-800/25 bg-white px-4 py-8 text-center text-sm text-stone-600'>
                Không có đơn hoàn tiền riêng lẻ — hoặc đã hiển thị trong vận đơn phía trên.
              </p>
            ) : (
              <ul className='space-y-3'>
                {refundOrdersOnly.map((o) => (
                  <li
                    key={o.orderId}
                    className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-yellow-800/15 bg-white px-4 py-3 shadow-sm'
                  >
                    <div>
                      <p className='font-mono text-xs font-semibold text-stone-900'>{o.orderId}</p>
                      <p className='text-xs text-stone-600'>{formatVnd(o.totalAmountVnd)}</p>
                    </div>
                    <span className='rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-900'>
                      {(o.status || '').toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
