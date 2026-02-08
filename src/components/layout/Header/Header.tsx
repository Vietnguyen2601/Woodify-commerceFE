import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import './Header.css'

interface HeaderProps {
  cartItemCount?: number
}

type NavItem = {
  label: string
  to: string
}

const mainNavigation: NavItem[] = [
  { label: 'Trang chủ', to: ROUTES.HOME },
  { label: 'Sản phẩm', to: ROUTES.CATALOG },
  { label: 'Khuyến mãi', to: ROUTES.CATALOG },
  { label: 'Chăm sóc khách hàng', to: '/support' },
]

const quickLinks: NavItem[] = [
  { label: 'Thông Báo', to: ROUTES.PROFILE_ORDERS },
  { label: 'Đặt hàng theo yêu cầu', to: ROUTES.CATALOG },
  { label: 'Kênh người bán', to: ROUTES.SELLER },
]

export default function Header({ cartItemCount = 0 }: HeaderProps) {
  const notificationCount = 3

  return (
    <header className="header">
      <div className="header__texture" aria-hidden="true" />
      <div className="header__inner">
        <div className="header__top">
          <div className="header__top-links">
            {quickLinks.map((item) => (
              <Link key={item.label} to={item.to} className="header__top-link">
                {item.label}
              </Link>
            ))}
            <button type="button" className="header__top-link header__top-link--button">
              Tải ứng dụng
            </button>
          </div>
          <div className="header__top-right">
            <Link to="/support" className="header__top-link">
              Liên hệ
            </Link>
            <button type="button" className="header__language">
              Tiếng Việt
            </button>
          </div>
        </div>

        <div className="header__divider" />

        <div className="header__main">
          <Link to={ROUTES.HOME} className="header__brand">
            <div className="header__brand-mark">
              <img src="https://placehold.co/66x66" alt="Woodify" />
            </div>
            <div className="header__brand-copy">
              <span className="header__brand-title">WOODIFY</span>
              <span className="header__brand-caption">Signature wooden living</span>
            </div>
          </Link>

          <nav className="header__nav" aria-label="Main navigation">
            {mainNavigation.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__controls">
            <button type="button" className="header__icon-button" aria-label="Tìm kiếm sản phẩm">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <button type="button" className="header__icon-button" aria-label="Thông báo mới">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                <path
                  d="M2 19H18L16 17V10C16 6.68629 13.3137 4 10 4C6.68629 4 4 6.68629 4 10V17L2 19Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 19C7 20.6569 8.34315 22 10 22C11.6569 22 13 20.6569 13 19"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {notificationCount > 0 && <span className="header__badge">{notificationCount}</span>}
            </button>

            <Link to={ROUTES.CART} className="header__icon-button header__cart" aria-label="Giỏ hàng">
              <svg width="24" height="22" viewBox="0 0 24 22" fill="none">
                <path
                  d="M2 2H5L6.6 12.59C6.69354 13.2068 7.19831 13.6776 7.82 13.6776H18.44C19.0617 13.6776 19.5665 13.2068 19.66 12.59L21 4H6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="18.5" r="1.5" fill="currentColor" />
                <circle cx="17" cy="18.5" r="1.5" fill="currentColor" />
              </svg>
              {cartItemCount > 0 && (
                <span className="header__badge header__badge--cart">{cartItemCount}</span>
              )}
            </Link>

            <div className="header__auth">
              <Link to={ROUTES.REGISTER}>Đăng ký</Link>
              <span className="header__auth-divider">|</span>
              <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
