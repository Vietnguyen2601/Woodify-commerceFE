import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { MapPin, Store, MessageSquare, CreditCard, Tag, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AssetIcon from '@/components/AssetIcon'
import chevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'
import { ROUTES } from '@/constants/routes'
import {
  ShopCart,
  CartItem,
  DeliveryAddress,
  Voucher,
  CheckoutSummary,
  PaymentMethod
} from '@/data/checkout-types'
import {
  MOCK_DELIVERY_ADDRESS,
  MOCK_SHOP_CARTS,
  updateShopNote,
  calculateCheckoutSummary,
  findVoucherByCode,
  formatCurrency
} from '@/data/checkout-mock-data'
import { paymentService, cartService, orderService } from '@/services'
import type { CheckoutShippingPreviewOption } from '@/services/order.service'
import type { CartItemDto } from '@/types'
import { readStoredUser } from '@/features/auth/utils/storage'
import { resolveCartItemLineId } from '@/utils/cartItemId'

const SHIPPING_OPTIONS = [
  { method: 'ECONOMY' as const, label: 'Ti\u1ebft ki\u1ec7m', code: 'ECO' as const },
  { method: 'STANDARD' as const, label: 'Ti\u00eau chu\u1ea9n', code: 'STD' as const },
  { method: 'EXPRESS' as const, label: 'Nhanh', code: 'EXP' as const },
] as const

const DEFAULT_SHIPPING = SHIPPING_OPTIONS[1]

function normalizeProviderServiceCode(c: string | null | undefined): string {
  const u = (c ?? '').trim().toUpperCase()
  if (u === 'STF') return 'STD'
  return u
}

function previewFeeForCode(
  options: CheckoutShippingPreviewOption[] | undefined,
  selectedCode: string | undefined
): number {
  if (!options?.length) return 0
  const want = normalizeProviderServiceCode(selectedCode)
  const hit = options.find(
    (o) => normalizeProviderServiceCode(o.providerServiceCode) === want
  )
  return hit?.totalAmountVnd ?? 0
}

function resolveCheckoutProviderServiceCode(cart: ShopCart): string {
  const raw = (cart.selected_shipping_code ?? '').trim().toUpperCase()
  if (raw === 'STF') return 'STD'
  if (raw === 'ECO' || raw === 'STD' || raw === 'EXP') return raw
  const fromMethod = SHIPPING_OPTIONS.find((o) => o.method === cart.selected_shipping_method)?.code
  return fromMethod ?? DEFAULT_SHIPPING.code
}

const normCartLineId = (id: string) => id.trim().toLowerCase()

/**
 * Đồng bộ dòng hàng với GetCart (luôn lấy giá/số lượng từ server).
 * `hadCriticalDiff`: lệch số lượng hoặc phiên bản so với trang → cần user xem lại rồi đặt lại.
 */
function mergeShopCartsWithServer(
  carts: ShopCart[],
  freshItems: CartItemDto[]
): { merged: ShopCart[]; hadCriticalDiff: boolean } {
  const { resolveLine } = buildFreshCartLookup(freshItems)
  let hadCriticalDiff = false
  const merged = carts.map((shop) => {
    let subtotal = 0
    const items: CartItem[] = shop.items.map((ci) => {
      const row = resolveLine(ci.cart_item_id, ci.shop_id, ci.product_id)
      if (!row) {
        subtotal += ci.subtotal
        return ci
      }
      if (row.quantity !== ci.quantity || row.versionId !== ci.product_id) {
        hadCriticalDiff = true
      }
      const next: CartItem = {
        ...ci,
        cart_item_id: row.cartItemId,
        quantity: row.quantity,
        price: row.price,
        subtotal: row.totalPrice,
        product_id: row.versionId,
        shop_id: row.shopId,
        product_name: row.productMasterName,
        variant_name: row.productVersionName,
        product_image: row.thumbnailUrl,
      }
      subtotal += next.subtotal
      return next
    })
    const shipping = shop.shipping_fee || 0
    return {
      ...shop,
      items,
      subtotal,
      total: subtotal + shipping,
    }
  })
  return { merged, hadCriticalDiff }
}

function readOrderMoneyField(obj: unknown, ...keys: string[]): number {
  if (!obj || typeof obj !== 'object') return 0
  const o = obj as Record<string, unknown>
  for (const key of keys) {
    const v = o[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

/**
 * PayOS / createPayment expect total amount in VND (field name is legacy "cents").
 * Order API may use camelCase or PascalCase. Subtotal/commission are often 1/10 catalog scale; shipping full VND.
 * Uses max(parts, lump total scaled) so missing camelCase fields do not collapse to a tiny amount (e.g. 3�).
 */
function orderPaymentAmountVnd(order: CreateOrderResponse['data']): number {
  const sub = readOrderMoneyField(order, 'subtotalCents', 'SubtotalCents')
  const ship = readOrderMoneyField(order, 'shippingFeeCents', 'ShippingFeeCents')
  const comm = readOrderMoneyField(order, 'commissionCents', 'CommissionCents')
  const totalRaw = readOrderMoneyField(order, 'totalAmountCents', 'TotalAmountCents')

  const fromParts = sub + ship + comm
  const fromLump = totalRaw > 0 ? totalRaw : 0
  return Math.round(Math.max(fromParts, fromLump))
}

/** When API money fields parse wrong, align with what the user sees on checkout. */
function resolveCheckoutPaymentAmountVnd(
  orders: CreateOrderResponse['data'][],
  summaryTotalVnd: number
): number {
  const sum = orders.reduce((s, o) => s + orderPaymentAmountVnd(o), 0)
  const rounded = Math.round(sum)
  if (summaryTotalVnd > 0 && rounded < summaryTotalVnd * 0.5) {
    return Math.round(summaryTotalVnd)
  }
  return rounded
}

/** Match checkout lines to GetCart rows by cartItemId, or by shopId+versionId if the id rotated. */
function buildFreshCartLookup(items: CartItemDto[]) {
  const byId = new Map<string, CartItemDto>()
  const byVersion = new Map<string, CartItemDto>()
  for (const i of items) {
    const cid = i.cartItemId?.trim()
    if (cid) byId.set(normCartLineId(cid), i)
    byVersion.set(`${i.shopId}|${i.versionId}`, i)
  }
  function resolveLine(cartItemId: string, shopId: string, versionId: string): CartItemDto | undefined {
    const id = (cartItemId || '').trim()
    if (id) {
      const hit = byId.get(normCartLineId(id))
      if (hit) return hit
    }
    return byVersion.get(`${shopId}|${versionId}`)
  }
  return { resolveLine, byId }
}

/** After PayOS redirect or stale localStorage, remap cart line ids from latest GetCart. */
function reconcileShopCartsFromFreshItems(carts: ShopCart[], freshItems: CartItemDto[]): ShopCart[] {
  const byId = new Map<string, CartItemDto>()
  const byVersion = new Map<string, CartItemDto>()
  for (const i of freshItems) {
    const cid = i.cartItemId?.trim().toLowerCase()
    if (cid) byId.set(cid, i)
    byVersion.set(`${i.shopId}|${i.versionId}`, i)
  }
  return carts.map((shop) => {
    let subtotal = 0
    const items: CartItem[] = shop.items.map((ci) => {
      const idKey = (ci.cart_item_id || '').trim().toLowerCase()
      let row = idKey ? byId.get(idKey) : undefined
      if (!row) row = byVersion.get(`${ci.shop_id}|${ci.product_id}`)
      if (!row) {
        subtotal += ci.subtotal
        return ci
      }
      const next: CartItem = {
        ...ci,
        cart_item_id: row.cartItemId,
        product_id: row.versionId,
        shop_id: row.shopId,
        product_name: row.productMasterName,
        variant_name: row.productVersionName,
        product_image: row.thumbnailUrl,
        price: row.price,
        quantity: row.quantity,
        subtotal: row.totalPrice,
      }
      subtotal += next.subtotal
      return next
    })
    const shipping = shop.shipping_fee || 0
    return { ...shop, items, subtotal, total: subtotal + shipping }
  })
}

export default function Checkout() {
  // Load checkout data from Cart page
  const getInitialShopCarts = (): ShopCart[] => {
    try {
      const checkoutData = localStorage.getItem('checkoutData')
      const checkoutItems = localStorage.getItem('checkoutItems')
      
      if (checkoutData) {
        const data = JSON.parse(checkoutData)
        // Transform cart items into ShopCart format
        return data.selectedByShop.map((shop: any) => {
          const rawItems = (shop.items ?? []) as CartItemDto[]
          const items = rawItems.map((item: CartItemDto) => ({
            cart_item_id: resolveCartItemLineId(item),
            product_id: item.versionId,
            shop_id: item.shopId,
            product_name: item.productMasterName,
            product_image: item.thumbnailUrl,
            variant_name: item.productVersionName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.totalPrice,
          }))
          const resolvedShopId =
            shop.shopId ??
            shop.shop_id ??
            rawItems.find((i) => i.shopId)?.shopId ??
            items.find((i) => i.shop_id)?.shop_id ??
            ''
          const resolvedShopName =
            (shop.shopName as string | undefined)?.trim() ||
            rawItems.find((i) => i.shopName?.trim())?.shopName?.trim() ||
            ''

          return {
            shop_id: resolvedShopId,
            shop_name: resolvedShopName,
            items,
            selected_shipping_method: DEFAULT_SHIPPING.method,
            selected_shipping_code: DEFAULT_SHIPPING.code,
            shipping_methods: [],
            shipping_fee: 0,
            note_to_seller: '',
            subtotal: shop.totalPrice,
            total: shop.totalPrice,
          }
        })
      }
      
      // Fallback to checkoutItems if checkoutData not available
      if (checkoutItems) {
        const items: CartItemDto[] = JSON.parse(checkoutItems)
        const groupedByShop = new Map<string, CartItemDto[]>()
        
        items.forEach((item) => {
          if (!groupedByShop.has(item.shopId)) {
            groupedByShop.set(item.shopId, [])
          }
          groupedByShop.get(item.shopId)!.push(item)
        })
        
        return Array.from(groupedByShop.entries()).map(([shopId, shopItems]) => {
          const totalPrice = shopItems.reduce((sum, item) => sum + item.totalPrice, 0)
          const resolvedShopId =
            shopId ||
            shopItems.find((i) => i.shopId)?.shopId ||
            ''

          return {
            shop_id: resolvedShopId,
            shop_name:
              shopItems.find((i) => i.shopName?.trim())?.shopName?.trim() || '',
            items: shopItems.map((item) => ({
              cart_item_id: resolveCartItemLineId(item),
              product_id: item.versionId,
              shop_id: item.shopId,
              product_name: item.productMasterName,
              product_image: item.thumbnailUrl,
              variant_name: item.productVersionName,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.totalPrice,
            })),
            selected_shipping_method: DEFAULT_SHIPPING.method,
            selected_shipping_code: DEFAULT_SHIPPING.code,
            shipping_methods: [],
            shipping_fee: 0,
            note_to_seller: '',
            subtotal: totalPrice,
            total: totalPrice,
          }
        })
      }
      
      // Use mock data if no checkout data available
      return MOCK_SHOP_CARTS.map((s) => ({
        ...s,
        selected_shipping_code:
          s.selected_shipping_code ??
          SHIPPING_OPTIONS.find((o) => o.method === s.selected_shipping_method)?.code ??
          DEFAULT_SHIPPING.code,
        shipping_methods: [],
        shipping_fee: 0,
        total: s.subtotal,
      }))
    } catch {
      return MOCK_SHOP_CARTS.map((s) => ({
        ...s,
        selected_shipping_code:
          s.selected_shipping_code ??
          SHIPPING_OPTIONS.find((o) => o.method === s.selected_shipping_method)?.code ??
          DEFAULT_SHIPPING.code,
        shipping_methods: [],
        shipping_fee: 0,
        total: s.subtotal,
      }))
    }
  }

  const [shopCarts, setShopCarts] = useState<ShopCart[]>(getInitialShopCarts())
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherError, setVoucherError] = useState('')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState(MOCK_DELIVERY_ADDRESS)
  const [tempAddress, setTempAddress] = useState({
    address_line: MOCK_DELIVERY_ADDRESS.address_line,
    city: MOCK_DELIVERY_ADDRESS.city,
    district: MOCK_DELIVERY_ADDRESS.district,
    ward: MOCK_DELIVERY_ADDRESS.ward
  })
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [placeOrderFeedback, setPlaceOrderFeedback] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const navigate = useNavigate()

  const [shippingPreviewByShop, setShippingPreviewByShop] = useState<
    Record<string, { loading: boolean; error?: string; options: CheckoutShippingPreviewOption[] }>
  >({})

  const shippingPreviewFetchKey = useMemo(
    () =>
      JSON.stringify(
        shopCarts.map((s) => ({
          shopId: s.shop_id,
          ids: [...s.items.map((i) => i.cart_item_id)].filter(Boolean).sort(),
        }))
      ),
    [shopCarts]
  )

  useEffect(() => {
    const accountId = readStoredUser()?.accountId?.trim()
    if (!accountId || shopCarts.length === 0) {
      setShippingPreviewByShop({})
      return
    }

    let cancelled = false

    void (async () => {
      await Promise.all(
        shopCarts.map(async (cart) => {
          const shopId = cart.shop_id?.trim()
          const cartItemIds = cart.items
            .map((i) => i.cart_item_id)
            .filter((id): id is string => Boolean(id && String(id).trim()))
          if (!shopId || cartItemIds.length === 0) return

          setShippingPreviewByShop((prev) => ({
            ...prev,
            [shopId]: {
              loading: true,
              options: prev[shopId]?.options ?? [],
              error: undefined,
            },
          }))

          try {
            const data = await orderService.previewCheckoutShipping({
              accountId,
              shopId,
              cartItemIds,
            })
            if (cancelled) return
            const options = data.options ?? []
            setShippingPreviewByShop((prev) => ({
              ...prev,
              [shopId]: { loading: false, options },
            }))
            setShopCarts((prev) =>
              prev.map((s) => {
                if (s.shop_id !== shopId) return s
                const fee = previewFeeForCode(options, s.selected_shipping_code)
                return { ...s, shipping_fee: fee, total: s.subtotal + fee }
              })
            )
          } catch (e: unknown) {
            if (cancelled) return
            const msg =
              e &&
              typeof e === 'object' &&
              'message' in e &&
              typeof (e as { message: string }).message === 'string'
                ? (e as { message: string }).message
                : 'Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c ph\u00ed v\u1eadn chuy\u1ec3n'
            setShippingPreviewByShop((prev) => ({
              ...prev,
              [shopId]: { loading: false, options: [], error: msg },
            }))
          }
        })
      )
    })()

    return () => {
      cancelled = true
    }
  }, [shippingPreviewFetchKey])

  useEffect(() => {
    document.body.classList.add('checkout-route-bg')
    return () => {
      document.body.classList.remove('checkout-route-bg')
    }
  }, [])

  // Clean up localStorage after loading
  useEffect(() => {
    // Keep data during this session, but clear after component unmounts
    return () => {
      // Optional: uncomment to clear after checkout complete
      // localStorage.removeItem('checkoutData')
      // localStorage.removeItem('checkoutItems')
    }
  }, [])

  const summary: CheckoutSummary = useMemo(
    () => calculateCheckoutSummary(shopCarts, appliedVoucher),
    [shopCarts, appliedVoucher]
  )

  const handleNoteChange = (shopId: string, note: string) => {
    setShopCarts(updateShopNote(shopCarts, shopId, note))
  }

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá')
      return
    }

    const voucher = findVoucherByCode(voucherCode)
    if (!voucher) {
      setVoucherError('Mã giảm giá không tồn tại')
      return
    }

    // Check minimum order requirement
    if (
      voucher.min_order &&
      summary.merchandise_subtotal < voucher.min_order
    ) {
      setVoucherError(
        `Mã này áp dụng cho đơn tối thiểu ${formatCurrency(voucher.min_order)}`
      )
      return
    }

    setAppliedVoucher(voucher)
    setVoucherError('')
    setVoucherCode('')
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(undefined)
    setVoucherCode('')
    setVoucherError('')
  }

  const handleOpenAddressModal = () => {
    setTempAddress({
      address_line: deliveryAddress.address_line,
      city: deliveryAddress.city,
      district: deliveryAddress.district,
      ward: deliveryAddress.ward
    })
    setShowAddressModal(true)
  }

  const handleConfirmAddress = () => {
    setDeliveryAddress({
      ...deliveryAddress,
      ...tempAddress
    })
    setShowAddressModal(false)
  }

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true)
      setPlaceOrderFeedback(null)

      // Get current user
      const currentUser = readStoredUser()
      if (!currentUser?.accountId) {
        setPlaceOrderFeedback({
          kind: 'error',
          message: 'Vui lòng đăng nhập để tiếp tục.',
        })
        return
      }

      // Format delivery address as string: "123 Đường, Phường, Quận, TP"
      const deliveryAddressString = `${deliveryAddress.address_line}, ${deliveryAddress.ward}, ${deliveryAddress.district}, ${deliveryAddress.city}`

      const orderPayloads = shopCarts.map((cart) => {
        const cartItemIds = cart.items
          .map((item) => item.cart_item_id)
          .filter((id): id is string => Boolean(id && String(id).trim()))
        return { cart, cartItemIds }
      })
      if (orderPayloads.some((p) => p.cartItemIds.length === 0)) {
        setPlaceOrderFeedback({
          kind: 'error',
          message:
            'Không tìm thấy mã dòng giỏ hàng để đặt hàng. Vui lòng quay lại giỏ hàng hoặc chọn "Mua ngay" lại.',
        })
        return
      }

      let freshCart: Awaited<ReturnType<typeof cartService.getCart>>
      try {
        freshCart = await cartService.getCart(currentUser.accountId!)
      } catch {
        setPlaceOrderFeedback({
          kind: 'error',
          message: 'Không tải được giỏ hàng. Vui lòng thử lại.',
        })
        return
      }

      const freshList = freshCart.items ?? []
      const { resolveLine } = buildFreshCartLookup(freshList)

      for (const { cart } of orderPayloads) {
        const rows = cart.items
          .map((item) => resolveLine(item.cart_item_id, item.shop_id, item.product_id))
          .filter((row): row is CartItemDto => Boolean(row))
        if (rows.length !== cartItemIds.length) {
          setPlaceOrderFeedback({
            kind: 'error',
            message:
              'Giỏ hàng đã thay đổi hoặc dòng hàng không còn hợp lệ. Vui lòng quay lại giỏ hàng hoặc tải lại trang.',
          })
          return
        }
        for (const row of rows) {
          if (row.isOutOfStock) {
            setPlaceOrderFeedback({
              kind: 'error',
              message: `Sản phẩm "${row.productMasterName}" không đủ hàng hoặc đã hết. Vui lòng chỉnh số lượng trong giỏ hàng rồi thử lại.`,
            })
            return
          }
          const em = row.errorMessage?.trim()
          if (em) {
            setPlaceOrderFeedback({ kind: 'error', message: em })
            return
          }
        }
        const shopIds = new Set(rows.map((r) => r.shopId))
        if (shopIds.size !== 1) {
          setPlaceOrderFeedback({
            kind: 'error',
            message: 'Không thể tạo đơn: dữ liệu cửa hàng không nhất quán. Vui lòng tải lại trang.',
          })
          return
        }
      }

      const { merged, hadCriticalDiff } = mergeShopCartsWithServer(shopCarts, freshList)
      setShopCarts(merged)
      if (hadCriticalDiff) {
        setPlaceOrderFeedback({
          kind: 'error',
          message:
            'Số lượng hoặc phiên bản sản phẩm trên trang khác với giỏ hàng trên server. Đã cập nhật hiển thị — vui lòng kiểm tra lại rồi bấm Đặt hàng.',
        })
        return
      }

      // Step 1: Create orders for each shop in parallel (shopId + cartItemIds theo đúng dữ liệu server)
      const orderPromises = orderPayloads.map(({ cart }) => {
        const rows = cart.items
          .map((item) => resolveLine(item.cart_item_id, item.shop_id, item.product_id))
          .filter((row): row is CartItemDto => Boolean(row))
        const orderShopId = rows[0]!.shopId
        const canonicalIds = rows.map((r) => r.cartItemId)
        const providerServiceCode = resolveCheckoutProviderServiceCode(cart)
        return paymentService.createOrder({
          accountId: currentUser.accountId!,
          shopId: orderShopId,
          cartItemIds: canonicalIds,
          deliveryAddress: deliveryAddressString,
          providerServiceCode,
          voucherId: appliedVoucher?.voucher_id || null,
        })
      })

      const orderResults = await Promise.all(orderPromises)

      const orderIds = orderResults.map((r) => r.orderId)
      /** Same VND total as sidebar `summary.total_payment` (merged carts + voucher). */
      const totalAmountVnd = Math.round(
        calculateCheckoutSummary(merged, appliedVoucher).total_payment
      )

      // Step 2: Create payment
      const baseUrl = window.location.origin

      const paymentRequest = {
        orderIds: orderIds,
        paymentMethod: paymentMethod,
        accountId: currentUser.accountId!,
        totalAmountVnd,
        ...(paymentMethod === 'PAYOS' && {
          returnUrl: `${baseUrl}/payment/success`,
          cancelUrl: `${baseUrl}/payment/cancel`
        })
      }

      const paymentResponse = await paymentService.createPayment(paymentRequest)

      // Step 3: Handle payment response based on method
      if (paymentMethod === 'PAYOS') {
        const payUrl = (paymentResponse as { paymentUrl?: string }).paymentUrl
        if (payUrl) {
          window.location.href = payUrl
        } else {
          setPlaceOrderFeedback({
            kind: 'error',
            message: 'Không nhận được liên kết thanh toán PayOS. Vui lòng thử lại.',
          })
        }
      } else if (paymentMethod === 'COD' || paymentMethod === 'WALLET') {
        const orderCodes = orderResults.map((r) => r.orderId).join(',')
        setPlaceOrderFeedback({
          kind: 'success',
          message: `Đơn hàng đã được tạo thành công. Phương thức thanh toán: ${getPaymentMethodLabel(paymentMethod)}.`,
        })
        window.setTimeout(() => {
          navigate(`/payment/success?orderCode=${orderCodes}&amount=${totalAmountVnd}`)
        }, 900)
      }

    } catch (error: unknown) {
      const err = error as {
        data?: unknown
        response?: { data?: unknown }
        message?: string
      }
      let apiMsg = ''
      const d = err.data ?? err.response?.data
      if (typeof d === 'string') {
        apiMsg = d
      } else if (d && typeof d === 'object') {
        const o = d as Record<string, unknown>
        if (typeof o.detail === 'string') apiMsg = o.detail
        else if (typeof o.message === 'string') apiMsg = o.message
        else if (Array.isArray(o.message)) apiMsg = o.message.map(String).join(', ')
        else if (typeof o.title === 'string') apiMsg = o.title
        const rawErrors = o.errors
        if (
          rawErrors &&
          typeof rawErrors === 'object' &&
          !Array.isArray(rawErrors) &&
          !apiMsg
        ) {
          const parts = Object.values(rawErrors as Record<string, unknown>)
            .flatMap((v) => (Array.isArray(v) ? v : [v]))
            .map(String)
            .filter(Boolean)
          if (parts.length) apiMsg = parts.join('; ')
        }
      }
      let errorMsg = apiMsg || err.message || 'Có lỗi xảy ra khi tạo đơn hàng'
      if (/invalid item/i.test(errorMsg)) {
        errorMsg +=
          ' Gợi ý: thử giảm số lượng trong giỏ hàng hoặc tải lại trang thanh toán sau khi cập nhật giỏ trên server.'
      }
      setPlaceOrderFeedback({ kind: 'error', message: errorMsg })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      COD: 'Thanh toán khi nhận (COD)',
      WALLET: 'Ví điện tử (Momo, ZaloPay)',
      PAYOS: 'Chuyển khoản ngân hàng (PayOS QR)'
    }
    return labels[method]
  }

  return (
    <div className='checkout-route min-h-screen w-full bg-transparent pb-14'>
      <div className='mx-auto w-full min-w-0 max-w-[min(1386px,calc(100%-2rem))] px-4 pb-8 pt-5 sm:px-6 lg:px-10 lg:pt-6'>
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
            <li>
              <Link to={ROUTES.CART} className='text-[#6C5B50] no-underline hover:text-[#BE9C73]'>
                Giỏ hàng
              </Link>
            </li>
            <li aria-hidden='true' className='flex items-center opacity-45'>
              <AssetIcon src={chevronRightIcon} width={12} height={12} />
            </li>
            <li className='font-semibold text-black'>Thanh toán</li>
          </ol>
        </nav>

        <header className='mb-8'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a6a4c]'>
            Đơn hàng
          </p>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight text-[#3f2a1d] sm:text-[1.65rem]'>
            Thanh toán
          </h1>
          <p className='mt-1.5 max-w-2xl text-sm text-black/55'>
            Hoàn tất đơn hàng của bạn từ {shopCarts.length} cửa hàng
          </p>
        </header>

        <div className='flex w-full min-w-0 flex-col gap-6 md:flex-row md:items-start md:gap-8'>
          {/* LEFT — flex 7 : 3, kéo full chiều ngang khung */}
          <div className='min-w-0 w-full space-y-6 md:flex-[7_1_0%]'>
            {/* DELIVERY ADDRESS CARD */}
            <div className='rounded-2xl border border-[#ece6dd] bg-[#fffcf9] p-4 shadow-[0_1px_0_rgba(36,28,21,0.05)]'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5 shrink-0 text-[#6C5B50]' />
                  <h2 className='text-sm font-semibold text-[#3f2a1d]'>Địa chỉ nhận hàng</h2>
                </div>
                <button
                  type='button'
                  onClick={handleOpenAddressModal}
                  className='rounded-full border border-[#ece6dd] bg-[#f8f3ec] px-3 py-1.5 text-sm font-semibold text-[#6C5B50] transition hover:border-[#BE9C73]/40 hover:bg-[#ebe3d4]'
                >
                  Thay đổi
                </button>
              </div>

              <div className='space-y-2'>
                <p className='text-sm leading-relaxed text-black/60'>
                  {deliveryAddress.address_line}, {deliveryAddress.ward},{' '}
                  {deliveryAddress.district}, {deliveryAddress.city}
                </p>
              </div>
            </div>

            {/* SHOP CART CARDS */}
            {shopCarts.map((shop, shopIndex) => (
              <div
                key={shop.shop_id || `checkout-shop-${shopIndex}`}
                className='overflow-hidden rounded-2xl border border-[#ece6dd] bg-[#fffcf9] shadow-[0_1px_0_rgba(36,28,21,0.05)]'
              >
                <div className='flex flex-wrap items-start justify-between gap-3 border-b border-[#ece6dd] bg-[#f8f3ec] px-4 py-3 sm:items-center'>
                  <div className='flex min-w-0 flex-1 items-start gap-3 sm:items-center'>
                    <Store className='mt-0.5 h-5 w-5 shrink-0 text-[#6C5B50] sm:mt-0' aria-hidden />
                    <div className='min-w-0 flex-1'>
                      <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a6a4c]'>
                        Cửa hàng
                      </p>
                      {shop.shop_id ? (
                        <Link
                          to={ROUTES.SHOP(shop.shop_id, shop.shop_name)}
                          className='mt-0.5 block truncate text-base font-semibold text-[#3f2a1d] no-underline hover:text-[#6C5B50]'
                          title={shop.shop_name?.trim() || undefined}
                        >
                          {shop.shop_name?.trim() ||
                            `Shop · ${String(shop.shop_id).slice(0, 8)}…`}
                        </Link>
                      ) : (
                        <span className='mt-0.5 block truncate text-base font-semibold text-[#3f2a1d]'>
                          {shop.shop_name?.trim() || 'Cửa hàng'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className='shrink-0 rounded-full border border-[#d4cab8] bg-white/80 px-2.5 py-0.5 text-xs font-medium text-[#5c4a3d]'>
                    {shop.items.length} sản phẩm
                  </span>
                </div>

                <div className='space-y-3 border-b border-[#ece6dd]/90 p-4'>
                  {shop.items.map(item => (
                    <div key={item.cart_item_id} className='flex gap-3'>
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className='h-20 w-20 shrink-0 rounded-lg border border-[#ece6dd] object-cover'
                      />

                      <div className='min-w-0 flex-1'>
                        <p className='line-clamp-2 text-sm font-semibold text-[#3f2a1d]'>
                          {item.product_name}
                        </p>
                        {item.variant_name && (
                          <p className='mt-1 text-xs text-black/50'>Phân loại: {item.variant_name}</p>
                        )}
                        <div className='mt-2 flex items-center justify-between gap-2'>
                          <p className='font-semibold text-[#6C5B50]'>{formatCurrency(item.price)}</p>
                          <p className='text-xs text-black/50'>×{item.quantity}</p>
                        </div>
                      </div>

                      <div className='shrink-0 text-right'>
                        <p className='text-sm font-semibold text-[#6C5B50]'>{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='border-b border-[#ece6dd]/90 px-4 py-3'>
                  <p className='mb-2 text-sm font-semibold text-[#3f2a1d]'>{'Ph\u01b0\u01a1ng th\u1ee9c v\u1eadn chuy\u1ec3n'}</p>
                  {shippingPreviewByShop[shop.shop_id]?.error &&
                    !shippingPreviewByShop[shop.shop_id]?.loading && (
                      <p className='mb-2 text-xs text-red-600/85'>
                        {shippingPreviewByShop[shop.shop_id]!.error}
                      </p>
                    )}
                  <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap'>
                    {SHIPPING_OPTIONS.map(({ method, label, code }) => {
                      const selected = shop.selected_shipping_method === method
                      const preview = shippingPreviewByShop[shop.shop_id]
                      const opt = preview?.options.find(
                        (o) => normalizeProviderServiceCode(o.providerServiceCode) === normalizeProviderServiceCode(code)
                      )
                      return (
                        <label
                          key={method}
                          className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            selected
                              ? 'border-[#6C5B50] bg-[#f8f3ec] text-[#3f2a1d]'
                              : 'border-[#ece6dd] bg-white text-black/70 hover:border-[#d4cab8]'
                          }`}
                        >
                          <input
                            type='radio'
                            name={`checkout_ship_${shop.shop_id || shopIndex}`}
                            className='accent-[#6C5B50] mt-0.5'
                            checked={selected}
                            onChange={() => {
                              const fee = previewFeeForCode(preview?.options, code)
                              setShopCarts((prev) =>
                                prev.map((s) =>
                                  s.shop_id === shop.shop_id
                                    ? {
                                        ...s,
                                        selected_shipping_method: method,
                                        selected_shipping_code: code,
                                        shipping_fee: fee,
                                        total: s.subtotal + fee,
                                      }
                                    : s
                                )
                              )
                            }}
                          />
                          <span className='min-w-0 flex-1'>
                            <span className='block'>
                              {label}{' '}
                              <span className='text-xs text-black/45'>({code})</span>
                            </span>
                            {preview?.loading ? (
                              <span className='mt-0.5 block text-xs text-black/40'>
                                {'\u0110ang t\u00ednh ph\u00ed\u2026'}
                              </span>
                            ) : preview?.error ? (
                              <span className='mt-0.5 block text-xs text-black/35'>{'\u2014'}</span>
                            ) : opt ? (
                              <span className='mt-0.5 block text-xs font-medium text-[#6C5B50]'>
                                {opt.isFreeShipping || opt.totalAmountVnd <= 0
                                  ? 'Mi\u1ec5n ph\u00ed v\u1eadn chuy\u1ec3n'
                                  : formatCurrency(opt.totalAmountVnd)}
                              </span>
                            ) : (
                              <span className='mt-0.5 block text-xs text-black/35'>{'\u2014'}</span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Seller Note */}
                <div className='border-b border-[#ece6dd]/90 px-4 py-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4 shrink-0 text-[#6C5B50]' />
                    <label
                      htmlFor={`note_${shop.shop_id}`}
                      className='text-sm font-semibold text-[#3f2a1d]'
                    >
                      Lời nhắn cho người bán
                    </label>
                  </div>
                  <textarea
                    id={`note_${shop.shop_id}`}
                    value={shop.note_to_seller || ''}
                    onChange={(e) => handleNoteChange(shop.shop_id, e.target.value)}
                    placeholder='Nhập lời nhắn của bạn...'
                    className='h-16 w-full resize-none rounded-lg border border-[#ece6dd] bg-white px-3 py-2 text-sm text-[#3f2a1d] placeholder:text-black/35 focus:border-[#6C5B50] focus:outline-none focus:ring-1 focus:ring-[#6C5B50]/25'
                  />
                </div>

                <div className='space-y-2 bg-[#f8f3ec]/50 px-4 py-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-black/55'>Tiền hàng ({shop.items.length} sản phẩm):</span>
                    <span className='font-semibold text-[#3f2a1d]'>{formatCurrency(shop.subtotal)}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-black/55'>Phí vận chuyển:</span>
                    <span className='font-semibold text-[#3f2a1d]'>{formatCurrency(shop.shipping_fee)}</span>
                  </div>
                  <div className='flex items-center justify-between border-t border-[#ece6dd]/90 pt-2'>
                    <span className='text-sm font-semibold text-[#3f2a1d]'>Tạm tính (shop):</span>
                    <span className='font-semibold text-[#6C5B50]'>{formatCurrency(shop.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className='min-w-0 w-full space-y-4 md:flex-[3_1_0%]'>
            <div className='md:sticky md:top-24'>
              <div className='mb-4 rounded-2xl border border-[#ece6dd] bg-[#fffcf9] p-4 shadow-[0_1px_0_rgba(36,28,21,0.05)]'>
                <div className='mb-4 flex items-center gap-2'>
                  <CreditCard className='h-5 w-5 shrink-0 text-[#6C5B50]' />
                  <h3 className='text-sm font-semibold text-[#3f2a1d]'>Phương thức thanh toán</h3>
                </div>

                <div className='space-y-2'>
                  {(['COD', 'PAYOS', 'WALLET'] as const).map(method => (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                        paymentMethod === method
                          ? 'border-[#6C5B50] bg-[#f8f3ec]'
                          : 'border-[#ece6dd] bg-white/80 hover:border-[#d4cab8]'
                      }`}
                    >
                      <input
                        type='radio'
                        name='payment_method'
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as PaymentMethod)
                        }
                        className='h-4 w-4 shrink-0'
                        style={{ accentColor: '#6C5B50' }}
                      />
                      <span className='text-sm font-semibold text-[#3f2a1d]'>
                        {getPaymentMethodLabel(method)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='mb-4 rounded-2xl border border-[#ece6dd] bg-[#fffcf9] p-4 shadow-[0_1px_0_rgba(36,28,21,0.05)]'>
                <div className='mb-4 flex items-center gap-2'>
                  <Tag className='h-5 w-5 shrink-0 text-[#6C5B50]' />
                  <h3 className='text-sm font-semibold text-[#3f2a1d]'>Mã giảm giá</h3>
                </div>

                {!appliedVoucher ? (
                  <div className='space-y-3'>
                    <p className='text-sm text-black/55'>Chưa áp dụng mã giảm giá</p>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value)
                          setVoucherError('')
                        }}
                        placeholder='Nhập mã'
                        className='min-w-0 flex-1 rounded-lg border border-[#ece6dd] bg-white px-3 py-2 text-sm text-[#3f2a1d] placeholder:text-black/35 focus:border-[#6C5B50] focus:outline-none focus:ring-1 focus:ring-[#6C5B50]/25'
                      />
                      <button
                        type='button'
                        onClick={handleApplyVoucher}
                        className='shrink-0 rounded-lg bg-[#6C5B50] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#554538]'
                      >
                        Áp dụng
                      </button>
                    </div>
                    {voucherError && <p className='text-xs text-red-600'>{voucherError}</p>}
                  </div>
                ) : (
                  <div className='rounded-xl border border-[#d4cab8] bg-[#f8f3ec] p-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <p className='font-semibold text-[#3f2a1d]'>{appliedVoucher.code}</p>
                        <p className='mt-1 text-xs text-black/55'>{appliedVoucher.title}</p>
                      </div>
                      <button
                        type='button'
                        onClick={handleRemoveVoucher}
                        className='text-black/40 transition-colors hover:text-[#6C5B50]'
                        aria-label='Bỏ mã giảm giá'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className='rounded-2xl border border-[#ece6dd] bg-[#fffcf9] p-4 shadow-[0_1px_0_rgba(36,28,21,0.05)]'>
                <h3 className='mb-4 text-sm font-semibold text-[#3f2a1d]'>Chi tiết thanh toán</h3>

                <div className='mb-4 space-y-2 border-b border-[#ece6dd] pb-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-black/55'>Tổng tiền hàng:</span>
                    <span className='font-semibold text-[#3f2a1d]'>
                      {formatCurrency(summary.merchandise_subtotal)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-black/55'>Phí vận chuyển:</span>
                    <span className='font-semibold text-[#3f2a1d]'>
                      {formatCurrency(summary.total_shipping_fee)}
                    </span>
                  </div>

                  {appliedVoucher && summary.voucher_discount > 0 && (
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-semibold text-emerald-700'>Giảm giá voucher:</span>
                      <span className='font-semibold text-emerald-700'>
                        -{formatCurrency(summary.voucher_discount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className='mb-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-semibold text-[#3f2a1d]'>Tổng thanh toán</span>
                    <span className='text-lg font-bold text-[#6C5B50]'>
                      {formatCurrency(summary.total_payment)}
                    </span>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || placeOrderFeedback?.kind === 'success'}
                  className='mb-3 w-full rounded-full bg-[#6C5B50] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#554538] disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>

                {placeOrderFeedback && (
                  <p
                    role='alert'
                    className={`mb-3 text-center text-sm leading-snug ${
                      placeOrderFeedback.kind === 'error'
                        ? 'font-medium text-red-600'
                        : 'font-medium text-emerald-700'
                    }`}
                  >
                    {placeOrderFeedback.message}
                  </p>
                )}

                <p className='text-center text-xs text-black/45'>
                  Bằng việc đặt hàng, bạn đã đồng ý với các{' '}
                  <span className='cursor-pointer text-[#6C5B50] hover:underline'>điều khoản &amp; điều kiện</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='checkout-address-modal-title'
        >
          <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#ece6dd] bg-[#fffcf9] p-6 shadow-xl sm:p-8'>
            <div className='mb-6'>
              <h2 id='checkout-address-modal-title' className='text-xl font-semibold text-[#3f2a1d]'>
                Thông tin giao hàng
              </h2>
              <p className='mt-1 text-sm text-black/55'>Chúng tôi sẽ giao hàng đến địa chỉ của bạn</p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-[#3f2a1d]'>Địa chỉ giao hàng</label>
                <input
                  type='text'
                  value={tempAddress.address_line}
                  onChange={(e) => setTempAddress({ ...tempAddress, address_line: e.target.value })}
                  className='h-12 w-full rounded-lg border border-[#ece6dd] bg-white px-4 text-sm text-[#3f2a1d] focus:border-[#6C5B50] focus:outline-none focus:ring-1 focus:ring-[#6C5B50]/25'
                  placeholder='Nhập địa chỉ'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-[#3f2a1d]'>Thành phố</label>
                  <input
                    type='text'
                    value={tempAddress.city}
                    onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                    className='h-12 w-full rounded-lg border border-[#ece6dd] bg-white px-4 text-sm text-[#3f2a1d] focus:border-[#6C5B50] focus:outline-none focus:ring-1 focus:ring-[#6C5B50]/25'
                    placeholder='Hà Nội'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-[#3f2a1d]'>Quận/Huyện</label>
                  <input
                    type='text'
                    value={tempAddress.district}
                    onChange={(e) => setTempAddress({ ...tempAddress, district: e.target.value })}
                    className='h-12 w-full rounded-lg border border-[#ece6dd] bg-white px-4 text-sm text-[#3f2a1d] focus:border-[#6C5B50] focus:outline-none focus:ring-1 focus:ring-[#6C5B50]/25'
                    placeholder='Ba Đình'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-[#3f2a1d]'>Phường/Xã</label>
                  <input
                    type='text'
                    value={tempAddress.ward}
                    onChange={(e) => setTempAddress({ ...tempAddress, ward: e.target.value })}
                    className='h-12 w-full rounded-lg border border-[#ece6dd] bg-white px-4 text-sm text-[#3f2a1d] focus:border-[#6C5B50] focus:outline-none focus:ring-1 focus:ring-[#6C5B50]/25'
                    placeholder='Phường XYZ'
                  />
                </div>
              </div>
            </div>

            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <button
                type='button'
                onClick={handleConfirmAddress}
                className='flex-1 rounded-full bg-[#6C5B50] py-3 text-sm font-semibold text-white transition hover:bg-[#554538]'
              >
                Xác nhận
              </button>
              <button
                type='button'
                onClick={() => setShowAddressModal(false)}
                className='flex-1 rounded-full border border-[#ece6dd] bg-white py-3 text-sm font-semibold text-[#3f2a1d] transition hover:border-[#d4cab8]'
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
