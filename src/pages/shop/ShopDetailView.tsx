import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductionCard, { type ProductionCardProduct } from '@/components/ProductionCard'
import AssetIcon from '@/components/AssetIcon'
import chevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'
import pointAddressIcon from '@/assets/icons/essential/commerce/point-address.svg'
import packageIcon from '@/assets/icons/essential/commerce/package.svg'
import filterIcon from '@/assets/icons/essential/interface/filter.svg'
import searchIcon from '@/assets/icons/essential/interface/search.svg'
import heartIcon from '@/assets/icons/essential/interface/heart.svg'
import headsetIcon from '@/assets/icons/essential/brand/headset.svg'
import { ROUTES } from '@/constants'
import type { ShopInfo } from '@/types'

export type ShopProductRowModel = {
  id: string
  categoryId: string
  categoryName: string
  name: string
  description: string
  thumbnailUrl: string | null
  createdAt: string
  soldCount: number
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
}

export type ShopCategoryOption = { categoryId: string; name: string }

type SortTab = 'popular' | 'newest' | 'bestseller'

export interface ShopDetailViewProps {
  shop: ShopInfo
  shopProducts: ShopProductRowModel[]
  categoryOptions: ShopCategoryOption[]
  productsLoading?: boolean
  /** `false` = card sản phẩm không điều hướng tới trang chi tiết. */
  linkProducts?: boolean
}

const sortTabs: { id: SortTab; label: string }[] = [
  { id: 'popular', label: 'Phổ biến' },
  { id: 'newest', label: 'Mới nhất' },
  { id: 'bestseller', label: 'Bán chạy' },
]

/** Viền + nền panel giống `.catalog__sidebar` / `.catalog__content` (padding gắn riêng từng khối). */
const shopPanelChrome = 'rounded-xl border border-[#ece6dd] bg-[#f8f3ec]'

