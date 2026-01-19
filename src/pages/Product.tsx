import React from 'react'
import { Link, useParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { products } from '../data/mockProducts'
import { useCart } from '../store/cartStore'

const galleryPresets = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505691938897-99c9f3ee6b1c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505692092197-6a20fae7edbf?auto=format&fit=crop&w=1200&q=80'
]

const specificationList = [
  { label: 'Kích thước', value: 'Dài 180cm x Rộng 90cm x Cao 75cm' },
  { label: 'Chất liệu', value: 'Gỗ sồi trắng Bắc Mỹ, phủ dầu thân thiện' },
  { label: 'Bảo hành', value: '24 tháng tại xưởng Woodify Studio' },
  { label: 'Tải trọng', value: 'Lên đến 180kg' },
  { label: 'Hoàn thiện', value: 'Sơn mờ chống ẩm, chống trầy xước' },
  { label: 'Phụ kiện', value: 'Tặng kèm bộ vệ sinh và lót chân bàn' }
]

type Review = {
  id: string
  author: string
  rating: number
  date: string
  content: string
  media?: string
}

const reviewEntries: Review[] = [
  {
    id: 'rv1',
    author: 'Lan Anh',
    rating: 5,
    date: '02/01/2026',
    content: 'Bàn gỗ rất chắc chắn, màu sơn chuẩn như ảnh. Nhân viên hỗ trợ phối đồ cực nhiệt tình.',
    media: 'https://images.unsplash.com/photo-1505692794400-52d174e35270?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rv2',
    author: 'Quốc Huy',
    rating: 4,
    date: '27/12/2025',
    content: 'Giao hàng đúng hẹn, có sẵn hướng dẫn bảo quản. Chân bàn hơi cao hơn mô tả nhưng vẫn ổn.'
  },
  {
    id: 'rv3',
    author: 'Trâm Lê',
    rating: 5,
    date: '18/12/2025',
    content: 'Thiết kế tối giản, hợp với không gian Bắc Âu của nhà mình. Sẽ ủng hộ thêm tủ cùng bộ.',
    media: 'https://images.unsplash.com/photo-1505692794400-52d174e35270?auto=format&fit=crop&w=600&q=80'
  }
]

