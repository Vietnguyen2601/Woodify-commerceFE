import type { ShipmentDto } from '@/types'

/** React Query key prefix for `GET .../shipments/by-shop/{shopId}` */
export const SHIP_QUERY_KEY = 'seller-shop-shipments'

/** Order statuses where creating a shipment is typically allowed (seller flow). */
export const ORDER_STATUSES_ALLOW_CREATE_SHIPMENT = new Set([
  'CONFIRMED',
  'PROCESSING',
  'READY_TO_SHIP',
])

const SHIPMENT_STRICT_TERMINAL = new Set(['DELIVERED', 'RETURNED', 'CANCELLED'])

export function hasNonTerminalShipment(s: ShipmentDto | null | undefined): boolean {
  if (!s) return false
  return !SHIPMENT_STRICT_TERMINAL.has((s.status || '').toUpperCase())
}

export function pickPrimaryShipmentForOrder(rows: ShipmentDto[]): ShipmentDto | null {
  if (!rows.length) return null
  const nonTerminal = rows.filter((s) => !SHIPMENT_STRICT_TERMINAL.has((s.status || '').toUpperCase()))
  const pool = nonTerminal.length ? nonTerminal : rows
  return pool.sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
  )[0]
}

export function buildShipmentByOrderIdMap(shipments: ShipmentDto[]): Map<string, ShipmentDto | null> {
  const groups = new Map<string, ShipmentDto[]>()
  for (const s of shipments) {
    const list = groups.get(s.orderId) ?? []
    list.push(s)
    groups.set(s.orderId, list)
  }
  const out = new Map<string, ShipmentDto | null>()
  for (const [orderId, list] of groups) {
    out.set(orderId, pickPrimaryShipmentForOrder(list))
  }
  return out
}

export const SHIPMENT_STATUS_LABEL_VI: Record<string, string> = {
  DRAFT: 'Nháp',
  PENDING: 'Chờ lấy hàng',
  PICKUP_SCHEDULED: 'Đã hẹn lấy',
  PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  OUT_FOR_DELIVERY: 'Đang giao đến khách',
  DELIVERED: 'Đã giao',
  DELIVERY_FAILED: 'Giao thất bại',
  RETURNING: 'Đang hoàn hàng',
  RETURNED: 'Đã hoàn kho',
  CANCELLED: 'Đã hủy vận đơn',
}

export function shipmentStatusLabel(status: string): string {
  const k = (status || '').toUpperCase()
  return SHIPMENT_STATUS_LABEL_VI[k] ?? status
}

export function shipmentStatusBadgeClass(status: string): string {
  const s = (status || '').toUpperCase()
  if (s === 'PENDING' || s === 'PICKUP_SCHEDULED' || s === 'DRAFT')
    return 'border-amber-300 bg-amber-50 text-amber-900'
  if (s === 'PICKED_UP' || s === 'IN_TRANSIT') return 'border-sky-300 bg-sky-50 text-sky-900'
  if (s === 'OUT_FOR_DELIVERY') return 'border-violet-300 bg-violet-50 text-violet-900'
  if (s === 'DELIVERED') return 'border-emerald-300 bg-emerald-50 text-emerald-900'
  if (s === 'DELIVERY_FAILED' || s === 'RETURNING') return 'border-orange-300 bg-orange-50 text-orange-900'
  if (s === 'RETURNED' || s === 'CANCELLED') return 'border-stone-300 bg-stone-100 text-stone-700'
  return 'border-yellow-800/30 bg-white text-stone-800'
}

/** Suggested next statuses for PATCH /status — backend still validates transitions. */
export function suggestedNextShipmentStatuses(current: string): string[] {
  const s = (current || '').toUpperCase()
  switch (s) {
    case 'DRAFT':
      return ['PENDING', 'PICKUP_SCHEDULED', 'CANCELLED']
    case 'PENDING':
    case 'PICKUP_SCHEDULED':
      return ['CANCELLED']
    case 'PICKED_UP':
      return ['IN_TRANSIT']
    case 'IN_TRANSIT':
      return ['OUT_FOR_DELIVERY', 'DELIVERY_FAILED', 'RETURNING']
    case 'OUT_FOR_DELIVERY':
      return ['DELIVERED', 'DELIVERY_FAILED', 'RETURNING']
    case 'DELIVERY_FAILED':
      return ['RETURNING', 'CANCELLED']
    case 'RETURNING':
      return ['RETURNED']
    default:
      return []
  }
}

export function canMarkPickup(status: string): boolean {
  const s = (status || '').toUpperCase()
  return s === 'DRAFT' || s === 'PENDING' || s === 'PICKUP_SCHEDULED'
}
