import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { ROUTES } from '@/constants'
import { adminService, queryKeys } from '@/services'
import type { ProductionCardProduct } from '@/components/ProductionCard'
import type { AdminShopDto, ProductMasterDto } from '@/types'

const fmtMoneyVi = (n: number | undefined) => {
  if (n == null || Number.isNaN(n)) return '—'
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
  } catch {
    return String(n)
  }
}

function resolveProductMasterId(p: ProductMasterDto): string {
  return String(p.productId ?? p.id ?? '').trim()
}

function resolveProductMasterName(p: ProductMasterDto): string {
  const raw = p.productName ?? p.name
  return raw?.trim() ? raw.trim() : '—'
}

function resolveProductMasterThumb(p: ProductMasterDto): string | null {
  const u = p.thumbnailUrl
  if (u != null && String(u).trim() !== '') return String(u).trim()
  return null
}

function resolveProductMasterPrice(p: ProductMasterDto): number | undefined {
  const a = p.basePrice
  const b = p.price
  if (typeof a === 'number' && !Number.isNaN(a)) return a
  if (typeof b === 'number' && !Number.isNaN(b)) return b
  return undefined
}

/** Map ProductMaster (admin shop list) → ProductionCard props — dùng SellerManager expand row. */
export function productMasterDtoToProductionCardProduct(
  p: ProductMasterDto,
  shop: { shopId: string; name: string }
): ProductionCardProduct {
  const rawId = resolveProductMasterId(p)
  const id = rawId || `sku-${(p.globalSku ?? '').replace(/\s/g, '-') || 'unknown'}`
  const title = resolveProductMasterName(p)
  return {
    id,
    title: title === '—' ? (p.globalSku || 'Product') : title,
    description: p.description ?? '',
    price: resolveProductMasterPrice(p) ?? 0,
    thumbnailUrl: resolveProductMasterThumb(p) ?? undefined,
    shopId: shop.shopId,
    shopName: shop.name,
    hasFreeship: true,
    soldCount: typeof p.sales === 'number' ? p.sales : 0,
  }
}

export interface AdminShopProductsPanelProps {
  shop: AdminShopDto | null
  open: boolean
  onClose: () => void
}

/**
 * Lưới sản phẩm theo shop (product master) — dùng trong SellerManager / ShopManager.
 */
export function AdminShopProductsPanel({ shop, open, onClose }: AdminShopProductsPanelProps) {
  const { isVietnamese } = useAppLanguage()
  const shopId = open && shop ? shop.shopId : null

  const {
    data: shopProducts = [],
    isLoading: shopProductsLoading,
    error: shopProductsError,
  } = useQuery({
    queryKey: [queryKeys.ADMIN_SHOPS, 'product-masters', shopId],
    queryFn: () => adminService.getProductsByShopId(shopId!),
    enabled: !!shopId,
  })

  const t = React.useMemo(
    () => ({
      shopProductsTitle: isVietnamese ? 'Sản phẩm của cửa hàng' : 'Shop products',
      closeProducts: isVietnamese ? 'Đóng' : 'Close',
      noProducts: isVietnamese ? 'Chưa có sản phẩm nào' : 'No products yet',
      loadProductsFailed: isVietnamese ? 'Không tải được danh sách sản phẩm' : 'Failed to load products',
      loading: isVietnamese ? 'Đang tải...' : 'Loading...',
      sku: 'SKU',
      category: isVietnamese ? 'Danh mục' : 'Category',
      productStatus: isVietnamese ? 'Trạng thái' : 'Status',
      openProductPage: isVietnamese ? 'Xem trang sản phẩm' : 'Open product',
      noImage: isVietnamese ? 'Chưa có ảnh' : 'No image',
    }),
    [isVietnamese]
  )

  if (!open || !shop) return null

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4'>
      <div
        role='dialog'
        aria-labelledby='admin-shop-products-title'
        className='flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl'
      >
        <div className='flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4'>
          <div>
            <h2 id='admin-shop-products-title' className='text-lg font-bold text-gray-900'>
              {t.shopProductsTitle}
            </h2>
            <p className='mt-0.5 text-sm text-gray-600'>{shop.name}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50'
          >
            {t.closeProducts}
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-4'>
          {shopProductsError && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
              {t.loadProductsFailed}
            </div>
          )}
          {shopProductsLoading && !shopProductsError && (
            <div className='flex justify-center py-12 text-gray-500'>{t.loading}</div>
          )}
          {!shopProductsLoading && !shopProductsError && shopProducts.length === 0 && (
            <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-gray-600'>
              {t.noProducts}
            </div>
          )}
          {!shopProductsLoading && !shopProductsError && shopProducts.length > 0 && (
            <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {shopProducts.map((p, idx) => {
                const pid = resolveProductMasterId(p)
                const pname = resolveProductMasterName(p)
                const thumb = resolveProductMasterThumb(p)
                const price = resolveProductMasterPrice(p)
                const category = p.categoryName?.trim() || '—'
                const stat = (p.status || p.moderationStatus || '—').toString()
                return (
                  <li
                    key={pid || `${shop.shopId}-${idx}-${p.globalSku ?? pname}`}
                    className='flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-amber-200 hover:shadow-md'
                  >
                    <div className='relative aspect-square w-full bg-gray-100'>
                      {thumb ? (
                        <img src={thumb} alt='' className='h-full w-full object-cover' loading='lazy' />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-xs text-gray-400'>
                          {t.noImage}
                        </div>
                      )}
                    </div>
                    <div className='flex flex-1 flex-col gap-1.5 p-3'>
                      <p className='line-clamp-2 text-sm font-semibold text-gray-900' title={pname}>
                        {pname}
                      </p>
                      {p.description ? (
                        <p className='line-clamp-2 text-xs text-gray-500'>{p.description}</p>
                      ) : null}
                      <div className='mt-auto space-y-1 pt-1 text-xs text-gray-600'>
                        <p>
                          <span className='font-medium text-gray-700'>{t.sku}: </span>
                          {p.globalSku?.trim() || '—'}
                        </p>
                        <p>
                          <span className='font-medium text-gray-700'>{t.category}: </span>
                          {category}
                        </p>
                        <p className='font-semibold text-amber-800'>{fmtMoneyVi(price)}</p>
                        <p>
                          <span className='font-medium text-gray-700'>{t.productStatus}: </span>
                          <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium uppercase text-gray-800'>
                            {stat}
                          </span>
                        </p>
                      </div>
                      {pid ? (
                        <Link
                          to={ROUTES.PRODUCT(pid, pname !== '—' ? pname : null)}
                          className='mt-2 inline-flex justify-center rounded-lg bg-gray-900 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-gray-800'
                        >
                          {t.openProductPage}
                        </Link>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
