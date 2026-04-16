import React from 'react'
import { useSellerOrdersAndShipments } from './hooks/useSellerOrdersAndShipments'
import ShipmentSellerPanel from './components/ShipmentSellerPanel'
import {
  ORDER_STATUSES_ALLOW_CREATE_SHIPMENT,
  hasNonTerminalShipment,
  shipmentStatusBadgeClass,
  shipmentStatusLabel,
} from './shipmentSellerUi'
import type { SellerOrder, ShipmentDto } from '@/types'

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0)
}

const PRE_HANDOVER_STATUSES = new Set(['DRAFT', 'PENDING', 'PICKUP_SCHEDULED', 'PICKED_UP'])

export default function Handover() {
  const { shopId, orders, shipments, shipmentByOrderId, isLoading, isError, error, refetch } =
    useSellerOrdersAndShipments()
  const [banner, setBanner] = React.useState<{ ok: boolean; msg: string } | null>(null)

  React.useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => setBanner(null), 4000)
    return () => window.clearTimeout(t)
  }, [banner])

  const needCreate = React.useMemo(() => {
    return orders.filter((o) => {
      const st = (o.status || '').toUpperCase()
      if (!ORDER_STATUSES_ALLOW_CREATE_SHIPMENT.has(st)) return false
      const sh = shipmentByOrderId.get(o.orderId) ?? null
      return !hasNonTerminalShipment(sh)
    })
  }, [orders, shipmentByOrderId])

  const pickupPipeline = React.useMemo(() => {
    return shipments.filter((s) => PRE_HANDOVER_STATUSES.has((s.status || '').toUpperCase()))
  }, [shipments])

  if (!shopId) return null

  return (
    <div className='min-h-[60vh] font-["Arimo"] text-stone-900'>
      <header className='mb-6'>
        <h1 className='text-xl font-bold text-stone-900'>Bàn giao & lấy hàng</h1>
        <p className='mt-1 max-w-2xl text-sm text-stone-600'>
          Tập trung đơn chưa có vận đơn và vận đơn ở giai đoạn chờ lấy / đã lấy. Sau khi chuyển sang{' '}
          <strong>Đang vận chuyển</strong>, theo dõi tại{' '}
          <span className='font-semibold text-yellow-900'>Giao hàng loạt</span>.
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

      <div className='mb-4 flex flex-wrap gap-2'>
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
        <div className='space-y-8'>
          <section>
            <h2 className='mb-3 text-sm font-bold uppercase tracking-wide text-stone-500'>
              1. Cần tạo vận đơn ({needCreate.length})
            </h2>
            {needCreate.length === 0 ? (
              <p className='rounded-xl border border-dashed border-yellow-800/25 bg-white px-4 py-8 text-center text-sm text-stone-600'>
                Không có đơn nào đang chờ tạo vận đơn trong nhóm trạng thái xử lý / sẵn sàng giao.
              </p>
            ) : (
              <ul className='space-y-4'>
                {needCreate.map((o) => (
                  <li
                    key={o.orderId}
                    className='overflow-hidden rounded-xl border border-yellow-800/20 bg-white shadow-sm'
                  >
                    <div className='flex flex-wrap items-center justify-between gap-2 border-b border-yellow-800/10 bg-orange-50/40 px-4 py-2'>
                      <span className='font-mono text-xs font-semibold'>{o.orderId}</span>
                      <span className='text-sm font-semibold'>{formatVnd(o.totalAmountVnd)}</span>
                    </div>
                    <div className='p-4'>
                      <ShipmentSellerPanel
                        shopId={shopId}
                        order={o}
                        shipment={null}
                        onToast={(ok, msg) => setBanner({ ok, msg })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className='mb-3 text-sm font-bold uppercase tracking-wide text-stone-500'>
              2. Vận đơn — chờ lấy / đã lấy ({pickupPipeline.length})
            </h2>
            {pickupPipeline.length === 0 ? (
              <p className='rounded-xl border border-dashed border-yellow-800/25 bg-white px-4 py-8 text-center text-sm text-stone-600'>
                Chưa có vận đơn ở trạng thái nháp / chờ lấy / đã lấy.
              </p>
            ) : (
              <ul className='space-y-4'>
                {pickupPipeline.map((s) => (
                  <HandoverShipmentRow
                    key={s.shipmentId}
                    shopId={shopId}
                    shipment={s}
                    orders={orders}
                    onToast={(ok, msg) => setBanner({ ok, msg })}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function HandoverShipmentRow({
  shopId,
  shipment,
  orders,
  onToast,
}: {
  shopId: string
  shipment: ShipmentDto
  orders: SellerOrder[]
  onToast: (ok: boolean, msg: string) => void
}) {
  const order = orders.find((o) => o.orderId === shipment.orderId)
  if (!order) {
    return (
      <li className='rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-900'>
        Vận đơn <span className='font-mono'>{shipment.shipmentId}</span> — không tìm thấy đơn {shipment.orderId}{' '}
        trong danh sách shop (đồng bộ sau vài giây).
      </li>
    )
  }

  return (
    <li className='overflow-hidden rounded-xl border border-yellow-800/20 bg-white shadow-sm'>
      <div className='flex flex-wrap items-center gap-2 border-b border-yellow-800/10 bg-orange-50/40 px-4 py-2'>
        <span className='font-mono text-xs font-semibold'>{order.orderId}</span>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${shipmentStatusBadgeClass(shipment.status)}`}
        >
          {shipmentStatusLabel(shipment.status)}
        </span>
        {shipment.trackingNumber && (
          <span className='font-mono text-[10px] text-stone-600'>#{shipment.trackingNumber}</span>
        )}
      </div>
      <div className='p-4'>
        <ShipmentSellerPanel shopId={shopId} order={order} shipment={shipment} onToast={onToast} />
      </div>
    </li>
  )
}
