import React from 'react'
import { currency } from '../../../utils/format'

type TransactionType = 'credit' | 'debit'
type TransactionStatus = 'completed' | 'pending' | 'failed'

type WalletTransaction = {
  id: string
  type: TransactionType
  description: string
  amount: number
  status: TransactionStatus
  timestamp: string
  orderId?: string
  channel: string
  balanceBefore: number
  balanceAfter: number
}

const WALLET_SUMMARY = {
  accountId: 'WAL-90321',
  status: 'ACTIVE',
  availableBalance: 0,
  holdAmount: 350000,
  lastTopUp: '15 Th01 2026'
}

const UPCOMING_PAYMENT = {
  orderId: '#WO-9182',
  label: 'Giỏ hàng nội thất cho phòng khách',
  amount: 2150000
}

const TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX-32015',
    type: 'credit',
    description: 'Nạp ví qua Momo',
    amount: 1500000,
    status: 'completed',
    timestamp: '18 Th01 2026 · 08:45',
    channel: 'MoMo',
    balanceBefore: 0,
    balanceAfter: 1500000
  },
  {
    id: 'TX-32034',
    type: 'debit',
    description: 'Thanh toán đơn #WO-8044',
    amount: 1500000,
    status: 'completed',
    timestamp: '18 Th01 2026 · 09:12',
    orderId: '#WO-8044',
    channel: 'Ví WoodPay',
    balanceBefore: 1500000,
    balanceAfter: 0
  },
  {
    id: 'TX-32072',
    type: 'debit',
    description: 'Thanh toán đơn #WO-9101',
    amount: 2450000,
    status: 'failed',
    timestamp: '17 Th01 2026 · 20:05',
    orderId: '#WO-9101',
    channel: 'Ví WoodPay',
    balanceBefore: 1800000,
    balanceAfter: 0
  },
  {
    id: 'TX-32088',
    type: 'credit',
    description: 'Hoàn tiền đơn #WO-7991',
    amount: 420000,
    status: 'pending',
    timestamp: '15 Th01 2026 · 14:20',
    orderId: '#WO-7991',
    channel: 'Refund',
    balanceBefore: 420000,
    balanceAfter: 420000
  }
]

const FILTERS: Array<{ id: 'all' | TransactionType; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'credit', label: 'Giao dịch cộng' },
  { id: 'debit', label: 'Giao dịch trừ' }
]

const ACTIONS = [
  { id: 'topup', label: 'Nạp thêm tiền', helper: 'Chuyển khoản nhanh', appearance: 'primary' as const },
  { id: 'pay', label: 'Thanh toán bằng ví', helper: 'Sử dụng tại checkout', appearance: 'secondary' as const },
  { id: 'history', label: 'Xem giao dịch', helper: 'Tải file CSV', appearance: 'ghost' as const }
]

