import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ProductionCard, { type ProductionCardProduct } from '../components/ProductionCard'
import Pagination from '../components/Pagination'
import AssetIcon from '@/components/AssetIcon'
import filterIcon from '@/assets/icons/essential/interface/filter.svg'
import searchIcon from '@/assets/icons/essential/interface/search.svg'
import shopIcon from '@/assets/icons/essential/commerce/shop.svg'
import tagIcon from '@/assets/icons/essential/commerce/tag.svg'
import starFilledIcon from '@/assets/icons/essential/interface/star-filled.svg'
import packageIcon from '@/assets/icons/essential/commerce/package.svg'
import truckIcon from '@/assets/icons/essential/commerce/truck.svg'
import refreshIcon from '@/assets/icons/essential/commerce/refresh.svg'
import chevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'
import { productMasterService, shopService } from '@/services'
import { ROUTES } from '@/constants'

const priceFilters = [
  { id: 'under3', label: 'Dưới 3 triệu', range: [0, 3000000] as [number, number] },
  { id: 'from3to6', label: '3 - 6 triệu', range: [3000000, 6000000] as [number, number] },
  { id: 'from6to10', label: '6 - 10 triệu', range: [6000000, 10000000] as [number, number] },
  { id: 'over10', label: 'Trên 10 triệu', range: [10000000, Number.MAX_SAFE_INTEGER] as [number, number] }
]

type SortOption = 'featured' | 'priceAsc' | 'priceDesc' | 'dateDesc' | 'dateAsc'
type CatalogProduct = ProductionCardProduct & { shopId: string; createdAt?: string }

