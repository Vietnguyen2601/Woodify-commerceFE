import React from 'react'
import { Link } from 'react-router-dom'

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  soldCount: number
  image: string
  storeName?: string
}

function StarRating({ rating, ratingCount }: { rating: number; ratingCount?: number }) {
  const fullStars = Math.floor(rating)
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path 
            d="M7.68335 1.53003C7.71257 1.471 7.7577 1.42132 7.81365 1.38658C7.86961 1.35184 7.93416 1.33344 8.00002 1.33344C8.06588 1.33344 8.13043 1.35184 8.18638 1.38658C8.24234 1.42132 8.28747 1.471 8.31669 1.53003L9.85669 4.64936C9.95814 4.85468 10.1079 5.0323 10.2931 5.167C10.4783 5.3017 10.6934 5.38944 10.92 5.4227L14.364 5.9267C14.4293 5.93615 14.4906 5.96368 14.541 6.00616C14.5914 6.04865 14.629 6.1044 14.6494 6.1671C14.6698 6.22981 14.6722 6.29697 14.6564 6.36099C14.6406 6.42501 14.6072 6.48333 14.56 6.52936L12.0694 8.9547C11.9051 9.11477 11.7822 9.31235 11.7112 9.53045C11.6403 9.74855 11.6234 9.98062 11.662 10.2067L12.25 13.6334C12.2615 13.6986 12.2545 13.7657 12.2297 13.8272C12.2049 13.8886 12.1633 13.9418 12.1097 13.9807C12.0561 14.0196 11.9927 14.0427 11.9266 14.0473C11.8605 14.0519 11.7945 14.0378 11.736 14.0067L8.65735 12.388C8.4545 12.2815 8.22881 12.2259 7.99969 12.2259C7.77057 12.2259 7.54487 12.2815 7.34202 12.388L4.26402 14.0067C4.20557 14.0376 4.13962 14.0516 4.07365 14.0469C4.00769 14.0422 3.94437 14.0191 3.89088 13.9802C3.8374 13.9413 3.79591 13.8882 3.77112 13.8268C3.74634 13.7655 3.73926 13.6985 3.75069 13.6334L4.33802 10.2074C4.37682 9.98119 4.36001 9.74896 4.28904 9.53073C4.21808 9.31249 4.09509 9.1148 3.93069 8.9547L1.44002 6.53003C1.39242 6.48405 1.35868 6.42563 1.34266 6.36141C1.32664 6.2972 1.32898 6.22978 1.34941 6.16682C1.36983 6.10387 1.40753 6.04793 1.4582 6.00535C1.50888 5.96278 1.57049 5.9353 1.63602 5.92603L5.07935 5.4227C5.30619 5.3897 5.52161 5.30207 5.70708 5.16736C5.89254 5.03264 6.04249 4.85488 6.14402 4.64936L7.68335 1.53003Z" 
            fill={i < fullStars ? '#FFA500' : 'none'}
            stroke={i < fullStars ? '#FFA500' : '#E5E7EB'}
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      ))}
      {ratingCount !== undefined && (
        <span className="font-['Arimo'] text-xs text-[#666] ml-0.5">({ratingCount})</span>
      )}
    </div>
  )
}

function LightningIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M8.66667 1.33301L2 9.33301H8L7.33333 14.6663L14 6.66634H8L8.66667 1.33301Z" 
        fill="white" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  originalPrice, 
  rating, 
  soldCount, 
  image,
  storeName = "Nội thất Vũ Gia"
}: ProductCardProps) {
  const formatPrice = (value: number) => {
    return value.toLocaleString('vi-VN') + 'đ'
  }

  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0

  // Generate a realistic rating count based on sold count
  const ratingCount = Math.floor(soldCount * 0.15) || Math.floor(rating * 4)

  return (
    <Link 
      to={`/product/${id}`} 
      className="flex flex-col rounded-[14px] bg-white overflow-hidden no-underline shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] group"
    >
      {/* Product Image Section */}
      <div className="relative h-[220px] overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        
        {/* Promotional Banner Overlay */}
        {discountPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#FF3B30] h-7 flex items-center justify-between px-3">
            <span className="font-['Arimo'] text-xs font-bold text-white uppercase tracking-wide">
              FREESHIP
            </span>
            <div className="flex items-center gap-1.5">
              <LightningIcon />
              <span className="font-['Arimo'] text-xs font-bold text-white">
                -{discountPercent}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Product Info Section */}
      <div className="p-4 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-['Arimo'] text-sm font-bold text-[#1a1a2e] m-0 leading-[1.4] line-clamp-2 min-h-[2.8em]">
          {name}
        </h3>
        
        {/* Store Name */}
        <p className="font-['Arimo'] text-xs text-[#888] m-0">
          Tại {storeName}
        </p>
        
        {/* Pricing Section */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-['Arimo'] text-xl font-bold text-[#FF3B30] leading-none">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="font-['Arimo'] text-sm font-normal text-[#999] line-through leading-none">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        
        {/* Rating & Sold Section */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-[#f0f0f0]">
          <StarRating rating={rating} ratingCount={ratingCount} />
          <span className="font-['Arimo'] text-xs text-[#666]">Đã bán {soldCount}</span>
        </div>
      </div>
    </Link>
  )
}
