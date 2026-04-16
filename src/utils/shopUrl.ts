/** UUID — nhận diện segment cũ `/shop/{uuid}`. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Slug tên shop cho URL (không dấu, chữ thường, gạch ngang).
 */
export function slugifyShopName(name: string): string {
  const s = name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return (s || 'cua-hang').slice(0, 72)
}

/** 8 ký tự hex đầu của shopId — chỉ dùng khi resolve URL cũ dạng `slug--hex`. */
export function shopIdShortHex(shopId: string): string {
  return shopId.replace(/-/g, '').slice(0, 8).toLowerCase()
}

/**
 * Segment trong path: chỉ slug tên shop, ví dụ `cua-hang-go-xanh`.
 * `shopId` giữ trong signature để không đổi call site (`ROUTES.SHOP(id, name)`).
 */
export function buildShopPathSegment(_shopId: string, shopName?: string | null): string {
  return slugifyShopName(shopName || 'cua-hang')
}

export type ParsedShopPath =
  | { kind: 'uuid'; shopId: string }
  /** URL bookmark cũ: `ten-shop--56ac6228` */
  | { kind: 'slugPrefix'; slug: string; prefix: string }
  /** URL chuẩn: chỉ slug */
  | { kind: 'slugOnly'; slug: string }
  | { kind: 'invalid' }

/**
 * Parse `:shopSegment` từ `/shop/:shopSegment`.
 */
export function parseShopPathParam(segment: string): ParsedShopPath {
  const t = decodeURIComponent(segment).trim()
  if (!t) return { kind: 'invalid' }

  if (UUID_RE.test(t)) {
    return { kind: 'uuid', shopId: t }
  }

  const idx = t.lastIndexOf('--')
  if (idx > 0) {
    const slugPart = t.slice(0, idx)
    const suffix = t.slice(idx + 2)
    if (slugPart.length > 0 && /^[0-9a-f]{8}$/i.test(suffix)) {
      return { kind: 'slugPrefix', slug: slugPart, prefix: suffix.toLowerCase() }
    }
  }

  return { kind: 'slugOnly', slug: t.toLowerCase() }
}
