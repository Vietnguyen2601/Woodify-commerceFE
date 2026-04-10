import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productMasterService, shopService } from '@/services'
import { useCart } from '../store/cartStore'
import { ROUTES } from '@/constants/routes'
import AssetIcon from '@/components/AssetIcon'
import chevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'

/** Figma MCP assets — related products (node 108:473) */
const RELATED_IMAGES = {
  chair: 'https://www.figma.com/api/mcp/asset/e76f1283-1a15-45d3-91bd-c5a1198d0d30',
  shelf: 'https://www.figma.com/api/mcp/asset/24850760-516c-4d82-855c-76b6a9593539',
  lamp: 'https://www.figma.com/api/mcp/asset/3505a72d-39c5-40c0-a0c6-cc02508757f9',
  cabinet: 'https://www.figma.com/api/mcp/asset/7463d068-eab7-419c-93d0-6d5992043125',
} as const

const RELATED_ITEMS = [
  { key: 'r1', title: 'Ghế làm việc ergonomic', price: 1_800_000, rating: 4.7, sold: 234, image: RELATED_IMAGES.chair },
  { key: 'r2', title: 'Kệ sách treo tường', price: 980_000, rating: 4.9, sold: 567, image: RELATED_IMAGES.shelf },
  { key: 'r3', title: 'Đèn bàn LED hiện đại', price: 450_000, rating: 4.6, sold: 789, image: RELATED_IMAGES.lamp },
  { key: 'r4', title: 'Tủ hồ sơ 3 ngăn', price: 2_200_000, rating: 4.8, sold: 345, image: RELATED_IMAGES.cabinet },
] as const

const PRODUCT_DETAIL_FALLBACK =
  'Bàn làm việc gỗ óc chó cao cấp với thiết kế hiện đại, tối giản. Được chế tác từ 100% gỗ óc chó tự nhiên, bề mặt xử lý chống trầy xước và chống nước. Phù hợp cho không gian làm việc tại nhà hoặc văn phòng.'

