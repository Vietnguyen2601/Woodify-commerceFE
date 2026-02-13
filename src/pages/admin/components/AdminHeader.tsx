import React from 'react'

export default function AdminHeader() {
  return (
    <div className='top-0 z-20 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm' style={{backgroundColor: '#C7A57A'}}>
      <div className='flex flex-wrap items-center justify-between gap-6'>
        <div className='flex flex-1 min-w-0 items-center gap-4'>
          <button
            type='button'
            aria-label='Mở menu điều hướng'
            className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100'
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'>
              <path d='M4 7h16M4 12h16M4 17h16' />
            </svg>
          </button>

          <label className='relative flex min-w-0 flex-1 items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 focus-within:border-gray-400'>
            <svg
              className='flex-shrink-0 text-gray-400'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='11' cy='11' r='7' />
              <path d='m16.5 16.5 4 4' />
            </svg>
            <input
              type='search'
              placeholder='Search products, shops, orders...'
              className='ml-3 w-full min-w-0 bg-transparent text-sm font-medium text-neutral-700 placeholder:text-neutral-500 focus:outline-none'
            />
          </label>
        </div>

        <div className='flex items-center gap-6'>
          <button
            type='button'
            aria-label='Thông báo'
            className='relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-600 hover:bg-gray-100'
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M12 5a4 4 0 0 0-4 4v2.764a2 2 0 0 1-.586 1.414L6.5 14.5h11l-1-1.322A2 2 0 0 1 16 11.764V9a4 4 0 0 0-4-4Z' />
              <path d='M9 18a3 3 0 0 0 6 0' />
            </svg>
            <span className='absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white' />
          </button>

          <div className='flex items-center gap-3 border-l border-gray-200 pl-5'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-stone-500 to-stone-600 text-sm font-semibold text-white'>
              SA
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-semibold text-gray-900'>Super Admin</span>
              <span className='text-xs text-gray-500'>admin@woodify.com</span>
            </div>
            <button
              type='button'
              aria-label='Mở menu tài khoản'
              className='flex h-6 w-6 items-center justify-center text-gray-500 hover:text-gray-700'
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'>
                <path d='m6 9 6 6 6-6' />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
