import React from 'react'

const STORE_META = {
  name: 'Wood Craft Artisans',
  status: 'ACTIVE',
  initials: 'WC'
}

const SUMMARY_CARDS = [
  {
    title: 'Overall Shop Rating',
    primary: '4.8',
    suffix: '/ 5.0',
    helper: '+0.2 vs 30 days ago',
    accent: 'text-yellow-800'
  },
  {
    title: 'Total Reviews',
    primary: '1.248',
    helper: '+12 this week'
  },
  {
    title: 'Order Review Rate',
    primary: '68.5%',
    helper: '+3.2% vs last month'
  },
  {
    title: 'Positive Review Rate',
    primary: '92.3%',
    helper: '4-5 stars'
  }
]

const REVIEW_ALERTS = [
  {
    title: 'Reviews Needing Response',
    description: 'Low-star reviews without seller response',
    value: '8',
    color: 'from-orange-50 to-orange-100',
    action: 'View All'
  },
  {
    title: 'New Reviews',
    description: 'Recent reviews in the last 7 days',
    value: '15',
    color: 'from-blue-50 to-blue-100',
    action: 'View All'
  }
]

const FILTER_TABS = ['All', 'Needs Response', 'Responded']

const RATING_FILTERS = ['5', '4', '3', '2', '1']

interface ReviewItem {
  id: string
  product: string
  sku: string
  image: string
  rating: number
  ratingLabel: string
  content: string
  buyer: string
  date: string
  respondedAt?: string
  sellerResponse?: string
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'WD2401250123',
    product: 'Oak Wood Dining Table',
    sku: '#WD2401250123',
    image: 'https://placehold.co/40',
    rating: 5,
    ratingLabel: '5 stars',
    content: 'Sản phẩm chất lượng tuyệt vời! Gỗ sồi thật, hoàn thiện đẹp, giao hàng nhanh. Rất hài lòng với bàn ăn này.',
    buyer: 'Nguyễn Văn A',
    date: '2026-01-25',
    respondedAt: '2026-01-25 15:30',
    sellerResponse: 'Cảm ơn quý khách đã tin tưởng! Chúc quý khách sử dụng sản phẩm lâu dài.'
  },
  {
    id: 'WD2401240089',
    product: 'Walnut Wood Coffee Table',
    sku: '#WD2401240089',
    image: 'https://placehold.co/40',
    rating: 4,
    ratingLabel: '4 stars',
    content: 'Bàn đẹp, gỗ óc chó màu đẹp. Tuy nhiên giao hàng hơi chậm so với dự kiến.',
    buyer: 'Trần Thị B',
    date: '2026-01-24'
  },
  {
    id: 'WD2401230045',
    product: 'Pine Wood Bookshelf - Large',
    sku: '#WD2401230045',
    image: 'https://placehold.co/40',
    rating: 5,
    ratingLabel: '5 stars',
    content: 'Kệ sách chắc chắn, lắp ráp dễ dàng. Gỗ thông có mùi thơm tự nhiên. Recommended!',
    buyer: 'Lê Văn C',
    date: '2026-01-23',
    respondedAt: '2026-01-24 09:15',
    sellerResponse: 'Cảm ơn anh/chị! Rất vui khi sản phẩm làm hài lòng quý khách.'
  },
  {
    id: 'WD2401220031',
    product: 'Teak Wood Outdoor Chair',
    sku: '#WD2401220031',
    image: 'https://placehold.co/40',
    rating: 2,
    ratingLabel: '2 stars',
    content: 'Ghế bị nứt ở chân, màu sơn không đều. Rất thất vọng với chất lượng.',
    buyer: 'Phạm Thị D',
    date: '2026-01-22'
  },
  {
    id: 'WD2401210018',
    product: 'Mahogany Desk - Executive',
    sku: '#WD2401210018',
    image: 'https://placehold.co/40',
    rating: 5,
    ratingLabel: '5 stars',
    content: 'Bàn làm việc sang trọng, gỗ gụ đẹp, hoàn thiện tỉ mỉ. Xứng đáng với giá tiền!',
    buyer: 'Hoàng Văn E',
    date: '2026-01-21',
    respondedAt: '2026-01-21 16:45',
    sellerResponse: 'Xin cảm ơn! Chúng tôi luôn nỗ lực mang đến sản phẩm chất lượng nhất.'
  }
]

const RatingStars = ({ value }: { value: number }) => (
  <div className='flex items-center gap-1 text-yellow-400'>
    {Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < value ? 'text-yellow-400' : 'text-stone-300'}>
        ★
      </span>
    ))}
  </div>
)

