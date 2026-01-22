import React from 'react'
import { Link } from 'react-router-dom'

const categories = [
  {
    id: 'decoration',
    title: 'Trang trí & kiến trúc',
    description: 'Tượng gỗ nghệ thuật, chi tiết, kiến trúc độc đáo',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/e2036c533868084ab01ca4ca64dfc9b4d5bcd6e8?width=1074'
  },
  {
    id: 'furniture',
    title: 'Nội thất đơn giản',
    description: 'Bàn, ghế, kệ thiết kế tinh gọn, hiện đại',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/e2036c533868084ab01ca4ca64dfc9b4d5bcd6e8?width=1074'
  }
]

export default function CategoryShowcase() {
  return (
    <section className="py-8 px-[60px] lg:px-10 md:px-5">
      <div className="text-center mb-8">
        <h2 className="font-['Inter'] text-[28px] font-extrabold text-black m-0 mb-4">
          Danh mục sản phẩm
        </h2>
        <p className="font-['Inter'] text-[15px] font-normal text-black m-0 leading-[1.55]">
          Khám phá bộ sưu tập đa đạng từ nghệ thuật trang trí đến nội thất thiết thực
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-1">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/catalog?category=${category.id}`}
            className="relative h-[350px] rounded-lg overflow-hidden no-underline group md:h-[400px]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(25,33,61,0.5)] to-[#6C5B50] z-[1]" />
            <img 
              src={category.image} 
              alt={category.title}
              className="w-full h-[250px] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-[35px] z-[2]">
              <h3 className="font-['Inter'] text-2xl font-bold text-white m-0 mb-2">
                {category.title}
              </h3>
              <p className="font-['Inter'] text-[15px] font-light text-white m-0 mb-4 leading-[1.33]">
                {category.description}
              </p>
              <span className="inline-flex items-center gap-3 font-['Inter'] text-xl font-semibold text-[#BE9C73] group-hover:opacity-80 transition-opacity">
                Khám phá ngay
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M13.75 22L11.825 19.3417L16.7063 12.8333H0V9.16667H16.7063L11.825 2.65833L13.75 0L22 11L13.75 22Z" fill="currentColor"/>
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
