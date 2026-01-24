import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProductionCard, { type ProductionCardProduct } from '../components/ProductionCard'
import { products } from '../data/mockProducts'

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

const badgePool = ['Bán chạy', 'Hàng mới', 'Giảm đặc biệt']
const tagPool = [
  ['Thủ công', 'Chuẩn FSC'],
  ['Thiết kế độc quyền', 'Bảo hành 24 tháng'],
  ['Giao trong 5 ngày', 'Tùy chọn cá nhân hóa']
]

type SortOption = 'featured' | 'priceAsc' | 'priceDesc'
type CatalogProduct = ProductionCardProduct & { category: string }

export default function Catalog() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortOption, setSortOption] = React.useState<SortOption>('featured')

  const catalogProducts = React.useMemo<CatalogProduct[]>(() => (
    products.map((product, index) => ({
      ...product,
      category: catalogCategories[index % catalogCategories.length].id,
      badge: badgePool[index % badgePool.length],
      tags: tagPool[index % tagPool.length]
    }))
  ), [])

  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const priceRange = priceFilters.find(item => item.id === selectedPrice)?.range

    let result = catalogProducts.filter(product => {
      const matchCategory = selectedCategory ? product.category === selectedCategory : true
      const matchSearch = normalizedSearch
        ? product.title.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch)
        : true
      const matchPrice = priceRange ? (product.price >= priceRange[0] && product.price <= priceRange[1]) : true

      return matchCategory && matchSearch && matchPrice
    })

    if (sortOption === 'priceAsc') {
      result = [...result].sort((a, b) => a.price - b.price)
    } else if (sortOption === 'priceDesc') {
      result = [...result].sort((a, b) => b.price - a.price)
    }

    return result
  }, [catalogProducts, searchTerm, selectedCategory, selectedPrice, sortOption])

  const handleResetFilters = () => {
    setSelectedCategory(null)
    setSelectedPrice(null)
    setSearchTerm('')
    setSortOption('featured')
  }

  return (
    <div className='catalog-page'>

      <main className='catalog__layout'>
        <aside className='catalog__sidebar'>
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
            <p className='catalog__eyebrow'>Bộ lọc tìm kiếm</p>

            <label htmlFor='catalog-search' className='catalog__label'>Từ khóa sản phẩm</label>
            <input
              id='catalog-search'
              type='search'
              className='catalog__input'
              placeholder='ví dụ: bàn ăn, tủ áo, đèn...'
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />

            <p className='catalog__label'>Khoảng giá</p>
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

            <button type='button' className='catalog__reset' onClick={handleResetFilters}>Xóa lọc</button>
          </section>
        </aside>

        <section className='catalog__content'>
          <div className='catalog__content-header'>
            <div>
              <p className='catalog__eyebrow'>Tìm thấy {filteredProducts.length} sản phẩm</p>
              <h1>Bộ sưu tập gỗ tuyển chọn</h1>
              <p className='catalog__subtitle'>Các sản phẩm được tuyển bởi cố vấn của Woodify, phù hợp mọi không gian sống.</p>
            </div>
            <div className='catalog__sort'>
              <label htmlFor='catalog-sort'>Sắp xếp</label>
              <select
                id='catalog-sort'
                value={sortOption}
                onChange={event => setSortOption(event.target.value as SortOption)}
              >
                <option value='featured'>Nổi bật</option>
                <option value='priceAsc'>Giá tăng dần</option>
                <option value='priceDesc'>Giá giảm dần</option>
              </select>
            </div>
          </div>

          <div className='catalog__grid'>
            {filteredProducts.length === 0 ? (
              <div className='catalog__empty'>
                <p>Không có sản phẩm nào khớp với bộ lọc. Hãy thử điều chỉnh điều kiện tìm kiếm.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <ProductionCard
                  key={product.id}
                  product={product}
                  onCardClick={() => navigate(`/product/${product.id}`)}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
