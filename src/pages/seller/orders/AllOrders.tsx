import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/services'
import { useShopStore } from '@/store/shopStore'
import type { SellerOrder, SellerOrderStatus } from '@/types'

function providerServiceCodeLabel(code: string | null | undefined): string {
  const u = (code ?? '').trim().toUpperCase()
  if (u === 'ECO') return 'Ti\u1ebft ki\u1ec7m (ECO)'
  if (u === 'STF') return 'Ti\u00eau chu\u1ea9n (STF)'
  if (u === 'EXP') return 'Nhanh (EXP)'
  return u || '\u2014'
}

const STATUS_LABEL_VI: Record<string, string> = {
  PENDING: 'Ch\u1edd x\u00e1c nh\u1eadn',
  CONFIRMED: '\u0110\u00e3 x\u00e1c nh\u1eadn',
  PROCESSING: '\u0110ang x\u1eed l\u00fd',
  READY_TO_SHIP: 'S\u1eb5n s\u00e0ng giao',
  SHIPPED: '\u0110ang giao',
  DELIVERED: '\u0110\u00e3 giao',
  COMPLETED: 'Ho\u00e0n th\u00e0nh',
  CANCELLED: '\u0110\u00e3 h\u1ee7y',
  REFUNDING: 'Ho\u00e0n ti\u1ec1n (\u0111ang x\u1eed l\u00fd)',
  REFUNDED: '\u0110\u00e3 ho\u00e0n ti\u1ec1n',
}

const FILTER_TABS: Array<{ value: 'ALL' | SellerOrderStatus; label: string }> = [
  { value: 'ALL', label: 'T\u1ea5t c\u1ea3' },
  { value: 'PENDING', label: 'Ch\u1edd x\u00e1c nh\u1eadn' },
  { value: 'CONFIRMED', label: '\u0110\u00e3 x\u00e1c nh\u1eadn' },
  { value: 'PROCESSING', label: '\u0110ang x\u1eed l\u00fd' },
  { value: 'READY_TO_SHIP', label: 'S\u1eb5n s\u00e0ng giao' },
  { value: 'SHIPPED', label: '\u0110ang giao' },
  { value: 'DELIVERED', label: '\u0110\u00e3 giao' },
  { value: 'COMPLETED', label: 'Ho\u00e0n th\u00e0nh' },
  { value: 'CANCELLED', label: '\u0110\u00e3 h\u1ee7y' },
  { value: 'REFUNDING', label: 'Ho\u00e0n ti\u1ec1n' },
  { value: 'REFUNDED', label: '\u0110\u00e3 ho\u00e0n ti\u1ec1n' },
]

const TERMINAL = new Set(['COMPLETED', 'CANCELLED', 'REFUNDED'])

function formatVnd(amount: number): string {
  return `${Number(amount || 0).toLocaleString('vi-VN')}\u00a0\u20ab`
}

