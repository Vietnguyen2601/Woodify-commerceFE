/**
 * Hai trục song song (Order vs Shipment) — align BE: không có một chuỗi bắt buộc;
 * COMPLETED trên đơn chủ yếu từ thanh toán, không suy ra từ shipment DELIVERED.
 * Chỉ dùng cho copy / gợi ý UI — không thay rule chuyển trạng thái API.
 */

import type { ShipmentDto } from '@/types'
import { shipmentStatusLabel } from './shipmentSellerUi'

function n(s: string | null | undefined): string {
  return (s ?? '').trim().toUpperCase()
}

export function isOrderPaymentCompleted(orderStatus: string | null | undefined): boolean {
  return n(orderStatus) === 'COMPLETED'
}

/**
 * Hai dòng ngắn: thanh toán (order.status) vs giao hàng (vận đơn).
 */
export function paymentDeliverySummaryVi(
  orderStatus: string | null | undefined,
  shipment: ShipmentDto | null | undefined,
): { payment: string; delivery: string } {
  const os = n(orderStatus)

  const payment = isOrderPaymentCompleted(orderStatus)
    ? 'Thanh toán: đã COMPLETED (thường do thanh toán — không phải bước bắt buộc sau khi giao xong).'
    : `Thanh toán: chưa COMPLETED — trạng thái đơn hiện tại: ${os || '—'}.`

  const delivery = shipment
    ? `Giao hàng (vận đơn): ${shipmentStatusLabel(shipment.status)}`
    : 'Giao hàng (vận đơn): chưa thấy — sau khi đổi trạng thái đơn, FE thử tạo vận đơn nếu thiếu; làm mới nếu vừa cập nhật.'

  return { payment, delivery }
}

/** Đơn đã COMPLETED nhưng vận đơn chưa DELIVERED (hoặc chưa có) — gợi ý không nhầm với “đã giao”. */
export function showPaidBeforeDeliveredHint(
  orderStatus: string | null | undefined,
  shipment: ShipmentDto | null | undefined,
): boolean {
  if (!isOrderPaymentCompleted(orderStatus)) return false
  if (!shipment) return true
  const ss = n(shipment.status)
  return ss !== 'DELIVERED'
}
