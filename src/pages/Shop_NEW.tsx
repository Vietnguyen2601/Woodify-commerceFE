import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productMasterService, shopService, categoryService } from '@/services'
import { currency } from '@/utils/format'

type SortOption = 'popular' | 'newest' | 'bestseller'

export default function Shop() {
  const navigate = useNavigate()
  const { shopId } = useParams<{ shopId: string }>()
  
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortOption, setSortOption] = React.useState<SortOption>('popular')
  const [activeTab, setActiveTab] = React.useState<'products' | 'reviews' | 'info'>('products')

  // Fetch categories from API
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  })

  // Get all categories (or root categories if available)
  const rootCategories = React.useMemo(() => {
    if (!categoriesResponse?.data) return []
    const roots = categoriesResponse.data.filter(cat => !cat.parentCategoryId)
    return roots.length > 0 ? roots : categoriesResponse.data
  }, [categoriesResponse])

  // Fetch shop details using API
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => shopService.getShopById(shopId!),
    enabled: !!shopId,
  })

  // Fetch shop products using API
  const { data: shopProductsData = [] } = useQuery({
    queryKey: ['shop-products', shopId],
    queryFn: () => (shopId ? productMasterService.getProductsByShopId(shopId) : Promise.resolve([])),
    enabled: !!shopId,
  })

  const shopProducts = React.useMemo(() => {
    return shopProductsData
      .filter(p => p.shopId === shopId)
      .map((p) => ({
        id: p.productId,
        name: p.name,
        categoryName: p.categoryName,
        thumbnailUrl: p.thumbnailUrl,
        createdAt: p.createdAt,
        soldCount: Math.floor(Math.random() * 500),
        price: Math.floor(Math.random() * 20000000) + 1000000,
        originalPrice: Math.floor(Math.random() * 25000000) + 2000000,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviewCount: Math.floor(Math.random() * 500)
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
    <div className='relative min-h-screen w-full bg-stone-100'>
      {/* SHOP HEADER BACKGROUND */}
      <div className='w-full h-52 bg-gradient-to-r from-yellow-800 via-yellow-800 to-yellow-800 opacity-20' />

      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 pb-8'>
        {/* SHOP CARD */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200'>
          <div className='flex gap-6'>
            {/* Shop Avatar */}
            <div className='flex-shrink-0'>
              <div 
                className='w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg'
                style={{ 
                  background: 'linear-gradient(135deg, #8B5A3C 0%, #D4AF37 100%)',
                }}
              >
                {shop?.name?.charAt(0).toUpperCase() || 'W'}
              </div>
            </div>

            {/* Shop Info */}
            <div className='flex-1'>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h1 className='text-2xl font-bold text-stone-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    {shop?.name || 'Shop'}
                  </h1>
                  <div className='mt-1 flex items-center gap-2'>
                    <span className='inline-block px-2 py-1 bg-lime-700 text-white text-xs font-medium rounded'>
                      ✓ Chính thức
                    </span>
                    <span className='text-gray-600 text-xs'>2 giờ trước</span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button className='px-4 py-2 bg-yellow-800 text-white rounded text-xs font-medium hover:bg-yellow-900 transition'>
                    ❤️ Theo dõi
                  </button>
                  <button className='px-4 py-2 bg-stone-100 text-yellow-800 border border-yellow-800 rounded text-xs font-medium hover:bg-stone-50 transition'>
                    💬 Chat ngay
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className='grid grid-cols-6 gap-4 mb-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                    <span className='text-lg'>📦</span>
                  </div>
                  <div>
                    <p className='text-gray-500 text-xs'>Sản phẩm</p>
                    <p className='text-yellow-800 text-sm font-bold'>{shop?.totalProducts ?? shopProducts.length}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                    <span className='text-lg'>👥</span>
                  </div>
                  <div>
                    <p className='text-gray-500 text-xs'>Đang theo dõi</p>
                    <p className='text-yellow-800 text-sm font-bold'>8.3k</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                    <span className='text-lg'>👨</span>
                  </div>
                  <div>
                    <p className='text-gray-500 text-xs'>Người theo dõi</p>
                    <p className='text-yellow-800 text-sm font-bold'>12.5k</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                    <span className='text-lg'>⭐</span>
                  </div>
                  <div>
                    <p className='text-gray-500 text-xs'>Đánh giá</p>
                    <p className='text-yellow-800 text-sm font-bold'>{shop?.rating ? `${(shop.rating).toFixed(1)}` : 'N/A'}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                    <span className='text-lg'>⚡</span>
                  </div>
                  <div>
                    <p className='text-gray-500 text-xs'>Tỷ lệ phản hồi</p>
                    <p className='text-lime-700 text-sm font-bold'>98%</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                    <span className='text-lg'>📅</span>
                  </div>
                  <div>
                    <p className='text-gray-500 text-xs'>Tham gia</p>
                    <p className='text-gray-700 text-sm font-bold'>28/7/2023</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='bg-gray-50 rounded-lg p-3'>
                <p className='text-gray-700 text-xs leading-relaxed'>
                  {shop?.description || 'Chuyên cung cấp đồ nội thất gỗ tự nhiên cao cấp với thiết kế hiện đại và sang trọng. Cam kết 100% gỗ tự nhiên, bảo hành dài hạn, giao hàng toàn quốc.'}
                </p>
                <p className='text-gray-600 text-xs mt-2'>
                  📍 {shop?.defaultPickupAddress || 'Đà Nẵng'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className='bg-white rounded-t-lg border-b border-gray-200 flex gap-6 px-6 py-3'>
          <button
            onClick={() => setActiveTab('products')}
            className='pb-3 font-medium text-sm transition-colors'
            style={{
              color: activeTab === 'products' ? '#8B5A3C' : '#9CA3AF',
              borderBottom: activeTab === 'products' ? '2px solid #8B5A3C' : 'none'
            }}
          >
            Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className='pb-3 font-medium text-sm transition-colors'
            style={{
              color: activeTab === 'reviews' ? '#8B5A3C' : '#9CA3AF',
              borderBottom: activeTab === 'reviews' ? '2px solid #8B5A3C' : 'none'
            }}
          >
            Đánh giá
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className='pb-3 font-medium text-sm transition-colors'
            style={{
              color: activeTab === 'info' ? '#8B5A3C' : '#9CA3AF',
              borderBottom: activeTab === 'info' ? '2px solid #8B5A3C' : 'none'
            }}
          >
            Thông tin
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className='flex gap-6 bg-white rounded-b-lg p-6'>
          {/* LEFT SIDEBAR */}
          <aside className='w-48 flex-shrink-0'>
            <div>
              {/* Categories */}
              <div className='mb-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <span className='text-lg'>📁</span>
                  <h3 className='font-bold text-sm text-yellow-800'>Danh mục sản phẩm</h3>
                </div>
                <div className='space-y-2'>
                  <button
                    key='all'
                    onClick={() => setSelectedCategory('all')}
                    className='w-full text-left text-xs py-2 px-3 rounded-lg transition-all font-medium'
                    style={{
                      background: selectedCategory === 'all' ? '#FEF3C7' : 'transparent',
                      color: selectedCategory === 'all' ? '#8B5A3C' : '#374151',
                    }}
                  >
                    Tất cả sản phẩm
                    <span className='float-right text-gray-500'>({shopProducts.length})</span>
                  </button>
                  {rootCategories.map(category => (
                    <button
                      key={category.categoryId}
                      onClick={() => setSelectedCategory(category.categoryId)}
                      className='w-full text-left text-xs py-2 px-3 rounded-lg transition-all font-medium'
                      style={{
                        background: selectedCategory === category.categoryId ? '#FEF3C7' : 'transparent',
                        color: selectedCategory === category.categoryId ? '#8B5A3C' : '#374151',
                      }}
                    >
                      {category.name}
                      <span className='float-right text-gray-500'>({shopProducts.filter(p => p.categoryName === category.name).length})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className='flex-1'>
            {/* Header */}
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-bold text-stone-800'>Sản phẩm</h2>
                <p className='text-xs text-gray-600 mt-1'>Tìm thấy {filteredProducts.length} sản phẩm</p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-600'>Sắp xếp:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className='text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none'
                  style={{ color: '#1F2937' }}
                >
                  <option value='popular'>Phổ biến</option>
                  <option value='newest'>Mới nhất</option>
                  <option value='bestseller'>Bán chạy</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className='grid grid-cols-4 gap-4'>
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                  >
                    {/* Image */}
                    <div className='relative w-full aspect-square bg-gray-100 overflow-hidden'>
                      {product.thumbnailUrl ? (
                        <img 
                          src={product.thumbnailUrl} 
                          alt={product.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-gray-300 text-2xl'>📷</div>
                      )}
                      
                      {/* Discount Badge */}
                      <div className='absolute top-2 right-2 bg-yellow-800 text-white px-2 py-1 rounded text-xs font-bold'>
                        -{Math.floor(Math.random() * 30)}%
                      </div>

                      {/* Freeship Badge */}
                      <div className='absolute bottom-2 left-2 bg-lime-700 text-white px-2 py-1 rounded text-xs font-bold'>
                        FREESHIP
                      </div>
                    </div>

                    {/* Info */}
                    <div className='p-2'>
                      <h3 className='text-xs font-medium text-gray-900 line-clamp-2 mb-1'>
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className='flex items-center gap-1 mb-2'>
                        <span className='text-xs font-bold text-yellow-800'>{currency(product.price)}</span>
                        <span className='text-xs text-gray-400 line-through'>{currency(product.originalPrice)}</span>
                      </div>

                      {/* Rating */}
                      <div className='flex items-center gap-1 text-xs'>
                        <span className='text-yellow-400'>⭐</span>
                        <span className='text-gray-700 font-medium'>{product.rating}</span>
                        <span className='text-gray-500'>({product.reviewCount})</span>
                        <span className='text-gray-500 ml-auto'>Đã bán {product.soldCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <p className='text-gray-500'>Không tìm thấy sản phẩm nào</p>
                <button
                  onClick={handleResetFilters}
                  className='mt-4 px-4 py-2 rounded text-xs font-medium'
                  style={{ background: '#FCD34D', color: '#8B5A3C' }}
                >
                  Xóa lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
