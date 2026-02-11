import React from 'react'
import FinanceTopBar from './components/FinanceTopBar'

const WALLET_BALANCE = {
  available: '125.680.000 ₫',
  locked: 'Đã khóa xử lý tranh chấp: 8.500.000 ₫'
}

const LINKED_ACCOUNT = {
  bank: 'Ngân hàng Vietcombank',
  digits: '****6789',
  owner: 'NGUYEN VAN A'
}

const TRANSACTIONS = [
  {
    time: '2026-01-25 14:30',
    type: 'Doanh thu đơn hàng',
    description: 'Doanh thu đơn hàng #WD2401250123',
    amount: '+4.560.000 ₫',
    balance: '125.680.000 ₫',
    tone: 'positive'
  },
  {
    time: '2026-01-24 10:15',
    type: 'Rút tiền',
    description: 'Rút tiền về VCB ***6789',
    amount: '-50.000.000 ₫',
    balance: '121.120.000 ₫',
    tone: 'negative'
  },
  {
    time: '2026-01-23 16:45',
    type: 'Doanh thu đơn hàng',
    description: 'Doanh thu đơn hàng #WD2401230045',
    amount: '+2.340.000 ₫',
    balance: '171.120.000 ₫',
    tone: 'positive'
  },
  {
    time: '2026-01-22 09:20',
    type: 'Phí hệ thống',
    description: 'Phí hệ thống tháng 01/2026',
    amount: '-1.200.000 ₫',
    balance: '168.780.000 ₫',
    tone: 'negative'
  },
  {
    time: '2026-01-21 11:30',
    type: 'Hoàn tiền',
    description: 'Hoàn tiền đơn hàng #WD2401180032',
    amount: '-3.450.000 ₫',
    balance: '169.980.000 ₫',
    tone: 'negative'
  },
  {
    time: '2026-01-20 15:10',
    type: 'Điều chỉnh',
    description: 'Điều chỉnh phí vận chuyển',
    amount: '+120.000 ₫',
    balance: '173.430.000 ₫',
    tone: 'positive'
  }
]

const FILTERS = [
  { label: 'Khoảng thời gian', value: 'Tất cả' },
  { label: 'Loại giao dịch', value: 'Tất cả' },
  { label: 'Trạng thái', value: 'Tất cả' },
  { label: 'Kênh thanh toán', value: 'Tất cả' }
]

