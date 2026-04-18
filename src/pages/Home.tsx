import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import HeroSection from '../components/home/HeroSection'
import FeaturedCategories from '../components/home/FeaturedCategories'
import ProductCard from '../components/home/ProductCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { imageService, productMasterService, queryKeys } from '@/services'
import { ROUTES } from '@/constants'

export default function Home() {
  const [activeSlide, setActiveSlide] = React.useState(0)
  const { user, isLoading: isAuthLoading } = useAuth()

  const showSellerInvite = !isAuthLoading && user?.role !== 'seller'

  const { data: bannerRows = [] } = useQuery({
    queryKey: queryKeys.home.banners(),
    queryFn: () => imageService.listByType('BANNER'),
    staleTime: 2 * 60 * 1000,
  })

  const bannerUrls = React.useMemo(() => {
    return [...bannerRows]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((x) => (x.originalUrl != null ? String(x.originalUrl).trim() : ''))
      .filter((u) => u.length > 0)
  }, [bannerRows])

  const slideCount = bannerUrls.length > 0 ? bannerUrls.length : 1

  React.useEffect(() => {
    setActiveSlide(0)
  }, [bannerUrls.join('|')])

  React.useEffect(() => {
    if (slideCount <= 1) return
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount)
    }, 7000)
    return () => window.clearInterval(interval)
  }, [slideCount])

  const { data: publishedProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['published-products', 'home-bestseller'],
    queryFn: () => productMasterService.getPublishedProducts(),
  })

  const bestSellerProducts = React.useMemo(() => {
    return publishedProducts.slice(0, 4).map(p => ({
      id: p.productId,
      name: p.name,
      price: p.price,
      originalPrice: undefined as number | undefined,
      rating: p.averageRating ?? 0,
      soldCount: 0,
      image:
        p.thumbnailUrl ??
        'https://api.builder.io/api/v1/image/assets/TEMP/2b187d7da259323f608b11efa987b977ee1bdd99?width=704',
      storeName: p.shopName ?? undefined,
    }))
  }, [publishedProducts])

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen bg-[#E3DCC8] shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative overflow-x-hidden">
        <HeroSection bannerUrls={bannerUrls} activeSlide={activeSlide} onSlideChange={setActiveSlide} />

        <main className="pt-0">
          <FeaturedCategories />

          <section className="py-10 px-[60px] lg:py-8 lg:px-10 sm:py-6 sm:px-4">
            <h2 className="font-['Inter'] text-[28px] font-extrabold text-black text-center m-0 mb-8 sm:text-[22px] sm:mb-6">
              Sản phẩm mới
            </h2>
            
            <div className="grid grid-cols-4 gap-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
              {isProductsLoading ? null : bestSellerProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>

          {showSellerInvite && (
            <section className="px-[60px] pb-12 lg:px-10 sm:px-4">
              <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#1b140d] via-[#4a2e1a] to-[#b4723c] px-12 py-12 text-white shadow-[0_35px_80px_rgba(61,37,14,0.35)] lg:px-10 sm:px-6 sm:py-10">
                <div className="absolute -right-6 -top-6 hidden h-48 w-48 rounded-full bg-white/10 blur-3xl lg:block" aria-hidden="true" />
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Woodify Seller Center</p>
                  <h3 className="mt-4 text-[34px] font-extrabold leading-snug text-white sm:text-[26px]">
                    Biến xưởng mộc của bạn thành thương hiệu nổi bật.
                  </h3>
                  <p className="mt-3 text-base text-white/80 sm:text-sm">
                    Đăng ký mở shop để sử dụng công cụ quản lý đơn, báo cáo tăng trưởng và đội ngũ hỗ trợ độc quyền dành riêng cho nhà bán hàng trên Woodify.
                  </p>
                  <ul className="mt-6 grid grid-cols-3 gap-4 text-sm text-white/80 sm:grid-cols-1">
                    <li className="rounded-2xl border border-white/20 px-4 py-3">Bảng điều khiển thời gian thực</li>
                    <li className="rounded-2xl border border-white/20 px-4 py-3">Ưu đãi phí vận chuyển</li>
                    <li className="rounded-2xl border border-white/20 px-4 py-3">Đội ngũ tư vấn 1:1</li>
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to={ROUTES.SELLER_REGISTRATION}
                      className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#2f1f12] transition hover:-translate-y-0.5 hover:bg-white/90"
                    >
                      Đăng ký mở shop
                    </Link>
                    <Link
                      to={ROUTES.SELLER}
                      className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-white"
                    >
                      Khám phá trung tâm Seller
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
