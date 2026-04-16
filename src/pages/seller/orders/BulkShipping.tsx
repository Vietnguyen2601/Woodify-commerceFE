import React from 'react'
import { useSellerOrdersAndShipments } from './hooks/useSellerOrdersAndShipments'
import ShipmentSellerPanel from './components/ShipmentSellerPanel'
import { shipmentStatusBadgeClass, shipmentStatusLabel } from './shipmentSellerUi'
import type { ShipmentDto } from '@/types'

type PipelineTab = 'ALL' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY'

const TAB_LABELS: Record<PipelineTab, string> = {
  ALL: 'Tất cả đang chạy',
  PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  OUT_FOR_DELIVERY: 'Đang giao đến',
}

function matchesTab(s: ShipmentDto, tab: PipelineTab): boolean {
  const st = (s.status || '').toUpperCase()
  if (tab === 'ALL') return ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(st)
  return st === tab
}

export default function BulkShipping() {
  const { shopId, orders, shipments, shipmentByOrderId, isLoading, isError, error, refetch } =
    useSellerOrdersAndShipments()
  const [tab, setTab] = React.useState<PipelineTab>('ALL')
  const [banner, setBanner] = React.useState<{ ok: boolean; msg: string } | null>(null)

  React.useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => setBanner(null), 4000)
    return () => window.clearTimeout(t)
  }, [banner])

  const orderMap = React.useMemo(() => new Map(orders.map((o) => [o.orderId, o])), [orders])

  const pipeline = React.useMemo(() => {
    return shipments.filter((s) => matchesTab(s, tab)).sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
    )
  }, [shipments, tab])

  if (!shopId) return null

  return (
    <div className='min-h-[60vh] font-["Arimo"] text-stone-900'>
      <header className='mb-6'>
        <h1 className='text-xl font-bold text-stone-900'>Giao hàng loạt</h1>
        <p className='mt-1 max-w-2xl text-sm text-stone-600'>
          Theo dõi vận đơn sau khi đã lấy hàng: chuyển trạng thái đến khi giao xong. Tạo vận đơn và thao tác lấy
          hàng nằm ở <span className='font-semibold text-yellow-900'>Bàn giao</span> hoặc{' '}
          <span className='font-semibold text-yellow-900'>Tất cả đơn</span>.
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

      <section className='mb-4 rounded-xl border border-yellow-800/20 bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap gap-2'>
          {(Object.keys(TAB_LABELS) as PipelineTab[]).map((k) => {
            const active = tab === k
            return (
              <button
                key={k}
                type='button'
                onClick={() => setTab(k)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-yellow-800 bg-yellow-800 text-white shadow'
                    : 'border-yellow-800/25 bg-stone-50 text-stone-800 hover:border-yellow-800/50'
                }`}
              >
                {TAB_LABELS[k]}
              </button>
            )
          })}
        </div>
        <button
          type='button'
          onClick={() => void refetch()}
          className='mt-3 rounded-lg border border-yellow-800/30 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50'
        >
          Làm mới
        </button>
      </section>

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

      {!isLoading && !isError && pipeline.length === 0 && (
        <div className='rounded-xl border border-dashed border-yellow-800/30 bg-white px-6 py-16 text-center text-sm text-stone-600'>
          Không có vận đơn nào khớp bộ lọc. Kiểm tra tab khác hoặc xử lý tại Bàn giao nếu đơn mới tạo vận đơn.
        </div>
      )}

      {!isLoading && !isError && pipeline.length > 0 && (
        <div className='space-y-4'>
          {pipeline.map((s) => {
            const order = orderMap.get(s.orderId)
            return (
              <article
                key={s.shipmentId}
                className='overflow-hidden rounded-xl border border-yellow-800/20 bg-white shadow-sm'
              >
                <div className='flex flex-wrap items-center justify-between gap-2 border-b border-yellow-800/10 px-4 py-2'>
                  <div className='flex flex-wrap items-center gap-2 text-xs'>
                    <span className='font-mono font-semibold text-stone-900'>{s.shipmentId}</span>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${shipmentStatusBadgeClass(s.status)}`}
                    >
                      {shipmentStatusLabel(s.status)}
                    </span>
                    <span className='text-stone-500'>Đơn: {s.orderId}</span>
                  </div>
                  {s.trackingNumber && (
                    <span className='font-mono text-xs text-stone-700'>Tracking: {s.trackingNumber}</span>
                  )}
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
                    <p className='text-sm text-amber-800'>Chưa tải được thông tin đơn — thử làm mới.</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
