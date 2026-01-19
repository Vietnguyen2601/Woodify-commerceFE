import React from 'react'

const CHANNELS = [
  { name: 'Shopee Ads', contribution: '42%', trend: '+6%' },
  { name: 'Tìm kiếm tự nhiên', contribution: '33%', trend: '+2%' },
  { name: 'Shopee Live', contribution: '15%', trend: '+10%' },
  { name: 'Khác', contribution: '10%', trend: '-1%' }
]

export default function SalesAnalysis() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Phân tích bán hàng</p>
          <h2>Kênh mang lại doanh thu</h2>
        </div>
        <select>
          <option>30 ngày</option>
          <option>7 ngày</option>
        </select>
      </header>

      <div className='seller-table'>
        <div className='seller-table__head'>
          <span>Kênh</span>
          <span>Đóng góp</span>
          <span>Xu hướng</span>
        </div>
        {CHANNELS.map(channel => (
          <div key={channel.name} className='seller-table__row'>
            <span>{channel.name}</span>
            <span>{channel.contribution}</span>
            <span>{channel.trend}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