export default function ShopRatingManagement() {
  return (
    <div className='space-y-6'>
      <header className='rounded-3xl border border-yellow-900/20 bg-white px-4 py-3 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-base font-bold text-stone-900'>{STORE_META.name}</p>
            <span className='mt-1 inline-flex items-center rounded-md bg-yellow-800 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white'>
              {STORE_META.status}
            </span>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-500'>
              <span className='text-stone-400'>⌕</span>
              <input
                type='search'
                placeholder='Search orders, products, SKU...'
                className='w-48 border-none bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none'
              />
            </div>
            <div className='flex items-center gap-2 rounded-full bg-yellow-800/10 px-3 py-1 text-xs font-semibold text-yellow-900'>
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-yellow-800 text-white'>{STORE_META.initials}</span>
              Review desk
            </div>
          </div>
        </div>
      </header>

      <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {SUMMARY_CARDS.map(card => (
          <article key={card.title} className='rounded-3xl border border-yellow-800/20 bg-white p-5 shadow-sm'>
            <p className='text-xs text-stone-500'>{card.title}</p>
            <div className='mt-2 flex items-baseline gap-2'>
              <p className={`text-2xl font-semibold ${card.accent ?? 'text-stone-900'}`}>{card.primary}</p>
              {card.suffix && <span className='text-sm text-stone-500'>{card.suffix}</span>}
            </div>
            <p className='mt-1 text-xs text-stone-500'>{card.helper}</p>
          </article>
        ))}
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        {REVIEW_ALERTS.map(alert => (
          <article
            key={alert.title}
            className={`rounded-3xl border border-yellow-800/20 bg-gradient-to-br ${alert.color} p-5 shadow-sm`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-base font-semibold text-stone-900'>{alert.title}</p>
                <p className='text-xs text-stone-500'>{alert.description}</p>
              </div>
              <p className='text-2xl font-bold text-stone-900'>{alert.value}</p>
            </div>
            <button
              type='button'
              className='mt-6 w-full rounded-2xl border border-yellow-800/30 bg-white px-4 py-2 text-xs font-semibold text-stone-900'
            >
              {alert.action}
            </button>
          </article>
        ))}
      </section>

      <section className='space-y-4 rounded-3xl border border-yellow-800/20 bg-white p-5 shadow-sm'>
        <div>
          <h3 className='text-base font-semibold text-stone-900'>Filter Reviews</h3>
        </div>
        <div className='flex flex-wrap gap-3'>
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              type='button'
              className={`rounded-2xl px-4 py-2 text-xs font-semibold ${tab === 'All' ? 'bg-orange-100 text-stone-900' : 'border border-stone-200 text-stone-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='text-xs font-semibold text-stone-600'>Rating:</span>
          <div className='flex flex-wrap gap-2'>
            {RATING_FILTERS.map(star => (
              <button
                key={star}
                type='button'
                className='flex items-center gap-2 rounded-xl border border-yellow-800/20 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-900'
              >
                <span className='text-yellow-600'>★</span>
                {star}
              </button>
            ))}
          </div>
        </div>
        <div className='flex flex-col gap-3 lg:flex-row'>
          <div className='flex flex-1 items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-500'>
            <span className='text-stone-400'>⌕</span>
            <input
              type='search'
              placeholder='Search product name, order code, buyer name...'
              className='flex-1 border-none bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none'
            />
          </div>
          <div className='flex flex-1 items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-500'>
            <span className='text-stone-400'>☰</span>
            <span className='text-xs text-stone-500'>Sort by latest</span>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <button type='button' className='flex-1 rounded-2xl bg-yellow-800 px-4 py-2 text-xs font-semibold text-white'>
            Apply Filters
          </button>
          <button type='button' className='rounded-2xl border border-yellow-800/20 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-900'>
            Reset
          </button>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-yellow-800/20 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h3 className='text-base font-semibold text-stone-900'>Reviews ({REVIEWS.length})</h3>
        </div>
        <div className='space-y-4'>
          {REVIEWS.map(review => (
            <article key={review.id} className='flex flex-col gap-4 border-b border-yellow-800/20 pb-4 last:border-none'>
              <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div className='flex items-center gap-3'>
                  <img src={review.image} alt={review.product} className='h-12 w-12 rounded-lg object-cover' />
                  <div>
                    <p className='text-sm font-semibold text-stone-900'>{review.product}</p>
                    <p className='text-xs text-stone-500'>{review.sku}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <RatingStars value={review.rating} />
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${review.rating <= 2 ? 'bg-rose-600 text-white' : 'bg-yellow-800 text-white'}`}>
                    {review.ratingLabel}
                  </span>
                </div>
              </div>
              <p className='text-sm text-stone-700'>{review.content}</p>
              <div className='flex flex-wrap items-center gap-2 text-[11px] text-stone-500'>
                <span>{review.buyer}</span>
                <span>•</span>
                <span>{review.date}</span>
              </div>
              {review.sellerResponse ? (
                <div className='rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-stone-700'>
                  <p>{review.sellerResponse}</p>
                  {review.respondedAt && <p className='mt-2 text-xs text-stone-500'>Replied: {review.respondedAt}</p>}
                </div>
              ) : (
                <div className='rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600'>
                  No response yet
                </div>
              )}
              <div>
                <button
                  type='button'
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold ${review.sellerResponse ? 'border border-yellow-800/30 bg-stone-100 text-stone-900' : 'bg-yellow-800 text-white'}`}
                >
                  {review.sellerResponse ? 'Edit Reply' : 'Reply'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
