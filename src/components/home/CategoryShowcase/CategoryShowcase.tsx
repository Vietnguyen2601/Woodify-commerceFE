import React from 'react'
import { Link } from 'react-router-dom'
import './CategoryShowcase.css'

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
    <section className="category-showcase">
      <div className="category-showcase__header">
        <h2 className="category-showcase__title">Danh mục sản phẩm</h2>
        <p className="category-showcase__subtitle">
          Khám phá bộ sưu tập đa đạng từ nghệ thuật trang trí đến nội thất thiết thực
        </p>
      </div>

      <div className="category-showcase__grid">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/catalog?category=${category.id}`}
            className="category-showcase__card"
          >
            <div className="category-showcase__card-overlay" />
            <img 
              src={category.image} 
              alt={category.title}
              className="category-showcase__card-image"
            />
            <div className="category-showcase__card-content">
              <h3 className="category-showcase__card-title">{category.title}</h3>
              <p className="category-showcase__card-desc">{category.description}</p>
              <span className="category-showcase__card-link">
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
