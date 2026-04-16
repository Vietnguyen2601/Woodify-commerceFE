import React from 'react'

interface FinanceTopBarProps {
  statusLabel?: string
  initials?: string
}

const STORE_NAME = 'Wood Craft Artisans'

export default function FinanceTopBar({ statusLabel = 'ACTIVE', initials = 'WC' }: FinanceTopBarProps) {
  return (
    <div className='rounded-2xl border border-amber-900/20 bg-white px-3 py-2 shadow-sm'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-sm font-semibold text-stone-900'>{STORE_NAME}</p>
          <span className='mt-1 inline-flex items-center rounded-full bg-amber-800 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white'>
            {statusLabel}
          </span>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-500'>
            <span className='text-stone-400'>⌕</span>
            <input
              type='search'
              placeholder='Search orders, products, SKU...'
              className='w-48 border-none bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none'
            />
          </div>
          <div className='flex items-center gap-2 rounded-full bg-amber-900/10 px-3 py-1 text-xs font-semibold text-amber-900'>
            <span className='flex h-8 w-8 items-center justify-center rounded-full bg-amber-900 text-white'>{initials}</span>
            Finance desk
          </div>
        </div>
      </div>
    </div>
  )
}