export function ShopDetailView({
  shop,
  shopProducts,
  categoryOptions,
  productsLoading = false,
  linkProducts = true,
}: ShopDetailViewProps) {
  const navigate = useNavigate()

  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortTab, setSortTab] = React.useState<SortTab>('popular')

  const metaByProductId = React.useMemo(() => {
    const map = new Map<string, { categoryId: string; createdAt: string }>()
    shopProducts.forEach((p) => {
      map.set(p.id, { categoryId: p.categoryId, createdAt: p.createdAt })
    })
    return map
  }, [shopProducts])

  const catalogCards = React.useMemo<ProductionCardProduct[]>(() => {
    return shopProducts.map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      thumbnailUrl: p.thumbnailUrl ?? undefined,
      shopId: shop.shopId,
      shopName: shop.name,
      rating: p.rating,
      reviewCount: p.reviewCount,
      soldCount: p.soldCount,
      hasFreeship: true,
    }))
  }, [shopProducts, shop.name, shop.shopId])

  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    let result = catalogCards.filter((product) => {
      const meta = metaByProductId.get(product.id)
      const matchCategory = selectedCategory === 'all' ? true : meta?.categoryId === selectedCategory
      const matchSearch = normalizedSearch ? product.title.toLowerCase().includes(normalizedSearch) : true
      return matchCategory && matchSearch
    })

    const byCreated = (a: ProductionCardProduct, b: ProductionCardProduct) => {
      const tA = metaByProductId.get(a.id)?.createdAt
        ? new Date(metaByProductId.get(a.id)!.createdAt).getTime()
        : 0
      const tB = metaByProductId.get(b.id)?.createdAt
        ? new Date(metaByProductId.get(b.id)!.createdAt).getTime()
        : 0
      return tB - tA
    }

    if (sortTab === 'newest') {
      result = [...result].sort(byCreated)
    } else if (sortTab === 'bestseller') {
      result = [...result].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    } else {
      result = [...result].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    }

    return result
  }, [catalogCards, metaByProductId, searchTerm, selectedCategory, sortTab])

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSearchTerm('')
    setSortTab('popular')
  }

  return (
    <div className="min-h-screen w-full bg-transparent pb-14">
      <div className="mx-auto w-full max-w-[1232px] px-10 pt-6 lg:px-10 sm:px-4 sm:pt-4">
        <nav className="mb-6 font-['Inter'] text-sm text-black/60" aria-label="Breadcrumb">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
            <li>
              <Link to={ROUTES.HOME} className="text-[#6C5B50] no-underline hover:text-[#BE9C73]">
                Trang chủ
              </Link>
            </li>
            <li aria-hidden="true" className="flex items-center opacity-45">
              <AssetIcon src={chevronRightIcon} width={12} height={12} />
            </li>
            <li className="font-medium text-black/80">Cửa hàng</li>
            <li aria-hidden="true" className="flex items-center opacity-45">
              <AssetIcon src={chevronRightIcon} width={12} height={12} />
            </li>
            <li className="font-semibold text-black">{shop.name}</li>
          </ol>
        </nav>

        <section className="mb-10 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(44,36,24,0.1)] ring-1 ring-black/[0.06] sm:mb-12">
          <div className="relative h-[168px] sm:h-[200px]">
            {shop.coverImageUrl ? (
              <img src={shop.coverImageUrl} alt={`Ảnh bìa ${shop.name}`} className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3d2a1f] via-[#6C5B50] to-[#BE9C73]"
                aria-hidden
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 z-[1] pb-4 pl-[calc(1.25rem+96px+1rem)] pr-5 sm:pb-5 sm:pl-[calc(2rem+108px+1rem)] sm:pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="m-0 font-['Inter'] text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-3xl">
                  {shop.name}
                </h1>
                {shop.status === 'ACTIVE' && (
                  <span className="rounded-full border border-white/35 bg-white/15 px-2.5 py-0.5 font-['Inter'] text-xs font-semibold text-white backdrop-blur-[2px]">
                    Đang hoạt động
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="h-[96px] w-[96px] shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-neutral-100 shadow-md sm:h-[108px] sm:w-[108px]">
                  {shop.logoUrl ? (
                    <img src={shop.logoUrl} alt={`Logo ${shop.name}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#78716C] to-[#a8a29e] font-['Inter'] text-3xl font-bold text-white">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="sm:pb-1">
                  {shop.description && (
                    <p className="mt-1 max-w-2xl font-['Inter'] text-sm leading-relaxed text-black/70 sm:mt-0">{shop.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:shrink-0">
                <button
                  type="button"
                  title="Tính năng sắp ra mắt"
                  className="inline-flex items-center gap-2 rounded-full bg-[#BE9C73] px-4 py-2 font-['Inter'] text-xs font-semibold text-white opacity-90 transition hover:opacity-100 sm:text-sm"
                >
                  <AssetIcon src={heartIcon} width={16} height={16} className="brightness-0 invert" />
                  Theo dõi
                </button>
                <button
                  type="button"
                  title="Tính năng sắp ra mắt"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#6C5B50] bg-transparent px-4 py-2 font-['Inter'] text-xs font-semibold text-[#3d2a1f] transition hover:bg-black/[0.04] sm:text-sm"
                >
                  <AssetIcon src={headsetIcon} width={16} height={16} className="opacity-80" />
                  Nhắn tin
                </button>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-neutral-200/90 pt-6 sm:grid-cols-4">
              <div className="rounded-xl bg-neutral-100 px-3 py-2.5">
                <dt className="font-['Inter'] text-xs text-black/55">Sản phẩm</dt>
                <dd className="mt-0.5 font-['Inter'] text-lg font-bold text-[#6C5B50]">{shop.totalProducts ?? shopProducts.length}</dd>
              </div>
              <div className="rounded-xl bg-neutral-100 px-3 py-2.5">
                <dt className="font-['Inter'] text-xs text-black/55">Đơn hàng</dt>
                <dd className="mt-0.5 font-['Inter'] text-lg font-bold text-[#6C5B50]">{shop.totalOrders ?? 0}</dd>
              </div>
              <div className="rounded-xl bg-neutral-100 px-3 py-2.5">
                <dt className="font-['Inter'] text-xs text-black/55">Đánh giá</dt>
                <dd className="mt-0.5 font-['Inter'] text-lg font-bold text-[#6C5B50]">{shop.reviewCount ?? 0}</dd>
              </div>
              <div className="rounded-xl bg-neutral-100 px-3 py-2.5">
                <dt className="font-['Inter'] text-xs text-black/55">Điểm</dt>
                <dd className="mt-0.5 font-['Inter'] text-lg font-bold text-[#6C5B50]">
                  {shop.rating != null && shop.rating > 0 ? `${shop.rating.toFixed(1)} / 5` : '—'}
                </dd>
              </div>
            </dl>

            {shop.defaultPickupAddress && (
              <p className="mt-4 flex items-start gap-2 font-['Inter'] text-sm text-black/65">
                <AssetIcon src={pointAddressIcon} width={18} height={18} className="mt-0.5 opacity-70" />
                <span>{shop.defaultPickupAddress}</span>
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="shop-products-heading">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="shop-products-heading"
                className="m-0 flex flex-wrap items-center gap-2 font-['Inter'] text-xl font-extrabold text-black sm:gap-2.5 sm:text-2xl"
              >
                <AssetIcon src={packageIcon} width={26} height={26} className="opacity-85 sm:h-7 sm:w-7" />
                Sản phẩm của shop
              </h2>
              <p className="mt-1 font-['Inter'] text-sm text-black/60">
                {productsLoading ? 'Đang tải…' : `${filteredProducts.length} sản phẩm`}
              </p>
            </div>

            <div className="flex border-b border-black/10 font-['Inter'] text-sm font-semibold lg:max-w-md">
              {sortTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSortTab(tab.id)}
                  className={`flex-1 border-b-2 pb-3 transition-colors ${
                    sortTab === tab.id
                      ? 'border-[#BE9C73] text-[#1c1917]'
                      : 'border-transparent text-black/45 hover:text-black/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className={`sticky top-24 ${shopPanelChrome} p-5`}>

              <label className="flex items-center gap-2 font-['Inter'] text-xs font-bold uppercase tracking-wide text-black/50">
                  <AssetIcon src={searchIcon} width={14} height={14} className="opacity-65" />
                  Tìm trong shop
                </label>
                <input
                  type="search"
                  placeholder="Tên sản phẩm…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 font-['Inter'] text-sm outline-none transition focus:border-[#BE9C73] focus:ring-2 focus:ring-[#BE9C73]/25"
                />


                <h3 className="m-0 flex items-center gap-2 font-['Inter'] text-sm font-bold text-[#1c1917]">
                  <AssetIcon src={filterIcon} width={18} height={18} className="opacity-80" />
                  Danh mục
                </h3>
                <div className="mt-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full rounded-xl px-3 py-2.5 text-left font-['Inter'] text-sm transition ${
                      selectedCategory === 'all'
                        ? 'bg-[#BE9C73]/20 font-semibold text-[#5c4a32]'
                        : 'text-black/70 hover:bg-black/[0.04]'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categoryOptions.map((category) => (
                    <button
                      key={category.categoryId}
                      type="button"
                      onClick={() => setSelectedCategory(category.categoryId)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left font-['Inter'] text-sm transition ${
                        selectedCategory === category.categoryId
                          ? 'bg-[#BE9C73]/20 font-semibold text-[#5c4a32]'
                          : 'text-black/70 hover:bg-black/[0.04]'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>


                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 w-full rounded-xl border border-[#6C5B50]/40 py-2.5 font-['Inter'] text-xs font-semibold text-[#5c4a32] transition hover:bg-black/[0.04]"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </aside>

            <div className={`flex flex-col gap-3 p-4 lg:hidden ${shopPanelChrome}`}>
              <label className="flex items-center gap-2 font-['Inter'] text-xs font-bold text-black/55">
                <AssetIcon src={filterIcon} width={14} height={14} className="opacity-65" />
                Danh mục
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 font-['Inter'] text-sm outline-none focus:border-[#BE9C73]"
              >
                <option value="all">Tất cả</option>
                {categoryOptions.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="search"
                placeholder="Tìm trong shop…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 font-['Inter'] text-sm outline-none focus:border-[#BE9C73]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className={`${shopPanelChrome} p-[14px] sm:p-5`}>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductionCard
                        key={product.id}
                        product={product}
                        onCardClick={
                          linkProducts ? () => navigate(ROUTES.PRODUCT(product.id, product.title)) : undefined
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/15 bg-white/60 px-6 py-16 text-center">
                    <AssetIcon src={searchIcon} width={40} height={40} className="mb-3 opacity-45" />
                    <p className="m-0 font-['Inter'] text-base text-black/65">Không có sản phẩm phù hợp bộ lọc.</p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-4 inline-flex rounded-full bg-[#BE9C73] px-5 py-2 font-['Inter'] text-sm font-semibold text-white transition hover:bg-[#a88962]"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
