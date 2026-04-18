/**
 * Lồng vận đơn vào thao tác đổi trạng thái đơn:
 * — READY_TO_SHIP → SHIPPED: tạo vận đơn trước (nếu chưa có), rồi UpdateStatus.
 * — Đơn → COMPLETED (Đã giao đến khách): UpdateStatus rồi PATCH vận đơn → DELIVERED.
 * — Catch-up: chỉ POST tạo vận đơn khi chưa có bản ghi nào.
 */

import { orderService, shipmentService } from '@/services'
import type { SellerOrder, SellerOrderStatus } from '@/types'
import { hasNonTerminalShipment, pickPrimaryShipmentForOrder } from './shipmentSellerUi'

/** Chỉ dùng sau UpdateStatus chung (catch-up), không tạo ở CONFIRMED/PROCESSING/READY_TO_SHIP. */
const CATCHUP_ORDER_STATUSES = new Set(['SHIPPED', 'DELIVERED', 'COMPLETED'])

function getErrStatus(e: unknown): number | undefined {
  if (typeof e === 'object' && e !== null && 'status' in e) {
    const s = (e as { status: unknown }).status
    return typeof s === 'number' ? s : undefined
  }
  return undefined
}

function errMsg(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e) return String((e as { message: string }).message)
  return 'Không thực hiện được thao tác vận đơn.'
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

async function createShipmentWithRetry(params: { shopId: string; order: SellerOrder }): Promise<void> {
  const body = {
    shopId: params.shopId,
    orderId: params.order.orderId,
    providerServiceCode: params.order.providerServiceCode ?? undefined,
  }
  const maxAttempts = 1 + CREATE_RETRY_DELAYS_MS.length
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await shipmentService.createShipment(body)
      return
    } catch (e) {
      const st = getErrStatus(e)
      if (st === 409) return
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
}

export type SellerOrderShipmentMutationResult = {
  /** Đã chạy luồng gộp: Sẵn sàng giao → Đang giao + tạo vận đơn */
  handover?: boolean
  /** Đã PATCH vận đơn sang DELIVERED cùng lúc với đơn */
  deliveredSync?: boolean
  shipmentWarning?: string
}

function mergeShipmentWarnings(a?: string, b?: string): string | undefined {
  if (a && b) return `${a} | ${b}`
  return a ?? b
}

const SHIP_TERMINAL_NO_DELIVER_PATCH = new Set(['RETURNED', 'CANCELLED', 'DELIVERY_FAILED', 'RETURNING'])

/**
 * Bước hợp lệ tiếp theo hướng về DELIVERED (theo graph Shipment — khớp suggestedNextShipmentStatuses).
 * Trạng thái khác → thử nhảy thẳng DELIVERED (một lần trong vòng lặp).
 */
function nextStatusTowardDelivered(current: string): string | null {
  const c = (current || '').toUpperCase()
  const map: Record<string, string> = {
    PICKED_UP: 'IN_TRANSIT',
    IN_TRANSIT: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED',
  }
  return map[c] ?? null
}

/**
 * Khi đơn sang COMPLETED (hoặc DELIVERED): đưa vận đơn chính sang DELIVERED —
 * chuỗi PATCH nếu cần (IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED), hoặc DELIVERED trực tiếp.
 */
async function markShipmentDeliveredIfNeeded(orderId: string): Promise<{
  synced?: boolean
  shipmentWarning?: string
}> {
  const list = await shipmentService.getShipmentsByOrder(orderId)
  const primary = pickPrimaryShipmentForOrder(Array.isArray(list) ? list : [])
  if (!primary) return {}

  let st = (primary.status || '').toUpperCase()
  if (st === 'DELIVERED') return { synced: true }
  if (SHIP_TERMINAL_NO_DELIVER_PATCH.has(st)) return {}

  const id = primary.shipmentId

  for (let i = 0; i < 10; i++) {
    if (st === 'DELIVERED') return { synced: true }
    const next = nextStatusTowardDelivered(st)
    const target = next ?? 'DELIVERED'
    try {
      await shipmentService.updateShipmentStatus(id, { status: target })
      st = target
    } catch (e) {
      if (next != null && next !== 'DELIVERED') {
        try {
          await shipmentService.updateShipmentStatus(id, { status: 'DELIVERED' })
          return { synced: true }
        } catch (e2) {
          return { shipmentWarning: errMsg(e2) }
        }
      }
      return { shipmentWarning: errMsg(e) }
    }
  }

  return st === 'DELIVERED'
    ? { synced: true }
    : { shipmentWarning: 'Không thể chuyển vận đơn sang DELIVERED.' }
}

/**
 * Một lần bấm đổi trạng thái đơn (seller): xử lý READY_TO_SHIP→SHIPPED trước (tạo ship rồi mới PUT đơn).
 */
export async function runSellerOrderStatusUpdateWithShipment(params: {
  shopId: string
  order: SellerOrder
  nextStatus: SellerOrderStatus
}): Promise<SellerOrderShipmentMutationResult> {
  const { shopId, order, nextStatus } = params
  const cur = (order.status || '').toUpperCase()
  const next = (nextStatus || '').toUpperCase()

  if (cur === 'READY_TO_SHIP' && next === 'SHIPPED') {
    const list = await shipmentService.getShipmentsByOrder(order.orderId)
    const primary = pickPrimaryShipmentForOrder(Array.isArray(list) ? list : [])
    if (!hasNonTerminalShipment(primary)) {
      await createShipmentWithRetry({ shopId, order })
    }
    await orderService.updateShopOrderStatus(order.orderId, nextStatus)
    return { handover: true }
  }

  await orderService.updateShopOrderStatus(order.orderId, nextStatus)
  const merged: SellerOrder = { ...order, status: nextStatus }

  if (next === 'DELIVERED' || next === 'COMPLETED') {
    const d = await markShipmentDeliveredIfNeeded(order.orderId)
    const catchup = await orchestrateShipmentAfterOrderUpdate({
      shopId,
      order: merged,
      newOrderStatus: nextStatus,
    })
    return {
      deliveredSync: d.synced,
      shipmentWarning: mergeShipmentWarnings(d.shipmentWarning, catchup.shipmentWarning),
    }
  }

  return orchestrateShipmentAfterOrderUpdate({ shopId, order: merged, newOrderStatus: nextStatus })
}

/**
 * Sau UpdateStatus: chỉ catch-up tạo vận đơn khi đơn đã SHIPPED/DELIVERED mà vẫn chưa có vận đơn chạy.
 */
export async function orchestrateShipmentAfterOrderUpdate(params: {
  shopId: string
  order: SellerOrder
  newOrderStatus: SellerOrderStatus
}): Promise<SellerOrderShipmentMutationResult> {
  const { shopId, order, newOrderStatus } = params
  const os = (newOrderStatus || '').toUpperCase()

  if (!CATCHUP_ORDER_STATUSES.has(os)) {
    return {}
  }

  const list = await shipmentService.getShipmentsByOrder(order.orderId)
  const primary = pickPrimaryShipmentForOrder(Array.isArray(list) ? list : [])
  if (primary) {
    return {}
  }

  try {
    await createShipmentWithRetry({ shopId, order })
    return {}
  } catch (e) {
    return { shipmentWarning: errMsg(e) }
  }
}
