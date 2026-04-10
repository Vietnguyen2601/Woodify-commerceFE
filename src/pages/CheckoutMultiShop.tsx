import React, { useState, useMemo, useEffect } from 'react'
import { MapPin, Store, MessageSquare, CreditCard, Tag, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ShopCart,
  DeliveryAddress,
  Voucher,
  CheckoutSummary,
  PaymentMethod
} from '@/data/checkout-types'
import {
  MOCK_DELIVERY_ADDRESS,
  MOCK_SHOP_CARTS,
  updateShopShippingMethod,
  updateShopNote,
  calculateCheckoutSummary,
  findVoucherByCode,
  formatCurrency,
  AVAILABLE_SHIPPING_METHODS
} from '@/data/checkout-mock-data'
import { shipmentService, paymentService } from '@/services'
import type { CartItemDto, ShipmentService } from '@/types'
import { readStoredUser } from '@/features/auth/utils/storage'

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
          const items = shop.items.map((item: CartItemDto) => ({
            cart_item_id: item.cartItemId,
            product_id: item.versionId,
            shop_id: item.shopId,
            product_name: item.productMasterName,
            product_image: item.thumbnailUrl,
            variant_name: item.productVersionName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.totalPrice,
          }))
          
          return {
            shop_id: shop.shopId,
            shop_name: shop.shopName,
            items,
            selected_shipping_method: 'STANDARD' as const,
            shipping_methods: AVAILABLE_SHIPPING_METHODS,
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
          
          return {
            shop_id: shopId,
            shop_name: shopItems[0].shopName,
            items: shopItems.map((item) => ({
              cart_item_id: item.cartItemId,
              product_id: item.versionId,
              shop_id: item.shopId,
              product_name: item.productMasterName,
              product_image: item.thumbnailUrl,
              variant_name: item.productVersionName,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.totalPrice,
            })),
            selected_shipping_method: 'STANDARD' as const,
            shipping_methods: AVAILABLE_SHIPPING_METHODS,
            shipping_fee: 0,
            note_to_seller: '',
            subtotal: totalPrice,
            total: totalPrice,
          }
        })
      }
      
      // Use mock data if no checkout data available
      return MOCK_SHOP_CARTS
    } catch (error) {
      console.error('Failed to load checkout data:', error)
      return MOCK_SHOP_CARTS
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
  // Store shipment services for each shop
  const [shipmentServicesByShop, setShipmentServicesByShop] = useState<Record<string, ShipmentService[]>>({})
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const navigate = useNavigate()

  // Clean up localStorage after loading
  useEffect(() => {
    // Keep data during this session, but clear after component unmounts
    return () => {
      // Optional: uncomment to clear after checkout complete
      // localStorage.removeItem('checkoutData')
      // localStorage.removeItem('checkoutItems')
    }
  }, [])

  // Fetch shipment services for each shop (only once on mount)
  useEffect(() => {
    const fetchShipmentServices = async () => {
      console.log('🚀 Fetching shipment services for shops:', shopCarts.map(s => s.shop_id))
      const services: Record<string, ShipmentService[]> = {}
      
      for (const shop of shopCarts) {
        try {
          const data = await shipmentService.getServicesByShopId(shop.shop_id)
          console.log(`✅ Shipment services for shop ${shop.shop_id}:`, data)
          services[shop.shop_id] = data
        } catch (error) {
          console.error(`❌ Failed to fetch shipment services for shop ${shop.shop_id}:`, error)
          // Skip adding to services on error - will fall back to mock data in rendering
          services[shop.shop_id] = []
        }
      }
      
      console.log('📦 All shipment services:', services)
      setShipmentServicesByShop(services)
    }

    if (shopCarts.length > 0) {
      fetchShipmentServices()
    }
    // Only fetch when component mounts or when shopCarts initial data is loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - fetch only once on mount

  // Update shipping codes when shipment services are fetched
  useEffect(() => {
    if (Object.keys(shipmentServicesByShop).length === 0) return

    setShopCarts(prevCarts =>
      prevCarts.map(shop => {
        const apiServices = shipmentServicesByShop[shop.shop_id] || []
        let shippingCode = shop.selected_shipping_code || ''

        // Only set the code for STANDARD method if no code is set yet
        if (apiServices.length > 0 && !shop.selected_shipping_code) {
          const standardService = apiServices.find(
            service => (service as any).speedLevel === 'STANDARD'
          )
          if (standardService) {
            shippingCode = (standardService as any).code
          }
        } else if (apiServices.length === 0 && !shop.selected_shipping_code) {
          // Use STANDARD for mock data
          shippingCode = 'STANDARD'
        }

        return {
          ...shop,
          selected_shipping_code: shippingCode,
          // Keep shipping_fee as is - will be set by another API
          total: shop.subtotal + shop.shipping_fee
        }
      })
    )
  }, [shipmentServicesByShop])
  const summary: CheckoutSummary = useMemo(
    () => calculateCheckoutSummary(shopCarts, appliedVoucher),
    [shopCarts, appliedVoucher]
  )

  const handleShippingMethodChange = (shopId: string, serviceCode: string, speedLevel: 'ECONOMY' | 'STANDARD' | 'EXPRESS') => {
    // Update shop carts with new shipping method and code
    setShopCarts(prevCarts =>
      prevCarts.map(shop => {
        if (shop.shop_id === shopId) {
          return {
            ...shop,
            selected_shipping_method: speedLevel, // Keep speedLevel for backward compatibility
            selected_shipping_code: serviceCode, // Use actual code for API
            shipping_fee: shop.shipping_fee, // Keep existing fee
            total: shop.subtotal + shop.shipping_fee
          }
        }
        return shop
      })
    )
  }

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

      // Get current user
      const currentUser = readStoredUser()
      if (!currentUser?.accountId) {
        alert('Vui lòng đăng nhập để tiếp tục')
        return
      }

      // Format delivery address as string: "123 Đường, Phường, Quận, TP"
      const deliveryAddressString = `${deliveryAddress.address_line}, ${deliveryAddress.ward}, ${deliveryAddress.district}, ${deliveryAddress.city}`

      console.log('📋 Starting order creation process...')
      console.log('User:', currentUser.accountId)
      console.log('Address:', deliveryAddressString)

      // Step 1: Create orders for each shop in parallel
      const orderPromises = shopCarts.map(cart =>
        paymentService.createOrder({
          accountId: currentUser.accountId!,
          shopId: cart.shop_id,
          cartItemIds: cart.items.map(item => item.cart_item_id),
          deliveryAddress: deliveryAddressString,
          providerServiceCode: cart.selected_shipping_code as any,
          voucherId: appliedVoucher?.voucher_id || null
        })
      )

      console.log('📤 Creating orders for', shopCarts.length, 'shop(s)...')
      const orderResults = await Promise.all(orderPromises)
      console.log('✅ Orders created:', orderResults.map(r => r.orderId))

      // Extract order IDs and calculate total
      const orderIds = orderResults.map(r => r.orderId)
      const totalAmountCents = orderResults.reduce(
        (sum, r) => sum + r.totalAmountCents,
        0
      )

      console.log('💰 Total amount (cents):', totalAmountCents)

      // Step 2: Create payment
      const baseUrl = window.location.origin

      const paymentRequest = {
        orderIds: orderIds,
        paymentMethod: paymentMethod,
        accountId: currentUser.accountId!,
        totalAmountCents: totalAmountCents * 10,  // Convert cents to smallest payment unit
        ...(paymentMethod === 'PAYOS' && {
          returnUrl: `${baseUrl}/payment/success`,
          cancelUrl: `${baseUrl}/payment/cancel`
        })
      }

      console.log('💳 Creating payment with method:', paymentMethod)
      const paymentResponse = await paymentService.createPayment(paymentRequest)
      console.log('✅ Payment created:', paymentResponse)

      // Step 3: Handle payment response based on method
      if (paymentMethod === 'PAYOS') {
        // Redirect to PayOS QR code page
        if ((paymentResponse as any).paymentUrl) {
          console.log('🔄 Redirecting to PayOS...')
          window.location.href = (paymentResponse as any).paymentUrl
        }
      } else if (paymentMethod === 'COD' || paymentMethod === 'WALLET') {
        // Success for COD and WALLET - show confirmation
        console.log('✅ Payment successful!')
        alert('Đơn hàng đã được tạo thành công!\nPhương thức thanh toán: ' + getPaymentMethodLabel(paymentMethod))
        
        // Navigate to success page with order codes
        const orderCodes = orderResults.map(r => r.orderId).join(',')
        navigate(`/payment/success?orderCode=${orderCodes}&amount=${totalAmountCents / 100}`)
      }
    } catch (error) {
      console.error('❌ Error placing order:', error)
      const errorMsg = (error as any)?.message || 'Có lỗi xảy ra khi tạo đơn hàng'
      alert('Lỗi: ' + errorMsg)
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
    <div className='min-h-screen w-full' style={{ backgroundColor: '#F5F0E8' }}>
      {/* Main Container */}
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1
            className='text-3xl font-bold mb-2'
            style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}
          >
            Thanh toán
          </h1>
          <p
            className='text-sm text-gray-600'
            style={{ fontFamily: 'Arimo, sans-serif' }}
          >
            Hoàn tất đơn hàng của bạn từ {shopCarts.length} shop
          </p>
        </div>

        {/* Main Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
          {/* LEFT COLUMN - Main Content (col-span-3) */}
          <div className='lg:col-span-3 space-y-6'>
            {/* DELIVERY ADDRESS CARD */}
            <div className='bg-white rounded-lg border border-gray-200 p-4'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <MapPin className='w-5 h-5' style={{ color: '#8B5A3C' }} />
                  <h2
                    className='font-semibold'
                    style={{ fontFamily: 'Arimo, sans-serif', color: '#8B5A3C' }}
                  >
                    Địa chỉ nhận hàng
                  </h2>
                </div>
                <button
                  onClick={handleOpenAddressModal}
                  className='text-sm font-semibold rounded-md px-3 py-1 transition-colors'
                  style={{
                    color: '#8B5A3C',
                    backgroundColor: '#F5E6D3'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#EDD5BF')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#F5E6D3')
                  }
                >
                  Thay đổi
                </button>
              </div>

              {/* Address Info */}
              <div className='space-y-2'>
                <p className='text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                  {deliveryAddress.address_line}, {deliveryAddress.ward},{' '}
                  {deliveryAddress.district}, {deliveryAddress.city}
                </p>
              </div>
            </div>

            {/* SHOP CART CARDS */}
            {shopCarts.map(shop => (
              <div
                key={shop.shop_id}
                className='bg-white rounded-lg border border-gray-200 overflow-hidden'
              >
                {/* Shop Header */}
                <div className='px-4 py-3 flex items-center gap-2' style={{ backgroundColor: '#F5E6D3' }}>
                  <Store className='w-5 h-5' style={{ color: '#8B5A3C' }} />
                  <h3
                    className='font-semibold'
                    style={{ fontFamily: 'Arimo, sans-serif', color: '#8B5A3C' }}
                  >
                    {shop.shop_name}
                  </h3>
                </div>

                {/* Product Items */}
                <div className='p-4 space-y-3 border-b border-gray-200'>
                  {shop.items.map(item => (
                    <div key={item.cart_item_id} className='flex gap-3'>
                      {/* Product Image */}
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className='w-20 h-20 object-cover rounded-lg flex-shrink-0'
                      />

                      {/* Product Details */}
                      <div className='flex-1 min-w-0'>
                        <p
                          className='font-semibold text-sm text-gray-900 line-clamp-2'
                          style={{ fontFamily: 'Arimo, sans-serif' }}
                        >
                          {item.product_name}
                        </p>
                        {item.variant_name && (
                          <p className='text-xs text-gray-600 mt-1'>
                            Phân loại: {item.variant_name}
                          </p>
                        )}
                        <div className='flex items-center justify-between gap-2 mt-2'>
                          <p
                            className='font-semibold'
                            style={{ fontFamily: 'Arimo, sans-serif', color: '#8B5A3C' }}
                          >
                            {formatCurrency(item.price)}
                          </p>
                          <p className='text-xs text-gray-600'>x{item.quantity}</p>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className='text-right flex-shrink-0'>
                        <p
                          className='font-semibold text-sm'
                          style={{ fontFamily: 'Arimo, sans-serif', color: '#8B5A3C' }}
                        >
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Methods */}
                <div className='px-4 py-3 border-b border-gray-200' style={{ backgroundColor: '#F9F9F9' }}>
                  <p
                    className='text-sm font-semibold text-gray-900 mb-3'
                    style={{ fontFamily: 'Arimo, sans-serif' }}
                  >
                    Phương thức vận chuyển
                  </p>
                  <div className='flex gap-2 flex-wrap'>
                    {(() => {
                      // Use API data if available, otherwise use mock
                      const apiServices = shipmentServicesByShop[shop.shop_id]
                      const methods = apiServices && apiServices.length > 0 ? apiServices : shop.shipping_methods
                      
                      console.log(`🎯 Rendering shipping methods for shop ${shop.shop_id}:`, {
                        hasApiServices: apiServices && apiServices.length > 0,
                        methodCount: methods.length,
                        methods: methods.map((m: any) => ({ name: m.name, code: m.code || m.id }))
                      })
                      
                      return methods.map(method => {
                        // Handle both API ShipmentService and mock ShippingMethod formats
                        const methodCode = (method as any).code || (method as any).id
                        const speedLevel = (method as any).speedLevel || (method as any).id
                        const methodName = method.name
                        const methodEstimatedDays = (method as any).estimated_days 
                          ? (method as any).estimated_days
                          : ((method as any).estimatedDaysMin && (method as any).estimatedDaysMax)
                            ? `${(method as any).estimatedDaysMin}-${(method as any).estimatedDaysMax} ngày`
                            : 'N/A'
                        
                        // Use mock fee for now, will be calculated by another API later
                        const methodFee = (method as any).fee || 0

                        return (
                          <label
                            key={methodCode}
                            className='flex-1 min-w-max px-3 py-2 rounded-lg border-2 cursor-pointer transition-all'
                            style={{
                              borderColor:
                                shop.selected_shipping_code === methodCode
                                  ? '#8B5A3C'
                                  : '#E5E7EB',
                              backgroundColor:
                                shop.selected_shipping_code === methodCode
                                  ? '#F5E6D3'
                                  : 'transparent'
                            }}
                          >
                            <input
                              type='radio'
                              name={`shipping_${shop.shop_id}`}
                              value={methodCode}
                              checked={shop.selected_shipping_code === methodCode}
                              onChange={(e) =>
                                handleShippingMethodChange(
                                  shop.shop_id,
                                  e.target.value,
                                  speedLevel as 'ECONOMY' | 'STANDARD' | 'EXPRESS'
                                )
                              }
                              className='hidden'
                            />
                            <div className='text-left'>
                              <p className='text-xs font-semibold text-gray-900'>
                                {methodName}
                              </p>
                              <p className='text-xs text-gray-500 mt-0.5'>({methodCode})</p>
                              <p className='text-xs text-gray-600'>{methodEstimatedDays}</p>
                              {methodFee > 0 && (
                                <p
                                  className='text-xs font-semibold mt-1'
                                  style={{ color: '#8B5A3C' }}
                                >
                                  {formatCurrency(methodFee)}
                                </p>
                              )}
                            </div>
                          </label>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Seller Note */}
                <div className='px-4 py-3 border-b border-gray-200'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MessageSquare className='w-4 h-4' style={{ color: '#8B5A3C' }} />
                    <label
                      htmlFor={`note_${shop.shop_id}`}
                      className='text-sm font-semibold text-gray-900'
                      style={{ fontFamily: 'Arimo, sans-serif' }}
                    >
                      Lời nhắn cho người bán
                    </label>
                  </div>
                  <textarea
                    id={`note_${shop.shop_id}`}
                    value={shop.note_to_seller || ''}
                    onChange={(e) => handleNoteChange(shop.shop_id, e.target.value)}
                    placeholder='Nhập lời nhắn của bạn...'
                    className='w-full h-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-2'
                    style={{ fontFamily: 'Arimo, sans-serif' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#8B5A3C')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  />
                </div>

                {/* Shop Subtotal */}
                <div className='px-4 py-3' style={{ backgroundColor: '#F9F9F9' }}>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Tổng tiền ({shop.items.length} sản phẩm):
                    </p>
                    <p
                      className='font-semibold'
                      style={{ fontFamily: 'Arimo, sans-serif', color: '#8B5A3C' }}
                    >
                      {formatCurrency(shop.subtotal)}
                    </p>
                  </div>
                  <div className='flex justify-between items-center mt-2'>
                    <p className='text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Phí vận chuyển:
                    </p>
                    <p
                      className='font-semibold'
                      style={{ fontFamily: 'Arimo, sans-serif', color: '#8B5A3C' }}
                    >
                      {formatCurrency(shop.shipping_fee)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN - Sidebar (col-span-2, sticky) */}
          <aside className='space-y-4'>
            <div className='sticky top-20'>
              {/* PAYMENT METHOD CARD */}
              <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4'>
                <div className='flex items-center gap-2 mb-4'>
                  <CreditCard className='w-5 h-5' style={{ color: '#8B5A3C' }} />
                  <h3
                    className='font-semibold text-gray-900'
                    style={{ fontFamily: 'Arimo, sans-serif' }}
                  >
                    Phương thức thanh toán
                  </h3>
                </div>

                <div className='space-y-2'>
                  {(['COD', 'PAYOS', 'WALLET'] as const).map(method => (
                    <label
                      key={method}
                      className='flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all'
                      style={{
                        borderColor:
                          paymentMethod === method ? '#8B5A3C' : '#E5E7EB',
                        backgroundColor:
                          paymentMethod === method ? '#F5E6D3' : 'transparent'
                      }}
                    >
                      <input
                        type='radio'
                        name='payment_method'
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as PaymentMethod)
                        }
                        className='w-4 h-4'
                      />
                      <span
                        className='text-sm font-semibold text-gray-900'
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        {getPaymentMethodLabel(method)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* VOUCHER CARD */}
              <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4'>
                <div className='flex items-center gap-2 mb-4'>
                  <Tag className='w-5 h-5' style={{ color: '#8B5A3C' }} />
                  <h3
                    className='font-semibold text-gray-900'
                    style={{ fontFamily: 'Arimo, sans-serif' }}
                  >
                    Mã giảm giá
                  </h3>
                </div>

                {!appliedVoucher ? (
                  <div className='space-y-2'>
                    <p className='text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Chưa áp dụng mã giảm giá
                    </p>
                  </div>
                ) : (
                  <div className='p-3 rounded-lg' style={{ backgroundColor: '#F5E6D3' }}>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <p
                          className='font-semibold text-gray-900'
                          style={{ fontFamily: 'Arimo, sans-serif' }}
                        >
                          {appliedVoucher.code}
                        </p>
                        <p className='text-xs text-gray-600 mt-1'>
                          {appliedVoucher.title}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className='text-gray-400 hover:text-gray-600 transition-colors'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SUMMARY CARD */}
              <div className='bg-white rounded-lg border border-gray-200 p-4'>
                <h3
                  className='font-semibold text-gray-900 mb-4'
                  style={{ fontFamily: 'Arimo, sans-serif' }}
                >
                  Chi tiết thanh toán
                </h3>

                <div className='space-y-2 mb-4 pb-4 border-b border-gray-200'>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Tổng tiền hàng:
                    </span>
                    <span
                      className='font-semibold'
                      style={{ fontFamily: 'Arimo, sans-serif' }}
                    >
                      {formatCurrency(summary.merchandise_subtotal)}
                    </span>
                  </div>

                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Tổng phí vận chuyển:
                    </span>
                    <span
                      className='font-semibold'
                      style={{ fontFamily: 'Arimo, sans-serif' }}
                    >
                      {formatCurrency(summary.total_shipping_fee)}
                    </span>
                  </div>

                  {appliedVoucher && summary.voucher_discount > 0 && (
                    <div className='flex justify-between items-center text-sm'>
                      <span
                        className='text-green-600 font-semibold'
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        Giảm giá voucher:
                      </span>
                      <span
                        className='text-green-600 font-semibold'
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        -{formatCurrency(summary.voucher_discount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className='mb-4'>
                  <div className='flex justify-between items-center gap-2'>
                    <span
                      className='text-sm font-semibold text-gray-900'
                      style={{ fontFamily: 'Arimo, sans-serif' }}
                    >
                      Tổng thanh toán
                    </span>
                    <span
                      className='text-lg font-bold'
                      style={{ fontFamily: 'Arimo, sans-serif', color: '#8B5A3C' }}
                    >
                      {formatCurrency(summary.total_payment)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className='w-full h-10 rounded-lg text-white font-semibold transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed'
                  style={{
                    backgroundColor: isPlacingOrder ? '#C0A080' : '#8B5A3C',
                    fontFamily: 'Arimo, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (!isPlacingOrder) {
                      e.currentTarget.style.backgroundColor = '#7A4D32'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPlacingOrder) {
                      e.currentTarget.style.backgroundColor = '#8B5A3C'
                    }
                  }}
                >
                  {isPlacingOrder ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
                </button>

                {/* Disclaimer */}
                <p className='text-xs text-gray-500 text-center' style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Bằng việc đặt hàng, bạn đã đồng ý với các{' '}
                  <span className='text-blue-600 cursor-pointer hover:underline'>
                    điều khoản &amp; điều kiện
                  </span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='w-[735px] bg-white rounded-2xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl outline outline-[0.80px] outline-offset-[-0.80px] outline-stone-400/20 p-8 space-y-6'>
            {/* Header */}
            <div className='flex items-start gap-3'>
              <div className='w-12 h-12 bg-gradient-to-b from-stone-400 to-orange-300 rounded-2xl flex justify-center items-center flex-shrink-0'>
                <div className='w-6 h-6 relative overflow-hidden'>
                  <div className='w-4 h-5 left-[4px] top-[2px] absolute outline outline-2 outline-offset-[-1px] outline-white' />
                  <div className='w-1.5 h-1.5 left-[9px] top-[7px] absolute outline outline-2 outline-offset-[-1px] outline-white' />
                </div>
              </div>
              <div>
                <h2 className='text-slate-800 text-2xl font-bold font-arimo leading-8'>Thông tin giao hàng</h2>
                <p className='text-gray-600 text-sm font-normal font-arimo leading-5'>Chúng tôi sẽ giao hàng đến địa chỉ của bạn</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className='space-y-4'>
              {/* Địa chỉ */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-gray-700 text-sm font-normal font-arimo'>
                  <div className='w-4 h-4 overflow-hidden'>
                    <div className='w-2.5 h-3.5 outline outline-[1.33px] outline-offset-[-0.67px] outline-stone-400' />
                  </div>
                  Địa chỉ giao hàng
                </label>
                <input
                  type='text'
                  value={tempAddress.address_line}
                  onChange={(e) => setTempAddress({ ...tempAddress, address_line: e.target.value })}
                  className='w-full h-12 px-4 py-3 rounded-[10px] outline outline-[0.80px] outline-offset-[-0.80px] outline-gray-300 text-base font-arimo focus:outline-2 focus:outline-orange-300'
                  placeholder='Nhập địa chỉ'
                />
              </div>

              {/* Row: Thành phố, Quận/Huyện, Phường/Xã */}
              <div className='grid grid-cols-3 gap-4'>
                {/* Thành phố */}
                <div className='space-y-2'>
                  <label className='text-gray-700 text-sm font-normal font-arimo'>Thành phố</label>
                  <input
                    type='text'
                    value={tempAddress.city}
                    onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                    className='w-full h-12 px-4 py-3 rounded-[10px] outline outline-[0.80px] outline-offset-[-0.80px] outline-gray-300 text-base font-arimo focus:outline-2 focus:outline-orange-300'
                    placeholder='Hà Nội'
                  />
                </div>

                {/* Quận/Huyện */}
                <div className='space-y-2'>
                  <label className='text-gray-700 text-sm font-normal font-arimo'>Quận/Huyện</label>
                  <input
                    type='text'
                    value={tempAddress.district}
                    onChange={(e) => setTempAddress({ ...tempAddress, district: e.target.value })}
                    className='w-full h-12 px-4 py-3 rounded-[10px] outline outline-[0.80px] outline-offset-[-0.80px] outline-gray-300 text-base font-arimo focus:outline-2 focus:outline-orange-300'
                    placeholder='Ba Đình'
                  />
                </div>

                {/* Phường/Xã */}
                <div className='space-y-2'>
                  <label className='text-gray-700 text-sm font-normal font-arimo'>Phường/Xã</label>
                  <input
                    type='text'
                    value={tempAddress.ward}
                    onChange={(e) => setTempAddress({ ...tempAddress, ward: e.target.value })}
                    className='w-full h-12 px-4 py-3 rounded-[10px] outline outline-[0.80px] outline-offset-[-0.80px] outline-gray-300 text-base font-arimo focus:outline-2 focus:outline-orange-300'
                    placeholder='Phường XYZ'
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className='flex gap-3'>
              <button
                onClick={handleConfirmAddress}
                className='flex-1 h-14 bg-gradient-to-b from-stone-400 to-orange-300 rounded-2xl text-center text-white text-base font-bold font-arimo leading-6 hover:from-stone-500 hover:to-orange-400 transition-all'
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                className='flex-1 h-14 border-2 border-gray-300 rounded-2xl text-center text-gray-700 text-base font-bold font-arimo leading-6 hover:bg-gray-50 transition-all'
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
