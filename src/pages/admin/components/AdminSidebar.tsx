import React from 'react'
import { NavLink } from 'react-router-dom'

interface SidebarItem {
  label: string
  to: string
  icon: 'dashboard' | 'shops' | 'products' | 'reviews' | 'orders' | 'shipments' | 'providers' | 'categories' | 'vouchers' | 'disputes' | 'finance' | 'cms' | 'settings' | 'logs'
}

const NAV_ITEMS: SidebarItem[] = [
  { label: 'Overview', to: '/admin', icon: 'dashboard' },
  { label: 'Shop Management', to: '/admin/sellers', icon: 'shops' },
  { label: 'Product Moderation', to: '/admin/products', icon: 'products' },
  { label: 'Category Management', to: '/admin/categories', icon: 'categories' },
  { label: 'Order Management', to: '/admin/orders', icon: 'orders' },
  { label: 'Shipment Management', to: '/admin/shipments', icon: 'shipments' }
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
    case 'finance':
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={stroke} strokeWidth={strokeWidth} strokeLinecap='round'>
          <path d='M4 19h16' />
          <path d='M8 19V9' />
          <path d='M12 19V5' />
          <path d='M16 19v-7' />
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
  return (
    <aside className='w-64 bg-white border-r border-gray-200 flex flex-col h-full min-h-[calc(100vh-64px)] overflow-hidden shadow-sm'>
      <div className='h-16 border-b border-gray-200 flex items-center px-6'>
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 rounded-2xl bg-gradient-to-b from-stone-500 to-stone-600 flex items-center justify-center text-white font-semibold'>
            <span className='text-sm'>WF</span>
          </div>
          <div>
            <strong className='text-lg font-bold text-neutral-800 leading-tight'>Woodify</strong>
            <p className='text-xs text-neutral-500'>Admin Console</p>
          </div>
        </div>
      </div>

      <nav className='flex-1 overflow-y-auto px-3 pt-6 space-y-1'>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors',
                isActive
                  ? 'bg-gradient-to-b from-stone-500 to-stone-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600'>
                  <SidebarIcon variant={item.icon} isActive={isActive} />
                </div>
                <span className='text-sm font-medium'>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
