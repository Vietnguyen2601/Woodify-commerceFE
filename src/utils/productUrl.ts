import { slugifyShopName } from '@/utils/shopUrl'
import type { ProductMaster } from '@/types'

/** UUID đầy đủ — segment cũ `/product/{uuid}`. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function slugifyProductName(name: string): string {
  return slugifyShopName(name)
}

/**
 * 8 ký tự hex (link cũ `slug--xxxxxxxx`) — vẫn dùng khi resolve bookmark cũ.
 */
export function productPublicRefHex(productId: string): string {
  const compact = productId.replace(/-/g, '').toLowerCase()
  if (/^[0-9a-f]{32}$/.test(compact)) return compact.slice(0, 8)
  let h = 0
  for (let i = 0; i < productId.length; i++) {
    h = (h * 31 + productId.charCodeAt(i)) >>> 0
  }
  return h.toString(16).padStart(8, '0').slice(0, 8)
}

/**
 * Segment `/product/:segment`.
 * - UUID + tên → chỉ **slug** (không suffix `--hex`).
 * - Bookmark `slug--8hex` cũ vẫn parse được.
 * - Chỉ số → coi là id legacy (mock / id ngắn), gọi API trực tiếp.
 */
export function buildProductPathSegment(productId: string, productName?: string | null): string {
  const id = productId.trim()
  if (!id) return 'invalid'
  const name = productName?.trim()
  if (name && UUID_RE.test(id)) {
    const slug = slugifyProductName(name)
    if (slug) return `${slug}--${productPublicRefHex(id)}`
  }
  return id
}

export type ParsedProductPath =
  | { kind: 'uuid'; productId: string }
  /** Định dạng URL cũ: `ten-san-pham--xxxxxxxx` */
  | { kind: 'slugPrefix'; slug: string; prefix: string }
  /** Chỉ slug: `ten-san-pham` — resolve qua danh sách published (phải khớp duy nhất 1 SP). */
  | { kind: 'slugOnly'; slug: string }
  | { kind: 'legacyId'; id: string }
  | { kind: 'invalid' }

export function parseProductPathParam(segment: string): ParsedProductPath {
  const t = decodeURIComponent(segment).trim()
  if (!t) return { kind: 'invalid' }

  if (UUID_RE.test(t)) {
    return { kind: 'uuid', productId: t }
  }

  const idx = t.lastIndexOf('--')
  if (idx > 0) {
    const slugPart = t.slice(0, idx)
    const suffix = t.slice(idx + 2)
    if (slugPart.length > 0 && /^[0-9a-f]{8}$/i.test(suffix)) {
      return { kind: 'slugPrefix', slug: slugPart, prefix: suffix.toLowerCase() }
    }
  }

  if (/^\d+$/.test(t)) {
    return { kind: 'legacyId', id: t }
  }

  return { kind: 'slugOnly', slug: slugifyProductName(t) }
}

export function resolveProductIdFromPublished(
  parsed: ParsedProductPath,
  published: ProductMaster[]
): string | null {
  if (parsed.kind === 'uuid') return parsed.productId
  if (parsed.kind === 'legacyId') return parsed.id
  if (parsed.kind === 'slugPrefix') {
    const hit = published.find(
      (p) =>
        slugifyProductName(p.name) === parsed.slug &&
        productPublicRefHex(p.productId) === parsed.prefix
    )
    return hit?.productId ?? null
  }
  if (parsed.kind === 'slugOnly') {
    const matches = published.filter((p) => slugifyProductName(p.name) === parsed.slug)
    if (matches.length === 1) return matches[0].productId
    return null
  }
  return null
}