function formatDateTime(iso: string): string {
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

function shortAccount(id: string): string {
  if (!id || id.length < 10) return id || '—'
  return `${id.slice(0, 6)}…${id.slice(-4)}`
}

function statusLabel(status: string): string {
  return STATUS_LABEL_VI[status.toUpperCase()] ?? status
}

function statusBadgeClass(status: string): string {
  const s = status.toUpperCase()
  if (s === 'PENDING') return 'border-amber-300 bg-amber-50 text-amber-900'
  if (s === 'CONFIRMED' || s === 'PROCESSING' || s === 'READY_TO_SHIP')
    return 'border-sky-300 bg-sky-50 text-sky-900'
  if (s === 'SHIPPED') return 'border-violet-300 bg-violet-50 text-violet-900'
  if (s === 'DELIVERED' || s === 'COMPLETED') return 'border-emerald-300 bg-emerald-50 text-emerald-900'
  if (s === 'CANCELLED') return 'border-stone-300 bg-stone-100 text-stone-700'
  if (s === 'REFUNDING' || s === 'REFUNDED') return 'border-orange-300 bg-orange-50 text-orange-900'
  return 'border-yellow-800/30 bg-white text-stone-800'
}

function getForwardActions(status: string): { label: string; next: SellerOrderStatus }[] {
  const s = status.toUpperCase()
  switch (s) {
    case 'PENDING':
      return [{ label: 'X\u00e1c nh\u1eadn \u0111\u01a1n', next: 'CONFIRMED' }]
    case 'CONFIRMED':
      return [{ label: 'B\u1eaft \u0111\u1ea7u x\u1eed l\u00fd', next: 'PROCESSING' }]
    case 'PROCESSING':
      return [{ label: 'S\u1eb5n s\u00e0ng giao h\u00e0ng', next: 'READY_TO_SHIP' }]
    case 'READY_TO_SHIP':
      return [{ label: '\u0110\u00e3 giao cho \u0110VVC', next: 'SHIPPED' }]
    case 'SHIPPED':
      return [{ label: '\u0110\u00e3 giao \u0111\u1ebfn kh\u00e1ch', next: 'DELIVERED' }]
    case 'DELIVERED':
      return [{ label: 'Ho\u00e0n t\u1ea5t \u0111\u01a1n', next: 'COMPLETED' }]
    default:
      return []
  }
}

function getCancelAction(status: string): { label: string; next: SellerOrderStatus } | null {
  const s = status.toUpperCase()
  if (s === 'PENDING' || s === 'CONFIRMED') {
    return { label: 'H\u1ee7y \u0111\u01a1n', next: 'CANCELLED' }
  }
  return null
}

export default function AllOrders() {
  const shop = useShopStore((s) => s.shop)
  const queryClient = useQueryClient()
  const [filter, setFilter] = React.useState<'ALL' | SellerOrderStatus>('ALL')
  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<SellerOrder | null>(null)
  const [banner, setBanner] = React.useState<{ ok: boolean; msg: string } | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['seller-shop-orders', shop?.shopId],
    queryFn: () => orderService.getShopOrders(shop!.shopId),
    enabled: !!shop?.shopId,
  })

  React.useEffect(() => {
    if (!selected || !orders.length) return
    const next = orders.find((o) => o.orderId === selected.orderId)
    if (next) setSelected(next)
  }, [orders, selected?.orderId])

  const mutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: SellerOrderStatus }) =>
      orderService.updateShopOrderStatus(orderId, status),
    onMutate: ({ orderId }) => setUpdatingId(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller-shop-orders', shop?.shopId] })
      setBanner({ ok: true, msg: '\u0110\u00e3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i \u0111\u01a1n h\u00e0ng.' })
    },
    onError: (e: unknown) => {
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message: string }).message)
          : 'Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt. Vui l\u00f2ng th\u1eed l\u1ea1i.'
      setBanner({ ok: false, msg })
    },
    onSettled: () => setUpdatingId(null),
  })

  React.useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => setBanner(null), 4000)
    return () => window.clearTimeout(t)
  }, [banner])

  const statusCounts = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const o of orders) {
      const k = (o.status || '').toUpperCase()
      m.set(k, (m.get(k) ?? 0) + 1)
    }
    return m
  }, [orders])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (filter !== 'ALL' && (o.status || '').toUpperCase() !== filter) return false
      if (!q) return true
      if (o.orderId.toLowerCase().includes(q)) return true
      if (o.accountId.toLowerCase().includes(q)) return true
      return (o.orderItems || []).some(
        (it) =>
          (it.productName || '').toLowerCase().includes(q) ||
          (it.sellerSku || '').toLowerCase().includes(q),
      )
    })
  }, [orders, filter, search])

  const runStatusUpdate = (orderId: string, status: SellerOrderStatus) => {
    setBanner(null)
    if (status === 'CANCELLED') {
      const ok = window.confirm(
        'H\u1ee7y \u0111\u01a1n n\u00e0y? \u1ea2nh h\u01b0\u1edfng t\u1edbi kh\u00e1ch \u2014 ch\u1ec9 h\u1ee7y khi \u0111\u00e3 th\u1ed1ng nh\u1ea5t v\u1edbi kh\u00e1ch.',
      )
      if (!ok) return
    }
    mutation.mutate({ orderId, status })
  }

  if (!shop?.shopId) return null

  return (
    <div className='min-h-[60vh] font-["Arimo"] text-stone-900'>
      <header className='mb-6'>
        <h1 className='text-xl font-bold text-stone-900'>{'Qu\u1ea3n l\u00fd \u0111\u01a1n h\u00e0ng'}</h1>
        <p className='mt-1 text-sm text-stone-600'>
          {'Xem \u0111\u01a1n theo shop, chi ti\u1ebft t\u1eebng \u0111\u01a1n v\u00e0 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i theo quy tr\u00ecnh giao h\u00e0ng.'}
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
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === 'ALL' ? orders.length : (statusCounts.get(tab.value) ?? 0)
            const active = filter === tab.value
            return (
              <button
                key={tab.value}
                type='button'
                onClick={() => setFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-yellow-800 bg-yellow-800 text-white shadow'
                    : 'border-yellow-800/25 bg-stone-50 text-stone-800 hover:border-yellow-800/50'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0 text-[10px] ${
                    active ? 'bg-white/20 text-white' : 'bg-white text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative flex-1'>
            <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400'>
              &#8981;
            </span>
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='M\u00e3 \u0111\u01a1n, m\u00e3 kh\u00e1ch, t\u00ean SP, SKU...'
              className='w-full rounded-lg border border-yellow-800/20 bg-stone-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-yellow-800/50'
            />
          </div>
          <button
            type='button'
            onClick={() => void refetch()}
            className='rounded-lg border border-yellow-800/30 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50'
          >
            {'L\u00e0m m\u1edbi'}
          </button>
        </div>
      </section>

      {isLoading && (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-yellow-800/20 bg-white py-20'>
          <div className='h-9 w-9 animate-spin rounded-full border-4 border-yellow-800 border-t-transparent' />
          <p className='text-sm text-stone-600'>{'\u0110ang t\u1ea3i \u0111\u01a1n h\u00e0ng\u2026'}</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className='rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800'>
          <p className='font-medium'>{'Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c danh s\u00e1ch \u0111\u01a1n.'}</p>
          <p className='mt-1 opacity-90'>
            {(error as { message?: string })?.message ||
              'Ki\u1ec3m tra k\u1ebft n\u1ed1i ho\u1eb7c \u0111\u0103ng nh\u1eadp seller.'}
          </p>
          <button
            type='button'
            onClick={() => void refetch()}
            className='mt-4 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white'
          >
            {'Th\u1eed l\u1ea1i'}
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className='rounded-xl border border-dashed border-yellow-800/30 bg-white px-6 py-16 text-center text-sm text-stone-600'>
          {orders.length === 0
            ? 'Ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o cho shop.'
            : 'Kh\u00f4ng c\u00f3 \u0111\u01a1n n\u00e0o kh\u1edbp b\u1ed9 l\u1ecdc / t\u00ecm ki\u1ebfm.'}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className='space-y-4'>
          {filtered.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              busy={updatingId === order.orderId}
              onOpenDetail={() => setSelected(order)}
              onStatusChange={runStatusUpdate}
            />
          ))}
        </div>
      )}

      {selected && (
        <OrderDetailDrawer
          order={selected}
          onClose={() => setSelected(null)}
          busy={updatingId === selected.orderId}
          onStatusChange={runStatusUpdate}
        />
      )}
    </div>
  )
}

