import React from 'react'
import FinanceTopBar from './components/FinanceTopBar'

const REVENUE_ALERT = {
  title: 'Mẹo tăng doanh thu',
  message: 'Kích hoạt quảng cáo cho sản phẩm bán chạy nhất của bạn để tiếp cận thêm 50% khách hàng tiềm năng!'
}

const OVERVIEW = {
  unpaid: {
    label: 'Chưa thanh toán',
    total: '45.680.000 ₫',
    orders: '12 đơn hàng đang xử lý'
  },
  paid: {
    weekly: '23.450.000 ₫',
    monthly: '89.230.000 ₫',
    total: '456.780.000 ₫'
  }
}

const REPORTS = [
  {
    label: 'Tuần 4 - Tháng 01/2026',
    range: '20/01/2026 - 26/01/2026',
    amount: '23.450.000 ₫'
  },
  {
    label: 'Tuần 3 - Tháng 01/2026',
    range: '13/01/2026 - 19/01/2026',
    amount: '31.280.000 ₫'
  },
  {
    label: 'Tuần 2 - Tháng 01/2026',
    range: '06/01/2026 - 12/01/2026',
    amount: '28.900.000 ₫'
  }
]

const TRANSACTION_TABS = [
  { label: 'Chưa thanh toán', count: 3 },
  { label: 'Đã thanh toán', count: 3 }
]

const TRANSACTIONS = [
  {
    order: '#WD2401250123',
    date: '25/1/2026',
    status: 'Đang chờ',
    method: 'COD',
    amount: '4.560.000 ₫',
    type: 'pending'
  },
  {
    order: '#WD2401240089',
    date: '24/1/2026',
    status: 'Đang chờ',
    method: 'Transfer',
    amount: '8.920.000 ₫',
    type: 'pending'
  },
  {
    order: '#WD2401230045',
    date: '23/1/2026',
    status: 'Đang xử lý',
    method: 'E-Wallet',
    amount: '2.340.000 ₫',
    type: 'processing'
  }
]

export default function Revenue() {
  return (
    <div className='space-y-6'>
      <FinanceTopBar />

      <section className='space-y-2'>
        <h1 className='text-xl font-bold text-stone-900'>Doanh thu</h1>
        <p className='text-xs text-stone-500'>Theo dõi doanh thu và các khoản thanh toán của shop</p>
      </section>

      <section className='rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900'>
        <p className='font-semibold'>💡 {REVENUE_ALERT.title}:</p>
        <p>{REVENUE_ALERT.message}</p>
      </section>

      <section className='space-y-5 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
        <div className='rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-900'>
          Số liệu chưa bao gồm các điều chỉnh phí, hoàn tiền và các khoản khấu trừ khác. Vui lòng xem chi tiết trong từng giao dịch.
        </div>
        <div className='grid gap-5 md:grid-cols-2'>
          <article className='rounded-2xl border border-orange-200 bg-orange-50/60 p-5'>
            <p className='text-sm font-semibold text-orange-900'>{OVERVIEW.unpaid.label}</p>
            <p className='mt-3 text-2xl font-bold text-orange-600'>{OVERVIEW.unpaid.total}</p>
            <p className='mt-1 text-xs text-stone-500'>{OVERVIEW.unpaid.orders}</p>
          </article>
          <article className='space-y-3 rounded-2xl border border-green-200 bg-green-50/60 p-5 text-sm text-stone-600'>
            <div>
              <p>Doanh thu tuần này</p>
              <p className='text-lg font-semibold text-green-700'>{OVERVIEW.paid.weekly}</p>
            </div>
            <div>
              <p>Doanh thu tháng này</p>
              <p className='text-lg font-semibold text-green-700'>{OVERVIEW.paid.monthly}</p>
            </div>
            <div className='border-t border-green-200 pt-3'>
              <p>Tổng doanh thu đã thanh toán</p>
              <p className='text-xl font-bold text-green-600'>{OVERVIEW.paid.total}</p>
            </div>
          </article>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
        <div>
          <h3 className='text-base font-semibold text-stone-900'>Báo cáo doanh thu</h3>
          <p className='text-xs text-stone-500'>Tải xuống báo cáo chi tiết theo tuần/tháng</p>
        </div>
        <div className='space-y-3'>
          {REPORTS.map(report => (
            <article key={report.label} className='flex flex-wrap items-center gap-4 rounded-2xl border border-amber-900/20 p-4'>
              <div>
                <p className='text-sm font-semibold text-stone-900'>{report.label}</p>
                <p className='text-xs text-stone-500'>{report.range}</p>
              </div>
              <div className='ml-auto flex items-center gap-3'>
                <span className='text-sm font-bold text-stone-900'>{report.amount}</span>
                <span className='rounded-full bg-amber-900 px-3 py-1 text-[11px] font-semibold text-white'>Có sẵn</span>
                <button
                  type='button'
                  className='rounded-xl border border-amber-900/20 bg-stone-100 px-4 py-1.5 text-xs font-medium text-stone-900'
                >
                  Tải xuống
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
        <div>
          <h3 className='text-base font-semibold text-stone-900'>Chi tiết giao dịch</h3>
          <p className='text-xs text-stone-500'>Danh sách các giao dịch thanh toán</p>
        </div>
        <div className='flex flex-wrap items-center gap-3 rounded-2xl bg-orange-50 p-2 text-xs font-semibold text-stone-700'>
          {TRANSACTION_TABS.map(tab => (
            <button
              key={tab.label}
              type='button'
              className={`rounded-2xl px-3 py-1 ${tab.label === 'Chưa thanh toán' ? 'bg-white text-stone-900' : ''}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className='flex flex-col gap-3 md:flex-row'>
          <div className='flex flex-1 items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-500'>
            <span className='text-stone-400'>⌕</span>
            <input
              type='search'
              placeholder='Tìm kiếm theo mã đơn hàng...'
              className='flex-1 border-none bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none'
            />
          </div>
          <button type='button' className='rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white'>Áp dụng</button>
          <button type='button' className='rounded-2xl border border-amber-900/20 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-900'>Đặt lại</button>
          <button type='button' className='rounded-2xl border border-amber-900/20 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-900'>Xuất file</button>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-xs text-stone-600'>
            <thead>
              <tr className='border-b border-amber-900/20 text-stone-900'>
                <th className='pb-3 pr-4 font-semibold'>Mã đơn hàng</th>
                <th className='pb-3 pr-4 font-semibold'>Ngày thanh toán</th>
                <th className='pb-3 pr-4 font-semibold'>Trạng thái</th>
                <th className='pb-3 pr-4 font-semibold'>Phương thức</th>
                <th className='pb-3 text-right font-semibold'>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(tx => (
                <tr key={tx.order} className='border-b border-amber-900/10 last:border-0'>
                  <td className='py-3 pr-4 font-semibold text-stone-900'>{tx.order}</td>
                  <td className='py-3 pr-4'>{tx.date}</td>
                  <td className='py-3 pr-4'>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${tx.type === 'pending' ? 'bg-orange-100 text-orange-900' : 'bg-amber-50 text-stone-900'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className='py-3 pr-4'>{tx.method}</td>
                  <td className='py-3 text-right font-bold text-orange-600'>{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
