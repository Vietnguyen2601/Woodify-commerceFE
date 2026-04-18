import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

interface SellerNavLink {
  label: string
  to?: string
  chip?: string
  description?: string
}

interface SellerNavGroup {
  id: string
  label: string
  defaultOpen?: boolean
  links?: SellerNavLink[]
  placeholder?: string
}

const NAV_GROUPS: SellerNavGroup[] = [
  {
    id: 'overview',
    label: 'T\u1ed5ng quan',
    defaultOpen: true,
    links: [{ label: 'B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n', to: '/seller' }]
  },
  {
    id: 'orders',
    label: 'Qu\u1ea3n L\u00fd \u0110\u01a1n H\u00e0ng',
    links: [
      { label: 'T\u1ea5t c\u1ea3', to: '/seller/orders' },
      { label: 'Giao h\u00e0ng lo\u1ea1t', to: '/seller/orders/bulk-shipping' },
      { label: 'B\u00e0n giao \u0111\u01a1n h\u00e0ng', to: '/seller/orders/handover' },
      { label: 'Tr\u1ea3 h\u00e0ng / Ho\u00e0n ti\u1ec1n', to: '/seller/orders/returns' }
    ]
  },
  {
    id: 'products',
    label: 'Qu\u1ea3n L\u00fd S\u1ea3n Ph\u1ea9m',
    links: [
      { label: 'T\u1ea5t c\u1ea3 s\u1ea3n ph\u1ea9m', to: '/seller/products' },
      { label: 'Th\u00eam s\u1ea3n ph\u1ea9m', to: '/seller/products/add' }
    ]
  },
  {
    id: 'support',
    label: 'Feedback & H\u1ed7 Tr\u1ee3',
    links: [{ label: 'Shop Rating Management', to: '/seller/support/shop-rating' }]
  },
  {
    id: 'finance',
    label: 'T\u00e0i Ch\u00ednh',
    links: [
      { label: 'Doanh thu', to: '/seller/finance/revenue' },
      { label: 'T\u00e0i kho\u1ea3n ng\u00e2n h\u00e0ng', to: '/seller/finance/bank' }
    ]
  },
  {
    id: 'shop',
    label: 'Qu\u1ea3n L\u00fd Shop',
    links: [{ label: 'H\u1ed3 s\u01a1 shop', to: '/seller/shop/profile' }]
  }
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'mt-1 flex flex-col rounded-2xl border px-3 py-2 text-xs transition',
    isActive
      ? 'border-amber-500 bg-amber-500/20 text-white shadow-lg shadow-amber-900/30'
      : 'border-white/5 text-stone-100/80 hover:border-white/20 hover:bg-white/5'
  ].join(' ')

/** Mở nhóm khi URL thuộc nhánh (prefix); khác với highlight NavLink — dùng `end` trên NavLink. */
const isPathUnderGroup = (currentPath: string, targetPath?: string) => {
  if (!targetPath) return false
  if (targetPath === '/seller') return currentPath === '/seller'
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

export default function SellerSidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
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
        if (group.links?.some(link => isPathUnderGroup(location.pathname, link.to))) {
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
    <aside className='flex w-64 flex-col justify-between bg-stone-950 text-stone-100 shadow-2xl'>
      <div className='space-y-6 px-4 py-6'>
        <div className='flex items-center gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 p-4'>
          <div className='h-12 w-12 rounded-2xl border border-amber-400/40 bg-stone-900/60' aria-hidden='true' />
          <div>
            <p className='text-lg font-semibold tracking-wide text-white'>WOODIFY</p>
            <p className='text-[11px] uppercase tracking-[0.2em] text-amber-200'>Seller Dashboard</p>
          </div>
        </div>

        <nav className='space-y-4'>
          {NAV_GROUPS.map(group => (
            <section key={group.id} className='rounded-3xl border border-white/5 bg-white/5 p-3'>
              <button
                type='button'
                className='flex w-full items-center justify-between rounded-2xl px-2 py-2 text-left text-sm font-semibold text-white transition hover:bg-white/10'
                onClick={() => toggleGroup(group.id)}
              >
                <div className='pl-1'>{group.label}</div>
                <span className='text-xs text-white/70' aria-hidden>
                  {openGroups[group.id] ? '\u25be' : '\u25b8'}
                </span>
              </button>

              {group.links && openGroups[group.id] && (
                <div className='mt-2 space-y-1'>
                  {group.links.map(link => (
                    link.to ? (
                      <NavLink key={link.to} to={link.to} end className={navLinkClass}>
                        <span className='font-medium'>{link.label}</span>
                        {link.chip && <small className='text-[11px] text-amber-200'>{link.chip}</small>}
                        {link.description && <small className='text-[11px] text-stone-300'>{link.description}</small>}
                      </NavLink>
                    ) : (
                      <div
                        key={link.label}
                        className='mt-1 flex flex-col rounded-2xl border border-white/5 px-3 py-2 text-xs text-stone-300'
                      >
                        <span>{link.label}</span>
                        {link.description && <small className='text-[11px] text-stone-400'>{link.description}</small>}
                      </div>
                    )
                  ))}
                </div>
              )}

              {group.placeholder && openGroups[group.id] && (
                <div className='mt-3 rounded-2xl border border-dashed border-white/30 bg-white/5 px-3 py-3 text-xs text-stone-200'>
                  <p className='text-[11px] leading-relaxed text-stone-200'>{group.placeholder}</p>
                  <button
                    type='button'
                    className='mt-3 rounded-xl border border-white/30 px-3 py-1 text-[11px] font-semibold text-white transition hover:border-white hover:bg-white/10'
                  >
                    Nhận thông báo
                  </button>
                </div>
              )}
            </section>
          ))}
        </nav>
      </div>

      <div className='border-t border-white/10 px-4 py-4 text-xs text-stone-100/70'>
        {user && (
          <div className='mb-2 flex items-center gap-2 rounded-2xl px-3 py-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-amber-800/60 text-[11px] font-semibold text-amber-200'>
              {((user.fullName ?? user.username ?? user.email) || 'U').charAt(0).toUpperCase()}
            </div>
            <div className='min-w-0'>
              <p className='truncate font-medium text-white'>{user.fullName ?? user.username ?? user.email ?? 'User'}</p>
              <p className='truncate text-[10px] text-stone-400'>{user.role}</p>
            </div>
          </div>
        )}
        <div className='space-y-1'>
          <p className='rounded-2xl px-3 py-2 transition hover:bg-white/5'>Cài đặt</p>
          <Link
            to={ROUTES.HOME}
            className='block rounded-2xl px-3 py-2 font-medium text-amber-200/90 transition hover:bg-white/5 hover:text-amber-100'
          >
            Quay lại
          </Link>
        </div>
        <button
          type='button'
          onClick={() => logout()}
          className='w-full rounded-2xl px-3 py-2 text-left text-rose-400 transition hover:bg-white/5 hover:text-rose-300'
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
