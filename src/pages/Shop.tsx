import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productMasterService, shopService, categoryService } from '@/services'

const priceFilters = [
  { id: 'under2', label: 'Dưới 2 triệu', range: [0, 2000000] as [number, number] },
  { id: 'from2to5', label: '2 - 5 triệu', range: [2000000, 5000000] as [number, number] },
  { id: 'from5to10', label: '5 - 10 triệu', range: [5000000, 10000000] as [number, number] },
  { id: 'over10', label: 'Trên 10 triệu', range: [10000000, Number.MAX_SAFE_INTEGER] as [number, number] }
]

type SortOption = 'popular' | 'newest' | 'bestseller'

export default function Shop() {
  const navigate = useNavigate()
  const { shopId } = useParams<{ shopId: string }>()
  
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortOption, setSortOption] = React.useState<SortOption>('popular')

  // Fetch categories from API
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  })

  // Get all categories (or root categories if available)
  const rootCategories = React.useMemo(() => {
    if (!categoriesResponse?.data) return []
    // Try to get root categories (parentCategoryId === null or undefined)
    // If none found, return all categories
    const roots = categoriesResponse.data.filter(cat => !cat.parentCategoryId)
    return roots.length > 0 ? roots : categoriesResponse.data
  }, [categoriesResponse])

  // Fetch shop details using API
  const { data: shop, isLoading: shopLoading, isError: shopError } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => shopService.getShopById(shopId!),
    enabled: !!shopId,
  })

  // Fetch shop products using API
  const { data: shopProductsData = [], isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', shopId],
    queryFn: () => (shopId ? productMasterService.getProductsByShopId(shopId) : Promise.resolve([])),
    enabled: !!shopId,
  })

  const shopProducts = React.useMemo(() => {
    return shopProductsData
      .filter(p => p.shopId === shopId)
      .map((p, index) => ({
        id: p.productId,
        name: p.name,
        categoryName: p.categoryName,
        thumbnailUrl: p.thumbnailUrl,
        createdAt: p.createdAt,
        soldCount: Math.floor(Math.random() * 500)
      }))
  }, [shopProductsData, shopId])

  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    let result = shopProducts.filter(product => {
      const matchCategory = selectedCategory === 'all' ? true : product.categoryName?.toLowerCase().includes(selectedCategory.toLowerCase())
      const matchSearch = normalizedSearch
        ? product.name.toLowerCase().includes(normalizedSearch)
        : true

      return matchCategory && matchSearch
    })

    if (sortOption === 'newest') {
      result = [...result].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    } else if (sortOption === 'bestseller') {
      result = [...result].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    }

    return result
  }, [shopProducts, searchTerm, selectedCategory, sortOption])

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSearchTerm('')
    setSortOption('popular')
  }

  if (shopLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-600'>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className='relative min-h-screen w-full'>
      {/* Background gradient */}
      <div 
        className='fixed inset-0 pointer-events-none w-screen h-screen' 
        style={{ background: 'linear-gradient(to bottom, rgba(254, 212, 122, 0.08), #FFFBEB, #FFF7ED)', zIndex: -1 }}
      />

      <div className='w-full mx-auto px-3 sm:px-4 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-10 lg:pb-12' style={{ maxWidth: '1400px' }}>
        {/* SHOP HEADER BACKGROUND */}
        {shop?.coverImageUrl && (
          <div className='mb-6 sm:mb-8 lg:mb-10 rounded-xl overflow-hidden h-32 sm:h-40 lg:h-48 bg-gray-200'>
            <img 
              src={shop.coverImageUrl} 
              alt='Shop cover' 
              className='w-full h-full object-cover'
            />
          </div>
        )}

        {/* SHOP HEADER */}
        <div className='mb-6 sm:mb-8 lg:mb-10'>
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
            {/* Shop Avatar/Logo */}
            {shop?.logoUrl ? (
              <div className='w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex-shrink-0 overflow-hidden bg-gray-100'>
                <img 
                  src={shop.logoUrl} 
                  alt={shop.name} 
                  className='w-full h-full object-cover'
                />
              </div>
            ) : (
              <div 
                className='w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold'
                style={{ background: 'linear-gradient(135deg, #78716C 0%, #A8A29E 100%)' }}
              >
                {(shop?.name ?? 'W')?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Shop Info */}
            <div className='flex-1'>
              <div className='mb-2 sm:mb-3'>
                <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                  {shop?.name || 'Shop'}
                </h1>
                {shop?.status && (
                  <p className='text-gray-600 text-xs sm:text-sm mt-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Trạng thái: <span style={{ color: '#78716C', fontWeight: '600' }}>{shop.status}</span>
                  </p>
                )}
              </div>

              {/* Shop Stats */}
              <div className='grid grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4'>
                <div>
                  <p className='text-xs text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>Sản phẩm</p>
                  <p className='text-base sm:text-lg font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#78716C' }}>
                    {shop?.totalProducts ?? shopProducts.length}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>Đơn hàng</p>
                  <p className='text-base sm:text-lg font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#78716C' }}>
                    {shop?.totalOrders ?? 0}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>Đánh giá</p>
                  <p className='text-base sm:text-lg font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#78716C' }}>
                    {shop?.reviewCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>Rating</p>
                  <p className='text-base sm:text-lg font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#78716C' }}>
                    {shop?.rating ? `${(shop.rating).toFixed(1)} ⭐` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2 flex-wrap'>
                <button
                  className='px-4 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity'
                  style={{
                    background: 'linear-gradient(90deg, #78716C 0%, #FED47A 100%)',
                    fontFamily: 'Arimo, sans-serif'
                  }}
                >
                  ❤️ Theo dõi
                </button>
                <button
                  className='px-4 py-2 border-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors'
                  style={{
                    borderColor: '#78716C',
                    color: '#78716C',
                    fontFamily: 'Arimo, sans-serif'
                  }}
                >
                  💬 Nhắn tin
                </button>
              </div>
            </div>
          </div>

          {/* Shop Description */}
          {shop?.description && (
            <p className='mt-4 sm:mt-6 text-gray-700 text-xs sm:text-sm leading-relaxed' style={{ fontFamily: 'Arimo, sans-serif' }}>
              {shop.description}
            </p>
          )}
          
          {/* Shop Address */}
          {shop?.defaultPickupAddress && (
            <p className='mt-2 text-gray-600 text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
              📍 Địa chỉ: {shop.defaultPickupAddress}
            </p>
          )}
        </div>

        {/* TABS */}
        <div className='flex gap-4 mb-6 sm:mb-8 lg:mb-10 border-b' style={{ borderColor: '#E5E7EB' }}>
          <button
            className='pb-3 px-2 font-semibold text-xs sm:text-sm'
            style={{
              fontFamily: 'Arimo, sans-serif',
              color: '#78716C',
              borderBottom: '2px solid #78716C'
            }}
          >
            Phổ biến
          </button>
          <button
            className='pb-3 px-2 font-semibold text-xs sm:text-sm'
            style={{
              fontFamily: 'Arimo, sans-serif',
              color: '#A8A29E'
            }}
          >
            Mới nhất
          </button>
          <button
            className='pb-3 px-2 font-semibold text-xs sm:text-sm'
            style={{
              fontFamily: 'Arimo, sans-serif',
              color: '#A8A29E'
            }}
          >
            Bán chạy
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className='flex gap-4 sm:gap-6 lg:gap-8'>
          {/* LEFT SIDEBAR - CATEGORIES */}
          <aside className='w-64 hidden lg:block flex-shrink-0'>
            <div className='bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm' style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' }}>
              {/* Categories */}
              <div className='mb-6'>
                <h3 className='text-sm font-bold mb-3' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                  Danh mục
                </h3>
                <div className='space-y-2'>
                  <button
                    key='all'
                    onClick={() => setSelectedCategory('all')}
                    className='w-full text-left text-xs py-2 px-3 rounded-lg transition-all'
                    style={{
                      background: selectedCategory === 'all' ? 'rgba(120, 113, 108, 0.1)' : 'transparent',
                      color: selectedCategory === 'all' ? '#78716C' : '#6B7280',
                      fontFamily: 'Arimo, sans-serif',
                      fontWeight: selectedCategory === 'all' ? '600' : '400'
                    }}
                  >
                    Tất cả sản phẩm
                  </button>
                  {rootCategories.map(category => (
                    <button
                      key={category.categoryId}
                      onClick={() => setSelectedCategory(category.categoryId)}
                      className='w-full text-left text-xs py-2 px-3 rounded-lg transition-all'
                      style={{
                        background: selectedCategory === category.categoryId ? 'rgba(120, 113, 108, 0.1)' : 'transparent',
                        color: selectedCategory === category.categoryId ? '#78716C' : '#6B7280',
                        fontFamily: 'Arimo, sans-serif',
                        fontWeight: selectedCategory === category.categoryId ? '600' : '400'
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Filter */}
              <div>
                <label className='text-xs font-bold block mb-2' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                  Tìm kiếm
                </label>
                <input
                  type='text'
                  placeholder='Nhập tên sản phẩm...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-2'
                  style={{
                    borderColor: '#D1D5DB',
                    fontFamily: 'Arimo, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#78716C'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className='w-full mt-4 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity'
                style={{
                  background: 'rgba(120, 113, 108, 0.08)',
                  color: '#78716C',
                  fontFamily: 'Arimo, sans-serif'
                }}
              >
                Xóa lọc
              </button>
            </div>
          </aside>

          {/* RIGHT CONTENT - PRODUCTS */}
          <div className='flex-1'>
            {/* Header */}
            <div className='mb-4 sm:mb-6 lg:mb-8'>
              <p className='text-xs text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                Tìm thấy {filteredProducts.length} sản phẩm
              </p>
              <div className='flex justify-between items-center gap-2 mt-2'>
                <h2 className='text-lg sm:text-xl font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                  Sản phẩm
                </h2>
                <div className='flex gap-2'>
                  <label className='text-xs' style={{ fontFamily: 'Arimo, sans-serif', color: '#6B7280' }}>
                    Sắp xếp:
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className='text-xs rounded px-2 py-1 border'
                    style={{
                      borderColor: '#D1D5DB',
                      fontFamily: 'Arimo, sans-serif',
                      color: '#1E293B'
                    }}
                  >
                    <option value='popular'>Phổ biến</option>
                    <option value='newest'>Mới nhất</option>
                    <option value='bestseller'>Bán chạy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'>
                {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                  style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' }}
                >
                  {/* Image Container */}
                  <div className='relative w-full aspect-square bg-gray-100 overflow-hidden rounded-t-xl'>
                    {product.thumbnailUrl ? (
                      <img 
                        src={product.thumbnailUrl} 
                        alt={product.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-400'>
                        <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                          <rect x='3' y='3' width='18' height='18' rx='3' />
                          <circle cx='8.5' cy='8.5' r='1.5' />
                          <path d='m21 15-5-5L5 21' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                      </div>
                    )}

                    {/* FREESHIP Badge */}
                    <div
                      className='absolute bottom-3 left-3 px-2 py-1 rounded text-white text-xs font-bold'
                      style={{ background: '#22c55e' }}
                    >
                      FREESHIP
                    </div>
                  </div>

                  {/* Content */}
                  <div className='p-3 sm:p-4'>
                    {shop?.name && (
                      <p className='text-xs text-gray-500 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        {shop.name}
                      </p>
                    )}
                    
                    <h3 className='font-semibold text-xs sm:text-sm line-clamp-2 mb-2' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                      {product.name}
                    </h3>

                    {/* Category */}
                    <div className='flex items-center gap-2 text-xs' style={{ fontFamily: 'Arimo, sans-serif', color: '#6B7280' }}>
                      <span>📁 {product.categoryName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <p className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
