import React from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import ProfileHome from './profile/ProfileHome'
import OrdersPage from './profile/orders/OrdersPage'
import MyProfile from './profile/account/MyProfile'
import BankAccount from './profile/account/BankAccount'
import Address from './profile/account/Address'
import ChangePassword from './profile/account/ChangePassword'
import NotificationSetting from './profile/account/NotificationSetting'
import PrivacySetting from './profile/account/PrivacySetting'
import PersonalInfo from './profile/account/PersonalInfo'
import VoucherPage from './profile/voucher/VoucherPage'
import NotificationCenter from './profile/NotificationCenter'
import ShopeeXu from './profile/ShopeeXu'
import DigitalWallet from './profile/wallet/DigitalWallet'

const PRIMARY_LINKS = [
  { id: 'notifications', label: 'Thông báo', to: '/profile/notifications', icon: '🔔' },
  { id: 'orders', label: 'Đơn mua', to: '/profile/orders', icon: '📦' },
  { id: 'voucher', label: 'Kho voucher', to: '/profile/voucher', icon: '🎟️' },
  { id: 'wallet', label: 'Ví WoodPay', to: '/profile/wallet', icon: '👛' },
  { id: 'xu', label: 'Shopee Xu', to: '/profile/xu', icon: '🪙' }
]

const ACCOUNT_LINKS = [
  { id: 'profile', label: 'Hồ sơ', to: '/profile/account/profile' },
  { id: 'bank', label: 'Ngân hàng', to: '/profile/account/bank' },
  { id: 'address', label: 'Địa chỉ', to: '/profile/account/address' },
  { id: 'password', label: 'Đổi mật khẩu', to: '/profile/account/password' },
  { id: 'notify', label: 'Cài đặt thông báo', to: '/profile/account/notifications' },
  { id: 'privacy', label: 'Thiết lập riêng tư', to: '/profile/account/privacy' },
  { id: 'personal', label: 'Thông tin cá nhân', to: '/profile/account/personal-info' }
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `account-nav__link${isActive ? ' is-active' : ''}`

export default function Profile() {
  const [accountOpen, setAccountOpen] = React.useState(true)

  return (
    <div className='account-center'>
      <header className='account-header'>
        <div className='account-header__logo'>
          <NavLink to='/'>Shopi<span>ee</span></NavLink>
          <span className='account-header__divider' />
          <p>Trung tâm tài khoản</p>
        </div>
        <div className='account-header__search'>
          <input type='text' placeholder='Tìm kiếm đơn hàng, voucher, cài đặt...' />
          <button>Tìm kiếm</button>
        </div>
        <div className='account-header__actions'>
          <button aria-label='Thông báo'>🔔</button>
          <button aria-label='Hỗ trợ'>💬</button>
          <button aria-label='Giỏ hàng'>🛒</button>
          <div className='account-header__avatar'>
            <span>NL</span>
            <small>Ngọc Linh</small>
          </div>
        </div>
      </header>

      <div className='account-shell'>
        <aside className='account-sidebar'>
          <div className='account-user-card'>
            <div className='account-user-card__avatar'>
              <img src='https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80' alt='Ngọc Linh' />
            </div>
            <div>
              <p>Xin chào,</p>
              <strong>Ngọc Linh</strong>
              <NavLink to='/profile/account/profile' className='account-edit-link'>Chỉnh sửa hồ sơ →</NavLink>
            </div>
          </div>

          <nav className='account-nav'>
            {PRIMARY_LINKS.map(link => (
              <NavLink key={link.id} to={link.to} className={navLinkClass}>
                <span className='account-nav__icon'>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            <div className='account-nav__group'>
              <button className='account-nav__group-toggle' onClick={() => setAccountOpen(!accountOpen)}>
                <div>
                  <span className='account-nav__icon'>👤</span>
                  Tài khoản của tôi
                </div>
                <span>{accountOpen ? '▾' : '▸'}</span>
              </button>
              {accountOpen && (
                <div className='account-nav__sub'>
                  {ACCOUNT_LINKS.map(link => (
                    <NavLink key={link.id} to={link.to} className={navLinkClass}>
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </aside>

        <section className='account-content'>
          <Routes>
            <Route index element={<ProfileHome />} />
            <Route path='notifications' element={<NotificationCenter />} />
            <Route path='orders' element={<OrdersPage />} />
            <Route path='voucher' element={<VoucherPage />} />
            <Route path='wallet' element={<DigitalWallet />} />
            <Route path='xu' element={<ShopeeXu />} />
            <Route path='account/profile' element={<MyProfile />} />
            <Route path='account/bank' element={<BankAccount />} />
            <Route path='account/address' element={<Address />} />
            <Route path='account/password' element={<ChangePassword />} />
            <Route path='account/notifications' element={<NotificationSetting />} />
            <Route path='account/privacy' element={<PrivacySetting />} />
            <Route path='account/personal-info' element={<PersonalInfo />} />
            <Route path='*' element={<Navigate to='orders' replace />} />
          </Routes>
        </section>
      </div>
    </div>
  )
}
