import React, { useState } from 'react'
import type { AxiosError } from 'axios'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES, EXTERNAL_LINKS } from '../../../constants/routes'
import woodifyLogo from '../../../assets/logo/Woodify.jpg'
import { Icon } from '../../ui'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { shopService } from '@/services'
import { useShopStore } from '@/store/shopStore'
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
  { label: 'Khuyến mãi', to: ROUTES.PROMOTIONS },
  { label: 'Chăm Sóc Khách Hàng', to: '/support' },
]

export default function Header({ cartItemCount = 0 }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const { setShop } = useShopStore()
  const navigate = useNavigate()
  const notificationCount = 3
  const [isSearching, setIsSearching] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isCheckingSellerAccess, setIsCheckingSellerAccess] = useState(false)

  const handleSellerChannelClick = async () => {
    if (isCheckingSellerAccess) return

    if (!isAuthenticated || !user?.accountId) {
      navigate(ROUTES.LOGIN)
      return
    }

    try {
      setIsCheckingSellerAccess(true)
      const shopData = await shopService.getShopByOwnerId(user.accountId)
      if (shopData?.shopId) {
        setShop(shopData)
        navigate(ROUTES.SELLER)
        return
      }
      navigate(ROUTES.SELLER_REGISTRATION)
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError?.response?.status === 404 || (error as any)?.status === 404) {
        navigate(ROUTES.SELLER_REGISTRATION)
      } else {
        console.error('Unable to verify seller access', error)
      }
    } finally {
      setIsCheckingSellerAccess(false)
    }
  }

  return (
    <header className="site-header sticky top-0 z-50 w-full" style={{backgroundColor: '#C7A57A'}}>
      {/* Top Bar - Hidden on Mobile */}
      <div className="hidden md:flex px-4 md:px-12 lg:px-20 py-1 items-center justify-between text-white text-xs" style={{backgroundColor: '#C7A57A'}}>
        <div className="hidden md:flex items-center gap-4 lg:gap-6 font-arbutus text-xs md:text-xs flex-1 justify-center ml-12 lg:ml-16">
          <Link to={ROUTES.PROFILE_ORDERS} className="hover:opacity-80 transition">
            THÔNG BÁO
          </Link>
          <Link to={ROUTES.CATALOG} className="hover:opacity-80 transition">
            ĐẶT HÀNG THEO YÊU CẦU
          </Link>
          <button
            type="button"
            onClick={handleSellerChannelClick}
            className={`hover:opacity-80 transition font-arbutus ${isCheckingSellerAccess ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isCheckingSellerAccess}
            aria-disabled={isCheckingSellerAccess}
          >
            KÊNH NGƯỜI BÁN
          </button>
          <Link to="#" className="hover:opacity-80 transition">
            TẢI ỨNG DỤNG
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          {/* Social Icons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={EXTERNAL_LINKS.FACEBOOK_WOODIFY}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
              aria-label="Woodify trên Facebook (mở tab mới)"
            >
              <Icon name="facebook" size={20} strokeWidth={1.8} decorative className="text-white" />
            </a>
            <a href="#" className="hover:opacity-80 transition" aria-label="Woodify trên Instagram">
              <Icon name="instagram" size={20} strokeWidth={1.8} decorative className="text-white" />
            </a>
            <a
              href={EXTERNAL_LINKS.TIKTOK_WOODIFY}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
              aria-label="Woodify trên TikTok (mở tab mới)"
            >
              <Icon name="tiktok" size={20} strokeWidth={1.8} decorative className="text-white" />
            </a>
          </div>

          <span className="hidden lg:block w-px h-3 bg-white opacity-40"></span>

          <Link to="/support" className="hidden md:block hover:opacity-80 transition font-arbutus text-xs">
            LIÊN HỆ
          </Link>
          
          <div className="hidden md:flex items-center text-white font-arbutus text-xs" aria-label="Ngôn ngữ">
            <Icon name="globe" size={18} strokeWidth={1.8} decorative className="text-white" />
            <select
              className="bg-transparent border-0 text-white font-arbutus text-xs pl-1 focus:outline-none appearance-none"
              defaultValue="vi"
              aria-label="Chọn ngôn ngữ"
            >
              <option value="vi" className="text-gray-800">TIẾNG VIỆT</option>
              <option value="en" className="text-gray-800">ENGLISH</option>
            </select>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white opacity-50 w-full hidden md:block"></div>

      {/* Main Header */}
      <div className="px-4 md:px-8 lg:px-20 py-1.5 md:py-2 flex items-center justify-between gap-4 md:gap-5" style={{backgroundColor: '#C7A57A'}}>
        {/* Brand */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="bg-white rounded-lg flex-shrink-0 overflow-hidden" style={{ width: '64px', height: '64px' }}>
            <img
              src={woodifyLogo}
              alt="Logo Woodify"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="text-white text-xl md:text-2xl lg:text-3xl font-bold font-poppins whitespace-nowrap">WOODIFY</span>
        </Link>

        {/* Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex flex-1 justify-center overflow-hidden">
          {isSearching ? (
            <input
              key="search-input"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
              className="w-full px-4 py-2 rounded bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 outline-none"
              style={{
                animation: 'slideIn 0.3s ease-out forwards'
              }}
            />
          ) : (
            <nav
              key="navigation"
              className="flex items-center gap-6 lg:gap-8 whitespace-nowrap transition-all duration-300"
              style={{
                animation: 'slideOut 0.3s ease-in forwards'
              }}
              aria-label="Main navigation"
            >
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-white text-base md:text-lg lg:text-xl font-bold font-poppins transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <button
              type="button"
              aria-label="Tìm kiếm sản phẩm"
              onClick={() => {
                setIsSearching(!isSearching)
                if (isSearching) setSearchValue('')
              }}
              className="p-1 md:p-1.5 text-white hover:opacity-100 transition-all duration-300"
            >
              {isSearching ? (
                <svg width="16" height="16" className="w-4 md:w-4 lg:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="16" height="16" className="w-4 md:w-4 lg:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M19.6 18.1L14 12.6c1.1-1.4 1.7-3.1 1.7-4.9 0-4.5-3.6-8.1-8.1-8.1S-1.5 3.3-1.5 7.8s3.6 8.1 8.1 8.1c1.8 0 3.5-.6 4.9-1.7l5.6 5.6 1.8-1.8zM7.6 13.6c-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8 5.8 2.6 5.8 5.8-2.6 5.8-5.8 5.8z" />
                </svg>
              )}
            </button>

            {/* Cart */}
            <Link
              to={ROUTES.CART}
              className="relative p-1 md:p-1.5 text-white hover:opacity-80 transition"
              aria-label="Giỏ hàng"
            >
              <svg width="18" height="16" className="w-5 md:w-5 lg:w-6" viewBox="0 0 24 20" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2.5 -right-1.5 inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center px-1 text-[10px] font-bold leading-none text-white md:min-h-5 md:min-w-5 md:px-1.5 md:text-xs bg-red-500 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Auth Links */}
          <div className="flex items-center gap-2 text-white text-xs font-arbutus border-l border-white border-opacity-40 pl-4 whitespace-nowrap">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.PROFILE}
                  className="hover:opacity-80 transition flex items-center gap-1.5"
                >
                  <Icon name="user" size={16} strokeWidth={1.8} decorative className="text-white flex-shrink-0" />
                  <span className="font-medium max-w-[100px] truncate">{user.username}</span>
                </Link>
                <span className="opacity-60">|</span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="hover:opacity-80 transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link to={ROUTES.REGISTER} className="hover:opacity-80 transition">
                  Đăng ký
                </Link>
                <span className="opacity-60">|</span>
                <Link to={ROUTES.LOGIN} className="hover:opacity-80 transition">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