const DISPLAY_RATING = 4.8
const DISPLAY_REVIEW_COUNT = 234
const DISPLAY_SOLD = 456

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

  React.useEffect(() => {
    document.body.classList.add('product-route-bg')
    return () => {
      document.body.classList.remove('product-route-bg')
    }
  }, [])

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
  const [detailTab, setDetailTab] = React.useState<'info' | 'reviews' | 'policy'>('info')

  React.useEffect(() => {
    if (activeVersions.length > 0) {
      setSelectedVersionId(activeVersions[0].versionId)
    }
  }, [activeVersions])

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
      <div className='flex min-h-screen w-full flex-col items-center justify-center bg-transparent px-4'>
        <div className='flex flex-col items-center gap-3 py-20'>
          <div className='h-9 w-9 animate-spin rounded-full border-4 border-[#6C5B50] border-t-transparent' />
          <p className="font-['Inter'] text-sm text-[#5c4a32]">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className='flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-transparent px-4 text-center'>
        <p className="font-['Inter'] text-base text-neutral-700">Không tìm thấy sản phẩm.</p>
        <Link to={ROUTES.CATALOG} className='home__action-primary'>
          Quay lại danh mục
        </Link>
      </div>
    )
  }

  const price = selectedVersion?.price ?? 0
  const originalPrice = Math.round(price * 1.2)
  const saving = originalPrice - price
  const discountPct = originalPrice > 0 ? Math.max(0, Math.round((1 - price / originalPrice) * 100)) : 0
  const shopJoinYear = shop?.createdAt ? new Date(shop.createdAt).getFullYear() : '—'

  const renderStars = (value: number, size: 'md' | 'sm' = 'md') => {
    const full = Math.floor(value)
    const partial = value - full
    return (
      <div className={`product-rating__stars ${size === 'sm' ? 'product-rating__stars--compact' : ''}`}>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) return <span key={i} className='filled'>&#9733;</span>
          if (i === full && partial >= 0.25) {
            return <span key={i} className='filled' style={{ opacity: 0.35 + partial }}>&#9733;</span>
          }
          return <span key={i}>&#9733;</span>
        })}
      </div>
    )
  }

  const descriptionText = product.description?.trim() ? product.description : PRODUCT_DETAIL_FALLBACK

  return (
    <div className='min-h-screen w-full bg-transparent pb-14'>
      <div className='mx-auto w-full max-w-[min(1386px,calc(100%-2rem))] px-10 pt-6 lg:px-10 sm:px-4 sm:pt-4'>
        <nav className="mb-6 font-['Inter'] text-sm text-black/60" aria-label='Breadcrumb'>
          <ol className='m-0 flex list-none flex-wrap items-center gap-1.5 p-0'>
            <li>
              <Link to={ROUTES.HOME} className='text-[#6C5B50] no-underline hover:text-[#BE9C73]'>
                Trang chủ
              </Link>
            </li>
            <li aria-hidden='true' className='flex items-center opacity-45'>
              <AssetIcon src={chevronRightIcon} width={12} height={12} />
            </li>
            <li>
              <Link to={ROUTES.CATALOG} className='text-[#6C5B50] no-underline hover:text-[#BE9C73]'>
                {product.categoryName}
              </Link>
            </li>
            <li aria-hidden='true' className='flex items-center opacity-45'>
              <AssetIcon src={chevronRightIcon} width={12} height={12} />
            </li>
            <li className='min-w-0 max-w-[min(100%,28rem)] truncate font-semibold text-black' title={product.name}>
              {product.name}
            </li>
          </ol>
        </nav>

        <div className='product-page__content--figma'>
        <div className='product-layout-figma'>
          <div className='product-layout-figma__main'>
            <section className='product-hero product-hero--figma'>
              <div className='product-media product-media--figma'>
                <div className='product-media__main product-media__main--figma'>
                  {gallery.length > 0 ? (
                    <img src={selectedImage} alt={product.name} />
                  ) : (
                    <div className='product-media__placeholder'>Chưa có ảnh</div>
                  )}
                  {discountPct > 0 && (
                    <span className='product-media__pct-badge'>-{discountPct}%</span>
                  )}
                  <span className='product-media__featured-badge'>Nổi bật</span>
                </div>

                {gallery.length > 0 && (
                  <div className='product-media__thumbs product-media__thumbs--figma'>
                    {gallery.map(img => (
                      <button
                        key={img}
                        type='button'
                        className={selectedImage === img ? 'product-media__thumb product-media__thumb--figma active' : 'product-media__thumb product-media__thumb--figma'}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt='' />
                      </button>
                    ))}
                  </div>
                )}

                <div className='product-media__share-row'>
                  <button type='button' className='product-media__soft-btn'>Yêu thích</button>
                  <button type='button' className='product-media__soft-btn'>Chia sẻ</button>
                </div>
              </div>

              <div className='product-purchase product-purchase--figma'>
                <p className='product-pill product-pill--figma'>{product.categoryName} · WOODIFY</p>
                <h1>{product.name}</h1>
                <p className='product-subtitle product-subtitle--figma'>{descriptionText}</p>

                <div className='product-rating product-rating--figma'>
                  {renderStars(DISPLAY_RATING)}
                  <strong>{DISPLAY_RATING}/5</strong>
                  <span className='product-rating__paren'>({DISPLAY_REVIEW_COUNT} đánh giá)</span>
                  <span className='product-rating__divider' aria-hidden />
                  <span className='product-rating__sold'>Đã bán <strong>{DISPLAY_SOLD}</strong></span>
                </div>

                {selectedVersion && (
                  <div className='product-price-block-figma'>
                    <div className='product-price-block-figma__row'>
                      <strong className='product-price-block-figma__now'>{price.toLocaleString('vi-VN')}₫</strong>
                      <del className='product-price-block-figma__was'>{originalPrice.toLocaleString('vi-VN')}₫</del>
                    </div>
                    <span className='product-price-block-figma__save'>Tiết kiệm {saving.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                <div className='product-vouchers-figma'>
                  <span className='product-voucher-figma product-voucher-figma--brown'>{vouchers[0]}</span>
                  <div className='product-vouchers-figma__row'>
                    <span className='product-voucher-figma product-voucher-figma--blue'>{vouchers[1]}</span>
                    <span className='product-voucher-figma product-voucher-figma--green'>{vouchers[2]}</span>
                  </div>
                </div>

                <div className='product-meta-figma'>
                  <div className='product-meta-figma__pair'>
                    <div className='product-meta-figma__cell'>
                      <p className='product-meta-figma__title'>Vận chuyển</p>
                      <p className='product-meta-figma__desc'>Freeship toàn quốc</p>
                    </div>
                    <div className='product-meta-figma__cell'>
                      <p className='product-meta-figma__title'>Bảo hành</p>
                      <p className='product-meta-figma__desc'>Bảo hành 24 tháng tận nơi</p>
                    </div>
                  </div>
                  <div className='product-meta-figma__cell product-meta-figma__cell--full'>
                    <p className='product-meta-figma__title'>Chính sách đổi trả</p>
                    <p className='product-meta-figma__desc'>Đổi trả miễn phí trong 7 ngày</p>
                  </div>
                </div>

                {activeVersions.length > 0 && (
                  <div className='product-options product-options--figma'>
                    <div>
                      <p className='product-label product-label--figma'>Phiên bản</p>
                      <div className='product-options__chips'>
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

                    <div className='product-quantity product-quantity--figma'>
                      <p className='product-label product-label--figma'>Số lượng</p>
                      <div className='product-quantity__figma-row'>
                        <div className='product-quantity__control product-quantity__control--figma'>
                          <button type='button' aria-label='Giảm' onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>−</button>
                          <span>{quantity}</span>
                          <button type='button' aria-label='Tăng' onClick={() => setQuantity(prev => Math.min(selectedVersion?.stockQuantity ?? 10, prev + 1))}>+</button>
                        </div>
                        <span className='product-quantity__stock'>{selectedVersion?.stockQuantity ?? 0} sản phẩm có sẵn</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className='product-cta product-cta--figma'>
                  <button type='button' className='product-cta__secondary product-cta__secondary--figma' onClick={handleAddToCart}>
                    Thêm vào giỏ
                  </button>
                  <button type='button' className='product-cta__primary product-cta__primary--figma' onClick={handleAddToCart}>
                    Mua ngay
                  </button>
                </div>
              </div>
            </section>

            <div className='product-figma-tabs-card'>
              <div className='product-figma-tabs' role='tablist' aria-label='Chi tiết sản phẩm'>
                <button
                  type='button'
                  role='tab'
                  aria-selected={detailTab === 'info'}
                  className={detailTab === 'info' ? 'active' : ''}
                  onClick={() => setDetailTab('info')}
                >
                  Thông tin chi tiết
                </button>
                <button
                  type='button'
                  role='tab'
                  aria-selected={detailTab === 'reviews'}
                  className={detailTab === 'reviews' ? 'active' : ''}
                  onClick={() => setDetailTab('reviews')}
                >
                  Đánh giá sản phẩm
                </button>
                <button
                  type='button'
                  role='tab'
                  aria-selected={detailTab === 'policy'}
                  className={detailTab === 'policy' ? 'active' : ''}
                  onClick={() => setDetailTab('policy')}
                >
                  Chính sách
                </button>
              </div>

              {detailTab === 'info' && (
                <div className='product-figma-tab-panel' role='tabpanel'>
                  <h3 className='product-figma-panel-title'>Thông tin chi tiết</h3>
                  <p className='product-figma-panel-lead'>{descriptionText}</p>
                  {specificationList.length > 0 && (
                    <dl className='product-specs product-specs--figma-grid'>
                      {specificationList.map(spec => (
                        <React.Fragment key={spec.label}>
                          <dt>{spec.label}</dt>
                          <dd>{spec.value}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  )}
                </div>
              )}

              {detailTab === 'reviews' && (
                <div className='product-figma-tab-panel product-figma-tab-panel--reviews' role='tabpanel'>
                  <div className='product-reviews__summary product-reviews__summary--figma'>
                    <div>
                      <strong>{DISPLAY_RATING}</strong>
                      <div className='product-rating__stars product-rating__stars--large'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < Math.floor(DISPLAY_RATING) ? 'filled' : ''}>&#9733;</span>
                        ))}
                      </div>
                      <span>{DISPLAY_REVIEW_COUNT} đánh giá</span>
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
                </div>
              )}

              {detailTab === 'policy' && (
                <div className='product-figma-tab-panel' role='tabpanel'>
                  <h3 className='product-figma-panel-title'>Chính sách</h3>
                  <p className='product-figma-panel-lead'>
Đổi trả miễn phí trong 7 ngày kể từ khi nhận hàng. Bảo hành 24 tháng tận nơi theo điều kiện nhà sản xuất.
                    {' '}
                    Vận chuyển Freeship toàn quốc áp dụng theo chương trình từng thời điểm.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className='product-layout-figma__aside'>
            {shop && (
              <div className='product-shop-card-figma'>
                <div className='product-shop-card-figma__identity'>
                  <div className='product-shop__avatar product-shop__avatar--figma'>
                    {shop.logoUrl
                      ? <img src={shop.logoUrl} alt={shop.name} />
                      : <span>{(shop.name ?? 'S').charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className='product-shop-card-figma__info'>
                    <h3 className='product-shop__name'>{shop.name}</h3>
                    <div className='product-shop-card-figma__rating'>
                      {renderStars(shop.rating, 'sm')}
                      <span>{shop.rating.toFixed(1)}</span>
                    </div>
                    <div className='product-shop-card-figma__stats'>
                      <span><strong>{shop.totalProducts}</strong> Sản phẩm</span>
                      <span><strong>{shop.totalOrders}</strong> Đơn hàng</span>
                      <span><strong>98%</strong> Phản hồi</span>
                      <span><strong>{shopJoinYear}</strong> Tham gia</span>
                    </div>
                  </div>
                </div>
                <div className='product-shop-card-figma__actions'>
                  <Link to={ROUTES.SHOP(shop.shopId, shop.name)} className='product-shop__btn product-shop__btn--outline product-shop__btn--figma'>
                    Xem Shop
                  </Link>
                  <button type='button' className='product-shop__btn product-shop__btn--primary product-shop__btn--figma'>
                    Chat ngay
                  </button>
                </div>
              </div>
            )}

            <div className='product-related-figma'>
              <h3 className='product-related-figma__title'>Sản phẩm liên quan</h3>
              <ul className='product-related-figma__list'>
                {RELATED_ITEMS.map(item => (
                  <li key={item.key} className='product-related-figma__item'>
                    <div className='product-related-figma__thumb'>
                      <img src={item.image} alt='' />
                    </div>
                    <div className='product-related-figma__body'>
                      <p className='product-related-figma__name'>{item.title}</p>
                      <p className='product-related-figma__price'>{item.price.toLocaleString('vi-VN')}₫</p>
                      <p className='product-related-figma__meta'>
                        <span>★ {item.rating}</span>
                        <span>•</span>
                        <span>Đã bán {item.sold}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>


        {suggestionSections.map(section => (
          section.items.length > 0 && (
            <section key={section.id} className='product-suggestions'>
              <div className='product-suggestions__section'>
                <div className='product-suggestions__header'>
                  <div>
                    <p className='product-eyebrow'>Gợi ý mua thêm</p>
                    <h3>{section.title}</h3>
                  </div>
                  <Link to={ROUTES.CATALOG}>Xem tất cả</Link>
                </div>
              </div>
            </section>
          )
        ))}
        </div>
      </div>
    </div>
  )
}
