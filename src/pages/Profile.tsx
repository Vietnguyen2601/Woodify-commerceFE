import React, { useState } from 'react'
import { Link } from 'react-router-dom'

type TabType = 'profile' | 'orders' | 'address' | 'settings'

interface UserInfo {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0123 456 789',
    dateOfBirth: '1990-01-15',
    address: '123 Đường ABC, Phường XYZ, Quận Ba Đình, Hà Nội'
  })

  const handleSaveProfile = () => {
    setIsEditing(false)
  }

  const menuItems = [
    { id: 'profile' as TabType, label: 'Thông tin cá nhân' },
    { id: 'orders' as TabType, label: 'Đơn hàng' },
    { id: 'address' as TabType, label: 'Địa chỉ' },
    { id: 'settings' as TabType, label: 'Cài đặt' }
  ]

  return (
    <div className='w-full min-h-screen bg-white'>
      {/* Top Promo Bar */}
      <div className='w-full h-9 fixed top-0 left-0 right-0 z-50 px-4' style={{backgroundColor: '#BE9C73'}}>
        <div className='max-w-7xl mx-auto flex justify-between items-center h-full'>
          <div className='flex items-center gap-4 text-white text-sm'>
            <div className='flex items-center gap-2'>
              <span>☎️</span>
              <span>0123 456 789</span>
            </div>
            <span>|</span>
            <span>Miễn phí vận chuyển cho đơn hàng trên 5 triệu</span>
          </div>
          <div className='text-white text-sm'>Hướng dẫn mua hàng</div>
        </div>
      </div>

      {/* Header */}
      <div className='w-full bg-white shadow-md fixed top-9 left-0 right-0 z-40'>
        <div className='max-w-7xl mx-auto h-16 px-4 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <div className='w-10 h-10 rounded-full flex items-center justify-center text-white font-bold' style={{backgroundColor: '#BE9C73'}}>
              N
            </div>
            <Link to='/' className='text-2xl font-normal' style={{color: '#BE9C73'}}>
              Nội Thất Cao Cấp
            </Link>
          </div>
          <nav className='flex gap-8 items-center text-base text-zinc-800'>
            <Link to='/'>Trang chủ</Link>
            <Link to='/catalog'>Sản phẩm</Link>
            <Link to='/catalog'>Danh mục</Link>
            <a href='#about'>Về chúng tôi</a>
            <a href='#contact'>Liên hệ</a>
          </nav>
          <div className='flex gap-4 items-center'>
            <button className='w-9 h-9 rounded-full hover:bg-gray-100'>🔍</button>
            <button className='w-9 h-9 rounded-full hover:bg-gray-100'>❤️</button>
            <button className='w-9 h-9 rounded-full hover:bg-gray-100'>👤</button>
            <button className='relative w-9 h-9 rounded-full hover:bg-gray-100'>
              🛒
              <span className='absolute bottom-0 right-0 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center' style={{backgroundColor: '#BE9C73'}}>
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='pt-28 px-4 pb-20' style={{background: `linear-gradient(to bottom, rgba(205, 166, 119, 0.1), white)`}}>
        <div className='max-w-7xl mx-auto'>
          {/* Header Section */}
          <div className='mb-12'>
            <h1 className='text-4xl font-normal mb-2' style={{color: '#BE9C73'}}>My Profile</h1>
            <p className='text-base font-normal' style={{color: '#666666'}}>
              Quản lý thông tin cá nhân và đơn hàng của bạn
            </p>
          </div>

          {/* Main Layout */}
          <div className='flex gap-8'>
            {/* Sidebar - User Card and Menu */}
            <div className='w-64 flex-shrink-0'>
              {/* User Card */}
              <div className='bg-white rounded-[10px] shadow-md overflow-hidden'>
                {/* User Header Background */}
                <div className='h-48 relative' style={{background: `linear-gradient(to bottom, #BE9C73, #CDA677)`}}>
                  {/* Avatar */}
                  <div className='absolute left-6 top-6 w-20 h-20'>
                    <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white'>
                      <span className='text-4xl font-bold' style={{color: '#BE9C73'}}>
                        {userInfo.name.charAt(0)}
                      </span>
                    </div>
                    <div className='absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center border-2' style={{color: '#BE9C73', borderColor: '#BE9C73'}}>
                      ✏️
                    </div>
                  </div>

                  {/* User Info */}
                  <div className='absolute left-6 bottom-6'>
                    <h3 className='text-white text-xl font-normal leading-7'>{userInfo.name}</h3>
                    <p className='text-white text-sm opacity-90'>{userInfo.email}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className='p-2 space-y-1'>
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all duration-200 text-base font-normal ${
                        activeTab === item.id
                          ? 'text-white shadow-md'
                          : 'hover:bg-gray-50'
                      }`}
                      style={activeTab === item.id ? {backgroundColor: '#BE9C73'} : {color: '#333333'}}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className='flex-1 bg-white rounded-[10px] shadow-md p-8'>
              {activeTab === 'profile' && (
                <div className='space-y-6'>
                  {/* Section Header */}
                  <div className='flex justify-between items-center pb-6'>
                    <h2 className='text-2xl font-normal' style={{color: '#BE9C73'}}>Thông tin cá nhân</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className='px-4 py-2 text-white rounded-[10px] flex items-center gap-2 transition-colors font-normal text-base'
                        style={{backgroundColor: '#BE9C73'}}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#AD8558')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#BE9C73')}
                      >
                        ✏️ Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {/* Form Fields Grid */}
                  <div className='grid grid-cols-2 gap-12'>
                    {/* Full Name */}
                    <div className='space-y-2'>
                      <label className='block text-gray-600 text-base font-normal'>
                        👤 Họ và tên
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={userInfo.name}
                          onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                          className='w-full px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 text-base'
                          placeholder='Nhập họ và tên'
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 text-base font-normal' style={{color: '#333333', borderColor: '#e5e7eb'}}>
                          {userInfo.name}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className='space-y-2'>
                      <label className='block text-gray-600 text-base font-normal'>
                        📧 Email
                      </label>
                      {isEditing ? (
                        <input
                          type='email'
                          value={userInfo.email}
                          onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                          className='w-full px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 text-base'
                          placeholder='Nhập email'
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 text-base font-normal' style={{color: '#333333', borderColor: '#e5e7eb'}}>
                          {userInfo.email}
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className='space-y-2'>
                      <label className='block text-gray-600 text-base font-normal'>
                        📱 Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type='tel'
                          value={userInfo.phone}
                          onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                          className='w-full px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 text-base'
                          placeholder='Nhập số điện thoại'
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 text-base font-normal' style={{color: '#333333', borderColor: '#e5e7eb'}}>
                          {userInfo.phone}
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className='space-y-2'>
                      <label className='block text-gray-600 text-base font-normal'>
                        🎂 Ngày sinh
                      </label>
                      {isEditing ? (
                        <input
                          type='date'
                          value={userInfo.dateOfBirth}
                          onChange={e => setUserInfo({ ...userInfo, dateOfBirth: e.target.value })}
                          className='w-full px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 text-base'
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 text-base font-normal' style={{color: '#333333', borderColor: '#e5e7eb'}}>
                          {new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className='space-y-3'>
                    <label className='block text-gray-600 text-base font-normal'>
                      🏠 Địa chỉ
                    </label>
                    {isEditing ? (
                      <textarea
                        value={userInfo.address}
                        onChange={e => setUserInfo({ ...userInfo, address: e.target.value })}
                        className='w-full px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 resize-none h-24 text-base'
                        placeholder='Nhập địa chỉ'
                      />
                    ) : (
                      <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200 text-base font-normal min-h-24' style={{color: '#333333', borderColor: '#e5e7eb'}}>
                        {userInfo.address}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className='flex gap-4 pt-6 border-t border-gray-200'>
                      <button
                        onClick={handleSaveProfile}
                        className='px-8 py-3 text-white rounded-[10px] transition-colors font-normal text-base'
                        style={{backgroundColor: '#BE9C73'}}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#AD8558')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#BE9C73')}
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className='px-8 py-3 border rounded-[10px] hover:bg-gray-50 transition-colors font-normal text-base'
                        style={{borderColor: '#e5e7eb', color: '#333333'}}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className='text-center py-16'>
                  <div className='text-6xl mb-4'>📦</div>
                  <p className='text-gray-500 text-lg mb-6'>Quản lý các đơn hàng của bạn</p>
                  <p className='text-gray-600 text-base'>Bạn chưa có đơn hàng nào.</p>
                </div>
              )}

              {activeTab === 'address' && (
                <div className='text-center py-16'>
                  <div className='text-6xl mb-4'>📍</div>
                  <p className='text-lg mb-6' style={{color: '#666666'}}>Quản lý địa chỉ giao hàng</p>
                  <p className='text-base mb-6' style={{color: '#333333'}}>Bạn chưa có địa chỉ giao hàng nào.</p>
                  <button className='px-6 py-2 text-white rounded-[10px] transition-colors font-normal' style={{backgroundColor: '#BE9C73'}} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#AD8558')} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#BE9C73')}>
                    + Thêm địa chỉ mới
                  </button>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className='space-y-6'>
                  <h3 className='text-xl font-normal mb-4' style={{color: '#BE9C73'}}>Cài đặt tài khoản</h3>
                  <div className='space-y-3'>
                    <button className='w-full flex items-center justify-between p-4 border rounded-[10px] hover:bg-gray-50 transition-colors text-base' style={{borderColor: '#e5e7eb', color: '#333333'}}>
                      <span>🔒 Đổi mật khẩu</span>
                      <span>→</span>
                    </button>
                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors text-base text-gray-700'>
                      <span>🔔 Thông báo</span>
                      <span>→</span>
                    </button>
                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors text-base text-gray-700'>
                      <span>🔐 Quyền riêng tư</span>
                      <span>→</span>
                    </button>
                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors text-base text-red-600'>
                      <span>🗑️ Xóa tài khoản</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{backgroundColor: '#ffffff', boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'}}>
        <div className='max-w-7xl mx-auto px-4 py-12'>
          {/* WOODIFY Logo */}
          <h2 className='text-3xl font-bold mb-12' style={{color: '#8B4513'}}>WOODIFY</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '80px'}}>
            {/* Company Info */}
            <div className='space-y-4'>
              <h3 className='text-lg font-bold' style={{color: '#A0522D'}}>Thông tin liên hệ</h3>
              <ul className='space-y-3 text-base' style={{color: '#996633'}}>
                <li>Số điện thoại: 0903038567</li>
                <li>Email:<br/>woodifylecomerce@gmail.com</li>
                <li>Địa chỉ: G30 Lê Thị Riêng Phường Thới An Quận 12 Thành phố Hồ Chí Minh</li>
              </ul>
            </div>

            {/* Categories */}
            <div className='space-y-4'>
              <h3 className='text-lg font-bold' style={{color: '#A0522D'}}>Doanh mục sản phẩm</h3>
              <ul className='space-y-3 text-base' style={{color: '#996633'}}>
                <li>
                  <a href='#' className='hover:underline'>
                    Phòng khách
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Nội thất phòng ngủ
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Văn phòng
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Nội thất bếp
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Sản phẩm trang trí
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className='space-y-4'>
              <h3 className='text-lg font-bold' style={{color: '#A0522D'}}>Hỗ trợ khách hàng</h3>
              <ul className='space-y-3 text-base' style={{color: '#996633'}}>
                <li>
                  <a href='#' className='hover:underline'>
                    Hướng dẫn mua hàng
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Hướng dẫn thanh toán
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Câu hỏi thường gặp
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Liên hệ hỗ trợ
                  </a>
                </li>
              </ul>
            </div>

            {/* Policies */}
            <div className='space-y-4'>
              <h3 className='text-lg font-bold' style={{color: '#A0522D'}}>Chính sách</h3>
              <ul className='space-y-3 text-base' style={{color: '#996633'}}>
                <li>
                  <a href='#' className='hover:underline'>
                    Chính sách vận chuyển
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Chính sách đổi trả
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:underline'>
                    Điều khoản dịch vụ
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
