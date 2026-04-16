import React, { useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useCart } from '@/store/cartStore'
import { cartService } from '@/services/cart.service'
import type { CartItemDto, CartResponse } from '@/types'
import { currency } from '@/utils/format'
import { ROUTES } from '@/constants/routes'
import AssetIcon from '@/components/AssetIcon'
import chevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'
import packageIcon from '@/assets/icons/essential/commerce/package.svg'

// Get accountId from localStorage (stored during login)
const getAccountId = (): string => {
  try {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const user = JSON.parse(userData)
      return user.accountId || ''
    }
  } catch (e) {
    console.error('Failed to parse user_data:', e)
  }
  return ''
}

interface ShopGroup {
  shopId: string
  shopName: string
  items: CartItemDto[]
  totalPrice: number
}

interface CartApiError {
  message?: string
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'Đã xảy ra lỗi'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Đã xảy ra lỗi không xác định'
}

export default function Cart() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accountId = getAccountId()

  useEffect(() => {
    document.body.classList.add('cart-route-bg')
    return () => {
      document.body.classList.remove('cart-route-bg')
    }
  }, [])

  // Zustand store for UI state
  const cartItems = useCart((s) => s.items)
  const setCartItems = useCart((s) => s.setItems)
  const setCartError = useCart((s) => s.setError)
  const removeCartItem = useCart((s) => s.removeItem)
  const updateQuantity = useCart((s) => s.updateQuantity)
  const cartErrorMsg = useCart((s) => s.error)

  // Selection state for checkout
  const [selected, setSelected] = React.useState<string[]>([])
  const selectionInitializedRef = useRef(false)

  // Fetch cart data
  const {
    data: cartData,
    isPending: isLoadingCart,
    error: cartError,
    refetch: refetchCart,
  } = useQuery<CartResponse, AxiosError>({
    queryKey: ['cart', accountId],
    queryFn: () => cartService.getCart(accountId),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Handle cart data updates
  useEffect(() => {
    if (cartData) {
      setCartItems(cartData.items || [])
      setCartError(null)
    }
  }, [cartData, setCartItems, setCartError])

  // Handle cart errors
  useEffect(() => {
    if (cartError) {
      setCartError(getErrorMessage(cartError))
    }
  }, [cartError, setCartError])

  // Update quantity mutation
  const updateQtyMutation = useMutation<CartItemDto, AxiosError, { cartItemId: string; quantity: number }>({
    mutationFn: ({ cartItemId, quantity }) =>
      cartService.updateCartItem(accountId, cartItemId, quantity),
    onSuccess: (data: CartItemDto) => {
      updateQuantity(data.cartItemId, data.quantity)
      queryClient.invalidateQueries({ queryKey: ['cart', accountId] })
    },
    onError: (error: AxiosError) => {
      setCartError(getErrorMessage(error))
    },
  })

  // Remove item mutation
  const removeItemMutation = useMutation<void, AxiosError, string>({
    mutationFn: (cartItemId: string) =>
      cartService.removeCartItem(accountId, cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', accountId] })
    },
    onError: (error: AxiosError) => {
      setCartError(getErrorMessage(error))
    },
  })

  // Clear cart mutation
  const clearCartMutation = useMutation<void, AxiosError, void>({
    mutationFn: () => cartService.clearCart(accountId),
    onSuccess: () => {
      useCart.setState({ items: [] })
      queryClient.invalidateQueries({ queryKey: ['cart', accountId] })
      setSelected([])
    },
    onError: (error: AxiosError) => {
      setCartError(getErrorMessage(error))
    },
  })

  // Initialize selection when cart loads
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(cartItems.map((i) => i.cartItemId))
      const stillValid = prev.filter((id) => ids.has(id))

      if (!selectionInitializedRef.current && cartItems.length > 0) {
        selectionInitializedRef.current = true
        return cartItems.map((i) => i.cartItemId)
      }
      return stillValid
    })

    if (cartItems.length === 0) {
      selectionInitializedRef.current = false
    }
  }, [cartItems])

  // Group items by shop
  const groupedShops = React.useMemo<ShopGroup[]>(() => {
    const map = new Map<string, ShopGroup>()

    cartItems.forEach((item) => {
      const key = item.shopId
      if (!map.has(key)) {
        map.set(key, {
          shopId: item.shopId,
          shopName: item.shopName,
          items: [],
          totalPrice: 0,
        })
      }

      const shop = map.get(key)!
      shop.items.push(item)
      shop.totalPrice += item.totalPrice
    })

    return Array.from(map.values())
  }, [cartItems])

  // Selection logic
  const allSelected = cartItems.length > 0 && selected.length === cartItems.length

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected([])
    } else {
      setSelected(cartItems.map((i) => i.cartItemId))
    }
  }, [allSelected, cartItems])

  const toggleShop = useCallback((shopItems: CartItemDto[]) => {
    const ids = shopItems.map((i) => i.cartItemId)
    const isFullySelected = ids.every((id) => selected.includes(id))

    if (isFullySelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)))
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...ids])))
    }
  }, [selected])

  const toggleItem = useCallback((cartItemId: string) => {
    setSelected((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((x) => x !== cartItemId)
        : [...prev, cartItemId]
    )
  }, [])

  // Handlers
  const handleDeleteSelected = async () => {
    const toDelete = selected.slice()
    setSelected([])

    for (const cartItemId of toDelete) {
      removeItemMutation.mutate(cartItemId)
    }
  }

  const handleQuantityChange = (cartItemId: string, newQty: number) => {
    const qty = Math.max(1, newQty)
    updateQtyMutation.mutate({ cartItemId, quantity: qty })
  }

  const handleCheckout = () => {
    if (selected.length === 0) {
      setCartError('Vui lòng chọn ít nhất một sản phẩm')
      return
    }

    // Get selected items
    const selectedItems = cartItems.filter((item) =>
      selected.includes(item.cartItemId)
    )

    // Calculate total price of selected items
    const selectedTotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0)

    // Group selected items by shop
    const selectedByShop = new Map<string, CartItemDto[]>()
    selectedItems.forEach((item) => {
      const shopId = item.shopId
      if (!selectedByShop.has(shopId)) {
        selectedByShop.set(shopId, [])
      }
      selectedByShop.get(shopId)!.push(item)
    })

    // Prepare checkout data with all necessary information
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

    // Store complete checkout data
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData))
    // Keep old key for backwards compatibility
    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems))

    navigate(ROUTES.CHECKOUT)
  }

  const selectedTotal = cartItems
    .filter((item) => selected.includes(item.cartItemId))
    .reduce((sum, item) => sum + item.totalPrice, 0)

  const accentCheckbox = { accentColor: '#6C5B50' } as const

  // Loading state
  if (isLoadingCart) {
    return (
      <div className='cart-route flex min-h-[60vh] w-full items-center justify-center px-4'>
        <div className='rounded-2xl border border-[#ece6dd] bg-[#fffcf9] px-10 py-12 text-center shadow-sm'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center'>
            <div className='h-10 w-10 animate-spin rounded-full border-2 border-[#d4c4b0] border-t-[#6C5B50]' />
          </div>
          <p className='text-sm text-black/55'>Đang tải giỏ hàng...</p>
        </div>
      </div>
    )
  }

  // Error state (only show if accountId exists, otherwise it's just unauthenticated)
  if (cartError && accountId) {
    return (
      <div className='cart-route mx-auto flex min-h-[60vh] w-full max-w-[min(1386px,calc(100%-2rem))] items-center justify-center px-4 py-10'>
        <div className='max-w-md rounded-2xl border border-red-200/80 bg-[#fffcf9] p-8 text-center shadow-sm'>
          <p className='mb-2 font-semibold text-red-700'>Lỗi tải giỏ hàng</p>
          <p className='mb-6 text-sm text-black/60'>{getErrorMessage(cartError)}</p>
          <div className='flex flex-wrap justify-center gap-3'>
            <button
              type='button'
              onClick={() => refetchCart()}
              className='rounded-full bg-[#6C5B50] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#554538]'
            >
              Thử lại
            </button>
            <Link
              to={ROUTES.HOME}
              className='inline-flex items-center justify-center rounded-full border border-[#ece6dd] bg-white px-6 py-2.5 text-sm font-medium text-[#3f2a1d] transition hover:border-[#BE9C73]/50 hover:text-[#6C5B50]'
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const cartRowGrid = (
    <div className='flex min-w-[720px] items-center gap-3 px-3 py-2.5 sm:min-w-0 sm:px-4'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <span className='text-xs font-semibold uppercase tracking-wide text-[#8a6a4c] sm:text-sm'>
          Sản phẩm
        </span>
      </div>
      <div className='w-24 shrink-0 text-center text-xs font-semibold uppercase tracking-wide text-[#8a6a4c] sm:w-28'>
        Đơn giá
      </div>
      <div className='w-28 shrink-0 text-center text-xs font-semibold uppercase tracking-wide text-[#8a6a4c]'>
        Số lượng
      </div>
      <div className='w-24 shrink-0 text-center text-xs font-semibold uppercase tracking-wide text-[#8a6a4c] sm:w-28'>
        Số tiền
      </div>
      <div className='w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-[#8a6a4c] sm:w-40'>
        Thao tác
      </div>
    </div>
  )

  return (
    <div className='cart-route min-h-screen w-full bg-transparent pb-36'>
      <div className='mx-auto w-full max-w-[min(1386px,calc(100%-2rem))] px-4 pb-6 pt-5 sm:px-6 lg:px-10 lg:pt-6'>
        {cartErrorMsg && (
          <div
            className='mb-4 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950'
            role='status'
          >
            {cartErrorMsg}
          </div>
        )}

        <nav className="mb-5 font-['Inter'] text-sm text-black/60 sm:mb-6" aria-label='Breadcrumb'>
          <ol className='m-0 flex list-none flex-wrap items-center gap-1.5 p-0'>
            <li>
              <Link to={ROUTES.HOME} className='text-[#6C5B50] no-underline hover:text-[#BE9C73]'>
                Trang chủ
              </Link>
            </li>
            <li aria-hidden='true' className='flex items-center opacity-45'>
              <AssetIcon src={chevronRightIcon} width={12} height={12} />
            </li>
            <li className='font-semibold text-black'>Giỏ hàng</li>
          </ol>
        </nav>

        <header className='mb-6'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a6a4c]'>
            Thanh toán
          </p>
          <h1 className='mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-[#3f2a1d] sm:text-[1.65rem]'>
            <AssetIcon src={packageIcon} width={26} height={26} className='opacity-90' />
            Giỏ hàng của bạn
          </h1>
          <p className='mt-1.5 max-w-xl text-sm leading-relaxed text-black/55'>
            Kiểm tra sản phẩm theo từng cửa hàng, chỉnh số lượng và tiến hành mua hàng khi đã sẵn sàng.
          </p>
        </header>

        {cartItems.length === 0 ? (
          <div className='rounded-2xl border border-[#ece6dd] bg-[#fffcf9] px-6 py-16 text-center shadow-sm'>
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ece6dd] bg-[#f8f3ec]'>
              <AssetIcon src={packageIcon} width={32} height={32} className='opacity-55' />
            </div>
            <p className='mb-6 text-sm text-black/55'>Chưa có sản phẩm trong giỏ hàng.</p>
            <Link
              to={ROUTES.CATALOG}
              className='inline-flex items-center justify-center rounded-full bg-[#6C5B50] px-8 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-[#554538]'
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <div className='sticky top-0 z-20 mb-3 overflow-hidden rounded-xl border border-[#ece6dd] bg-[#f8f3ec] shadow-sm'>
              <div className='-mx-px overflow-x-auto border-b border-[#ece6dd]'>{cartRowGrid}</div>
            </div>

            <div className='flex flex-col gap-4 pb-4'>
              {groupedShops.map((shop) => {
                const shopSelectedCount = shop.items.filter((item) =>
                  selected.includes(item.cartItemId)
                ).length
                const isShopFullySelected = shop.items.every((item) =>
                  selected.includes(item.cartItemId)
                )

                return (
                  <div
                    key={shop.shopId}
                    className='overflow-hidden rounded-2xl border border-[#ece6dd] bg-[#fffcf9] shadow-[0_1px_0_rgba(36,28,21,0.05)]'
                  >
                    <div className='flex items-center gap-3 border-b border-[#ece6dd] bg-[#f8f3ec] px-3 py-3 sm:gap-4 sm:px-4'>
                      <label className='flex shrink-0 cursor-pointer items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={isShopFullySelected}
                          onChange={() => toggleShop(shop.items)}
                          className='h-4 w-4 shrink-0 cursor-pointer rounded'
                          style={accentCheckbox}
                        />
                        <span className='text-sm font-semibold text-[#3f2a1d]'>Chọn tất cả</span>
                      </label>
                      <span className='shrink-0 text-black/25' aria-hidden>
                        |
                      </span>
                      <Link
                        to={ROUTES.SHOP(shop.shopId, shop.shopName)}
                        className='min-w-0 flex-1 truncate text-sm font-semibold text-[#6C5B50] no-underline hover:text-[#BE9C73]'
                      >
                        {shop.shopName}
                      </Link>
                      <span className='shrink-0 rounded-full border border-[#d4c4b0] bg-white/70 px-2.5 py-0.5 text-xs font-medium text-[#5c4a3d]'>
                        {shopSelectedCount} đã chọn
                      </span>
                    </div>

                    <div className='divide-y divide-[#ece6dd]/90'>
                      {shop.items.map((item) => (
                        <div key={item.cartItemId} className='overflow-x-auto'>
                          <div className='flex min-w-[720px] items-start gap-3 px-3 py-4 sm:min-w-0 sm:px-4'>
                            <div className='flex min-w-0 flex-1 items-start gap-3'>
                              <input
                                type='checkbox'
                                checked={selected.includes(item.cartItemId)}
                                onChange={() => toggleItem(item.cartItemId)}
                                className='mt-1 h-4 w-4 shrink-0 cursor-pointer rounded'
                                style={accentCheckbox}
                              />
                              <img
                                src={item.thumbnailUrl}
                                alt={item.productVersionName}
                                className='h-16 w-16 shrink-0 rounded-lg border border-[#ece6dd] object-cover'
                              />
                              <div className='min-w-0 flex-1'>
                                <div className='line-clamp-2 text-sm font-medium leading-snug text-[#3f2a1d]'>
                                  {item.productMasterName}
                                </div>
                                <div className='mt-1 text-xs text-black/50'>{item.productVersionName}</div>
                                {item.isOutOfStock && (
                                  <div className='mt-1 text-xs font-semibold text-red-600'>Hết hàng</div>
                                )}
                              </div>
                            </div>

                            <div className='w-24 shrink-0 pt-1 text-center sm:w-28'>
                              <div className='text-sm font-medium text-[#3f2a1d]'>{currency(item.price)}</div>
                            </div>

                            <div className='flex w-28 shrink-0 justify-center pt-0.5'>
                              <div className='flex h-8 w-[6.5rem] items-center gap-0.5 rounded-lg border border-[#ece6dd] bg-white'>
                                <button
                                  type='button'
                                  onClick={() =>
                                    handleQuantityChange(item.cartItemId, item.quantity - 1)
                                  }
                                  disabled={item.quantity === 1}
                                  className='flex h-8 w-8 items-center justify-center text-[#5c4a3d] transition hover:bg-[#f8f3ec] disabled:opacity-30'
                                >
                                  −
                                </button>
                                <div className='flex h-8 flex-1 items-center justify-center text-sm font-medium text-[#3f2a1d]'>
                                  {item.quantity}
                                </div>
                                <button
                                  type='button'
                                  onClick={() =>
                                    handleQuantityChange(item.cartItemId, item.quantity + 1)
                                  }
                                  disabled={updateQtyMutation.isPending}
                                  className='flex h-8 w-8 items-center justify-center text-[#5c4a3d] transition hover:bg-[#f8f3ec] disabled:opacity-50'
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className='w-24 shrink-0 pt-1 text-center sm:w-28'>
                              <div className='text-sm font-semibold text-[#6C5B50]'>{currency(item.totalPrice)}</div>
                            </div>

                            <div className='w-36 shrink-0 pt-1 sm:w-40'>
                              <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                                <button
                                  type='button'
                                  onClick={() => removeItemMutation.mutate(item.cartItemId)}
                                  disabled={removeItemMutation.isPending}
                                  className='text-xs font-medium text-[#6C5B50] hover:text-[#BE9C73] disabled:opacity-50'
                                >
                                  Xóa
                                </button>
                                <span className='hidden h-3 w-px bg-[#ece6dd] sm:inline' aria-hidden />
                                <button
                                  type='button'
                                  className='text-xs font-medium text-[#6C5B50] hover:text-[#BE9C73]'
                                >
                                  Tìm sản phẩm tương tự
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className='sticky bottom-0 z-40 w-full pb-3 sm:pb-4'>
          <div className='mx-auto w-full max-w-[min(1386px,calc(100%-2rem))] px-4 sm:px-6 lg:px-10'>
            <div className='flex flex-col gap-4 rounded-2xl border border-[#d4cab8] bg-[#e3d9c8]/98 px-3 py-3.5 shadow-[0_-10px_36px_rgba(36,28,21,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-[#e3d9c8]/92 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3.5'>
              <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 text-xs text-[#3f2a1d]'>
              <label className='flex cursor-pointer items-center gap-2 whitespace-nowrap font-medium'>
                <input
                  type='checkbox'
                  checked={allSelected}
                  onChange={toggleAll}
                  className='h-4 w-4 cursor-pointer rounded'
                  style={accentCheckbox}
                />
                Chọn tất cả ({cartItems.length})
              </label>
              <span className='text-black/25' aria-hidden>
                |
              </span>
              <button
                type='button'
                onClick={handleDeleteSelected}
                disabled={selected.length === 0 || removeItemMutation.isPending}
                className='font-medium text-black/60 hover:text-red-600 disabled:opacity-45'
              >
                Xóa
              </button>
              <span className='hidden text-black/25 sm:inline' aria-hidden>
                |
              </span>
              <button
                type='button'
                className='hidden font-medium text-black/50 hover:text-[#6C5B50] sm:inline'
              >
                Bỏ sản phẩm không hoạt động
              </button>
              <span className='hidden text-black/25 md:inline' aria-hidden>
                |
              </span>
              <button
                type='button'
                className='hidden font-medium text-black/50 hover:text-[#6C5B50] md:inline'
              >
                Lưu vào mục Đã thích
              </button>
              </div>

              <div className='flex flex-shrink-0 flex-wrap items-center justify-end gap-4 border-t border-[#cfc3b0]/90 pt-3 sm:border-t-0 sm:pt-0'>
                <div className='text-right'>
                  <div className='text-xs text-black/50'>
                    Tổng cộng ({selected.length} sản phẩm)
                  </div>
                  <div className='text-xl font-bold tracking-tight text-[#6C5B50]'>{currency(selectedTotal)}</div>
                </div>
                <button
                  type='button'
                  onClick={handleCheckout}
                  disabled={selected.length === 0}
                  className='rounded-full bg-[#6C5B50] px-10 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#554538] disabled:cursor-not-allowed disabled:opacity-45'
                >
                  Mua hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
