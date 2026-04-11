import React, { useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useCart } from '@/store/cartStore'
import { cartService } from '@/services/cart.service'
import type { CartItemDto, CartResponse } from '@/types'
import { currency } from '@/utils/format'
import { ROUTES } from '@/constants/routes'

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

    navigate(ROUTES.CHECKOUT_MULTISHOP)
  }

  const selectedTotal = cartItems
    .filter((item) => selected.includes(item.cartItemId))
    .reduce((sum, item) => sum + item.totalPrice, 0)

  // Loading state
  if (isLoadingCart) {
    return (
      <div className='bg-stone-100 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-800 mb-4'></div>
          <p className='text-gray-600'>Đang tải giỏ hàng...</p>
        </div>
      </div>
    )
  }

  // Error state (only show if accountId exists, otherwise it's just unauthenticated)
  if (cartError && accountId) {
    return (
      <div className='bg-stone-100 min-h-screen flex items-center justify-center'>
        <div className='bg-white rounded-md border-2 border-red-500 p-6 max-w-md text-center'>
          <p className='text-red-600 font-semibold mb-4'>Lỗi tải giỏ hàng</p>
          <p className='text-gray-600 mb-4'>{getErrorMessage(cartError)}</p>
          <button
            onClick={() => refetchCart()}
            className='px-6 py-2 bg-yellow-800 text-white rounded hover:bg-yellow-900'
          >
            Thử lại
          </button>
          <Link
            to={ROUTES.HOME}
            className='ml-3 px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-stone-100 min-h-screen'>
      {/* Table Header - Full Width */}
      <div className='sticky top-0 z-30 w-full bg-white border-b border-gray-200'>
        <div className='w-full max-w-[1352px] mx-auto px-56 py-3'>
          <div className='flex items-center gap-3'>
            {/* Checkbox + Sản Phẩm */}
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <input
                type='checkbox'
                checked={allSelected}
                onChange={toggleAll}
                className='w-4 h-4 rounded cursor-pointer flex-shrink-0'
                style={{ accentColor: '#8B5A3C' }}
              />
              <span className='text-gray-600 text-sm font-medium flex-shrink-0'>Sản Phẩm</span>
            </div>

            {/* Đơn Giá */}
            <div className='w-20 text-center flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Đơn Giá</span>
            </div>

            {/* Số Lượng */}
            <div className='w-24 text-center flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Số Lượng</span>
            </div>

            {/* Số Tiền */}
            <div className='w-20 text-center flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Số Tiền</span>
            </div>

            {/* Thao Tác */}
            <div className='w-40 flex-shrink-0'>
              <span className='text-gray-600 text-sm font-medium'>Thao Tác</span>
            </div>
          </div>
        </div>
      </div>

      <main className='w-full max-w-[1352px] mx-auto'>
        <div className='flex flex-col gap-3 pb-3'>
          {/* Empty Cart */}
          {cartItems.length === 0 && (
            <div className='w-full p-12 bg-white rounded-md border border-gray-200 text-center'>
              <p className='text-gray-600 mb-4'>Chưa có sản phẩm</p>
              <Link
                to={ROUTES.CATALOG}
                className='inline-block px-6 py-2 bg-yellow-800 text-white rounded hover:bg-yellow-900'
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          )}

          {/* Shop Groups */}
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
                className='w-full bg-white rounded-md border border-gray-200 overflow-hidden'
              >
                {/* Shop Header */}
                <div className='px-3 py-2.5 bg-yellow-50 border-b border-gray-200 flex items-center gap-3'>
                  <input
                    type='checkbox'
                    checked={isShopFullySelected}
                    onChange={() => toggleShop(shop.items)}
                    className='w-4 h-4 rounded cursor-pointer flex-shrink-0'
                    style={{ accentColor: '#8B5A3C' }}
                  />
                  <span className='text-gray-900 text-sm font-semibold flex-1'>
                    {shop.shopName}
                  </span>
                  <span className='px-2 py-1 rounded border border-yellow-800 text-yellow-800 text-xs font-medium flex-shrink-0'>
                    {shopSelectedCount} đã chọn
                  </span>
                </div>

                {/* Product Items */}
                <div className='divide-y divide-gray-100'>
                  {shop.items.map((item) => (
                    <div key={item.cartItemId} className='px-3 py-3 flex items-start gap-3'>
                      {/* Checkbox + Product Info */}
                      <div className='flex items-start gap-3 flex-1 min-w-0'>
                        <input
                          type='checkbox'
                          checked={selected.includes(item.cartItemId)}
                          onChange={() => toggleItem(item.cartItemId)}
                          className='w-4 h-4 rounded cursor-pointer flex-shrink-0 mt-1'
                          style={{ accentColor: '#8B5A3C' }}
                        />
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productVersionName}
                          className='w-16 h-16 rounded border border-gray-200 flex-shrink-0 object-cover'
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='text-gray-900 text-sm font-medium leading-5 line-clamp-2'>
                            {item.productMasterName}
                          </div>
                          <div className='text-gray-500 text-xs font-normal leading-4 mt-1'>
                            {item.productVersionName}
                          </div>
                          {item.isOutOfStock && (
                            <div className='text-red-600 text-xs font-semibold mt-1'>
                              Hết hàng
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Đơn Giá */}
                      <div className='w-20 text-center flex-shrink-0 pt-1'>
                        <div className='text-gray-900 text-sm font-medium'>
                          {currency(item.price)}
                        </div>
                      </div>

                      {/* Số Lượng */}
                      <div className='w-24 flex justify-center flex-shrink-0'>
                        <div className='w-24 h-7 rounded border border-gray-300 flex items-center gap-1'>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.cartItemId, item.quantity - 1)
                            }
                            disabled={item.quantity === 1}
                            className='w-7 h-7 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-100 text-lg'
                          >
                            −
                          </button>
                          <div className='flex-1 h-7 flex items-center justify-center text-gray-900 text-sm font-medium'>
                            {item.quantity}
                          </div>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.cartItemId, item.quantity + 1)
                            }
                            disabled={updateQtyMutation.isPending}
                            className='w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg disabled:opacity-50'
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Số Tiền */}
                      <div className='w-20 text-center flex-shrink-0 pt-1'>
                        <div className='text-yellow-800 text-sm font-semibold'>
                          {currency(item.totalPrice)}
                        </div>
                      </div>

                      {/* Thao Tác */}
                      <div className='w-40 flex-shrink-0 pt-1'>
                        <div className='flex items-center gap-3 flex-wrap'>
                          <button
                            onClick={() =>
                              removeItemMutation.mutate(item.cartItemId)
                            }
                            disabled={removeItemMutation.isPending}
                            className='text-yellow-800 text-xs font-medium hover:text-yellow-900 disabled:opacity-50 whitespace-nowrap'
                          >
                            Xóa
                          </button>
                          <div className='w-px h-4 bg-gray-300'></div>
                          <button className='text-yellow-800 text-xs font-medium hover:text-yellow-900 whitespace-nowrap'>
                            Tìm sản phẩm tương tự
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                
              </div>
            )
          })}
        </div>
      </main>

      {/* Sticky Footer */}
      <div className='sticky bottom-0 z-40 w-full bg-white border-t-2 border-gray-200 shadow-md'>
        <div className='w-full max-w-[1352px] mx-auto px-56 py-2.5 flex items-center justify-between gap-4'>
          {/* Left Section */}
          <div className='flex items-center gap-2 flex-shrink-0'>
            <label className='flex items-center gap-2 cursor-pointer whitespace-nowrap'>
              <input
                type='checkbox'
                checked={allSelected}
                onChange={toggleAll}
                className='w-4 h-4 rounded cursor-pointer'
                style={{ accentColor: '#8B5A3C' }}
              />
              <span className='text-gray-900 text-xs font-medium'>
                Chọn Tất Cả ({cartItems.length})
              </span>
            </label>
            <button
              onClick={handleDeleteSelected}
              disabled={selected.length === 0 || removeItemMutation.isPending}
              className='text-gray-900 text-xs font-medium hover:text-red-600 disabled:opacity-50 whitespace-nowrap'
            >
              Xóa
            </button>
            <div className='w-px h-3 bg-gray-300'></div>
            <button className='text-gray-900 text-xs font-medium hover:text-blue-600 whitespace-nowrap'>
              Bỏ sản phẩm không hoạt động
            </button>
            <div className='w-px h-3 bg-gray-300'></div>
            <button className='text-gray-900 text-xs font-medium hover:text-blue-600 whitespace-nowrap'>
              Lưu vào mục Đã thích
            </button>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-4 flex-shrink-0'>
            {/* Total Section */}
            <div className='flex flex-col gap-0.5 text-right whitespace-nowrap'>
              <div className='text-gray-600 text-xs font-normal'>
                Tổng cộng ({selected.length} sản phẩm):
              </div>
              <div className='text-yellow-800 text-xl font-bold'>
                {currency(selectedTotal)}
              </div>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleCheckout}
              disabled={selected.length === 0}
              className='px-8 py-2 bg-yellow-800 text-white rounded text-xs font-medium hover:bg-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0'
            >
              Mua Hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
