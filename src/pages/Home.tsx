import React from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/home/HeroSection'
import FeaturedCategories from '../components/home/FeaturedCategories'
import ProductCard from '../components/home/ProductCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/constants'

const bestSellerProducts = [
  {
    id: '1',
    name: 'Ghế Gỗ Hiện Đại',
    price: 2500000,
    originalPrice: 3200000,
    rating: 4.5,
    soldCount: 120,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2b187d7da259323f608b11efa987b977ee1bdd99?width=704'
  },
  {
    id: '2',
    name: 'Sofa Cao Cấp',
    price: 15000000,
    originalPrice: 18500000,
    rating: 4.8,
    soldCount: 85,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/369d702115de7b45039a91da86b50057525cfb24?width=704'
  },
  {
    id: '3',
    name: 'Bàn Gỗ Tự Nhiên',
    price: 4800000,
    originalPrice: 5900000,
    rating: 4.5,
    soldCount: 95,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2b187d7da259323f608b11efa987b977ee1bdd99?width=704'
  },
  {
    id: '4',
    name: 'Giường Ngủ Sang Trọng',
    price: 12000000,
    originalPrice: 14250000,
    rating: 4.6,
    soldCount: 90,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/9aab162ca8024a2ec4cc5921588be408d63802cc?width=704'
  }
]

const specialOfferProducts = [
  {
    id: '5',
    name: 'Tủ Gỗ Cao Cấp',
    price: 8500000,
    originalPrice: 10200000,
    rating: 4.9,
    soldCount: 75,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/e8cfe9b919e7a17eb0525e495b471ff6ed38629a?width=704'
  },
  {
    id: '6',
    name: 'Kệ Sách Gỗ Óc Chó',
    price: 6200000,
    originalPrice: 7500000,
    rating: 4.7,
    soldCount: 65,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/369d702115de7b45039a91da86b50057525cfb24?width=704'
  },
  {
    id: '7',
    name: 'Bàn Làm Việc Hiện Đại',
    price: 3500000,
    originalPrice: 4800000,
    rating: 4.6,
    soldCount: 110,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2b187d7da259323f608b11efa987b977ee1bdd99?width=704'
  },
  {
    id: '8',
    name: 'Đèn Trang Trí Vintage',
    price: 1800000,
    originalPrice: 2500000,
    rating: 4.8,
    soldCount: 125,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/9aab162ca8024a2ec4cc5921588be408d63802cc?width=704'
  }
]

export default function Home() {
  const [activeSlide, setActiveSlide] = React.useState(0)
  const { user, isLoading: isAuthLoading } = useAuth()

  const showSellerInvite = !isAuthLoading && user?.role !== 'seller'

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 5)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen bg-[#E3DCC8] shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative overflow-x-hidden">
        <HeroSection 
          activeSlide={activeSlide}
          totalSlides={5}
          onSlideChange={setActiveSlide}
        />

        <main className="pt-0">
          <FeaturedCategories />

          <section className="py-10 px-[60px] lg:py-8 lg:px-10 sm:py-6 sm:px-4">
            <h2 className="font-['Inter'] text-[28px] font-extrabold text-black text-center m-0 mb-8 sm:text-[22px] sm:mb-6">
              Sản phẩm bán chạy
            </h2>
            
            <div className="grid grid-cols-4 gap-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
              {bestSellerProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>

          <section className="py-10 px-[60px] lg:py-8 lg:px-10 sm:py-6 sm:px-4">
            <h2 className="font-['Inter'] text-[28px] font-extrabold text-black text-center m-0 mb-8 sm:text-[22px] sm:mb-6">
              Ưu đãi đặc biệt
            </h2>
            
            <div className="grid grid-cols-4 gap-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
              {specialOfferProducts.map(product => (
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
                      to={ROUTES.SELLER_REGISTER}
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