const reviewFilters = ['Tất cả', '5 sao', '4 sao', '3 sao', 'Có ảnh']
const colorOptions = ['Walnut nâu', 'Natural sồi', 'Đen smoked']
const vouchers = ['Giảm 5% đơn từ 3.000.000₫', 'Freeship toàn bộ HCM', 'Tặng bộ vệ sinh gỗ']

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const prod = products.find(p => p.id === id)
  const add = useCart(state => state.add)

  const ratingValue = 4.8
  const totalReviews = 128
  const totalPurchased = 360

  const [selectedImage, setSelectedImage] = React.useState(galleryPresets[0])
  const [selectedColor, setSelectedColor] = React.useState(colorOptions[0])
  const [quantity, setQuantity] = React.useState(1)
  const [activeReviewFilter, setActiveReviewFilter] = React.useState(reviewFilters[0])

  React.useEffect(() => {
    setSelectedImage(galleryPresets[0])
    setSelectedColor(colorOptions[0])
    setQuantity(1)
  }, [id])

  const suggestionSections = React.useMemo(() => (
    [
      {
        id: 'shop',
        title: 'Các sản phẩm khác của Woodify Studio',
        items: products.map((item, index) => ({
          key: `${item.id}-shop-${index}`,
          targetId: item.id,
          title: item.title,
          price: item.price
        }))
      },
      {
        id: 'related',
        title: 'Có thể bạn sẽ thích',
        items: products.map((item, index) => ({
          key: `${item.id}-rel-${index}`,
          targetId: item.id,
          title: `${item.title} phiên bản studio`,
          price: item.price + (index + 1) * 250000
        }))
      }
    ]
  ), [])

  const filteredReviews = React.useMemo(() => {
    if (activeReviewFilter === 'Tất cả') return reviewEntries
    if (activeReviewFilter === 'Có ảnh') {
      return reviewEntries.filter(review => Boolean(review.media))
    }
    const star = Number(activeReviewFilter[0])
    return Number.isFinite(star) ? reviewEntries.filter(review => Math.round(review.rating) === star) : reviewEntries
  }, [activeReviewFilter])

  if (!prod) {
    return (
      <div className='product-page product-page--empty'>
        <p>Không tìm thấy sản phẩm.</p>
        <Link to='/catalog' className='home__action-primary'>Quay lại catalog</Link>
      </div>
    )
  }

  const originalPrice = Math.round(prod.price * 1.2)
  const saving = originalPrice - prod.price

  const handleAddToCart = () => {
    add({ id: prod.id, title: `${prod.title} - ${selectedColor}`, price: prod.price, qty: quantity })
  }

  const handleBuyNow = () => {
    handleAddToCart()
  }

  return (
    <div className='product-page'>
      <header className='product-page__top'>
        <NavBar />
      </header>

      <main className='product-page__content'>
        <section className='product-hero'>
          <div className='product-media'>
            <div className='product-media__main'>
              <span className='product-media__badge'>Ưu đãi trong tuần</span>
              <img src={selectedImage} alt={`Góc nhìn của ${prod.title}`} />
              <div className='product-media__shipping'>
                <p>Giao nhanh 48h nội thành</p>
                <span>Đổi trả 7 ngày · Bảo hành tại nhà</span>
              </div>
            </div>

            <div className='product-media__thumbs'>
              {galleryPresets.map(image => (
                <button
                  key={image}
                  type='button'
                  className={selectedImage === image ? 'product-media__thumb active' : 'product-media__thumb'}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt='Ảnh phụ của sản phẩm' />
                </button>
              ))}
            </div>
          </div>

          <div className='product-purchase'>
            <p className='product-pill'>Woodify Studio · Sản phẩm thủ công</p>
            <h1>{prod.title}</h1>
            <p className='product-subtitle'>{prod.description}</p>

            <div className='product-rating'>
              <div className='product-rating__stars'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className={index < Math.round(ratingValue) ? 'filled' : ''}>&#9733;</span>
                ))}
              </div>
              <strong>{ratingValue.toFixed(1)}/5</strong>
              <span>({totalReviews}+ đánh giá)</span>
              <span>· {totalPurchased}+ lượt mua</span>
            </div>

            <div className='product-price'>
              <strong>{prod.price.toLocaleString('vi-VN')} VND</strong>
              <del>{originalPrice.toLocaleString('vi-VN')} VND</del>
              <span className='product-price__label'>Tiết kiệm {saving.toLocaleString('vi-VN')} VND</span>
            </div>

            <div className='product-vouchers'>
              {vouchers.map(voucher => (
                <button key={voucher} type='button' className='product-voucher'>{voucher}</button>
              ))}
            </div>

            <div className='product-meta'>
              <div>
                <p>Vận chuyển</p>
                <strong>Freeship toàn quốc</strong>
              </div>
              <div>
                <p>Bảo hành</p>
                <strong>24 tháng tận nơi</strong>
              </div>
              <div>
                <p>Tư vấn</p>
                <strong>Stylist 1:1 miễn phí</strong>
              </div>
            </div>

            <div className='product-options'>
              <div>
                <p className='product-label'>Phân loại theo màu</p>
                <div className='product-options__colors'>
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type='button'
                      className={selectedColor === color ? 'active' : ''}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className='product-quantity'>
                <p className='product-label'>Số lượng</p>
                <div className='product-quantity__control'>
                  <button type='button' onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                  <span>{quantity}</span>
                  <button type='button' onClick={() => setQuantity(prev => Math.min(10, prev + 1))}>+</button>
                </div>
              </div>
            </div>

            <div className='product-cta'>
              <button type='button' className='product-cta__secondary' onClick={handleAddToCart}>Thêm vào giỏ</button>
              <button type='button' className='product-cta__primary' onClick={handleBuyNow}>Mua ngay</button>
            </div>
          </div>
        </section>

        <section className='product-details'>
          <div className='product-section-heading'>
            <h2>Thông tin chi tiết</h2>
            <p>Thông số được Woodify xác minh cùng xưởng sản xuất, giúp bạn yên tâm khi mua sắm.</p>
          </div>
          <dl className='product-specs'>
            {specificationList.map(spec => (
              <React.Fragment key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

        <section className='product-reviews'>
          <div className='product-section-heading'>
            <h2>Đánh giá sản phẩm</h2>
            <p>Điểm trung bình {ratingValue.toFixed(1)}/5 từ {totalReviews}+ lượt đánh giá thực tế.</p>
          </div>

          <div className='product-reviews__summary'>
            <div>
              <strong>{ratingValue.toFixed(1)}</strong>
              <div className='product-rating__stars product-rating__stars--large'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className={index < Math.round(ratingValue) ? 'filled' : ''}>&#9733;</span>
                ))}
              </div>
              <span>{totalReviews}+ đánh giá</span>
            </div>

            <div className='product-reviews__filters'>
              {reviewFilters.map(filter => (
                <button
                  key={filter}
                  type='button'
                  className={activeReviewFilter === filter ? 'active' : ''}
                  onClick={() => setActiveReviewFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className='product-reviews__list'>
            {filteredReviews.map(review => (
              <article key={review.id} className='product-review'>
                <header>
                  <strong>{review.author}</strong>
                  <span>{review.date}</span>
                </header>
                <div className='product-rating__stars product-rating__stars--compact'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className={index < review.rating ? 'filled' : ''}>&#9733;</span>
                  ))}
                </div>
                <p>{review.content}</p>
                {review.media && (
                  <div className='product-review__media'>
                    <img src={review.media} alt={`Khách hàng ${review.author}`} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className='product-suggestions'>
          {suggestionSections.map(section => (
            <div key={section.id} className='product-suggestions__section'>
              <div className='product-suggestions__header'>
                <div>
                  <p className='product-eyebrow'>Gợi ý mua thêm</p>
                  <h3>{section.title}</h3>
                </div>
                <Link to='/catalog'>Xem tất cả</Link>
              </div>
              <div className='product-suggestions__list'>
                {section.items.map((item, index) => (
                  <article key={item.key} className='product-suggestion-card'>
                    <Link to={`/product/${item.targetId}`} className='product-suggestion-card__image'>
                      <img src={galleryPresets[index % galleryPresets.length]} alt={`Gợi ý cho ${item.title}`} />
                    </Link>
                    <div className='product-suggestion-card__body'>
                      <Link to={`/product/${item.targetId}`}>{item.title}</Link>
                      <div className='product-rating product-rating--compact'>
                        <div className='product-rating__stars product-rating__stars--compact'>
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <span key={starIndex} className={starIndex < 4 ? 'filled' : ''}>&#9733;</span>
                          ))}
                        </div>
                        <span>4.{(index % 3) + 3} · 50+ đánh giá</span>
                      </div>
                      <strong>{item.price.toLocaleString('vi-VN')} VND</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