export default function DigitalWallet() {
  const [activeFilter, setActiveFilter] = React.useState<'all' | TransactionType>('all')
  const [selectedTransaction, setSelectedTransaction] = React.useState<WalletTransaction | null>(null)

  const filteredTransactions = React.useMemo(() => {
    if (activeFilter === 'all') return TRANSACTIONS
    return TRANSACTIONS.filter((tx) => tx.type === activeFilter)
  }, [activeFilter])

  const hasEmptyBalance = WALLET_SUMMARY.availableBalance === 0
  const shortage = Math.max(0, UPCOMING_PAYMENT.amount - WALLET_SUMMARY.availableBalance)
  const hasInsufficientBalance = shortage > 0
  const failedTransactions = TRANSACTIONS.filter((tx) => tx.status === 'failed')

  return (
    <div className='account-panel wallet-board'>
      <section className='wallet-hero'>
        <div className='wallet-balance-card'>
          <div className='wallet-status-pill'>
            <span className='wallet-status-dot' aria-hidden />
            Ví {WALLET_SUMMARY.status}
          </div>
          <p className='wallet-label'>Số dư khả dụng</p>
          <h1>{currency(WALLET_SUMMARY.availableBalance)}</h1>
          <div className='wallet-meta'>
            <div className='wallet-meta__item'>
              <small>ID ví</small>
              <strong>{WALLET_SUMMARY.accountId}</strong>
            </div>
            <div className='wallet-meta__item'>
              <small>Số tiền đang giữ</small>
              <strong>{currency(WALLET_SUMMARY.holdAmount)}</strong>
            </div>
            <div className='wallet-meta__item'>
              <small>Nạp gần nhất</small>
              <strong>{WALLET_SUMMARY.lastTopUp}</strong>
            </div>
          </div>
        </div>

        <div className='wallet-actions'>
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              className={`wallet-action-btn wallet-action-btn--${action.appearance}`}
              type='button'
            >
              <span>{action.label}</span>
              <small>{action.helper}</small>
            </button>
          ))}
        </div>
      </section>

      {(hasEmptyBalance || hasInsufficientBalance || failedTransactions.length > 0) && (
        <div className='wallet-alert-grid'>
          {hasEmptyBalance && (
            <article className='wallet-alert wallet-alert--empty'>
              <div>
                <h4>Ví hiện đang trống</h4>
                <p>Chưa có số dư để chi tiêu. Hãy nạp thêm để mở khóa thanh toán nhanh.</p>
              </div>
              <button type='button'>Nạp ngay</button>
            </article>
          )}

          {hasInsufficientBalance && (
            <article className='wallet-alert wallet-alert--warning'>
              <div>
                <h4>Chưa đủ để thanh toán đơn chờ</h4>
                <p>
                  {UPCOMING_PAYMENT.label} ({UPCOMING_PAYMENT.orderId}) cần {currency(UPCOMING_PAYMENT.amount)}. Bạn thiếu{' '}
                  <strong>{currency(shortage)}</strong>.
                </p>
              </div>
              <button type='button'>Thiết lập Auto Top-up</button>
            </article>
          )}

          {failedTransactions.length > 0 && (
            <article className='wallet-alert wallet-alert--danger'>
              <div>
                <h4>Có giao dịch thất bại</h4>
                <p>
                  Giao dịch {failedTransactions[0].id} không thành công. Kiểm tra lại nguồn tiền hoặc thử phương thức khác.
                </p>
              </div>
              <button type='button' onClick={() => setSelectedTransaction(failedTransactions[0])}>Chi tiết</button>
            </article>
          )}
        </div>
      )}

      <section className='wallet-history'>
        <div className='wallet-history__header'>
          <div>
            <p className='eyebrow'>Lịch sử ví</p>
            <h3>Giao dịch gần đây</h3>
          </div>
          <div className='wallet-filters'>
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                className={`wallet-filter-btn${activeFilter === filter.id ? ' is-active' : ''}`}
                type='button'
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className='wallet-empty-list'>
            <p>Chưa có giao dịch cho bộ lọc này.</p>
          </div>
        ) : (
          <div className='wallet-transaction-list'>
            {filteredTransactions.map((tx) => (
              <button
                key={tx.id}
                className='wallet-transaction'
                type='button'
                onClick={() => setSelectedTransaction(tx)}
              >
                <div className={`wallet-transaction__icon wallet-transaction__icon--${tx.type}`} aria-hidden>
                  {tx.type === 'credit' ? '+' : '−'}
                </div>
                <div className='wallet-transaction__details'>
                  <div>
                    <h4>{tx.description}</h4>
                    <p>{tx.timestamp}</p>
                  </div>
                  {tx.orderId && <span>{tx.orderId}</span>}
                </div>
                <div className='wallet-transaction__meta'>
                  <span className={`wallet-amount wallet-amount--${tx.type}`}>
                    {tx.type === 'credit' ? '+' : '−'}
                    {currency(tx.amount)}
                  </span>
                  <span className={`wallet-status-badge wallet-status-badge--${tx.status}`}>
                    {tx.status === 'completed' && 'Hoàn tất'}
                    {tx.status === 'pending' && 'Đang xử lý'}
                    {tx.status === 'failed' && 'Thất bại'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedTransaction && (
        <div className='wallet-modal-overlay' onClick={() => setSelectedTransaction(null)}>
          <div className='wallet-modal' role='dialog' aria-modal='true' onClick={(e) => e.stopPropagation()}>
            <header className='wallet-modal__header'>
              <div>
                <p className='eyebrow'>Chi tiết giao dịch</p>
                <h3>{selectedTransaction.description}</h3>
              </div>
              <button type='button' onClick={() => setSelectedTransaction(null)} aria-label='Đóng'>
                ×
              </button>
            </header>
            <div className='wallet-detail-grid'>
              <div>
                <small>ID giao dịch</small>
                <strong>{selectedTransaction.id}</strong>
              </div>
              <div>
                <small>Loại</small>
                <strong>{selectedTransaction.type === 'credit' ? 'Giao dịch cộng' : 'Giao dịch trừ'}</strong>
              </div>
              <div>
                <small>Số tiền</small>
                <strong>
                  {selectedTransaction.type === 'credit' ? '+' : '−'}
                  {currency(selectedTransaction.amount)}
                </strong>
              </div>
              <div>
                <small>Trạng thái</small>
                <strong className={`wallet-status-badge wallet-status-badge--${selectedTransaction.status}`}>
                  {selectedTransaction.status === 'completed' && 'Hoàn tất'}
                  {selectedTransaction.status === 'pending' && 'Đang xử lý'}
                  {selectedTransaction.status === 'failed' && 'Thất bại'}
                </strong>
              </div>
              <div>
                <small>Số dư trước</small>
                <strong>{currency(selectedTransaction.balanceBefore)}</strong>
              </div>
              <div>
                <small>Số dư sau</small>
                <strong>{currency(selectedTransaction.balanceAfter)}</strong>
              </div>
              <div>
                <small>Đơn liên quan</small>
                <strong>{selectedTransaction.orderId ?? 'Không có'}</strong>
              </div>
              <div>
                <small>Kênh thực hiện</small>
                <strong>{selectedTransaction.channel}</strong>
              </div>
              <div>
                <small>Thời gian</small>
                <strong>{selectedTransaction.timestamp}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
