import React from 'react'
import { Link } from 'react-router-dom'

export interface ProductionCardProduct {
  id: string
  title: string
  description: string
  price: number
  badge?: string
  tags?: string[]
  thumbnailUrl?: string
  shopName?: string | null
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

  return (
    <article
      className='production-card'
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick}
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
        {product.badge && <span className='production-card__badge'>{product.badge}</span>}
      </div>

      <div className='production-card__header'>
        <h3>{product.title}</h3>
        {product.shopName && (
          <p className='production-card__shop'>{product.shopName}</p>
        )}
        <p className='production-card__description'>{product.description}</p>
      </div>

      {product.tags && product.tags.length > 0 && (
        <ul className='production-card__tags'>
          {product.tags.map(tag => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      <div className='production-card__footer'>
        <div>
          <span className='production-card__price-label'>Giá tham khảo</span>
          <strong>{product.price.toLocaleString('vi-VN')} VND</strong>
        </div>
        <div className='production-card__actions'>
          <Link
            to={`/product/${product.id}`}
            className='home__ghost-btn'
            onClick={event => event.stopPropagation()}
          >
            Chi tiết
          </Link>
          <button
            type='button'
            className='home__action-primary'
            onClick={event => event.stopPropagation()}
          >
            Thêm giỏ
          </button>
        </div>
      </div>
    </article>
  )
}
