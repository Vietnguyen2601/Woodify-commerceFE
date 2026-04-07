import React from 'react'
import { useAppLanguage } from '@/hooks'

export default function AdminHeader() {
  const { lang, setLang, isVietnamese } = useAppLanguage()

  const t = {
    menu: isVietnamese ? 'Mở menu điều hướng' : 'Open navigation menu',
    alerts: isVietnamese ? 'Thông báo' : 'Notifications',
    account: isVietnamese ? 'Mở menu tài khoản' : 'Open account menu',
    role: isVietnamese ? 'Quản trị viên' : 'Super Admin',
    title: isVietnamese ? 'Bảng Điều Khiển Admin' : 'Admin Control Desk',
    subtitle: isVietnamese ? 'Theo dõi vận hành toàn sàn' : 'Marketplace operations overview',
  }

  const dateLabel = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date())

  return (
    <div className='top-0 z-20 border-b border-black/10 bg-[linear-gradient(165deg,_#8e6d4d,_#a47f5d_65%,_#b58f6a_100%)] px-0 py-3 shadow-sm'>
      <div className='mx-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-[1px]'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-3'>
            <button
              type='button'
              aria-label={t.menu}
              className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-black/20 bg-white/20 text-gray-900 transition-colors hover:bg-black/10'
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#2f2418' strokeWidth='1.8' strokeLinecap='round'>
                <path d='M4 7h16M4 12h16M4 17h16' />
              </svg>
            </button>

            <div className='min-w-0'>
              <p className='truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85'>{t.subtitle}</p>
              <div className='flex items-center gap-2'>
                <h2 className='truncate text-base font-semibold text-white'>{t.title}</h2>
                <span className='rounded-full border border-white/35 bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-white/90'>
                  {dateLabel}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='inline-flex items-center rounded-xl border border-white/45 bg-white/20 p-1 text-xs font-semibold'>
              <button
                type='button'
                onClick={() => setLang('vi')}
                className={`rounded-lg px-2.5 py-1 ${lang === 'vi' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/85 hover:bg-white/20'}`}
              >
                VI
              </button>
              <button
                type='button'
                onClick={() => setLang('en')}
                className={`rounded-lg px-2.5 py-1 ${lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/85 hover:bg-white/20'}`}
              >
                EN
              </button>
            </div>

            <button
              type='button'
              aria-label={t.alerts}
              className='relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/45 shadow-sm shadow-black/20 transition-all hover:bg-white/60'
            >
              <span className='text-xl'>🔔</span>
              
              {/* Notification Badge */}
              <span className='absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white' />
            </button>

            <div className='flex items-center gap-3 border-l border-white/40 pl-3 text-white'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-black/35 text-xs font-semibold tracking-wide'>
                SA
              </div>
              <div className='hidden sm:flex sm:flex-col sm:leading-tight'>
                <span className='text-sm font-semibold text-gray-900/90'>{t.role}</span>
                <span className='text-xs text-gray-800/80'>admin@woodify.com</span>
              </div>
              <button
                type='button'
                aria-label={t.account}
                className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-800 transition-colors hover:bg-white/30 hover:text-black'
              >
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'>
                  <path d='m6 9 6 6 6-6' />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
