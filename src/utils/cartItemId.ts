/**
 * Resolves cart line id from API / localStorage shapes (camelCase, snake_case, PascalCase).
 */
export function resolveCartItemLineId(item: unknown): string {
  if (!item || typeof item !== 'object') return ''
  const o = item as Record<string, unknown>
  // Do not use generic `id` — it may be version/product id and breaks Orders/create validation
  const candidates = [o.cartItemId, o.cart_item_id, o.CartItemId]
  for (const v of candidates) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}
