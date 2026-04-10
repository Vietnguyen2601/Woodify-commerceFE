import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ProductionCard, { type ProductionCardProduct } from '../components/ProductionCard'
import Pagination from '../components/Pagination'
import { productMasterService, shopService } from '@/services'
import type { ProductMaster } from '@/types'

const catalogCategories = [
  { id: 'living', label: 'Không gian phòng khách' },
  { id: 'bedroom', label: 'Nội thất phòng ngủ' },
  { id: 'workspace', label: 'Góc làm việc' },
  { id: 'decor', label: 'Trang trí & phụ kiện' },
  { id: 'bespoke', label: 'Đặt đóng theo yêu cầu' }
]

const priceFilters = [
  { id: 'under3', label: 'Dưới 3 triệu', range: [0, 3000000] as [number, number] },
  { id: 'from3to6', label: '3 - 6 triệu', range: [3000000, 6000000] as [number, number] },
  { id: 'from6to10', label: '6 - 10 triệu', range: [6000000, 10000000] as [number, number] },
  { id: 'over10', label: 'Trên 10 triệu', range: [10000000, Number.MAX_SAFE_INTEGER] as [number, number] }
]

type SortOption = 'featured' | 'priceAsc' | 'priceDesc' | 'dateDesc' | 'dateAsc'
type CatalogProduct = ProductionCardProduct & { category: string; shopId: string; createdAt?: string }

export default function Catalog() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [selectedShop, setSelectedShop] = React.useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortOption, setSortOption] = React.useState<SortOption>('dateDesc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 9

  const { data: rawProducts = [], isLoading, isError } = useQuery({
    queryKey: ['published-products'],
    queryFn: () => productMasterService.getPublishedProducts(),
    enabled: true,
  })

  const { data: shops = [] } = useQuery({
    queryKey: ['all-shops'],
    queryFn: () => shopService.getAllShops(),
    enabled: true,
  })

  const productsToUse = rawProducts
  const shopsToUse = shops

  const catalogProducts = React.useMemo<CatalogProduct[]>(() => (
    productsToUse.map((p: ProductMaster) => ({
      id: p.productId,
      title: p.name,
      description: p.description || '',
      price: p.price,
      originalPrice: undefined,
      rating: undefined,
      reviewCount: undefined,
      soldCount: undefined,
      location: undefined,
      discount: undefined,
      isFeatured: false,
      hasFreeship: false,
      badge: undefined,
      tags: [p.categoryName].filter(Boolean),
      thumbnailUrl: p.thumbnailUrl ?? undefined,
      shopName: p.shopName,
      shopId: p.shopId,
      category: p.categoryId,
      createdAt: p.publishedAt || p.createdAt,
    }))
  ), [productsToUse])

  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const priceRange = priceFilters.find(item => item.id === selectedPrice)?.range

    let result = catalogProducts.filter(product => {
      const matchCategory = selectedCategory ? product.category === selectedCategory : true
      const matchShop = selectedShop ? product.shopId === selectedShop : true
      const matchSearch = normalizedSearch
        ? product.title.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch)
        : true
      const matchPrice = priceRange ? (product.price >= priceRange[0] && product.price <= priceRange[1]) : true

      return matchCategory && matchShop && matchSearch && matchPrice
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
  }, [catalogProducts, searchTerm, selectedCategory, selectedPrice, sortOption])

  const handleResetFilters = () => {
    setSelectedCategory(null)
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

      <main className='catalog__layout'>
        <aside className='catalog__sidebar'>
          <div className='catalog__sidebar-header'>
            <p className='catalog__eyebrow'>🔍 Bộ lọc tìm kiếm</p>
          </div>

          <section className='catalog__sidebar-section'>
            <div className='catalog__sidebar-heading'>
              <div>
                <p className='catalog__eyebrow'>Danh mục</p>
                <h2>Chọn không gian</h2>
              </div>
              <button type='button' className='catalog__link' onClick={() => setSelectedCategory(null)}>Bỏ chọn</button>
            </div>

            <div className='catalog__pill-group'>
              {catalogCategories.map(category => (
                <button
                  key={category.id}
                  type='button'
                  className={selectedCategory === category.id ? 'catalog__pill active' : 'catalog__pill'}
                  onClick={() => setSelectedCategory(prev => prev === category.id ? null : category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </section>

          <section className='catalog__sidebar-section'>
            <div>
              <p className='catalog__eyebrow'>Tìm kiếm</p>
              <label htmlFor='catalog-search' className='catalog__label'>Từ khóa sản phẩm</label>
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
              <p className='catalog__eyebrow'>Khoảng giá</p>
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

            <button type='button' className='catalog__reset' onClick={handleResetFilters}>Xóa tất cả lọc</button>
          </section>

          {shopsToUse && shopsToUse.length > 0 && (
            <section className='catalog__sidebar-section'>
              <div className='catalog__sidebar-heading'>
                <div>
                  <p className='catalog__eyebrow'>Cửa hàng</p>
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
              <p className='catalog__eyebrow'>Tìm thấy {filteredProducts.length} sản phẩm</p>
              <h1>Bộ sưu tập gỗ tuyển chọn</h1>
              <p className='catalog__subtitle'>Các sản phẩm được tuyển bởi cố vấn của Woodify, phù hợp mọi không gian sống.</p>
            </div>
            <button type='button' className='catalog__hide-filter' onClick={() => {}}>
              <span>⏷</span> Ẩn bộ lọc
            </button>
          </div>

          <div className='catalog__sort-bar'>
            <p className='catalog__sort-label'>Sắp xếp</p>
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
                  <div className='h-7 w-7 animate-spin rounded-full border-4 border-yellow-800 border-t-transparent' />
                  <p className='text-sm text-stone-500'>Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : isError ? (
              <div className='catalog__empty'>
                <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className='catalog__empty'>
                <p>Không có sản phẩm nào khớp với bộ lọc. Hãy thử điều chỉnh điều kiện tìm kiếm.</p>
              </div>
            ) : (
              paginatedProducts.map(product => (
                <ProductionCard
                  key={product.id}
                  product={product}
                  onCardClick={() => navigate(`/product/${product.id}`)}
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
      </main>
    </div>
  )
}
