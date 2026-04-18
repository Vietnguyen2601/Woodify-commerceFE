import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAppLanguage } from '@/hooks'

interface SidebarItem {
  labelVi: string
  labelEn: string
  to: string
  end?: boolean
  icon: 'dashboard' | 'shops' | 'products' | 'reviews' | 'orders' | 'shipments' | 'providers' | 'categories' | 'vouchers' | 'disputes' | 'cms' | 'finance' | 'settings' | 'logs'
}

const NAV_ITEMS: SidebarItem[] = [
  { labelVi: 'Tổng quan', labelEn: 'Overview', to: '/admin', end: true, icon: 'dashboard' },
  { labelVi: 'Cửa hàng', labelEn: 'Shops', to: '/admin/sellers', icon: 'shops' },
  { labelVi: 'Kiểm duyệt sản phẩm', labelEn: 'Product Moderation', to: '/admin/products', icon: 'products' },
  { labelVi: 'Danh mục', labelEn: 'Categories', to: '/admin/categories', icon: 'categories' },
  { labelVi: 'Đơn hàng', labelEn: 'Orders', to: '/admin/orders', icon: 'orders' },
  { labelVi: 'Vận chuyển', labelEn: 'Shipments', to: '/admin/shipments', icon: 'shipments' },
  { labelVi: 'Quảng cáo', labelEn: 'Advertising', to: '/admin/marketing', icon: 'cms' },
  { labelVi: 'Tài chính', labelEn: 'Finance', to: '/admin/finance', icon: 'finance' }
]

const iconStroke = 'currentColor'

const SidebarIcon: React.FC<{ variant: SidebarItem['icon']; isActive?: boolean }> = ({ variant, isActive }) => {
  const strokeWidth = 1.5
  const stroke = isActive ? '#fff' : iconStroke

  switch (variant) {
    case 'dashboard':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <rect x='3' y='3' width='7' height='7' rx='1.5' />
          <rect x='14' y='3' width='7' height='10' rx='1.5' />
          <rect x='3' y='14' width='10' height='7' rx='1.5' />
          <rect x='15' y='15' width='6' height='6' rx='1.5' />
        </svg>
      )
    case 'shops':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M4 10h16v10H4z' />
          <path d='M3 10h18l-2-5H5z' />
          <path d='M9 14v6' />
          <path d='M15 14v6' />
        </svg>
      )
    case 'products':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M3 7l9-4 9 4-9 4-9-4z' />
          <path d='M3 7v10l9 4 9-4V7' />
          <path d='M12 11v10' />
        </svg>
      )
    case 'reviews':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M4 5h16v10H7l-3 4z' />
          <path d='M8 9h8' />
          <path d='M8 12h5' />
        </svg>
      )
    case 'orders':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M7 4h10l3 4v12H4V4h3z' />
          <path d='M7 4v4h10V4' />
          <path d='M9 13h6' />
          <path d='M9 17h3' />
        </svg>
      )
    case 'shipments':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M3 7l9-4 9 4v6l-9 4-9-4V7z' />
          <path d='M12 3v10' />
          <path d='M3 13l9 4 9-4' />
        </svg>
      )
    case 'providers':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M4 6h16v5H4z' />
          <path d='M4 13h16v5H4z' />
          <path d='M9 6v12' />
          <path d='M15 6v12' />
        </svg>
      )
    case 'categories':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M6 5h4v4H6z' />
          <path d='M6 15h4v4H6z' />
          <path d='M14 5h4v4h-4z' />
          <path d='M14 15h4v4h-4z' />
        </svg>
      )
    case 'vouchers':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M4 7h16v10H4z' />
          <path d='M8 7v10' />
          <path d='M16 7v10' />
          <path d='M10 12h4' />
        </svg>
      )
    case 'disputes':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M4 6h16l-2 10H6L4 6z' />
          <path d='M9 11h6' />
          <path d='M12 11v5' />
        </svg>
      )
    case 'cms':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M4 5h16v6H4z' />
          <path d='M4 13h8v6H4z' />
          <path d='M14 13h6v6h-6z' />
        </svg>
      )
    case 'finance':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round'>
          <rect x='2' y='5' width='20' height='14' rx='2' />
          <path d='M2 10h20' />
          <path d='M16 14h.01' />
        </svg>
      )
    case 'settings':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' />
          <path d='M4 12h2' />
          <path d='M18 12h2' />
          <path d='M12 4v2' />
          <path d='M12 18v2' />
          <path d='M5.6 5.6l1.4 1.4' />
          <path d='M16.9 16.9l1.4 1.4' />
          <path d='M18.5 5.5l-1.4 1.4' />
          <path d='M6.5 17.5l-1.4 1.4' />
        </svg>
      )
    case 'logs':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M6 4h12v16H6z' />
          <path d='M10 8h4' />
          <path d='M10 12h4' />
          <path d='M10 16h2' />
        </svg>
      )
    default:
      return null
  }
}

export default function AdminSidebar() {
  const { isVietnamese } = useAppLanguage()

  return (
    <aside className='admin-sidebar-panel shrink-0' aria-label={isVietnamese ? 'Điều hướng admin' : 'Admin navigation'}>
      <div className='admin-sidebar-panel__brand'>
        <div className='admin-sidebar-panel__badge'>WF</div>
        <div>
          <p className='admin-sidebar-panel__eyebrow'>Woodify Console</p>
          <strong>Admin Command</strong>
        </div>
      </div>

      <nav className='admin-sidebar-panel__nav'>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              ['admin-sidebar__link', isActive ? 'is-active' : ''].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span className='admin-sidebar__icon-wrap' aria-hidden='true'>
                  <SidebarIcon variant={item.icon} isActive={isActive} />
                </span>
                <span className='admin-sidebar__label'>{isVietnamese ? item.labelVi : item.labelEn}</span>
                <span className='admin-sidebar__chevron' aria-hidden='true'>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                    <path d='m9 6 6 6-6 6' />
                  </svg>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
