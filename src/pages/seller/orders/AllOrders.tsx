import React from 'react'

type OrderStatusSummary = {
  label: string
  count: number
  accent?: 'primary'
}

type OrderRow = {
  id: string
  product: string
  buyer: string
  total: string
  status: {
    label: string
    tone: 'solid' | 'outline'
  }
  countdown?: string
  carrier?: string
  priority?: 'primary'
}

const STATUS_SUMMARY: OrderStatusSummary[] = [
  { label: 'Tất cả', count: 125, accent: 'primary' },
  { label: 'Chờ xác nhận', count: 8 },
  { label: 'Chờ lấy hàng', count: 15 },
  { label: 'Đang giao', count: 32 },
  { label: 'Đã giao', count: 68 },
  { label: 'Trả hàng / Hoàn tiền / Hủy', count: 2 }
]

const QUICK_STATUS_FILTERS = [
  { label: 'Đang giao', summaryKey: 'Đang giao' },
  { label: 'Đã giao', summaryKey: 'Đã giao' },
  { label: 'Hoàn tiền / Trả hàng', summaryKey: 'Trả hàng / Hoàn tiền / Hủy' }
]

const ORDER_ROWS: OrderRow[] = [
  {
    id: 'WD2401290001',
    product: 'Bàn ăn gỗ sồi cao cấp 1.6m',
    buyer: 'Nguyễn Văn A',
    total: '12.450.000 ₫',
    status: { label: 'Chờ lấy hàng', tone: 'outline' },
    countdown: '23:45:12',
    carrier: 'GHN',
    priority: 'primary'
  },
  {
    id: 'WD2401290002',
    product: 'Bàn trà gỗ óc chó - Size M',
    buyer: 'Trần Thị B',
    total: '5.680.000 ₫',
    status: { label: 'Chờ lấy hàng', tone: 'outline' },
    countdown: '20:15:30',
    carrier: 'SPX',
    priority: 'primary'
  },
  {
    id: 'WD2401290003',
    product: 'Kệ sách gỗ thông 5 tầng',
    buyer: 'Lê Văn C',
    total: '3.450.000 ₫',
    status: { label: 'Đang giao', tone: 'solid' },
    carrier: 'GHTK'
  },
  {
    id: 'WD2401280004',
    product: 'Ghế ngoài trời gỗ teak',
    buyer: 'Phạm Thị D',
    total: '6.780.000 ₫',
    status: { label: 'Đã giao', tone: 'solid' },
    carrier: 'Viettel Post'
  },
  {
    id: 'WD2401280005',
    product: 'Bàn làm việc gỗ gụ Executive',
    buyer: 'Hoàng Văn E',
    total: '18.900.000 ₫',
    status: { label: 'Chờ xác nhận', tone: 'outline' },
    countdown: '47:30:00'
  }
]

const TABLE_GRID_CLASS =
  'grid grid-cols-[48px_minmax(280px,2fr)_minmax(160px,1fr)_minmax(150px,1fr)_minmax(130px,0.9fr)_minmax(150px,1fr)_minmax(130px,0.9fr)_minmax(180px,1.1fr)]'

