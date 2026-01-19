import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface SellerNavLink {
  label: string
  to?: string
  chip?: string
  description?: string
}

interface SellerNavGroup {
  id: string
  label: string
  icon: string
  defaultOpen?: boolean
  links?: SellerNavLink[]
  placeholder?: string
}

const NAV_GROUPS: SellerNavGroup[] = [
  {
    id: 'overview',
    label: 'Tổng quan',
    icon: '📊',
    defaultOpen: true,
    links: [{ label: 'Bảng điều khiển', to: '/seller' }]
  },
  {
    id: 'orders',
    label: 'Quản Lý Đơn Hàng',
    icon: '📦',
    links: [
      { label: 'Tất cả', to: '/seller/orders' },
      { label: 'Giao hàng loạt', to: '/seller/orders/bulk-shipping' },
      { label: 'Bàn giao đơn hàng', to: '/seller/orders/handover' },
      { label: 'Trả hàng / Hoàn tiền', to: '/seller/orders/returns' },
      { label: 'Cài đặt vận chuyển', to: '/seller/orders/shipping-settings', description: 'Thiết lập dịch vụ' }
    ]
  },
  {
    id: 'products',
    label: 'Quản Lý Sản Phẩm',
    icon: '🪵',
    links: [
      { label: 'Tất cả sản phẩm', to: '/seller/products' },
      { label: 'Thêm sản phẩm', to: '/seller/products/add' },
      { label: 'Công cụ tối ưu AI', to: '/seller/products/ai' }
    ]
  },
  {
    id: 'marketing',
    label: 'Kênh Marketing',
    icon: '📣',
    placeholder: 'Tính năng sẽ ra mắt sớm. Theo dõi Shopee Live để nhận cập nhật.'
  },
  {
    id: 'support',
    label: 'Chăm Sóc Khách Hàng',
    icon: '💬',
    placeholder: 'Kết nối chat, đánh giá và phản hồi trong bản phát hành kế tiếp.'
  },
  {
    id: 'finance',
    label: 'Tài Chính',
    icon: '💰',
    links: [
      { label: 'Doanh thu', to: '/seller/finance/revenue' },
      { label: 'Số dư TK Shopee', to: '/seller/finance/wallet' },
      { label: 'Tài khoản ngân hàng', to: '/seller/finance/bank' }
    ]
  },
  {
    id: 'analytics',
    label: 'Dữ Liệu',
    icon: '📈',
    links: [
      { label: 'Phân tích bán hàng', to: '/seller/analytics/sales' },
      { label: 'Hiệu quả hoạt động', to: '/seller/analytics/performance' }
    ]
  },
  {
    id: 'shop',
    label: 'Quản Lý Shop',
    icon: '🏬',
    links: [
      { label: 'Hồ sơ shop', to: '/seller/shop/profile' },
      { label: 'Trang trí shop', to: '/seller/shop/decoration' },
      { label: 'Thiết lập shop', to: '/seller/shop/settings' },
      { label: 'Quản lý khiếu nại', to: '/seller/shop/complaints' }
    ]
  }
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `seller-sidebar__link${isActive ? ' is-active' : ''}`

const isPathActive = (currentPath: string, targetPath?: string) => {
  if (!targetPath) return false
  if (targetPath === '/seller') return currentPath === '/seller'
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

export default function SellerSidebar() {
  const location = useLocation()
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    NAV_GROUPS.forEach(group => {
      initial[group.id] = group.defaultOpen ?? true
    })
    return initial
  })

  React.useEffect(() => {
    setOpenGroups(prev => {
      const next = { ...prev }
      NAV_GROUPS.forEach(group => {
        if (group.links?.some(link => isPathActive(location.pathname, link.to))) {
          next[group.id] = true
        }
      })
      return next
    })
  }, [location.pathname])

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  return (
    <aside className='seller-sidebar'>
      <div className='seller-sidebar__identity'>
        <div>
          <p className='seller-sidebar__eyebrow'>Kênh người bán</p>
          <strong>Woodify Studio</strong>
          <span>Trạng thái: <b>Xuất sắc</b></span>
          <small>Điểm phạt gần nhất: 0 • SLA 97%</small>
        </div>
        <button type='button' className='seller-sidebar__status-btn'>Xem đánh giá shop</button>
      </div>

      <nav>
        {NAV_GROUPS.map(group => (
          <section key={group.id} className='seller-sidebar__section'>
            <button type='button' className='seller-sidebar__section-toggle' onClick={() => toggleGroup(group.id)}>
              <div>
                <span className='seller-sidebar__icon'>{group.icon}</span>
                {group.label}
              </div>
              <span aria-hidden>{openGroups[group.id] ? '▾' : '▸'}</span>
            </button>

            {group.links && openGroups[group.id] && (
              <div className='seller-sidebar__links'>
                {group.links.map(link => (
                  link.to ? (
                    <NavLink key={link.label} to={link.to} className={navLinkClass}>
                      <span>{link.label}</span>
                      {link.chip && <small>{link.chip}</small>}
                      {link.description && <small className='seller-sidebar__hint'>{link.description}</small>}
                    </NavLink>
                  ) : (
                    <div key={link.label} className='seller-sidebar__link is-disabled'>
                      <span>{link.label}</span>
                      <small>{link.description}</small>
                    </div>
                  )
                ))}
              </div>
            )}

            {group.placeholder && openGroups[group.id] && (
              <div className='seller-sidebar__placeholder'>
                <p>{group.placeholder}</p>
                <button type='button'>Nhận thông báo</button>
              </div>
            )}
          </section>
        ))}
      </nav>
    </aside>
  )
}
