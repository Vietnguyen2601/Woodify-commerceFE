import React, { useState } from 'react'
import { useCart } from '../store/cartStore'

// Import Icons
import MailIcon from '@/assets/icons/essential/commerce/point-address.svg'
import ShoppingBagIcon from '@/assets/icons/essential/commerce/shopping-cart.svg'
import TagIcon from '@/assets/icons/essential/commerce/tag.svg'
import ShieldIcon from '@/assets/icons/essential/commerce/shield-check.svg'
import TruckIcon from '@/assets/icons/essential/commerce/truck.svg'

type ShippingMethod = 'standard' | 'express' | 'install'

interface DeliveryForm {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  district: string
  ward: string
}

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

export default function Checkout() {
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [discountCode, setDiscountCode] = useState('')
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: ''
  })

  // Mock cart items data
  const cartItems: CartItem[] = [
    { id: '1', name: 'Bàn Ăn Gỗ Sồi Tự Nhiên', price: 12500000, qty: 1 },
    { id: '2', name: 'Ghế Gỗ Cao Cấp (Bộ 4)', price: 8900000, qty: 1 },
    { id: '3', name: 'Kệ Sách Gỗ Óc Chó', price: 5600000, qty: 1 },
    { id: '4', name: 'Ghế Sofa Gỗ Tần Bì', price: 15200000, qty: 1 }
  ]

  const shippingOptions = [
    { id: 'standard', title: 'Giao hàng tiêu chuẩn', subtitle: '5-7 ngày làm việc', price: 0 },
    { id: 'express', title: 'Giao hàng nhanh', subtitle: '2-3 ngày làm việc', price: 500000 },
    { id: 'install', title: 'Giao hàng & lắp đặt', subtitle: '1-2 ngày làm việc', price: 1000000 }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shippingFee = shippingOptions.find(o => o.id === shippingMethod)?.price || 0
  const vat = subtotal * 0.1
  const total = subtotal + shippingFee + vat

  const handleInputChange = (field: keyof DeliveryForm, value: string) => {
    setDeliveryForm(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className='relative min-h-screen w-full'>
      {/* Background gradient - fixed to viewport, below all content */}
      <div className='fixed inset-0 pointer-events-none w-screen h-screen' style={{ background: 'linear-gradient(to bottom, rgba(254, 212, 122, 0.1), #FFFBEB, #FFF7ED)', zIndex: -1 }}>
      </div>
      
      {/* Main Container */}
      <div className='w-full mx-auto px-3 sm:px-4 lg:px-8 pt-0 sm:pt-0 lg:pt-0 pb-4 sm:pb-6 lg:pb-8' style={{ maxWidth: '1200px' }}>
        {/* Page Header */}
        <div className='mb-4 sm:mb-6 lg:mb-8'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
            Thanh toán
          </h1>
          <p className='text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base' style={{ fontFamily: 'Arimo, sans-serif' }}>
            Hoàn tất đơn hàng của bạn
          </p>
        </div>

        {/* 2 Column Layout - Responsive Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6'>
          {/* LEFT COLUMN - DELIVERY FORM */}
          <div className='lg:col-span-2'>
            {/* DELIVERY INFORMATION */}
            <div className='bg-white rounded-2xl p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6 shadow-md' style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' }}>
              {/* Section Header */}
              <div className='flex items-center gap-2 mb-3 sm:mb-4'>
                <img src={MailIcon} alt='Delivery' className='w-5 h-5' />
                <div>
                  <h2 className='text-base sm:text-lg lg:text-xl font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                    Thông tin giao hàng
                  </h2>
                  <p className='text-gray-600 text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Chúng tôi sẽ giao hàng đến địa chỉ của bạn
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className='space-y-2'>
                {/* Row 1: Full Name & Phone */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  <input
                    type='text'
                    placeholder='Nguyễn Văn A'
                    value={deliveryForm.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className='w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-2 text-xs lg:text-sm h-9 sm:h-9 lg:h-10'
                    style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB', focusBorderColor: '#78716C' }}
                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <input
                    type='tel'
                    placeholder='0123 456 789'
                    value={deliveryForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className='w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-2 text-xs lg:text-sm h-9 sm:h-9 lg:h-10'
                    style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB' }}
                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>

                {/* Email */}
                <input
                  type='email'
                  placeholder='nguyenvana@email.com'
                  value={deliveryForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className='w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-2 text-xs lg:text-sm h-9 sm:h-9 lg:h-10'
                  style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB' }}
                  onFocus={(e) => e.target.style.borderColor = '#78716C'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />

                {/* Address */}
                <input
                  type='text'
                  placeholder='123 Đường ABC'
                  value={deliveryForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className='w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-2 text-xs lg:text-sm h-9 sm:h-9 lg:h-10'
                  style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB' }}
                  onFocus={(e) => e.target.style.borderColor = '#78716C'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />

                {/* City, District, Ward */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                  <input
                    type='text'
                    placeholder='Hà Nội'
                    value={deliveryForm.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className='w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-2 text-xs lg:text-sm h-9 sm:h-9 lg:h-10'
                    style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB' }}
                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <input
                    type='text'
                    placeholder='Ba Đình'
                    value={deliveryForm.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className='w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-2 text-xs lg:text-sm h-9 sm:h-9 lg:h-10'
                    style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB' }}
                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <input
                    type='text'
                    placeholder='Phường XYZ'
                    value={deliveryForm.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className='w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-2 text-xs lg:text-sm h-9 sm:h-9 lg:h-10'
                    style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB' }}
                    onFocus={(e) => e.target.style.borderColor = '#78716C'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>
            </div>

            {/* SHIPPING METHODS */}
            <div className='bg-white rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md' style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' }}>
              <h3 className='text-base sm:text-lg lg:text-lg font-bold mb-3 sm:mb-4' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                Phương thức vận chuyển
              </h3>

              <div className='space-y-2'>
                {shippingOptions.map(option => (
                  <div
                    key={option.id}
                    onClick={() => setShippingMethod(option.id as ShippingMethod)}
                    className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      shippingMethod === option.id
                        ? 'border-stone-400 bg-stone-400/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className='flex justify-between items-start gap-2'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-gray-800 text-xs sm:text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {option.title}
                        </h4>
                        <p className='text-xs text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {option.subtitle}
                        </p>
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <p className='font-bold text-xs whitespace-nowrap' style={{ fontFamily: 'Arimo, sans-serif', color: '#78716C' }}>
                          {option.price === 0 ? 'MIỄN PHÍ' : formatCurrency(option.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className='w-full h-9 sm:h-10 lg:h-11 rounded-2xl text-white font-bold text-xs sm:text-sm lg:text-base mt-3 sm:mt-4 hover:opacity-90 transition-opacity shadow-lg'
                style={{
                  background: 'linear-gradient(90deg, #78716C 0%, #FED47A 100%)',
                  fontFamily: 'Arimo, sans-serif',
                  boxShadow: '0px 4px 12px rgba(120, 113, 108, 0.2)'
                }}
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <aside className='lg:col-span-2'>
            <div className='bg-white rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md sticky top-6 sm:top-6 lg:top-6' style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' }}>
              {/* Section Header */}
              <div className='flex items-center gap-2 mb-3 sm:mb-4'>
                <img src={ShoppingBagIcon} alt='Order' className='w-4 h-4' />
                <h3 className='text-base sm:text-lg lg:text-lg font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                  Đơn hàng
                </h3>
              </div>

              {/* Product List */}
              <div className='space-y-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200'>
                {cartItems.map(item => (
                  <div key={item.id} className='flex gap-2'>
                    <div
                      className='w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 bg-gray-200 rounded-lg flex-shrink-0'
                      style={{ backgroundColor: '#F3F4F6' }}
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-semibold text-gray-800 line-clamp-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        {item.name}
                      </p>
                      <p className='font-bold text-xs sm:text-sm mt-0.5' style={{ fontFamily: 'Arimo, sans-serif', color: '#78716C' }}>
                        {formatCurrency(item.price)}
                      </p>
                      <div className='flex items-center gap-1 mt-1'>
                        <button className='w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200 text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          −
                        </button>
                        <span className='w-4 text-center text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {item.qty}
                        </span>
                        <button className='w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-gray-600 hover:bg-gray-200 text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          +
                        </button>
                        <button className='ml-auto text-red-500 hover:text-red-600 text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className='mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200'>
                <div className='flex flex-col sm:flex-row gap-2 mb-2'>
                  <div className='flex-1 relative'>
                    <img src={TagIcon} alt='Tag' className='w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none' />
                    <input
                      type='text'
                      placeholder='Mã giảm giá'
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className='w-full px-3 py-1.5 pl-8 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-2 h-8 sm:h-9'
                      style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D1D5DB' }}
                      onFocus={(e) => e.target.style.borderColor = '#78716C'}
                      onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                  <button
                    className='px-3 py-1.5 bg-stone-400 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-xs whitespace-nowrap h-8 sm:h-9'
                    style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#78716C' }}
                  >
                    Áp dụng
                  </button>
                </div>
                <p className='text-xs text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                  Thử mã: GOWOOD20
                </p>
              </div>

              {/* Pricing Breakdown */}
              <div className='space-y-1 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b' style={{ borderColor: 'rgba(229, 231, 235, 0.8)' }}>
                <div className='flex justify-between text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                  <span className='text-gray-600'>Tạm tính</span>
                  <span className='font-semibold' style={{ color: '#0A0A0A' }}>
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className='flex justify-between text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                  <span className='text-gray-600'>Phí vận chuyển</span>
                  <span className='font-semibold' style={{ color: '#78716C' }}>
                    {shippingFee === 0 ? 'MIỄN PHÍ' : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className='flex justify-between text-xs' style={{ fontFamily: 'Arimo, sans-serif' }}>
                  <span className='text-gray-600'>VAT (10%)</span>
                  <span className='font-semibold' style={{ color: '#0A0A0A' }}>
                    {formatCurrency(vat)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className='mb-3 sm:mb-4'>
                <div className='flex justify-between items-center gap-2'>
                  <span className='text-sm font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#1E293B' }}>
                    Tổng cộng
                  </span>
                  <span className='text-lg sm:text-xl font-bold' style={{ fontFamily: 'Arimo, sans-serif', color: '#78716C' }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className='grid grid-cols-2 gap-2'>
                <div className='p-2 rounded-lg text-center' style={{ backgroundColor: 'rgba(120, 113, 108, 0.1)' }}>
                  <img src={ShieldIcon} alt='Secure' className='w-4 h-4 mx-auto mb-0.5' style={{ filter: 'brightness(0) saturate(100%) invert(26%) sepia(13%) saturate(814%) hue-rotate(343deg) brightness(94%) contrast(91%)' }} />
                  <p className='text-xs font-semibold text-gray-700' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Thanh toán bảo mật
                  </p>
                </div>
                <div className='p-2 rounded-lg text-center' style={{ backgroundColor: '#F0FDF4' }}>
                  <img src={TruckIcon} alt='Free Shipping' className='w-4 h-4 mx-auto mb-0.5' style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(393%) hue-rotate(93deg) brightness(95%) contrast(89%)' }} />
                  <p className='text-xs font-semibold text-green-700' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Giao hàng miễn phí
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

