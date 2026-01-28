import React from 'react'

const CHANNELS = [
  { name: 'Shopee Ads', contribution: '42%', trend: '+6%' },
  { name: 'Tìm kiếm tự nhiên', contribution: '33%', trend: '+2%' },
  { name: 'Shopee Live', contribution: '15%', trend: '+10%' },
  { name: 'Khác', contribution: '10%', trend: '-1%' }
]

export default function SalesAnalysis() {
  return (
    <section className='rounded-2xl border border-amber-800/15 bg-white p-6 shadow-sm'>
      <header className='flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4'>
        <div>
          <p className='text-xs uppercase tracking-wide text-stone-500'>Phân tích bán hàng</p>
          <h1 className='text-2xl font-semibold text-stone-900'>Kênh mang lại doanh thu</h1>
        </div>
        <select className='rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700 focus:border-amber-800 focus:outline-none'>
          <option>30 ngày</option>
          <option>7 ngày</option>
        </select>
      </header>

      <div className='mt-6 overflow-hidden rounded-xl border border-stone-100'>
        <div className='grid grid-cols-3 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-600'>
          <span>Kênh</span>
          <span>Đóng góp</span>
          <span>Xu hướng</span>
        </div>
        <div className='divide-y divide-stone-100 bg-white text-sm text-stone-900'>
          {CHANNELS.map(channel => (
            <div key={channel.name} className='grid grid-cols-3 px-4 py-3'>
              <span>{channel.name}</span>
              <span>{channel.contribution}</span>
              <span className={channel.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}>{channel.trend}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
