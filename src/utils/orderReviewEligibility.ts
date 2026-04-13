/**
 * Buyer UI: when to show "Danh gia" per order line.
 * CreateReview is still validated by the API.
 *
 * @see docs/ORDER_REVIEW_ELIGIBILITY_FE.md
 */

const ORDER_OK = new Set(['DELIVERED', 'COMPLETED'])

/** Hide review only for lines clearly cancelled / refunded (not UNFULFILLED). */
const LINE_HARD_BLOCK = new Set(['CANCELLED', 'REFUNDED', 'REFUNDING', 'RETURNED'])

function norm(s: string | null | undefined): string {
  const t = (s ?? '').trim().toUpperCase().replace(/\s+/g, '_')
  if (t === 'COMPLETE') return 'COMPLETED'
  return t
}

export function orderAllowsBuyerReview(orderStatus: string | null | undefined): boolean {
  return ORDER_OK.has(norm(orderStatus))
}

/**
 * If order is DELIVERED/COMPLETED, show review for every line except LINE_HARD_BLOCK.
 * Covers BE inconsistency: order COMPLETED but line still UNFULFILLED.
 */
export function lineEligibleForBuyerReview(
  orderStatus: string | null | undefined,
  lineStatus: string | null | undefined,
): boolean {
  if (!orderAllowsBuyerReview(orderStatus)) return false

  const line = norm(lineStatus)
  if (line !== '' && LINE_HARD_BLOCK.has(line)) return false
  return true
}
