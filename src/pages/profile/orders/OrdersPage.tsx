import React from 'react'
import OrderTabs from './OrderTabs'
import OrderEmpty from './OrderEmpty'

const ORDER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'processing', label: 'Chờ xác nhận', badge: '2' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
  { id: 'refund', label: 'Trả hàng / Hoàn tiền' }
]

const EMPTY_MESSAGE: Record<string, string> = {
  all: 'Bạn chưa có đơn hàng nào. Khám phá thêm sản phẩm yêu thích ngay hôm nay!',
  processing: 'Tạm thời chưa có đơn nào cần xác nhận.',
  shipping: 'Không có đơn đang giao.',
  completed: 'Chưa có đơn hoàn thành.',
  cancelled: 'Bạn chưa hủy đơn nào.',
  refund: 'Không có yêu cầu trả hàng.'
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = React.useState('processing')
  const [query, setQuery] = React.useState('')

  const hasOrders = false

  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Đơn mua</p>
          <h3>Theo dõi trạng thái và lịch sử đơn hàng</h3>
        </div>
        <button className='cart-link'>Hỗ trợ đơn hàng</button>
      </header>

      <OrderTabs tabs={ORDER_TABS} active={activeTab} onChange={setActiveTab} />

      <div className='order-search'>
        <input
          type='text'
          placeholder='Tìm theo mã đơn, sản phẩm hoặc shop'
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button>Tra cứu</button>
      </div>

      {hasOrders ? (
        <div className='order-list'>
          {/* placeholder for future orders */}
        </div>
      ) : (
        <OrderEmpty
          title='Chưa có đơn trong mục này'
          description={EMPTY_MESSAGE[activeTab]}
        />
      )}
    </div>
  )
}
