import React from 'react'
import { Link } from 'react-router-dom'

/** Ảnh dự phòng khi API chưa có banner BANNER hoặc lỗi tải */
const FALLBACK_HERO_IMAGE =
  'https://api.builder.io/api/v1/image/assets/TEMP/f82779e269fd43005091ca94ff7a635eded6adfc?width=2542'

interface HeroSectionProps {
  /** URL từ GET /api/product/images/type/BANNER (originalUrl), đã sort */
  bannerUrls: string[]
  activeSlide?: number
  onSlideChange?: (index: number) => void
}

export default function HeroSection({
  bannerUrls,
  activeSlide = 0,
  onSlideChange,
}: HeroSectionProps) {
  const slides = bannerUrls.length > 0 ? bannerUrls : [FALLBACK_HERO_IMAGE]
  const safeIndex = slides.length > 0 ? activeSlide % slides.length : 0
  const currentSrc = slides[safeIndex] ?? FALLBACK_HERO_IMAGE

  return (
    <section className="relative w-full h-[500px]">
      <img
        key={currentSrc}
        className="w-full h-full object-cover"
        src={currentSrc}
        alt="Woodify Hero - Nội thất gỗ Việt Nam"
      />
      
      <div className="absolute left-[60px] top-[140px] lg:left-10 md:left-5 md:top-[150px]">
        <div className="w-[300px] p-6 px-7 bg-[#DB814C]/50 rounded-[14px] md:w-[280px] md:p-5 md:px-6">
          <h1 className="font-['Inria_Sans'] text-[28px] font-bold text-white drop-shadow-[4px_3px_3px_rgba(0,0,0,0.5)] leading-[1.2] m-0 mb-3 md:text-2xl">
            Where enduring quality meets modern design
          </h1>
          <p className="font-['Inria_Sans'] text-lg font-light text-white m-0 leading-[1.4] md:text-base">
            Explore the endless beauty of Vietnamese wood
          </p>
        </div>
        
        <Link 
          to="/catalog" 
          className="inline-flex items-center justify-center w-[110px] h-8 mt-2 ml-[95px] md:ml-20 bg-[#DB814C] rounded-xl text-white font-['Inria_Sans'] text-[13px] font-bold no-underline hover:bg-[#C46E3D] transition-colors"
        >
          Discover now
        </Link>
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-[18px] left-1/2 flex -translate-x-1/2 gap-[19px] lg:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className="relative h-[7px] w-[167px] cursor-pointer overflow-hidden rounded-[10px] border-none bg-white/20 p-0 lg:w-[120px] md:w-[60px]"
              onClick={() => onSlideChange?.(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`absolute left-0 top-0 h-full rounded-[10px] bg-black/55 transition-[width] duration-300 ${
                  index === safeIndex ? 'w-[76%]' : 'w-0'
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
