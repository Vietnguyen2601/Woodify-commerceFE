import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface AdminNavLink {
  label: string
  to: string
  description?: string
  badge?: string
}

interface AdminNavGroup {
  id: string
  label: string
  icon: string
  links: AdminNavLink[]
}

const NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Điều hành',
    icon: '🛰️',
    links: [
      { label: 'Dashbroad', to: '/admin' },
      { label: 'Admin Flow', to: '/admin/flow', description: 'Luồng kiểm soát tức thời' }
    ]
  },
  {
    id: 'operations',
    label: 'Vận hành',
    icon: '🧭',
    links: [
      { label: 'Quản lý Categories', to: '/admin/categories' },
      { label: 'Quản lý Seller', to: '/admin/sellers', badge: '32 cảnh báo' },
      { label: 'Quản lý Order', to: '/admin/orders', description: 'Đơn rủi ro / SLA' }
    ]
  },
  {
    id: 'growth',
    label: 'Chiến lược',
    icon: '📈',
    links: [
      { label: 'Kế hoạch Marketing', to: '/admin/marketing' },
      { label: 'Chính sách & tuân thủ', to: '/admin/policies' }
    ]
  },
  {
    id: 'profile',
    label: 'Cá nhân hoá',
    icon: '👩‍✈️',
    links: [{ label: 'Hồ sơ quản trị', to: '/admin/profile' }]
  }
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `admin-nav__link${isActive ? ' is-active' : ''}`

const isNavActive = (pathname: string, target: string) =>
  pathname === target || pathname.startsWith(`${target}/`)

export default function AdminSidebar() {
  const location = useLocation()

  return (
    <aside className='admin-sidebar'>
      <div className='admin-sidebar__identity'>
        <p className='admin-sidebar__eyebrow'>Woodify Command</p>
        <strong>Đội phản ứng nhanh</strong>
        <span>Trực ca sáng • SLA 97.4%</span>
        <button type='button' className='admin-btn ghost'>Gửi báo cáo cuối ca</button>
      </div>

      {NAV_GROUPS.map((group) => (
        <section key={group.id} className='admin-nav__section'>
          <div className='admin-nav__label'>
            <span aria-hidden>{group.icon}</span>
            {group.label}
          </div>
          <div className='admin-nav__links'>
            {group.links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                <div>
                  <span>{link.label}</span>
                  {link.description && <small>{link.description}</small>}
                </div>
                {(link.badge || isNavActive(location.pathname, link.to)) && (
                  <span className='admin-nav__badge'>
                    {link.badge || 'Live'}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </section>
      ))}
    </aside>
  )
}
