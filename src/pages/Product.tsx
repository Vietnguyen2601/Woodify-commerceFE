import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productMasterService, shopService } from '@/services'
import { useCart } from '../store/cartStore'

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
const vouchers = ['Giảm 5% đơn từ 3.000.000₫', 'Freeship toàn bộ HCM', 'Tặng bộ vệ sinh gỗ']

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const add = useCart(state => state.add)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => productMasterService.getProductDetail(id!),
    enabled: !!id,
  })

  const { data: shop } = useQuery({
    queryKey: ['shop', product?.shopId],
    queryFn: () => shopService.getShopById(product!.shopId),
    enabled: !!product?.shopId,
  })

  const activeVersions = React.useMemo(
    () => product?.versions.filter(v => v.isActive) ?? [],
    [product]
  )

  const [selectedVersionId, setSelectedVersionId] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const [activeReviewFilter, setActiveReviewFilter] = React.useState(reviewFilters[0])

  React.useEffect(() => {
    if (activeVersions.length > 0) {
      setSelectedVersionId(activeVersions[0].versionId)
    }
  }, [product])

  const selectedVersion = activeVersions.find(v => v.versionId === selectedVersionId) ?? activeVersions[0]

  const gallery = React.useMemo(() => {
    const productImgs = product?.images.map(i => i.originalUrl) ?? []
    const versionImgs = selectedVersion?.images.map(i => i.originalUrl) ?? []
    const all = [...new Set([...productImgs, ...versionImgs])]
    return all
  }, [product, selectedVersion])

  const [selectedImage, setSelectedImage] = React.useState<string>('')

  React.useEffect(() => {
    if (gallery.length > 0) setSelectedImage(gallery[0])
  }, [gallery])

  const specificationList = selectedVersion ? [
    { label: 'Loại gỗ', value: selectedVersion.woodType },
    { label: 'Kích thước (D×R×C)', value: `${selectedVersion.lengthCm} cm × ${selectedVersion.widthCm} cm × ${selectedVersion.heightCm} cm` },
    { label: 'Trọng lượng', value: `${(selectedVersion.weightGrams / 1000).toFixed(1)} kg` },
    { label: 'Số lượng còn', value: `${selectedVersion.stockQuantity} sản phẩm` },
    { label: 'Danh mục', value: product?.categoryName ?? '—' },
    { label: 'SKU', value: product?.globalSku ?? '—' },
  ] : []

  const suggestionSections = React.useMemo(() => ([
    {
      id: 'shop',
      title: `Sản phẩm từ cùng danh mục${product ? ` "${product.categoryName}"` : ''}`,
      items: [] as { key: string; targetId: string; title: string; price: number }[]
    }
  ]), [product])

  const filteredReviews = React.useMemo(() => {
    if (activeReviewFilter === 'Tất cả') return reviewEntries
    if (activeReviewFilter === 'Có ảnh') return reviewEntries.filter(r => r.media)
    const star = Number(activeReviewFilter[0])
    return Number.isFinite(star) ? reviewEntries.filter(r => Math.round(r.rating) === star) : reviewEntries
  }, [activeReviewFilter])

  const handleAddToCart = () => {
    if (!product || !selectedVersion) return
    add({
      id: product.productId,
      title: `${product.name} – ${selectedVersion.versionName}`,
      price: selectedVersion.price,
      qty: quantity,
    })
  }

  if (isLoading) {
    return (
      <div className='product-page product-page--empty'>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '80px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #7c5c3b', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#7c5c3b', fontSize: 14 }}>Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className='product-page product-page--empty'>
        <p>Không tìm thấy sản phẩm.</p>
        <Link to='/catalog' className='home__action-primary'>Quay lại catalog</Link>
      </div>
    )
  }

  const price = selectedVersion?.price ?? 0
  const originalPrice = Math.round(price * 1.2)
  const saving = originalPrice - price

  return (
    <div className='product-page'>
      <main className='product-page__content'>
        <section className='product-hero'>
          <div className='product-media'>
            <div className='product-media__main'>
              {gallery.length > 0 ? (
                <img src={selectedImage} alt={product.name} />
              ) : (
                <div style={{ width: '100%', height: 400, background: '#f5ede2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8b49a', fontSize: 13 }}>
                  Chưa có ảnh
                </div>
              )}
              <div className='product-media__shipping'>
                <p>Giao nhanh 48h nội thành</p>
                <span>Đổi trả 7 ngày · Bảo hành tại nhà</span>
              </div>
            </div>

            {gallery.length > 1 && (
              <div className='product-media__thumbs'>
                {gallery.map(img => (
                  <button
                    key={img}
                    type='button'
                    className={selectedImage === img ? 'product-media__thumb active' : 'product-media__thumb'}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt='Ảnh phụ của sản phẩm' />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className='product-purchase'>
            <p className='product-pill'>{product.categoryName} · Woodify</p>
            <h1>{product.name}</h1>
            <p className='product-subtitle'>{product.description}</p>

            <div className='product-rating'>
              <div className='product-rating__stars'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < 4 ? 'filled' : ''}>&#9733;</span>
                ))}
              </div>
              <strong>4.0/5</strong>
              <span>(0 đánh giá)</span>
            </div>

            {selectedVersion && (
              <div className='product-price'>
                <strong>{price.toLocaleString('vi-VN')} VND</strong>
                <del>{originalPrice.toLocaleString('vi-VN')} VND</del>
                <span className='product-price__label'>Tiết kiệm {saving.toLocaleString('vi-VN')} VND</span>
              </div>
            )}

            <div className='product-vouchers'>
              {vouchers.map(v => (
                <button key={v} type='button' className='product-voucher'>{v}</button>
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

            {activeVersions.length > 0 && (
              <div className='product-options'>
                <div>
                  <p className='product-label'>Phiên bản</p>
                  <div className='product-options__colors'>
                    {activeVersions.map(v => (
                      <button
                        key={v.versionId}
                        type='button'
                        className={selectedVersionId === v.versionId ? 'active' : ''}
                        onClick={() => setSelectedVersionId(v.versionId)}
                      >
                        {v.versionName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='product-quantity'>
                  <p className='product-label'>Số lượng</p>
                  <div className='product-quantity__control'>
                    <button type='button' onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                    <span>{quantity}</span>
                    <button type='button' onClick={() => setQuantity(prev => Math.min(selectedVersion?.stockQuantity ?? 10, prev + 1))}>+</button>
                  </div>
                </div>
              </div>
            )}

            <div className='product-cta'>
              <button type='button' className='product-cta__secondary' onClick={handleAddToCart}>Thêm vào giỏ</button>
              <button type='button' className='product-cta__primary' onClick={handleAddToCart}>Mua ngay</button>
            </div>
          </div>
        </section>

        {shop && (
          <section className='product-shop'>
            <div className='product-shop__inner'>
              <div className='product-shop__identity'>
                <div className='product-shop__avatar'>
                  {shop.logoUrl
                    ? <img src={shop.logoUrl} alt={shop.name} />
                    : <span>{(shop?.name ?? 'S').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className='product-shop__info'>
                  <h3 className='product-shop__name'>{shop.name}</h3>
                  <div className='product-shop__rating'>
                    <div className='product-rating__stars product-rating__stars--compact'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < Math.round(shop.rating) ? 'filled' : ''}>&#9733;</span>
                      ))}
                    </div>
                    <span>{shop.rating.toFixed(1)} ({shop.reviewCount} đánh giá)</span>
                  </div>
                  <div className='product-shop__stats'>
                    <span><strong>{shop.totalProducts}</strong> Sản phẩm</span>
                    <span className='product-shop__stats-divider' />
                    <span><strong>{shop.totalOrders}</strong> Đơn hàng</span>
                  </div>
                </div>
              </div>
              <div className='product-shop__actions'>
                <Link to={`/shop/${shop.shopId}`} className='product-shop__btn product-shop__btn--outline'>
                  Xem Shop
                </Link>
                <button type='button' className='product-shop__btn product-shop__btn--primary'>
                  Chat ngay
                </button>
              </div>
            </div>
          </section>
        )}

        {specificationList.length > 0 && (
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
        )}

        <section className='product-reviews'>
          <div className='product-section-heading'>
            <h2>Đánh giá sản phẩm</h2>
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          </div>

          <div className='product-reviews__summary'>
            <div>
              <strong>4.0</strong>
              <div className='product-rating__stars product-rating__stars--large'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < 4 ? 'filled' : ''}>&#9733;</span>
                ))}
              </div>
              <span>0 đánh giá</span>
            </div>
            <div className='product-reviews__filters'>
              {reviewFilters.map(f => (
                <button
                  key={f}
                  type='button'
                  className={activeReviewFilter === f ? 'active' : ''}
                  onClick={() => setActiveReviewFilter(f)}
                >
                  {f}
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
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < review.rating ? 'filled' : ''}>&#9733;</span>
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

        {suggestionSections.map(section => (
          section.items.length > 0 && (
            <section key={section.id} className='product-suggestions'>
              <div className='product-suggestions__section'>
                <div className='product-suggestions__header'>
                  <div>
                    <p className='product-eyebrow'>Gợi ý mua thêm</p>
                    <h3>{section.title}</h3>
                  </div>
                  <Link to='/catalog'>Xem tất cả</Link>
                </div>
              </div>
            </section>
          )
        ))}
      </main>
    </div>
  )
}