export default function Wallet() {
  return (
    <div className='space-y-6'>
      <FinanceTopBar statusLabel='VERIFIED' />

      <section className='space-y-2'>
        <h1 className='text-xl font-bold text-stone-900'>Số dư TK Woodify</h1>
        <p className='text-xs text-stone-600'>Quản lý số dư ví và lịch sử giao dịch trong hệ thống Woodify</p>
      </section>

      <section className='grid gap-4 lg:grid-cols-[2fr,1fr]'>
        <div className='space-y-5 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
          <div className='flex flex-col gap-4 rounded-2xl border border-amber-900/20 bg-amber-50/60 p-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-xs font-medium text-stone-500'>Số dư khả dụng</p>
              <p className='mt-1 text-3xl font-bold text-amber-900'>{WALLET_BALANCE.available}</p>
              <p className='text-xs text-stone-500'>{WALLET_BALANCE.locked}</p>
            </div>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-amber-900/10 text-amber-900'>
              ₿
            </div>
          </div>

          <div className='space-y-3 rounded-2xl bg-lime-900/10 p-4 text-xs text-stone-700'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='font-semibold text-stone-900'>Rút tiền tự động</p>
                <p className='text-[11px] text-stone-500'>Tự động chuyển tiền khi đủ ngưỡng</p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[11px] font-semibold text-amber-900'>Bật</span>
                <span className='relative inline-flex h-6 w-11 items-center rounded-full bg-amber-900 px-1'>
                  <span className='inline-block h-4 w-4 rounded-full bg-white shadow'></span>
                </span>
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <button type='button' className='rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white'>Yêu cầu thanh toán</button>
              <button
                type='button'
                className='rounded-2xl border border-amber-900/20 bg-white px-4 py-2 text-xs font-semibold text-amber-900'
              >
                Cài đặt rút tiền
              </button>
            </div>
          </div>
        </div>

        <div className='space-y-5 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
          <div>
            <p className='text-xs font-semibold text-stone-900'>Tài khoản nhận tiền</p>
            <p className='text-[11px] text-stone-500'>Thông tin ngân hàng liên kết</p>
          </div>
          <div className='rounded-2xl border border-lime-900/20 bg-lime-900/10 p-4 text-sm text-stone-600'>
            <div className='flex items-center gap-3 text-stone-900'>
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-900/10 text-amber-900'>🏦</span>
              <div>
                <p className='text-sm font-semibold'>{LINKED_ACCOUNT.bank}</p>
                <p className='text-xs text-stone-500'>{LINKED_ACCOUNT.digits}</p>
              </div>
            </div>
            <p className='mt-3 text-xs text-stone-500'>{LINKED_ACCOUNT.owner}</p>
            <span className='mt-3 inline-flex rounded-full bg-amber-900 px-3 py-1 text-[11px] font-semibold text-white'>Đang sử dụng</span>
          </div>
          <div className='space-y-2 text-xs font-semibold'>
            <button type='button' className='w-full rounded-2xl border border-amber-900/20 bg-stone-100 px-4 py-2 text-stone-900'>
              Thay đổi tài khoản
            </button>
            <button type='button' className='w-full rounded-2xl px-4 py-2 text-rose-600'>Hủy liên kết</button>
          </div>
        </div>
      </section>

      <section className='rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900'>
        💡 Số dư tài khoản Woodify sẽ được tự động rút về tài khoản ngân hàng đã liên kết mỗi tuần. Bạn cũng có thể yêu cầu thanh toán ngay bất cứ lúc nào.
      </section>

      <section className='space-y-5 rounded-3xl border border-amber-900/20 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h3 className='text-sm font-semibold text-stone-900'>Giao dịch gần đây</h3>
            <p className='text-[11px] text-stone-500'>Lịch sử các giao dịch tài khoản Woodify</p>
          </div>
          <button type='button' className='rounded-2xl border border-amber-900/20 bg-stone-100 px-4 py-1.5 text-xs font-semibold text-stone-900'>
            Xuất file
          </button>
        </div>

        <div className='space-y-3 rounded-2xl bg-lime-900/10 p-4'>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
            {FILTERS.map(filter => (
              <div key={filter.label} className='rounded-xl border border-amber-900/20 bg-white px-3 py-2'>
                <p className='text-[11px] text-stone-400'>{filter.label}</p>
                <p className='text-xs font-semibold text-stone-900'>{filter.value}</p>
              </div>
            ))}
          </div>
          <div className='flex flex-col gap-3 md:flex-row'>
            <div className='flex flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500'>
              <span className='text-stone-400'>⌕</span>
              <input
                type='search'
                placeholder='Tìm kiếm mô tả giao dịch...'
                className='flex-1 border-none bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none'
              />
            </div>
            <div className='flex items-center gap-2'>
              <button type='button' className='rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white'>Áp dụng bộ lọc</button>
              <button type='button' className='rounded-2xl border border-amber-900/20 bg-white px-4 py-2 text-xs font-semibold text-stone-900'>Thiết lập lại</button>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-xs text-stone-600'>
            <thead>
              <tr className='border-b border-amber-900/20 text-[11px] uppercase tracking-wide text-stone-500'>
                <th className='pb-3 pr-4 font-semibold'>Thời gian</th>
                <th className='pb-3 pr-4 font-semibold'>Loại giao dịch</th>
                <th className='pb-3 pr-4 font-semibold'>Mô tả</th>
                <th className='pb-3 pr-4 text-right font-semibold'>Số tiền</th>
                <th className='pb-3 text-right font-semibold'>Số dư sau GD</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(tx => (
                <tr key={`${tx.time}-${tx.description}`} className='border-b border-amber-900/10'>
                  <td className='py-3 pr-4 font-semibold text-stone-900'>{tx.time}</td>
                  <td className='py-3 pr-4'>
                    <span className='inline-flex rounded-full border border-amber-900/20 px-2 py-1 text-[11px] font-semibold text-stone-700'>
                      {tx.type}
                    </span>
                  </td>
                  <td className='py-3 pr-4 text-stone-900'>{tx.description}</td>
                  <td className={`py-3 pr-4 text-right font-semibold ${tx.tone === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount}
                  </td>
                  <td className='py-3 text-right font-semibold text-stone-900'>{tx.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type='button' className='w-full rounded-2xl border border-amber-900/20 bg-stone-50 py-2 text-xs font-semibold text-stone-900'>
          Xem thêm giao dịch
        </button>
      </section>
    </div>
  )
}