function OrderCard({
  order,
  busy,
  onOpenDetail,
  onStatusChange,
}: {
  order: SellerOrder
  busy: boolean
  onOpenDetail: () => void
  onStatusChange: (orderId: string, s: SellerOrderStatus) => void
}) {
  const st = (order.status || '').toUpperCase()
  const forward = getForwardActions(st)
  const cancel = getCancelAction(st)
  const locked = TERMINAL.has(st) || st === 'REFUNDING'

  const first = order.orderItems?.[0]
  const more = (order.orderItems?.length ?? 0) - 1

  return (
    <article className='overflow-hidden rounded-xl border border-yellow-800/20 bg-white shadow-sm'>
      <div className='flex flex-col gap-3 border-b border-yellow-800/10 bg-orange-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <span className='font-mono font-semibold text-stone-900'>{order.orderId}</span>
          <span className='text-stone-500'>{formatDateTime(order.createdAt)}</span>
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusBadgeClass(st)}`}
          >
            {statusLabel(st)}
          </span>
        </div>
        <div className='text-sm font-semibold text-stone-900'>
          {formatVnd(order.totalAmountCents)}
        </div>
      </div>

      <div className='px-4 py-3'>
        <div className='flex gap-3'>
          <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-yellow-800/15 bg-stone-100 text-[10px] text-stone-500'>
            {(order.orderItems?.length ?? 0)} SP
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-stone-900'>
              {first?.productName ?? '—'}
              {more > 0 ? (
                <span className='font-normal text-stone-500'>{` · +${more} m\u1eb7t h\u00e0ng`}</span>
              ) : null}
            </p>
            <p className='mt-0.5 text-xs text-stone-600'>
              {'Kh\u00e1ch: '}
              <span className='font-mono'>{shortAccount(order.accountId)}</span>
            </p>
            <p className='mt-1 line-clamp-2 text-xs text-stone-500' title={order.deliveryAddress}>
              {order.deliveryAddress}
            </p>
            {order.providerServiceCode != null && order.providerServiceCode !== '' && (
              <p className='mt-1 text-[10px] text-stone-600'>
                VC:{' '}
                <span className='font-mono font-semibold'>{order.providerServiceCode}</span>
              </p>
            )}
          </div>
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={onOpenDetail}
            className='rounded-lg border border-yellow-800/25 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100'
          >
            {'Chi ti\u1ebft & thao t\u00e1c'}
          </button>
          {!locked &&
            forward.map((a) => (
              <button
                key={a.next}
                type='button'
                disabled={busy}
                onClick={() => onStatusChange(order.orderId, a.next)}
                className='rounded-lg bg-yellow-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-yellow-900 disabled:opacity-50'
              >
                {a.label}
              </button>
            ))}
          {!locked && cancel && (
            <button
              type='button'
              disabled={busy}
              onClick={() => onStatusChange(order.orderId, cancel.next)}
              className='rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50'
            >
              {cancel.label}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function OrderDetailDrawer({
  order,
  onClose,
  busy,
  onStatusChange,
}: {
  order: SellerOrder
  onClose: () => void
  busy: boolean
  onStatusChange: (orderId: string, s: SellerOrderStatus) => void
}) {
  const st = (order.status || '').toUpperCase()
  const forward = getForwardActions(st)
  const cancel = getCancelAction(st)
  const locked = TERMINAL.has(st) || st === 'REFUNDING'

  return (
    <div className='fixed inset-0 z-[200] flex justify-end' role='dialog' aria-modal='true'>
      <button
        type='button'
        className='absolute inset-0 bg-black/40'
        aria-label='\u0110\u00f3ng'
        onClick={onClose}
      />
      <div className='relative flex h-full w-full max-w-lg flex-col border-l border-yellow-800/20 bg-white shadow-2xl'>
        <div className='flex items-start justify-between border-b border-yellow-800/15 px-5 py-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-stone-500'>Chi tiết sản phẩm</p>
            <p className='mt-1 text-xs text-stone-500'>{formatDateTime(order.createdAt)}</p>
            <span
              className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusBadgeClass(st)}`}
            >
              {statusLabel(st)}
            </span>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-stone-200 px-2 py-1 text-sm text-stone-600 hover:bg-stone-50'
          >
            x
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-5 py-4'>
          <section className='mb-5'>
            <h3 className='text-xs font-bold uppercase text-stone-500'>{'Khách hàng & giao hààng'}</h3>
            <p className='mt-2 text-sm text-stone-800'>
              {'Mã tài khoản: '}
              <span className='font-mono'>{order.accountId}</span>
            </p>
            <p className='mt-2 text-sm leading-relaxed text-stone-700'>{order.deliveryAddress}</p>
            {order.providerServiceCode != null && order.providerServiceCode !== '' && (
              <p className='mt-2 text-xs text-stone-600'>
                {'D\u1ecbch v\u1ee5 VC: '}
                <span className='font-mono font-semibold text-stone-800'>
                  {providerServiceCodeLabel(order.providerServiceCode)}
                </span>
              </p>
            )}
          </section>

          <section className='mb-5'>
            <h3 className='text-xs font-bold uppercase text-stone-500'>{'S\u1ea3n ph\u1ea9m'}</h3>
            <ul className='mt-2 divide-y divide-yellow-800/10 rounded-lg border border-yellow-800/15'>
              {(order.orderItems || []).map((it) => (
                <li key={it.orderItemId} className='px-3 py-3 text-sm'>
                  <p className='font-medium text-stone-900'>{it.productName}</p>
                  <p className='text-xs text-stone-600'>{it.versionName}</p>
                  <p className='mt-1 text-xs text-stone-500'>SKU: {it.sellerSku}</p>
                  <div className='mt-2 flex flex-wrap justify-between gap-2 text-xs'>
                    <span className='text-stone-600'>
                      SL: <strong>{it.quantity}</strong> x {formatVnd(it.unitPriceCents)}
                    </span>
                    <span className='font-semibold text-stone-900'>{formatVnd(it.lineTotalCents)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className='rounded-lg border border-yellow-800/15 bg-orange-50/40 px-3 py-3 text-sm'>
            <div className='flex justify-between py-1'>
              <span className='text-stone-600'>{'T\u1ea1m t\u00ednh'}</span>
              <span className='font-medium'>{formatVnd(order.subtotalCents)}</span>
            </div>
            <div className='flex justify-between border-t border-yellow-800/10 py-2 font-semibold'>
              <span>{'T\u1ed5ng thanh to\u00e1n'}</span>
              <span>{formatVnd(order.totalAmountCents)}</span>
            </div>
          </section>
        </div>

        <div className='border-t border-yellow-800/15 bg-stone-50 px-5 py-4'>
          <p className='mb-2 text-[11px] font-semibold uppercase text-stone-500'>{'C\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i'}</p>
          <div className='flex flex-wrap gap-2'>
            {!locked &&
              forward.map((a) => (
                <button
                  key={a.next}
                  type='button'
                  disabled={busy}
                  onClick={() => onStatusChange(order.orderId, a.next)}
                  className='flex-1 min-w-[140px] rounded-lg bg-yellow-800 py-2.5 text-center text-xs font-semibold text-white hover:bg-yellow-900 disabled:opacity-50'
                >
                  {a.label}
                </button>
              ))}
            {!locked && cancel && (
              <button
                type='button'
                disabled={busy}
                onClick={() => onStatusChange(order.orderId, cancel.next)}
                className='rounded-lg border border-red-300 bg-white px-4 py-2.5 text-xs font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50'
              >
                {cancel.label}
              </button>
            )}
            {locked && (
              <p className='text-xs text-stone-500'>
                {'\u0110\u01a1n \u1edf tr\u1ea1ng th\u00e1i k\u1ebft th\u00fac \u2014 kh\u00f4ng th\u1ec3 \u0111\u1ed5i th\u00eam.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
