/**
 * Seller UI: collapse order + shipment into 5 display stages (view model).
 * API/DB enums unchanged — không phải một chuỗi BE duy nhất: COMPLETED trên đơn
 * và trạng thái vận đơn là hai trục (xem sellerOrderAxes.ts).
 *
 * @see docs/SELLER_ORDER_STAGE_UI.md
 */

import type { ShipmentDto } from '@/types'

export type SellerOrderStage = 'prepare' | 'handover' | 'in_delivery' | 'done' | 'exception'

export const SELLER_STAGE_SEQUENCE: SellerOrderStage[] = [
  'prepare',
  'handover',
  'in_delivery',
  'done',
  'exception',
]

export const SELLER_STAGE_LABEL_VI: Record<SellerOrderStage, string> = {
  prepare: 'Ch\u1ea9n b\u1ecb \u0111\u01a1n',
  handover: 'B\u00e0n giao v\u1eadn chuy\u1ec3n',
  in_delivery: '\u0110ang giao h\u00e0ng',
  done: '\u0110\u00e3 giao / k\u1ebft th\u00fac (g\u1ee3i \u00fd hi\u1ec3n th\u1ecb)',
  exception: 'X\u1eed l\u00fd ngo\u1ea1i l\u1ec7',
}

/** Short labels for 4-step progress strip (exception shown separately). */
export const SELLER_STAGE_STRIP_LABEL_VI: Record<'prepare' | 'handover' | 'in_delivery' | 'done', string> =
  {
    prepare: 'Ch\u1ea9n b\u1ecb',
    handover: 'B\u00e0n giao',
    in_delivery: '\u0110ang giao',
    done: 'Ho\u00e0n t\u1ea5t',
  }

export type SellerMainStage = 'prepare' | 'handover' | 'in_delivery' | 'done'

export const SELLER_MAIN_STAGE_SEQUENCE: SellerMainStage[] = ['prepare', 'handover', 'in_delivery', 'done']

const ORDER_EXCEPTION = new Set(['CANCELLED', 'REFUNDING', 'REFUNDED'])
const SHIPMENT_EXCEPTION = new Set(['DELIVERY_FAILED', 'RETURNING', 'RETURNED', 'CANCELLED'])

const HANDOVER_SHIPMENT = new Set(['PENDING', 'PICKUP_SCHEDULED', 'PICKED_UP'])

function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toUpperCase()
}

/** Resolve stage; rules evaluated top-to-bottom. */
export function resolveSellerOrderStage(
  orderStatus: string | null | undefined,
  primaryShipment: ShipmentDto | null | undefined,
): SellerOrderStage {
  const os = norm(orderStatus)
  const ss = norm(primaryShipment?.status)

  if (ORDER_EXCEPTION.has(os)) return 'exception'
  if (ss && SHIPMENT_EXCEPTION.has(ss)) return 'exception'

  const orderDone = os === 'DELIVERED' || os === 'COMPLETED'
  const shipDelivered = ss === 'DELIVERED'
  if (orderDone || shipDelivered) return 'done'

  if (os === 'SHIPPED') return 'in_delivery'

  if (os === 'READY_TO_SHIP' && ss && HANDOVER_SHIPMENT.has(ss)) return 'handover'

  return 'prepare'
}

export function sellerStageIndex(stage: SellerOrderStage): number {
  if (stage === 'exception') return 4
  return SELLER_STAGE_SEQUENCE.indexOf(stage)
}

export function sellerStageBadgeClass(stage: SellerOrderStage): string {
  switch (stage) {
    case 'prepare':
      return 'border-sky-300 bg-sky-50 text-sky-950'
    case 'handover':
      return 'border-amber-300 bg-amber-50 text-amber-950'
    case 'in_delivery':
      return 'border-violet-300 bg-violet-50 text-violet-950'
    case 'done':
      return 'border-emerald-300 bg-emerald-50 text-emerald-950'
    case 'exception':
      return 'border-orange-400 bg-orange-50 text-orange-950'
    default:
      return 'border-stone-300 bg-stone-100 text-stone-800'
  }
}
