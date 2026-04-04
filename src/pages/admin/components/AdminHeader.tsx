import React from 'react'

const SEARCH_INPUT_ID = 'admin-search-field'

export default function AdminHeader() {
  return (
    <div className='top-0 z-20 border-b border-gray-900/20 bg-[#c7a57a] px-4 py-2 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-1 min-w-0 items-center gap-3'>
          <button
            type='button'
            aria-label='Mở menu điều hướng'
            className='flex h-8 w-8 flex-shrink-0 items-center justify-center border border-gray-800/30 text-gray-800 transition-colors hover:bg-black/10'
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'>
              <path d='M4 7h16M4 12h16M4 17h16' />
            </svg>
          </button>

          <div className='admin-search flex-1 min-w-0' role='search'>
            <span className='admin-search__icon'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.4'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='11' cy='11' r='7' />
                <path d='m16.5 16.5 4 4' />
              </svg>
            </span>
            <input
              id={SEARCH_INPUT_ID}
              type='search'
              placeholder='Search products, shops, orders...'
              className='admin-search__input'
            />
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <button
            type='button'
            aria-label='Thông báo'
            className='relative flex h-8 w-8 items-center justify-center border border-white/60 bg-white/30 text-white shadow-sm shadow-black/20 transition-all hover:bg-white/50 hover:text-gray-900'
          >
            <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4'>
              <path d='M12 5a4 4 0 0 0-4 4v2.764a2 2 0 0 1-.586 1.414L6.5 14.5h11l-1-1.322A2 2 0 0 1 16 11.764V9a4 4 0 0 0-4-4Z' />
              <path d='M9 18a3 3 0 0 0 6 0' />
            </svg>
            <span className='absolute right-1.5 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white' />
          </button>

          <div className='flex items-center gap-3 border-l border-white/40 pl-4 text-white'>
            <div className='flex h-8 w-8 items-center justify-center bg-black/40 text-xs font-semibold tracking-wide'>
              SA
            </div>
            <div className='flex flex-col leading-tight'>
              <span className='text-sm font-semibold text-gray-900/90'>Super Admin</span>
              <span className='text-xs text-gray-800/80'>admin@woodify.com</span>
            </div>
            <button
              type='button'
              aria-label='Mở menu tài khoản'
              className='flex h-6 w-6 items-center justify-center text-gray-800 hover:text-black'
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'>
                <path d='m6 9 6 6 6-6' />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
