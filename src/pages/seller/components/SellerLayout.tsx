import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import SellerSidebar from './SellerSidebar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useShopStore } from '@/store/shopStore'
import { shopService } from '@/services'
import { ROUTES } from '@/constants/routes'
import { useOrderShipmentRealtime } from '@/realtime/useOrderShipmentRealtime'

export default function SellerLayout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { shop, isLoading, setShop, setLoading } = useShopStore()
  const navigate = useNavigate()

  useOrderShipmentRealtime({
    shopId: shop?.shopId,
    accountId: user?.accountId,
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.accountId) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    if (shop) return

    setLoading(true)
    shopService
      .getShopByOwnerId(user.accountId)
      .then((shopData) => {
        if (shopData) {
          setShop(shopData)
        } else {
          navigate(ROUTES.SELLER_REGISTRATION, { replace: true })
        }
      })
      .catch((error) => {
        if (error?.status === 404) {
          navigate(ROUTES.SELLER_REGISTRATION, { replace: true })
        } else {
          console.error('Không thể tải thông tin cửa hàng:', error)
          navigate(ROUTES.SELLER_REGISTRATION, { replace: true })
        }
      })
      .finally(() => setLoading(false))
  }, [authLoading, isAuthenticated, user?.accountId])

  if (authLoading || isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-stone-50'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-amber-800 border-t-transparent' />
          <p className='text-sm text-stone-500'>Đang tải thông tin cửa hàng...</p>
        </div>
      </div>
    )
  }

  if (!shop) return null

  return (
    <div className='min-h-screen w-full bg-stone-100 text-stone-900'>
      <div className='flex min-h-screen'>
        <SellerSidebar />

        <div className='flex flex-1 flex-col'>
          <header className='border-b border-amber-800/20 bg-white px-6 py-4 shadow-sm md:px-8 lg:px-10'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div className='flex items-center gap-4'>
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className='h-14 w-14 rounded-2xl border border-amber-900/20 object-cover'
                  />
                ) : (
                  <div className='h-14 w-14 rounded-2xl border border-amber-900/20 bg-stone-50' aria-hidden='true' />
                )}
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wider text-stone-500'>Woodify Seller Center</p>
                  <div className='flex items-center gap-3'>
                    <h1 className='text-lg font-semibold text-stone-900'>{shop.name}</h1>
                    <span className='rounded-md bg-amber-800 px-2 py-0.5 text-[11px] font-medium text-white'>Beta</span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
                <form
                  className='flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 focus-within:border-amber-800'
                  aria-label='Tìm kiếm đơn hàng hoặc SKU'
                >
                  <span className='text-stone-400'>⌕</span>
                  <input
                    className='flex-1 border-none bg-transparent outline-none placeholder:text-stone-400'
                    type='search'
                    placeholder='Tìm đơn hàng, sản phẩm, người mua...'
                  />
                  <button type='submit' className='rounded-lg bg-amber-800 px-3 py-1 text-xs font-semibold text-white'>
                    Tìm
                  </button>
                </form>

                <div className='flex flex-wrap items-center gap-2 text-sm'>
                  {['Đào tạo', 'Hỗ trợ', 'Thông báo'].map(action => (
                    <button
                      key={action}
                      type='button'
                      className='rounded-lg border border-stone-200 px-3 py-1.5 text-stone-600 transition hover:border-amber-700 hover:text-amber-800'
                    >
                      {action}
                    </button>
                  ))}
                  <div className='flex flex-col items-center rounded-2xl border border-amber-900/20 bg-amber-900/10 px-3 py-1 text-xs font-semibold text-amber-900'>
                    <span>WM</span>
                    <small className='text-[10px] font-normal text-amber-800'>Woodify</small>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className='flex-1 overflow-y-auto bg-stone-50'>
            <div className='w-full px-8 pb-10 pt-8 md:px-10 lg:px-12'>
              <div className='w-full space-y-6'>
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
