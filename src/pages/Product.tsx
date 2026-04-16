import React from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productMasterService, productReviewService, shopService, cartService } from '@/services'
import { readStoredUser } from '@/features/auth/utils/storage'
import { useCart } from '../store/cartStore'
import { ROUTES } from '@/constants/routes'
import type { CartItemDto } from '@/types'
import AssetIcon from '@/components/AssetIcon'
import chevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'
import { parseProductPathParam, resolveProductIdFromPublished } from '@/utils/productUrl'
import { resolveCartItemLineId } from '@/utils/cartItemId'

function writeCheckoutFromItems(accountId: string, selectedItems: CartItemDto[]) {
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const selectedByShop = new Map<string, CartItemDto[]>()
  selectedItems.forEach((item) => {
    if (!selectedByShop.has(item.shopId)) selectedByShop.set(item.shopId, [])
    selectedByShop.get(item.shopId)!.push(item)
  })
  const checkoutData = {
    accountId,
    selectedItems,
    selectedByShop: Array.from(selectedByShop.entries()).map(([shopId, items]) => ({
      shopId,
      shopName: items[0].shopName,
      items,
      totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0),
    })),
    selectedTotal,
    selectedCount: selectedItems.length,
  }
  localStorage.setItem('checkoutData', JSON.stringify(checkoutData))
  localStorage.setItem('checkoutItems', JSON.stringify(selectedItems))
}

const PRODUCT_DETAIL_FALLBACK =
  'Bàn làm việc gỗ óc chó cao cấp với thiết kế hiện đại, tối giản. Được chế tác từ 100% gỗ óc chó tự nhiên, bề mặt xử lý chống trầy xước và chống nước. Phù hợp cho không gian làm việc tại nhà hoặc văn phòng.'

const DISPLAY_SOLD = 456

const reviewFilters = ['Tất cả', '5 sao', '4 sao', '3 sao', 'Có ảnh']

function reviewerDisplayName(accountId: string): string {
  const id = (accountId ?? '').trim()
  if (id.length < 4) return 'Khách hàng'
  return `Khách hàng · ${id.slice(-4)}`
}

