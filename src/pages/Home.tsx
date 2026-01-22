import React from 'react'
import Header from '../components/layout/Header'
import HeroSection from '../components/home/HeroSection'
import CategoryShowcase from '../components/home/CategoryShowcase'
import FeaturedCategories from '../components/home/FeaturedCategories'
import ProductCard from '../components/home/ProductCard'
import Footer from '../components/layout/Footer'

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
  },
  {
    id: '5',
    name: 'Tủ Gỗ Cao Cấp',
    price: 8500000,
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
  }
]

export default function Home() {
  const [activeSlide, setActiveSlide] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 5)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen bg-[#E3DCC8] shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative overflow-x-hidden">
        <Header cartItemCount={0} />
        
        <HeroSection 
          activeSlide={activeSlide}
          totalSlides={5}
          onSlideChange={setActiveSlide}
        />

        <main className="pt-0">
          <CategoryShowcase />
          
          <FeaturedCategories />

          <section className="py-10 px-[60px] lg:py-8 lg:px-10 sm:py-6 sm:px-4">
            <h2 className="font-['Inter'] text-[28px] font-extrabold text-black text-center m-0 mb-8 sm:text-[22px] sm:mb-6">
              Sản phẩm bán chạy
            </h2>
            
            <div className="grid grid-cols-3 gap-6 lg:gap-5 md:grid-cols-2 sm:grid-cols-1">
              {bestSellerProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        </main>
      </div>
      <div className="bg-black w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mb-6 pb-6">
        <Footer />
      </div>
    </>
  )
}
