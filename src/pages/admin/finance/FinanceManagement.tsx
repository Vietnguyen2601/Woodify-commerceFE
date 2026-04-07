import React from 'react'
import { useAppLanguage } from '@/hooks'

const FINANCE_CARDS = [
  { label: 'Gross Revenue (MTD)', value: '12.4B VND', tone: 'is-success' },
  { label: 'Settlements Pending', value: '1.2B VND', tone: 'is-warning' },
  { label: 'Refund Requests', value: '84', tone: 'is-danger' },
  { label: 'Net Payout (Today)', value: '356M VND', tone: '' },
]

const PAYOUT_SNAPSHOTS = [
  { seller: 'Woodify Prime', amount: '124M VND', status: 'Released' },
  { seller: 'Craft Home', amount: '88M VND', status: 'On Hold' },
  { seller: 'Oak Studio', amount: '74M VND', status: 'In Review' },
]

export default function FinanceManagement() {
  const { isVietnamese } = useAppLanguage()

  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>{isVietnamese ? 'Quản lý tài chính' : 'Finance Management'}</p>
          <h2>{isVietnamese ? 'Dòng tiền, đối soát và tiến độ thanh toán' : 'Cashflow, payouts, and reconciliation snapshots'}</h2>
          <span>{isVietnamese ? 'Theo dõi sức khỏe tài chính toàn sàn và rủi ro vận hành thanh toán.' : 'Monitor marketplace financial health and payment operation risk in one place.'}</span>
        </div>
        <div className='admin-view__actions'>
          <button type='button' className='admin-btn outline'>{isVietnamese ? 'Xuất báo cáo' : 'Export Report'}</button>
          <button type='button' className='admin-btn primary'>{isVietnamese ? 'Chạy đối soát' : 'Run Reconciliation'}</button>
        </div>
      </header>

      <div className='admin-grid admin-grid--metrics'>
        {FINANCE_CARDS.map((card) => (
          <article key={card.label} className={['admin-card', card.tone].filter(Boolean).join(' ')}>
            <header>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
            </header>
            <footer>
              <span>{isVietnamese ? 'Cập nhật từ luồng tài chính' : 'Updated from finance stream'}</span>
            </footer>
          </article>
        ))}
      </div>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <h3>{isVietnamese ? 'Hàng đợi thanh toán gần nhất' : 'Latest payout queue'}</h3>
          <button type='button' className='admin-btn ghost'>{isVietnamese ? 'Xem toàn bộ' : 'View full queue'}</button>
        </header>
        <div className='admin-table'>
          {PAYOUT_SNAPSHOTS.map((item) => (
            <div key={item.seller} className='admin-table__row'>
              <div>
                <strong>{item.seller}</strong>
                <p>{isVietnamese ? 'Số tiền thanh toán' : 'Payout amount'}: {item.amount}</p>
              </div>
              <span className='admin-chip neutral'>{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