export default function Product() {
  const { id: pathParam = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const addItem = useCart(state => state.addItem)
  const setCartItems = useCart(state => state.setItems)

  React.useEffect(() => {
    document.body.classList.add('product-route-bg')
    return () => {
      document.body.classList.remove('product-route-bg')
    }
  }, [])

  const parsedPath = React.useMemo(() => parseProductPathParam(pathParam), [pathParam])
  const needsPublishedForSlug =
    parsedPath.kind === 'slugPrefix' || parsedPath.kind === 'slugOnly'

  const { data: publishedProducts, isPending: publishedListLoading } = useQuery({
    queryKey: ['published-products'],
    queryFn: () => productMasterService.getPublishedProducts(),
    enabled: needsPublishedForSlug || !!pathParam.trim(),
    staleTime: 60_000,
  })

  const resolvedProductId = React.useMemo(() => {
    if (parsedPath.kind === 'uuid') return parsedPath.productId
    if (parsedPath.kind === 'legacyId') return parsedPath.id
    if ((parsedPath.kind === 'slugPrefix' || parsedPath.kind === 'slugOnly') && publishedProducts)
      return resolveProductIdFromPublished(parsedPath, publishedProducts)
    return null
  }, [parsedPath, publishedProducts])

  const slugResolveFailed =
    (parsedPath.kind === 'slugPrefix' || parsedPath.kind === 'slugOnly') &&
    !publishedListLoading &&
    Array.isArray(publishedProducts) &&
    resolvedProductId == null

  const {
    data: product,
    isLoading: productDetailLoading,
    isError: productDetailError,
  } = useQuery({
    queryKey: ['product-detail', resolvedProductId],
    queryFn: () => productMasterService.getProductDetail(resolvedProductId!),
    enabled: !!resolvedProductId,
  })

  const {
    data: visibleReviews = [],
    isPending: visibleReviewsLoading,
    isError: visibleReviewsError,
  } = useQuery({
    queryKey: ['product-visible-reviews', resolvedProductId],
    queryFn: () => productReviewService.getVisibleReviews(resolvedProductId!),
    enabled: !!resolvedProductId,
  })

  const isLoading = productDetailLoading

  const { data: shop } = useQuery({
    queryKey: ['shop', product?.shopId],
    queryFn: () => shopService.getShopById(product!.shopId),
    enabled: !!product?.shopId,
  })

  const relatedProducts = React.useMemo(() => {
    if (!publishedProducts?.length || !product) return []
    return publishedProducts
      .filter((p) => p.categoryId === product.categoryId && p.productId !== product.productId)
      .slice(0, 4)
  }, [publishedProducts, product])

  const isProductRouteLoading =
    (!slugResolveFailed &&
      (parsedPath.kind === 'slugPrefix' || parsedPath.kind === 'slugOnly') &&
      publishedListLoading) ||
    (!!resolvedProductId && productDetailLoading)

  React.useEffect(() => {
    if (!product?.productId || !product?.name) return
    if (parsedPath.kind !== 'uuid' && parsedPath.kind !== 'slugPrefix') return
    const canonical = ROUTES.PRODUCT(product.productId, product.name)
    if (location.pathname !== canonical) {
      navigate(canonical, { replace: true })
    }
  }, [product?.productId, product?.name, parsedPath.kind, location.pathname, navigate])

  const activeVersions = React.useMemo(
    () => (product?.versions ?? []).filter(v => v.isActive),
    [product]
  )

  const [selectedVersionId, setSelectedVersionId] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const [qtyDraft, setQtyDraft] = React.useState('1')
  const [activeReviewFilter, setActiveReviewFilter] = React.useState(reviewFilters[0])
  const [detailTab, setDetailTab] = React.useState<'info' | 'reviews' | 'policy'>('info')

  React.useEffect(() => {
    if (activeVersions.length > 0) {
      setSelectedVersionId(activeVersions[0].versionId)
    }
  }, [activeVersions])

  React.useEffect(() => {
    setQtyDraft(String(quantity))
  }, [quantity])

  React.useEffect(() => {
    setQuantity(1)
    setQtyDraft('1')
  }, [selectedVersionId])

  const selectedVersion = activeVersions.find(v => v.versionId === selectedVersionId) ?? activeVersions[0]

  React.useEffect(() => {
    const max = Math.max(1, selectedVersion?.stockQuantity ?? 1)
    setQuantity((q) => Math.min(max, Math.max(1, q)))
  }, [selectedVersion?.stockQuantity])

  const gallery = React.useMemo(() => {
    const productImgs = (product?.images ?? []).map(i => i.originalUrl)
    const versionImgs = (selectedVersion?.images ?? []).map(i => i.originalUrl)
    const all = [...new Set([...productImgs, ...versionImgs])]
    return all
  }, [product, selectedVersion])

  const [selectedImage, setSelectedImage] = React.useState<string>('')
  const [addToCartError, setAddToCartError] = React.useState<string | null>(null)
  const [addToCartSuccess, setAddToCartSuccess] = React.useState<string | null>(null)

  type AddCartIntent = 'cart' | 'checkout'

  const addToCartMutation = useMutation({
    mutationFn: async ({ intent }: { intent: AddCartIntent }) => {
      const user = readStoredUser()
      if (!user?.accountId) throw new Error('NOT_LOGGED_IN')
      if (!product || !selectedVersion) throw new Error('Sản phẩm không hợp lệ')

      const versionId = selectedVersion.versionId
      const cartItem = await cartService.addToCart(
        user.accountId,
        versionId,
        product.shopId,
        quantity
      )
      return { cartItem, intent, accountId: user.accountId, versionId }
    },
    onSuccess: async ({ cartItem, intent, accountId, versionId }) => {
      setAddToCartError(null)
      void queryClient.invalidateQueries({ queryKey: ['cart', accountId] })
      let serverItems: CartItemDto[] | null = null
      try {
        const cart = await cartService.getCart(accountId)
        serverItems = cart.items ?? []
        setCartItems(serverItems)
      } catch {
        if (cartItem) addItem(cartItem)
        serverItems = null
      }
      if (intent === 'checkout') {
        setAddToCartSuccess(null)
        // Prefer full line from GetCart (always has cartItemId); addToCart payload may omit it
        const fromServer = serverItems?.find((i) => i.versionId === versionId)
        const fromStore = useCart.getState().items.find((i) => i.versionId === versionId)
        const line = fromServer ?? fromStore ?? cartItem
        const cartItemId = resolveCartItemLineId(line) || line?.cartItemId
        if (line && product && cartItemId) {
          const shopId = line.shopId || product.shopId
          const shopName = line.shopName || product.shopName || ''
          const normalized: CartItemDto = { ...line, cartItemId, shopId, shopName }
          writeCheckoutFromItems(accountId, [normalized])
          navigate(ROUTES.CHECKOUT)
        } else if (line && cartItemId) {
          const normalized: CartItemDto = { ...line, cartItemId }
          writeCheckoutFromItems(accountId, [normalized])
          navigate(ROUTES.CHECKOUT)
        } else {
          setAddToCartError('Không thể chuyển đến thanh toán. Vui lòng mở giỏ hàng và thử lại.')
        }
      } else {
        setAddToCartSuccess('Đã thêm vào giỏ hàng.')
      }
    },
    onError: (err: { message?: string } | Error) => {
      const raw = 'message' in err ? err.message : (err as Error)?.message
      if (raw === 'NOT_LOGGED_IN') {
        setAddToCartError('Bạn cần đăng nhập mới có thể thêm sản phẩm vào giỏ hàng.')
      } else {
        setAddToCartError(raw || 'Thêm vào giỏ thất bại')
      }
      setAddToCartSuccess(null)
    },
  })

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

  const filteredReviews = React.useMemo(() => {
    if (activeReviewFilter === 'Tất cả') return visibleReviews
    if (activeReviewFilter === 'Có ảnh')
      return visibleReviews.filter((r) => (r.imageUrls?.length ?? 0) > 0)
    const star = Number(activeReviewFilter[0])
    return Number.isFinite(star)
      ? visibleReviews.filter((r) => Math.round(r.rating) === star)
      : visibleReviews
  }, [activeReviewFilter, visibleReviews])

  const requireAccountForCart = (): boolean => {
    const user = readStoredUser()
    if (!user?.accountId) {
      setAddToCartSuccess(null)
      setAddToCartError('Bạn cần đăng nhập mới có thể thêm sản phẩm vào giỏ hàng.')
      return false
    }
    return true
  }

  const handleAddToCart = () => {
    if (!requireAccountForCart()) return
    if (!selectedVersion) {
      setAddToCartError('Vui lòng chọn phiên bản sản phẩm.')
      return
    }
    setAddToCartError(null)
    setAddToCartSuccess(null)
    addToCartMutation.mutate({ intent: 'cart' })
  }

  const handleBuyNow = () => {
    if (!requireAccountForCart()) return
    if (!selectedVersion) {
      setAddToCartError('Vui lòng chọn phiên bản sản phẩm.')
      return
    }
    setAddToCartError(null)
    setAddToCartSuccess(null)
    addToCartMutation.mutate({ intent: 'checkout' })
  }

  if (isProductRouteLoading) {
    return (
      <div className='flex min-h-screen w-full flex-col items-center justify-center bg-transparent px-4'>
        <div className='flex flex-col items-center gap-3 py-20'>
          <div className='h-9 w-9 animate-spin rounded-full border-4 border-[#6C5B50] border-t-transparent' />
          <p className="font-['Inter'] text-sm text-[#5c4a32]">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (slugResolveFailed || (!productDetailLoading && (productDetailError || !product))) {
    return (
      <div className='flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-transparent px-4 text-center'>
        <p className="font-['Inter'] text-base text-neutral-700">Không tìm thấy sản phẩm.</p>
        <Link to={ROUTES.CATALOG} className='home__action-primary'>
          Quay lại danh mục
        </Link>
      </div>
    )
  }

  if (!product) return null

  const price = selectedVersion?.price ?? 0
  const shopJoinYear = shop?.createdAt ? new Date(shop.createdAt).getFullYear() : '—'
  const cartPending = addToCartMutation.isPending

  const headerReviewCount = product.reviewCount ?? visibleReviews.length
  const headerAvgRating =
    product.averageRating != null
      ? product.averageRating
      : visibleReviews.length > 0
        ? visibleReviews.reduce((s, r) => s + r.rating, 0) / visibleReviews.length
        : null

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
                  {headerAvgRating != null && headerReviewCount > 0 ? (
                    <>
                      {renderStars(headerAvgRating)}
                      <strong>{headerAvgRating.toFixed(1)}/5</strong>
                      <span className='product-rating__paren'>({headerReviewCount} đánh giá)</span>
                    </>
                  ) : (
                    <span className="font-['Inter'] text-sm text-black/55">Chưa có đánh giá</span>
                  )}
                  <span className='product-rating__divider' aria-hidden />
                  <span className='product-rating__sold'>Đã bán <strong>{DISPLAY_SOLD}</strong></span>
                </div>

                {selectedVersion && (
                  <div className='product-price-block-figma'>
                    <div className='product-price-block-figma__row'>
                      <strong className='product-price-block-figma__now'>{price.toLocaleString('vi-VN')}₫</strong>
                    </div>
                  </div>
                )}

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
                          <button
                            type='button'
                            aria-label='Giảm'
                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          >
                            −
                          </button>
                          <input
                            type='number'
                            min={1}
                            max={Math.max(1, selectedVersion?.stockQuantity ?? 1)}
                            inputMode='numeric'
                            autoComplete='off'
                            aria-label='Số lượng'
                            className='product-quantity__input--figma'
                            value={qtyDraft}
                            onChange={(e) => {
                              const raw = e.target.value
                              if (raw === '') {
                                setQtyDraft('')
                                return
                              }
                              if (!/^\d+$/.test(raw)) return
                              setQtyDraft(raw)
                              const n = parseInt(raw, 10)
                              const max = Math.max(1, selectedVersion?.stockQuantity ?? 1)
                              if (Number.isFinite(n)) setQuantity(Math.min(max, Math.max(1, n)))
                            }}
                            onBlur={() => {
                              const max = Math.max(1, selectedVersion?.stockQuantity ?? 1)
                              if (qtyDraft === '' || !/^\d+$/.test(qtyDraft)) {
                                setQuantity(1)
                                setQtyDraft('1')
                                return
                              }
                              const n = Math.min(max, Math.max(1, parseInt(qtyDraft, 10)))
                              setQuantity(n)
                              setQtyDraft(String(n))
                            }}
                          />
                          <button
                            type='button'
                            aria-label='Tăng'
                            onClick={() =>
                              setQuantity((prev) => {
                                const max = Math.max(1, selectedVersion?.stockQuantity ?? 1)
                                return Math.min(max, prev + 1)
                              })
                            }
                          >
                            +
                          </button>
                        </div>
                        <span className='product-quantity__stock'>{selectedVersion?.stockQuantity ?? 0} sản phẩm có sẵn</span>
                      </div>
                    </div>
                  </div>
                )}

                {(addToCartError || addToCartSuccess) && (
                  <div className='mt-3 space-y-2' role='status' aria-live='polite'>
                    {addToCartError && (
                      <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-['Inter'] text-sm text-red-800">
                        {addToCartError}
                      </p>
                    )}
                    {addToCartSuccess && (
                      <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-['Inter'] text-sm text-emerald-900">
                        {addToCartSuccess}
                      </p>
                    )}
                  </div>
                )}

                <div className='product-cta product-cta--figma'>
                  <button
                    type='button'
                    className='product-cta__secondary product-cta__secondary--figma'
                    onClick={handleAddToCart}
                    disabled={cartPending || activeVersions.length === 0}
                  >
                    {cartPending ? 'Đang xử lý…' : 'Thêm vào giỏ'}
                  </button>
                  <button
                    type='button'
                    className='product-cta__primary product-cta__primary--figma'
                    onClick={handleBuyNow}
                    disabled={cartPending || activeVersions.length === 0}
                  >
                    {cartPending ? 'Đang xử lý…' : 'Mua ngay'}
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
                  {visibleReviewsLoading ? (
                    <div className='flex justify-center py-10'>
                      <div className='h-8 w-8 animate-spin rounded-full border-2 border-[#6C5B50] border-t-transparent' />
                    </div>
                  ) : visibleReviewsError ? (
                    <p className="m-0 font-['Inter'] text-sm text-red-600">
                      Không tải được đánh giá. Vui lòng thử lại sau.
                    </p>
                  ) : (
                    <>
                      <div className='product-reviews__summary product-reviews__summary--figma'>
                        <div>
                          {headerAvgRating != null && headerReviewCount > 0 ? (
                            <>
                              <strong>{headerAvgRating.toFixed(1)}</strong>
                              <div className='product-rating__stars product-rating__stars--large'>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={i < Math.floor(headerAvgRating) ? 'filled' : ''}
                                  >
                                    &#9733;
                                  </span>
                                ))}
                              </div>
                              <span>{headerReviewCount} đánh giá</span>
                            </>
                          ) : (
                            <span className="font-['Inter'] text-sm text-black/60">Chưa có đánh giá</span>
                          )}
                        </div>
                        <div className='product-reviews__filters'>
                          {reviewFilters.map((f) => (
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
                        {filteredReviews.length === 0 ? (
                          <p className="m-0 font-['Inter'] text-sm text-black/55">
                            {visibleReviews.length === 0
                              ? 'Chưa có đánh giá nào.'
                              : 'Không có đánh giá phù hợp bộ lọc.'}
                          </p>
                        ) : (
                          filteredReviews.map((review) => (
                            <article key={review.reviewId} className='product-review'>
                              <header>
                                <strong>{reviewerDisplayName(review.accountId)}</strong>
                                <span>
                                  {review.createdAt
                                    ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                                    : ''}
                                </span>
                              </header>
                              <div className='product-rating__stars product-rating__stars--compact'>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < review.rating ? 'filled' : ''}>
                                    &#9733;
                                  </span>
                                ))}
                              </div>
                              {review.content ? <p>{review.content}</p> : null}
                              {(review.imageUrls ?? []).length > 0 && (
                                <div className='product-review__media mt-2 flex flex-wrap gap-2'>
                                  {review.imageUrls.map((url, idx) => (
                                    <img
                                      key={`${review.reviewId}-img-${idx}`}
                                      src={url}
                                      alt=''
                                      className='max-h-40 rounded-lg object-cover'
                                    />
                                  ))}
                                </div>
                              )}
                              {review.shopResponse ? (
                                <div className='mt-3 rounded-md bg-[#f5f5f5] px-3 py-2.5 text-sm text-black/80'>
                                  <p className='m-0 font-semibold text-black/85'>
                                    {'Phản hồi của người bán'}
                                  </p>
                                  <p className='m-0 mt-1.5 leading-relaxed'>{review.shopResponse}</p>
                                </div>
                              ) : null}
                            </article>
                          ))
                        )}
                      </div>
                    </>
                  )}
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
                      <span><strong>{shop.reviewCount}</strong> Đánh giá</span>
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
              {relatedProducts.length === 0 ? (
                <p className="m-0 font-['Inter'] text-sm text-black/55">Chưa có sản phẩm cùng danh mục.</p>
              ) : (
                <ul className='product-related-figma__list'>
                  {relatedProducts.map((item) => (
                    <li key={item.productId} className='product-related-figma__item'>
                      <Link to={ROUTES.PRODUCT(item.productId, item.name)} className='flex min-w-0 gap-3 no-underline text-inherit hover:opacity-90'>
                        <div className='product-related-figma__thumb'>
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt='' />
                          ) : (
                            <span className='flex h-full w-full items-center justify-center bg-black/5 text-xs text-black/40'>Ảnh</span>
                          )}
                        </div>
                        <div className='product-related-figma__body min-w-0'>
                          <p className='product-related-figma__name'>{item.name}</p>
                          <p className='product-related-figma__price'>{item.price.toLocaleString('vi-VN')}₫</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
        </div>
      </div>
    </div>
  )
}
