import React from 'react'
import { Link } from 'react-router-dom'

export interface ProductionCardProduct {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  badge?: string
  tags?: string[]
  thumbnailUrl?: string
  shopName?: string | null
  location?: string
  rating?: number
  reviewCount?: number
  soldCount?: number
  discount?: number
  isFeatured?: boolean
  hasFreeship?: boolean
}

interface ProductionCardProps {
  product: ProductionCardProduct
  onCardClick?: () => void
}

export default function ProductionCard({ product, onCardClick }: ProductionCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!onCardClick) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onCardClick()
    }
  }

  const rating = product.rating || 4.8
  const reviewCount = product.reviewCount || 234

  return (
    <article
      className='production-card'
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className='production-card__thumbnail'>
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className='production-card__thumbnail-img'
            loading='lazy'
          />
        ) : (
          <div className='production-card__thumbnail-placeholder'>
            <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' aria-hidden='true'>
              <rect x='3' y='3' width='18' height='18' rx='3' />
              <circle cx='8.5' cy='8.5' r='1.5' />
              <path d='m21 15-5-5L5 21' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </div>
        )}
        {product.discount && (
          <span className='production-card__discount-badge'>{-Math.round(product.discount)}%</span>
        )}
        <div className='production-card__badges'>
          {product.isFeatured && (
            <span className='production-card__badge production-card__badge--featured'>
              ⭐ Nổi bật
            </span>
          )}
          {product.hasFreeship && (
            <span className='production-card__badge production-card__badge--freeship'>
              Freeship
            </span>
          )}
        </div>
      </div>

      <div className='production-card__content'>
        <h3 className='production-card__title'>{product.title}</h3>
        
        <div className='production-card__price-section'>
          <strong className='production-card__price'>
            {product.price.toLocaleString('vi-VN')}₫
          </strong>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className='production-card__original-price'>
              {product.originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        <div className='production-card__meta'>
          <div className='production-card__rating'>
            <span className='production-card__rating-value'>⭐ {rating}</span>
            <span className='production-card__review-count'>({reviewCount})</span>
            <span className='production-card__sold'>Đã bán {product.soldCount || 456}</span>
          </div>
        </div>

        <div className='production-card__seller'>
          <div className='production-card__seller-row'>
            <span className='production-card__seller-icon'>🏪</span>
            <span className='production-card__seller-name'>{product.shopName || 'Shop'}</span>
          </div>
          <div className='production-card__seller-row'>
            <span className='production-card__location-icon'>📍</span>
            <span className='production-card__location'>{product.location || 'Hà Nội'}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
