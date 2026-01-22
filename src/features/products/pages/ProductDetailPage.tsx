import React from 'react'
import { useParams } from 'react-router-dom'
import { useProduct } from '../hooks'
import { Button } from '@/components'
import './products.css'

/**
 * Product detail page
 * TODO: Migrate full implementation from pages/Product.tsx
 */
export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, error } = useProduct(id || '')

  if (isLoading) {
    return (
      <div className="product-page">
        <div className="product-loading">Đang tải thông tin sản phẩm...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-page">
        <div className="product-error">Không thể tải thông tin sản phẩm.</div>
      </div>
    )
  }

  return (
    <div className="product-page">
      <div className="product-detail">
        <div className="product-detail__gallery">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="product-detail__main-image"
          />
        </div>

        <div className="product-detail__info">
          <h1 className="product-detail__title">{product.title}</h1>
          
          <div className="product-detail__meta">
            <span className="product-detail__species">{product.species}</span>
            <span className="product-detail__grade">Grade: {product.grade}</span>
          </div>

          <p className="product-detail__price">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price)}
            /{product.unit}
          </p>

          <p className="product-detail__description">{product.description}</p>

          <div className="product-detail__specs">
            <h3>Thông số kỹ thuật</h3>
            <dl>
              <dt>Độ ẩm</dt>
              <dd>{product.moisture}</dd>
              <dt>Kích thước</dt>
              <dd>
                {product.dimensions.length} x {product.dimensions.width} x{' '}
                {product.dimensions.thickness} {product.dimensions.unit}
              </dd>
            </dl>
          </div>

          <div className="product-detail__actions">
            <Button variant="primary" size="lg">
              Thêm vào giỏ hàng
            </Button>
            <Button variant="outline" size="lg">
              Liên hệ nhà cung cấp
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
