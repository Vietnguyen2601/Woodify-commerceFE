import React, { useState, useMemo, useEffect } from 'react'
import { MapPin, Store, MessageSquare, CreditCard, Tag, X } from 'lucide-react'
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
import type { CartItemDto } from '@/types'

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

  const handleShippingMethodChange = (shopId: string, methodId: 'ECONOMY' | 'STANDARD' | 'EXPRESS') => {
    setShopCarts(updateShopShippingMethod(shopCarts, shopId, methodId))
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

  const handlePlaceOrder = () => {
    const orderData = {
      delivery_address: deliveryAddress,
      shop_carts: shopCarts,
      payment_method: paymentMethod,
      voucher: appliedVoucher,
      summary: summary,
      timestamp: new Date().toISOString()
    }

    console.log('===== ORDER DATA =====')
    console.log(JSON.stringify(orderData, null, 2))
    console.log('=====================')

    alert('Đơn hàng đã được tạo thành công!\nVui lòng kiểm tra console để xem chi tiết.')
  }

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      COD: 'Thanh toán khi nhận (COD)',
      BANK_TRANSFER: 'Chuyển khoản ngân hàng',
      WALLET: 'Ví điện tử (Momo, ZaloPay)'
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
                    {shop.shipping_methods.map(method => (
                      <label
                        key={method.id}
                        className='flex-1 min-w-max px-3 py-2 rounded-lg border-2 cursor-pointer transition-all'
                        style={{
                          borderColor:
                            shop.selected_shipping_method === method.id
                              ? '#8B5A3C'
                              : '#E5E7EB',
                          backgroundColor:
                            shop.selected_shipping_method === method.id
                              ? '#F5E6D3'
                              : 'transparent'
                        }}
                      >
                        <input
                          type='radio'
                          name={`shipping_${shop.shop_id}`}
                          value={method.id}
                          checked={shop.selected_shipping_method === method.id}
                          onChange={(e) =>
                            handleShippingMethodChange(
                              shop.shop_id,
                              e.target.value as 'ECONOMY' | 'STANDARD' | 'EXPRESS'
                            )
                          }
                          className='hidden'
                        />
                        <div className='text-left'>
                          <p className='text-xs font-semibold text-gray-900'>
                            {method.name}
                          </p>
                          <p className='text-xs text-gray-600'>{method.estimated_days}</p>
                          <p
                            className='text-xs font-semibold mt-1'
                            style={{ color: '#8B5A3C' }}
                          >
                            {formatCurrency(method.fee)}
                          </p>
                        </div>
                      </label>
                    ))}
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
                  {(['COD', 'BANK_TRANSFER', 'WALLET'] as const).map(method => (
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
                  className='w-full h-10 rounded-lg text-white font-semibold transition-colors mb-3'
                  style={{
                    backgroundColor: '#8B5A3C',
                    fontFamily: 'Arimo, sans-serif'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#7A4D32')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#8B5A3C')
                  }
                >
                  ĐẶT HÀNG
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
