import React from 'react'
import { useProducts } from '../hooks'
import './products.css'

/**
 * Catalog page - displays list of products with filters
 * TODO: Migrate full implementation from pages/Catalog.tsx
 */
export const CatalogPage: React.FC = () => {
  const { data, isLoading, error } = useProducts()

  if (isLoading) {
    return (
      <div className="catalog-page">
        <div className="catalog-loading">Đang tải sản phẩm...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="catalog-page">
        <div className="catalog-error">Không thể tải sản phẩm. Vui lòng thử lại.</div>
      </div>
    )
  }

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <h1 className="catalog-title">Danh mục sản phẩm</h1>
        <p className="catalog-subtitle">{data?.total || 0} sản phẩm</p>
      </header>

      <div className="catalog-grid">
        {data?.items?.map((product) => (
          <article key={product.id} className="product-card">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="product-card__image"
            />
            <div className="product-card__content">
              <h3 className="product-card__title">{product.title}</h3>
              <p className="product-card__species">{product.species}</p>
              <p className="product-card__price">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(product.price)}
                /{product.unit}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
