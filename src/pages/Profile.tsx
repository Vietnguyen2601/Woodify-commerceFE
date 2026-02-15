import React, { useState } from 'react'

type TabType = 'profile' | 'orders' | 'wallet' | 'settings'
type WalletTabType = 'refund' | 'history'
type OrderStatus = 'processing' | 'shipping' | 'completed' | 'cancelled'

interface Transaction {
  id: string
  type: 'income' | 'expense' | 'refund'
  title: string
  date: string
  time: string
  status: 'success' | 'pending' | 'failed'
  amount: number
  balance: number
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: OrderStatus
  items: {
    name: string
    quantity: number
    price: number
    image?: string
  }[]
  total: number
  shippingAddress: string
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('wallet')
  const [walletTab, setWalletTab] = useState<WalletTabType>('history')
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0903038567',
    dateOfBirth: '1990-01-15',
    gender: 'Nam',
    address: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP. Hồ Chí Minh'
  })

  const menuItems = [
    { id: 'profile' as TabType, label: 'Thông tin cá nhân', icon: '👤' },
    { id: 'orders' as TabType, label: 'Đơn hàng', icon: '📦' },
    { id: 'wallet' as TabType, label: 'Ví của tôi', icon: '💳' },
    { id: 'settings' as TabType, label: 'Cài đặt', icon: '⚙️' }
  ]

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      title: 'Nạp tiền vào ví',
      date: '15/02/2026',
      time: '14:30',
      status: 'success',
      amount: 5000000,
      balance: 15750000
    },
    {
      id: '2',
      type: 'expense',
      title: 'Thanh toán đơn hàng #DH2024001',
      date: '14/02/2026',
      time: '10:15',
      status: 'success',
      amount: -3500000,
      balance: 10750000
    },
    {
      id: '3',
      type: 'refund',
      title: 'Hoàn tiền đơn hàng #DH2024002',
      date: '13/02/2026',
      time: '16:45',
      status: 'success',
      amount: 2250000,
      balance: 14250000
    }
  ]

  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'DH2024001',
      date: '14/02/2026',
      status: 'shipping',
      items: [
        { name: 'Ghế Sofa Cao Cấp', quantity: 1, price: 12500000 },
        { name: 'Bàn Trà Gỗ Sồi', quantity: 1, price: 3500000 }
      ],
      total: 16000000,
      shippingAddress: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM'
    },
    {
      id: '2',
      orderNumber: 'DH2024002',
      date: '10/02/2026',
      status: 'completed',
      items: [
        { name: 'Tủ Gỗ Trang Trí', quantity: 2, price: 4500000 }
      ],
      total: 9000000,
      shippingAddress: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM'
    },
    {
      id: '3',
      orderNumber: 'DH2024003',
      date: '05/02/2026',
      status: 'processing',
      items: [
        { name: 'Giường Ngủ Gỗ Tự Nhiên', quantity: 1, price: 18500000 }
      ],
      total: 18500000,
      shippingAddress: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM'
    }
  ]

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    promotionNotifications: false,
    newsletter: true
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return '↓'
      case 'expense':
        return '↑'
      case 'refund':
        return '↻'
      default:
        return '•'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-500'
      case 'expense':
        return 'bg-red-500'
      case 'refund':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getOrderStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return 'Đang xử lý'
      case 'shipping':
        return 'Đang giao'
      case 'completed':
        return 'Hoàn thành'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-700' }
      case 'shipping':
        return { bg: 'bg-orange-100', text: 'text-orange-700' }
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700' }
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-100'>
      {/* Main Content */}
      <div className='max-w-[1280px] mx-auto px-8 py-8'>
        <div className='flex gap-8'>
          {/* Sidebar - Left */}
          <div className='w-64 flex-shrink-0'>
            {/* User Profile Card with Gradient */}
            <div className='rounded-[20px] shadow-md p-8 mb-4' style={{ background: 'linear-gradient(to bottom, #D4B896, #E3DCC8)' }}>
              {/* Avatar */}
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <span className='text-3xl font-bold' style={{ color: '#BE9C73' }}>{userInfo.name.charAt(0)}</span>
              </div>
              {/* User Info */}
              <div className='text-center'>
                <h3 className='text-lg font-semibold mb-1' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                  {userInfo.name}
                </h3>
                <p className='text-sm' style={{ fontFamily: 'Arimo, sans-serif', color: '#6C5B50', opacity: 0.8 }}>
                  {userInfo.email}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className='bg-white rounded-[20px] shadow-md p-2'>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all duration-200 text-left ${
                    activeTab === item.id
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === item.id ? { fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' } : { fontFamily: 'Arimo, sans-serif' }}
                >
                  <span className='text-xl'>{item.icon}</span>
                  <span className='text-sm font-medium'>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area - Wallet Section */}
          <div className='flex-1'>
            {activeTab === 'wallet' && (
              <div className='space-y-8'>
                {/* Page Title */}
                <div>
                  <h1 className='text-3xl font-bold text-gray-800 mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Ví của tôi
                  </h1>
                  <p className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Quản lý số dư và lịch sử giao dịch
                  </p>
                </div>

                {/* Balance Card with Gradient */}
                <div className='rounded-[20px] shadow-lg p-8' style={{ background: 'linear-gradient(to right, #D4B896, #E3DCC8)' }}>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-sm mb-2' style={{ fontFamily: 'Arbutus Slab, serif', color: '#6C5B50', opacity: 0.8 }}>
                        Số dư ví
                      </p>
                      <h2 className='text-4xl font-bold mb-6' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                        {formatCurrency(15750000)}
                      </h2>
                      <button className='bg-white px-6 py-3 rounded-[10px] font-semibold hover:bg-white/90 transition-colors shadow-md' style={{ fontFamily: 'Arimo, sans-serif', color: '#BE9C73' }}>
                        Nạp tiền
                      </button>
                    </div>

                    {/* Stats Boxes */}
                    <div className='flex gap-4'>
                      <div className='bg-white/20 backdrop-blur-sm rounded-[10px] p-4 min-w-[140px]'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-2xl'>💰</span>
                          <p className='text-xs' style={{ fontFamily: 'Arbutus Slab, serif', color: '#6C5B50', opacity: 0.8 }}>
                            Tổng nạp
                          </p>
                        </div>
                        <p className='text-xl font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                          25M
                        </p>
                      </div>
                      <div className='bg-white/20 backdrop-blur-sm rounded-[10px] p-4 min-w-[140px]'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-2xl'>💸</span>
                          <p className='text-xs' style={{ fontFamily: 'Arbutus Slab, serif', color: '#6C5B50', opacity: 0.8 }}>
                            Tổng chi
                          </p>
                        </div>
                        <p className='text-xl font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                          18.75M
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs and Filters */}
                <div className='bg-white rounded-[20px] shadow-md p-6'>
                  {/* Tabs */}
                  <div className='flex items-center justify-between mb-6 border-b border-gray-200'>
                    <div className='flex gap-8'>
                      <button
                        onClick={() => setWalletTab('refund')}
                        className={`pb-3 px-2 transition-all ${
                          walletTab === 'refund'
                            ? 'text-gray-800 border-b-2 border-gray-300 font-semibold'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        Hoàn tiền
                      </button>
                      <button
                        onClick={() => setWalletTab('history')}
                        className={`pb-3 px-2 transition-all ${
                          walletTab === 'history'
                            ? 'text-gray-800 border-b-2 border-gray-300 font-semibold'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        Lịch sử
                      </button>
                    </div>

                    {/* Filter Buttons */}
                    <div className='flex gap-2'>
                      <button className='px-4 py-2 border border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-50 transition-colors text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        🔽 Lọc
                      </button>
                      <button className='px-4 py-2 bg-gray-100 border border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Tháng này
                      </button>
                    </div>
                  </div>

                  {/* Transaction List */}
                  <div className='space-y-4'>
                    {transactions.map(transaction => (
                      <div
                        key={transaction.id}
                        className='flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors'
                      >
                        {/* Left Side - Icon and Details */}
                        <div className='flex items-center gap-4 flex-1'>
                          {/* Icon Circle */}
                          <div className={`w-12 h-12 ${getTransactionBgColor(transaction.type)} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                            {getTransactionIcon(transaction.type)}
                          </div>

                          {/* Transaction Details */}
                          <div className='flex-1'>
                            <h4 className='text-gray-800 font-semibold mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              {transaction.title}
                            </h4>
                            <div className='flex items-center gap-3'>
                              <p className='text-gray-500 text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                {transaction.date} • {transaction.time}
                              </p>
                              <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                Thành công
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Amount and Balance */}
                        <div className='text-right'>
                          <p className={`text-lg font-bold mb-1 ${getTransactionColor(transaction.type)}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          <p className='text-gray-500 text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                            Số dư: {formatCurrency(transaction.balance)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className='space-y-8'>
                {/* Page Title */}
                <div className='flex justify-between items-center'>
                  <div>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Thông tin cá nhân
                    </h1>
                    <p className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Quản lý thông tin tài khoản của bạn
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className='px-6 py-3 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity shadow-md flex items-center gap-2'
                      style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}
                    >
                      <span>✏️</span>
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {/* Profile Card */}
                <div className='bg-white rounded-[20px] shadow-md p-8'>
                  {/* Avatar Section */}
                  <div className='flex items-center gap-6 pb-8 mb-8 border-b border-gray-200'>
                    <div className='relative'>
                      <div className='w-24 h-24 rounded-full flex items-center justify-center shadow-lg' style={{ background: 'linear-gradient(to bottom, #D4B896, #E3DCC8)' }}>
                        <span className='text-4xl font-bold' style={{ color: '#BE9C73' }}>
                          {userInfo.name.charAt(0)}
                        </span>
                      </div>
                      {isEditing && (
                        <button className='absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 hover:scale-110 transition-transform' style={{ borderColor: '#BE9C73' }}>
                          <span className='text-sm'>📷</span>
                        </button>
                      )}
                    </div>
                    <div>
                      <h2 className='text-2xl font-bold mb-1' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                        {userInfo.name}
                      </h2>
                      <p className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        {userInfo.email}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className='grid grid-cols-2 gap-6'>
                    {/* Họ và tên */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Họ và tên
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.name}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type='email'
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.email}
                        </div>
                      )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type='tel'
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.phone}
                        </div>
                      )}
                    </div>

                    {/* Ngày sinh */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Ngày sinh
                      </label>
                      {isEditing ? (
                        <input
                          type='date'
                          value={userInfo.dateOfBirth}
                          onChange={(e) => setUserInfo({ ...userInfo, dateOfBirth: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>

                    {/* Giới tính */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Giới tính
                      </label>
                      {isEditing ? (
                        <select
                          value={userInfo.gender}
                          onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        >
                          <option value='Nam'>Nam</option>
                          <option value='Nữ'>Nữ</option>
                          <option value='Khác'>Khác</option>
                        </select>
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.gender}
                        </div>
                      )}
                    </div>

                    {/* Địa chỉ - Full width */}
                    <div className='col-span-2'>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Địa chỉ
                      </label>
                      {isEditing ? (
                        <textarea
                          value={userInfo.address}
                          onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                          rows={3}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors resize-none'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.address}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
                      <button
                        onClick={() => setIsEditing(false)}
                        className='px-8 py-3 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity shadow-md'
                        style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className='px-8 py-3 border-2 rounded-[10px] font-semibold hover:bg-gray-50 transition-colors'
                        style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896', color: '#6C5B50' }}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {/* Security Card */}
                <div className='bg-white rounded-[20px] shadow-md p-8'>
                  <h3 className='text-xl font-bold mb-6' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                    Bảo mật
                  </h3>
                  <div className='space-y-4'>
                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#FED7AA' }}>
                          <span className='text-xl'>🔒</span>
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Đổi mật khẩu</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Cập nhật mật khẩu định kỳ</p>
                        </div>
                      </div>
                      <span className='text-gray-400 group-hover:text-gray-600 transition-colors'>→</span>
                    </button>

                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#DCFCE7' }}>
                          <span className='text-xl'>✓</span>
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Xác thực hai yếu tố</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Tăng cường bảo mật tài khoản</p>
                        </div>
                      </div>
                      <span className='text-gray-400 group-hover:text-gray-600 transition-colors'>→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className='space-y-8'>
                {/* Page Title */}
                <div>
                  <h1 className='text-3xl font-bold text-gray-800 mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Đơn hàng của tôi
                  </h1>
                  <p className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Theo dõi và quản lý đơn hàng
                  </p>
                </div>

                {/* Orders List */}
                <div className='space-y-4'>
                  {orders.map(order => {
                    const statusColor = getOrderStatusColor(order.status)
                    return (
                      <div key={order.id} className='bg-white rounded-[20px] shadow-md p-6 hover:shadow-lg transition-shadow'>
                        {/* Order Header */}
                        <div className='flex justify-between items-start mb-4 pb-4 border-b border-gray-200'>
                          <div>
                            <div className='flex items-center gap-3 mb-2'>
                              <h3 className='text-lg font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                                #{order.orderNumber}
                              </h3>
                              <span className={`px-3 py-1 ${statusColor.bg} ${statusColor.text} rounded-full text-xs font-semibold`} style={{ fontFamily: 'Arimo, sans-serif' }}>
                                {getOrderStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              Ngày đặt: {order.date}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-gray-500 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>Tổng tiền</p>
                            <p className='text-xl font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#BE9C73' }}>
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className='space-y-3 mb-4'>
                          {order.items.map((item, index) => (
                            <div key={index} className='flex justify-between items-center py-3 px-4 bg-gray-50 rounded-[10px]'>
                              <div>
                                <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                  {item.name}
                                </p>
                                <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                              <p className='font-bold text-gray-700' style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                          <div>
                            <p className='text-sm text-gray-600 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              📍 Địa chỉ giao hàng:
                            </p>
                            <p className='text-sm font-medium text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              {order.shippingAddress}
                            </p>
                          </div>
                          <div className='flex gap-2'>
                            <button className='px-4 py-2 border-2 rounded-[10px] font-semibold hover:bg-gray-50 transition-colors text-sm' style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896', color: '#6C5B50' }}>
                              Chi tiết
                            </button>
                            {order.status === 'completed' && (
                              <button className='px-4 py-2 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity text-sm' style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}>
                                Mua lại
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Empty State (if needed) */}
                {orders.length === 0 && (
                  <div className='bg-white rounded-[20px] shadow-md p-16 text-center'>
                    <div className='text-6xl mb-4'>📦</div>
                    <h3 className='text-xl font-bold text-gray-800 mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Chưa có đơn hàng nào
                    </h3>
                    <p className='text-gray-600 mb-6' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Bạn chưa có đơn hàng nào. Hãy khám phá sản phẩm của chúng tôi!
                    </p>
                    <button className='px-6 py-3 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity' style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}>
                      Mua sắm ngay
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className='space-y-8'>
                {/* Page Title */}
                <div>
                  <h1 className='text-3xl font-bold text-gray-800 mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Cài đặt tài khoản
                  </h1>
                  <p className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Quản lý cài đặt và tùy chọn tài khoản
                  </p>
                </div>

                {/* Notifications Settings */}
                <div className='bg-white rounded-[20px] shadow-md p-8'>
                  <h3 className='text-xl font-bold mb-6' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                    Thông báo
                  </h3>
                  <div className='space-y-4'>
                    {/* Email Notifications */}
                    <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Thông báo qua Email
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Nhận các thông báo quan trọng qua email
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.emailNotifications ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Order Notifications */}
                    <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Thông báo đơn hàng
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Cập nhật trạng thái đơn hàng của bạn
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, orderNotifications: !settings.orderNotifications})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.orderNotifications ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.orderNotifications ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Promotion Notifications */}
                    <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Thông báo khuyến mãi
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Nhận thông tin về các chương trình khuyến mãi
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, promotionNotifications: !settings.promotionNotifications})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.promotionNotifications ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.promotionNotifications ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Newsletter */}
                    <div className='flex items-center justify-between py-4'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Nhận bản tin
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Đăng ký nhận bản tin hàng tuần
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, newsletter: !settings.newsletter})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.newsletter ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.newsletter ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className='bg-white rounded-[20px] shadow-md p-8'>
                  <h3 className='text-xl font-bold mb-6' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                    Bảo mật & Quyền riêng tư
                  </h3>
                  <div className='space-y-3'>
                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#FED7AA' }}>
                          <span className='text-xl'>🔒</span>
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Đổi mật khẩu</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Cập nhật mật khẩu của bạn</p>
                        </div>
                      </div>
                      <span className='text-gray-400 group-hover:text-gray-600 transition-colors'>→</span>
                    </button>

                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#DCFCE7' }}>
                          <span className='text-xl'>✓</span>
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Xác thực hai yếu tố</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Tăng cường bảo mật tài khoản</p>
                        </div>
                      </div>
                      <span className='text-gray-400 group-hover:text-gray-600 transition-colors'>→</span>
                    </button>

                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#BFDBFE' }}>
                          <span className='text-xl'>🔐</span>
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Quyền riêng tư</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Quản lý quyền riêng tư dữ liệu</p>
                        </div>
                      </div>
                      <span className='text-gray-400 group-hover:text-gray-600 transition-colors'>→</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className='bg-white rounded-[20px] shadow-md p-8 border-2 border-red-200'>
                  <h3 className='text-xl font-bold mb-4' style={{ fontFamily: 'Poppins, sans-serif', color: '#DC2626' }}>
                    Vùng nguy hiểm
                  </h3>
                  <p className='text-sm text-gray-600 mb-4' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Các hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
                  </p>
                  <button className='px-6 py-3 bg-red-500 text-white rounded-[10px] font-semibold hover:bg-red-600 transition-colors' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