export default function AllOrders() {
  return (
    <div className="min-h-screen bg-stone-100 px-6 py-6 font-['Arimo'] text-stone-900">
      <div className='flex w-full justify-center'>
        <div className='flex w-full flex-col gap-4 rounded-2xl bg-transparent'>
          <header className='flex w-full flex-col gap-[3.25px] text-[9.75px]'>
            <div className='text-xl font-bold leading-7 text-stone-900'>Tất cả đơn hàng</div>
            <p className='text-stone-600 leading-3'>Theo dõi và xử lý toàn bộ vòng đời đơn hàng</p>
          </header>

          <section className='w-full rounded-xl border border-yellow-800/20 bg-white px-5 py-3'>
            <div className='rounded-xl bg-orange-100 px-3 py-2'>
              <div className='grid grid-cols-2 gap-2 text-[9.75px] sm:grid-cols-3 lg:grid-cols-6'>
                {STATUS_SUMMARY.map(status => (
                  <StatusCard key={status.label} status={status} />
                ))}
              </div>
            </div>
          </section>

          <section className='w-full rounded-xl border border-yellow-800/20 bg-white px-5 py-3'>
            <div className='flex w-full flex-col gap-3 text-[9.75px]'>
              <div className='flex flex-wrap gap-3'>
                <FilterSelect label='Trạng thái' value='Tất cả' />
                <SearchField placeholder='Tìm theo mã đơn hàng...' />
                <FilterSelect label='Thời gian' value='Tất cả' align='end' />
              </div>
              <QuickStatusRow />
              <div className='flex items-center gap-1.5 text-xs'>
                <button className='relative flex-1 rounded bg-yellow-800 py-1.5 text-center text-white shadow'>Áp dụng</button>
                <button className='w-14 rounded border border-yellow-800/20 bg-stone-100 py-1.5 text-center text-stone-900'>Đặt lại</button>
              </div>
            </div>
          </section>

          <section className='w-full rounded-xl border border-yellow-800/20 bg-white'>
            <div className='w-full overflow-auto px-3 pb-3'>
              <div className='min-w-[960px]'>
                <TableHeader />
                <div className='divide-y divide-yellow-800/20'>
                  {ORDER_ROWS.map(order => (
                    <TableRow key={order.id} order={order} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ status }: { status: OrderStatusSummary }) {
  const isPrimary = status.accent === 'primary'
  const base = 'flex flex-col items-center justify-center rounded-xl border border-transparent px-3 py-1 text-center'
  return (
    <div className={`${base} ${isPrimary ? 'bg-yellow-800 text-white shadow' : 'bg-white text-stone-900'}`}>
      <p className='text-[9.75px] leading-3'>{status.label}</p>
      <p className={`text-[9.75px] font-bold leading-3 ${isPrimary ? 'text-white' : 'text-stone-900'}`}>({status.count})</p>
    </div>
  )
}

function FilterSelect({ label, value, align }: { label: string; value: string; align?: 'end' }) {
  const alignment = align === 'end' ? 'ml-auto' : ''
  return (
    <label className={`flex min-w-[200px] flex-1 flex-col gap-1 text-[9.75px] ${alignment}`}>
      <span className='sr-only'>{label}</span>
      <div className='inline-flex items-center justify-between rounded border border-yellow-800/20 bg-white px-2.5 py-1.5'>
        <span>{value}</span>
        <span className='text-stone-600'>⌄</span>
      </div>
    </label>
  )
}

function QuickStatusRow() {
  return (
    <div className='flex flex-wrap gap-2 pt-1'>
      {QUICK_STATUS_FILTERS.map(filter => (
        <QuickStatusChip key={filter.label} label={filter.label} count={getStatusCount(filter.summaryKey)} />
      ))}
    </div>
  )
}

function getStatusCount(summaryKey: string) {
  return STATUS_SUMMARY.find(status => status.label === summaryKey)?.count ?? 0
}

function QuickStatusChip({ label, count }: { label: string; count: number }) {
  return (
    <button
      className='inline-flex items-center gap-1 rounded-full border border-yellow-800/20 bg-white px-3 py-1 text-[10px] text-stone-900 shadow-sm transition hover:border-yellow-800/40'
      type='button'
    >
      <span>{label}</span>
      <span className='text-[10px] font-semibold'>({count})</span>
    </button>
  )
}

function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className='flex-1 min-w-[280px]'>
      <div className='relative inline-flex w-full items-center rounded border border-yellow-800/20 bg-white pl-6 pr-3 text-[12px] text-stone-600'>
        <span className='absolute left-2.5 text-xs text-stone-500'>🔍</span>
        <span className='py-1.5 text-[12px]'>{placeholder}</span>
      </div>
    </div>
  )
}

function TableHeader() {
  const columnClasses = 'text-[10px] font-medium uppercase tracking-wide text-stone-600'
  return (
    <div className={`${TABLE_GRID_CLASS} border-b border-yellow-800/20 py-2`}>
      <div />
      <div className={columnClasses}>Sản phẩm</div>
      <div className={columnClasses}>Mã đơn hàng</div>
      <div className={columnClasses}>Người mua</div>
      <div className={`${columnClasses} text-right`}>Tổng tiền</div>
      <div className={columnClasses}>Trạng thái</div>
      <div className={columnClasses}>Đếm ngược</div>
      <div className={`${columnClasses} text-right`}>Thao tác</div>
    </div>
  )
}

function TableRow({ order }: { order: OrderRow }) {
  return (
    <div className={`${TABLE_GRID_CLASS} items-center gap-2 py-3 text-[10px]`}>
      <div className='px-2'>
        <input type='checkbox' className='h-3.5 w-3.5 rounded border-yellow-800/20 text-yellow-800 focus:ring-yellow-800/40' />
      </div>
      <div className='inline-flex items-center gap-3'>
        <div className='h-11 w-11 rounded-xl bg-stone-200' />
        <p className='leading-4 text-sm text-stone-900'>{order.product}</p>
      </div>
      <div className='font-[Cousine] text-[10px] text-stone-900'>{order.id}</div>
      <div className='text-stone-900'>{order.buyer}</div>
      <div className='text-right font-semibold text-stone-900'>{order.total}</div>
      <div>
        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-0.5 text-[10px] ${
            order.status.tone === 'solid'
              ? 'border-yellow-800 bg-yellow-800 text-white'
              : 'border-yellow-800/30 bg-white text-stone-900'
          }`}
        >
          {order.status.label}
        </span>
      </div>
      <div className='font-[Cousine] font-semibold text-orange-600'>{order.countdown ?? '-'}</div>
      <div className='flex items-center justify-end gap-2'>
        <span className='inline-flex min-w-[70px] items-center justify-center rounded border border-yellow-800/20 px-2 py-1 text-[10px] text-stone-900'>
          {order.carrier ?? '-'}
        </span>
        <div className='inline-flex flex-shrink-0 items-center gap-2'>
          <button className='rounded border border-yellow-800/20 bg-stone-100 px-3 py-1 text-[10px] text-stone-900'>Xem</button>
          <button className='rounded bg-yellow-800 px-3 py-1 text-[10px] text-white'>Chuẩn bị</button>
        </div>
      </div>
    </div>
  )
}
