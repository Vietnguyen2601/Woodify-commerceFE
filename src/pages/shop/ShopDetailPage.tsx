import React from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ShopDetailView, type ShopProductRowModel } from './ShopDetailView'
import { productMasterService, shopService, categoryService } from '@/services'
import { ROUTES } from '@/constants'
import type { ProductMaster, CategoryDTO, ShopInfo } from '@/types'
import {
  parseShopPathParam,
  slugifyShopName,
  shopIdShortHex,
} from '@/utils/shopUrl'

type ShopProductRow = ProductMaster & {
  price?: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  soldCount?: number
}

function stableSold(productId: string, max = 400): number {
  let h = 0
  for (let i = 0; i < productId.length; i++) h = (h * 31 + productId.charCodeAt(i)) | 0
  return (Math.abs(h) % max) + 1
}

export default function ShopDetailPage() {
  const { shopSegment = '' } = useParams<{ shopSegment: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const rawSegment = React.useMemo(() => decodeURIComponent(shopSegment).trim(), [shopSegment])

  React.useEffect(() => {
    document.body.classList.add('shop-route-bg')
    return () => {
      document.body.classList.remove('shop-route-bg')
    }
  }, [])

  const { data: categoriesData = [] } = useQuery<CategoryDTO[]>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const response = await categoryService.getAllCategories()
      return Array.isArray(response) ? response : []
    },
  })

  const categoryOptions = React.useMemo(() => {
    const list = categoriesData
    const roots = list.filter((cat) => !cat.parentCategoryId)
    const useList = roots.length > 0 ? roots : list
    return useList.map((c) => ({ categoryId: c.categoryId, name: c.name }))
  }, [categoriesData])

  const {
    data: shop,
    isLoading: shopLoading,
    isError: shopError,
    refetch: refetchShop,
  } = useQuery({
    queryKey: ['shop', 'resolve', rawSegment],
    queryFn: async (): Promise<ShopInfo> => {
      const parsed = parseShopPathParam(rawSegment)
      if (parsed.kind === 'uuid') {
        return shopService.getShopById(parsed.shopId)
      }
      if (parsed.kind === 'slugPrefix') {
        const shops = await shopService.getAllShops()
        const found = shops.find(
          (sh) =>
            slugifyShopName(sh.name) === parsed.slug && shopIdShortHex(sh.shopId) === parsed.prefix,
        )
        if (found) return found
        throw new Error('SHOP_NOT_FOUND')
      }
      if (parsed.kind === 'slugOnly') {
        const shops = await shopService.getAllShops()
        const matches = shops.filter((sh) => slugifyShopName(sh.name) === parsed.slug)
        if (matches.length === 1) return matches[0]
        if (matches.length > 1) {
          const active = matches.find((s) => s.status === 'ACTIVE')
          return active ?? matches[0]
        }
        throw new Error('SHOP_NOT_FOUND')
      }
      throw new Error('INVALID_SHOP_URL')
    },
    enabled: !!rawSegment,
  })

  const resolvedShopId = shop?.shopId

  const { data: shopProductsData = [], isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', resolvedShopId],
    queryFn: () => (resolvedShopId ? productMasterService.getProductsByShopId(resolvedShopId) : Promise.resolve([])),
    enabled: !!resolvedShopId,
  })

  /** URL cũ (`/shop/{uuid}` hoặc `slug--hex`) → chuyển sang `/shop/{slug}`. */
  React.useEffect(() => {
    if (!shop || !rawSegment) return
    const pretty = ROUTES.SHOP(shop.shopId, shop.name)
    if (location.pathname === pretty) return
    const p = parseShopPathParam(rawSegment)
    if (p.kind !== 'uuid' && p.kind !== 'slugPrefix') return
    void queryClient
      .prefetchQuery({
        queryKey: ['shops', 'all'],
        queryFn: () => shopService.getAllShops(),
      })
      .then(() => {
        navigate(pretty, { replace: true })
      })
  }, [shop, rawSegment, location.pathname, navigate, queryClient])

  const shopProducts = React.useMemo((): ShopProductRowModel[] => {
    if (!resolvedShopId) return []
    return shopProductsData
      .filter((p) => p.shopId === resolvedShopId)
      .map((p) => {
        const extra = p as ShopProductRow
        return {
          id: p.productId,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          name: p.name,
          description: p.description ?? '',
          thumbnailUrl: p.thumbnailUrl,
          createdAt: p.createdAt,
          soldCount: typeof extra.soldCount === 'number' ? extra.soldCount : stableSold(p.productId),
          price: typeof extra.price === 'number' ? extra.price : 0,
          originalPrice: extra.originalPrice,
          rating: extra.rating,
          reviewCount: extra.reviewCount,
        }
      })
  }, [shopProductsData, resolvedShopId])

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-bg)]">
        <div className="mx-auto max-w-[1232px] px-10 py-10 lg:px-10 sm:px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-48 rounded bg-black/10" />
            <div className="h-52 rounded-2xl bg-black/10" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-xl bg-black/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (shopError || !shop) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[var(--color-brand-bg)] px-4">
        <p className="font-['Inter'] text-center text-base text-neutral-700">
          Không tải được thông tin shop hoặc đường dẫn không hợp lệ.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => refetchShop()}
            className="rounded-full bg-[#BE9C73] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-white transition hover:bg-[#a88962]"
          >
            Thử lại
          </button>
          <Link
            to={ROUTES.HOME}
            className="rounded-full border border-[#6C5B50] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-[#2f1f12] no-underline transition hover:bg-black/5"
          >
            Về trang chủ
          </Link>
          <Link
            to={ROUTES.CATALOG}
            className="rounded-full border border-dashed border-[#6C5B50] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-[#5c4a32] no-underline transition hover:bg-black/5"
          >
            Xem danh mục sản phẩm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ShopDetailView
      shop={shop}
      shopProducts={shopProducts}
      categoryOptions={categoryOptions}
      productsLoading={productsLoading}
      linkProducts
    />
  )
}