export default function Catalog() {
  const navigate = useNavigate()

  /** Nền xám mặc định là `body { background: #f1f1f1 }` — ghi đè bằng cream khi đang ở catalog. */
  React.useEffect(() => {
    document.body.classList.add('catalog-route-bg')
    return () => {
      document.body.classList.remove('catalog-route-bg')
    }
  }, [])

  const [selectedShop, setSelectedShop] = React.useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortOption, setSortOption] = React.useState<SortOption>('dateDesc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 9

  const { data: rawProducts = [], isLoading, isError } = useQuery({
    queryKey: ['published-products'],
    queryFn: () => productMasterService.getPublishedProducts(),
  })

  const { data: shops = [] } = useQuery({
    queryKey: ['all-shops'],
    queryFn: () => shopService.getAllShops(),
  })

  const productsToUse = rawProducts
  const shopsToUse = shops

  const shopMap = React.useMemo(() => {
    const map: Record<string, string> = {}
    shopsToUse.forEach(s => { map[s.shopId] = s.name })
    return map
  }, [shopsToUse])

  const catalogProducts = React.useMemo<CatalogProduct[]>(() => (
    productsToUse.map((p: any) => ({
      id: p.productId,
      title: p.name,
      description: p.description || '',
      price: p.price,
      originalPrice: undefined,
      rating: undefined,
      reviewCount: undefined,
      soldCount: typeof p.sales === 'number' ? p.sales : undefined,
      location: undefined,
      discount: undefined,
      isFeatured: false,
      hasFreeship: false,
      badge: undefined,
      thumbnailUrl: p.thumbnailUrl ?? undefined,
      shopName: p.shopName ?? shopMap[p.shopId] ?? null,
      shopId: p.shopId,
      category: p.categoryId,
      createdAt: p.publishedAt || p.createdAt,
    }))
  ), [productsToUse, shopMap])

  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const priceRange = priceFilters.find(item => item.id === selectedPrice)?.range

    let result = catalogProducts.filter(product => {
      const matchShop = selectedShop ? product.shopId === selectedShop : true
      const matchSearch = normalizedSearch
        ? product.title.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch)
        : true
      const matchPrice = priceRange ? (product.price >= priceRange[0] && product.price <= priceRange[1]) : true

      return matchShop && matchSearch && matchPrice
    })

    if (sortOption === 'priceAsc') {
      result = [...result].sort((a, b) => a.price - b.price)
    } else if (sortOption === 'priceDesc') {
      result = [...result].sort((a, b) => b.price - a.price)
    } else if (sortOption === 'dateDesc') {
      result = [...result].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    } else if (sortOption === 'dateAsc') {
      result = [...result].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateA - dateB
      })
    } else if (sortOption === 'featured') {
      // Featured products first
      result = [...result].sort((a, b) => {
        if (a.isFeatured === b.isFeatured) return 0
        return a.isFeatured ? -1 : 1
      })
    }

    return result
  }, [catalogProducts, searchTerm, selectedShop, selectedPrice, sortOption])

  const handleResetFilters = () => {
    setSelectedShop(null)
    setSelectedPrice(null)
    setSearchTerm('')
    setSortOption('dateDesc')
    setCurrentPage(1)
  }

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filteredProducts.length])

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <div className='catalog-page'>
      <div className='catalog__breadcrumbs-row'>
        <nav className="mb-4 font-['Inter'] text-sm text-black/60 sm:mb-3" aria-label='Breadcrumb'>
          <ol className='m-0 flex list-none flex-wrap items-center gap-1.5 p-0'>
            <li>
              <Link to={ROUTES.HOME} className='text-[#6C5B50] no-underline hover:text-[#BE9C73]'>
                Trang chủ
              </Link>
            </li>
            <li aria-hidden='true' className='flex items-center opacity-45'>
              <AssetIcon src={chevronRightIcon} width={12} height={12} />
            </li>
            <li className='font-semibold text-black'>Danh mục</li>
          </ol>
        </nav>
      </div>

      <div className='catalog__layout'>
        <aside className='catalog__sidebar'>
          <div className='catalog__sidebar-header'>
            <p className='catalog__eyebrow catalog__eyebrow--icon'>
              <AssetIcon src={filterIcon} width={16} height={16} className='opacity-90' />
              Bộ lọc tìm kiếm
            </p>
          </div>
          <section className='catalog__sidebar-section'>
            <div>
              <p className='catalog__eyebrow catalog__eyebrow--icon'>
                <AssetIcon src={searchIcon} width={16} height={16} className='opacity-90' />
                Tìm kiếm
              </p>
            </div>
            <input
              id='catalog-search'
              type='search'
              className='catalog__input'
              placeholder='ví dụ: bàn ăn, tủ áo, đèn...'
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />

            <div style={{ marginTop: '20px' }}>
              <p className='catalog__eyebrow catalog__eyebrow--icon'>
                <AssetIcon src={tagIcon} width={16} height={16} className='opacity-90' />
                Khoảng giá
              </p>
              <div className='catalog__pill-group'>
                {priceFilters.map(filter => (
                  <button
                    key={filter.id}
                    type='button'
                    className={selectedPrice === filter.id ? 'catalog__pill active' : 'catalog__pill'}
                    onClick={() => setSelectedPrice(prev => prev === filter.id ? null : filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <button type='button' className='catalog__reset catalog__reset--icon' onClick={handleResetFilters}>
              <AssetIcon src={refreshIcon} width={16} height={16} className='opacity-80' />
              Xóa tất cả lọc
            </button>
          </section>

          {shopsToUse && shopsToUse.length > 0 && (
            <section className='catalog__sidebar-section'>
              <div className='catalog__sidebar-heading'>
                <div>
                  <p className='catalog__eyebrow catalog__eyebrow--icon'>
                    <AssetIcon src={shopIcon} width={16} height={16} className='opacity-90' />
                    Cửa hàng
                  </p>
                  <h2>Lọc theo shop</h2>
                </div>
                <button type='button' className='catalog__link' onClick={() => setSelectedShop(null)}>Bỏ chọn</button>
              </div>
              <div className='catalog__pill-group'>
                {shopsToUse.map(shop => (
                  <button
                    key={shop.shopId}
                    type='button'
                    className={selectedShop === shop.shopId ? 'catalog__pill active' : 'catalog__pill'}
                    onClick={() => setSelectedShop(prev => prev === shop.shopId ? null : shop.shopId)}
                  >
                    {shop.name}
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>

        <section className='catalog__content'>
          <div className='catalog__content-header'>
            <div>
              <p className='catalog__eyebrow catalog__eyebrow--icon'>
                <AssetIcon src={packageIcon} width={16} height={16} className='opacity-90' />
                Tìm thấy {filteredProducts.length} sản phẩm
              </p>
              <h1 className='catalog__title-row'>
                <AssetIcon src={starFilledIcon} width={28} height={28} className='catalog__title-icon' />
                Bộ sưu tập gỗ tuyển chọn
              </h1>
              <p className='catalog__subtitle catalog__subtitle--icon'>
                <AssetIcon src={truckIcon} width={18} height={18} className='catalog__subtitle-icon' />
                Các sản phẩm được tuyển bởi cố vấn của Woodify, phù hợp mọi không gian sống.
              </p>
            </div>
            <button type='button' className='catalog__hide-filter catalog__hide-filter--icon' onClick={() => {}}>
              <AssetIcon src={chevronRightIcon} width={16} height={16} className='catalog__hide-filter-chevron' />
              Ẩn bộ lọc
            </button>
          </div>

          <div className='catalog__sort-bar'>
            <p className='catalog__sort-label catalog__sort-label--icon'>
              <AssetIcon src={filterIcon} width={16} height={16} className='opacity-85' />
              Sắp xếp
            </p>
            <button 
              type='button'
              className={`catalog__sort-btn ${sortOption === 'featured' ? 'active' : ''}`}
              onClick={() => setSortOption('featured')}
            >
              Phổ biến
            </button>
            <button 
              type='button'
              className={`catalog__sort-btn ${sortOption === 'dateDesc' ? 'active' : ''}`}
              onClick={() => setSortOption('dateDesc')}
            >
              Mới nhất
            </button>
            <button 
              type='button'
              className={`catalog__sort-btn ${sortOption === 'dateAsc' ? 'active' : ''}`}
              onClick={() => setSortOption('dateAsc')}
            >
              Bán chạy
            </button>
            <button 
              type='button'
              className={`catalog__sort-btn ${sortOption === 'priceAsc' ? 'active' : ''}`}
              onClick={() => setSortOption('priceAsc')}
            >
              Giá thấp - cao
            </button>
            <button 
              type='button'
              className={`catalog__sort-btn ${sortOption === 'priceDesc' ? 'active' : ''}`}
              onClick={() => setSortOption('priceDesc')}
            >
              Giá cao - thấp
            </button>
          </div>

          <div className='catalog__grid'>
            {isLoading ? (
              <div className='catalog__empty'>
                <div className='flex flex-col items-center gap-3 py-10'>
                  <AssetIcon src={packageIcon} width={36} height={36} className='animate-pulse opacity-70' />
                  <p className='text-sm text-stone-500'>Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : isError ? (
              <div className='catalog__empty catalog__empty--centered'>
                <AssetIcon src={searchIcon} width={40} height={40} className='mb-3 opacity-50' />
                <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className='catalog__empty catalog__empty--centered'>
                <AssetIcon src={searchIcon} width={44} height={44} className='mb-3 opacity-55' />
                <p>Không có sản phẩm nào khớp với bộ lọc. Hãy thử điều chỉnh điều kiện tìm kiếm.</p>
              </div>
            ) : (
              paginatedProducts.map(product => (
                <ProductionCard
                  key={product.id}
                  product={product}
                  onCardClick={() => navigate(ROUTES.PRODUCT(product.id, product.title))}
                />
              ))
            )}
          </div>

          {filteredProducts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </div>
    </div>
  )
}
