import React from 'react'
import FinanceTopBar from './components/FinanceTopBar'

const BANK_ACCOUNTS = [
  {
    bank: 'Ngân hàng Vietcombank',
    code: 'VCB',
    number: '****7890',
    owner: 'NGUYEN VAN A',
    branch: 'Chi nhánh Hà Nội',
    status: 'Mặc định',
    active: true
  },
  {
    bank: 'Ngân hàng Techcombank',
    code: 'TCB',
    number: '****3210',
    owner: 'NGUYEN VAN A',
    branch: 'Chi nhánh TP.HCM',
    status: 'Đang hoạt động',
    active: true
  },
  {
    bank: 'Ngân hàng BIDV',
    code: 'BIDV',
    number: '****6677',
    owner: 'NGUYEN VAN A',
    branch: 'Chi nhánh Đà Nẵng',
    status: 'Không hoạt động',
    active: false
  }
]

export default function BankAccount() {
  return (
    <div className='space-y-6'>
      <FinanceTopBar statusLabel='VERIFIED' />

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-bold text-stone-900'>Tài khoản ngân hàng</h1>
          <p className='text-xs text-stone-600'>Quản lý tài khoản ngân hàng để nhận thanh toán</p>
        </div>
        <button type='button' className='rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white'>Thêm tài khoản</button>
      </div>

      <section className='rounded-3xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900'>
        <p className='font-semibold'>Lưu ý về tài khoản ngân hàng</p>
        <ul className='mt-2 list-disc pl-4 text-[11px] text-blue-800'>
          <li>Tài khoản ngân hàng phải đứng tên chủ shop hoặc người được ủy quyền.</li>
          <li>Chỉ có thể đặt 1 tài khoản làm mặc định để nhận thanh toán.</li>
          <li>Thông tin tài khoản sẽ được bảo mật và chỉ dùng cho mục đích thanh toán.</li>
        </ul>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        {BANK_ACCOUNTS.map(account => (
          <article
            key={account.number}
            className={`space-y-4 rounded-3xl border ${account.active ? 'border-amber-900/20' : 'border-yellow-800/20'} bg-white p-5 shadow-sm`}
          >
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-900/10 text-amber-900'>🏦</span>
                <div>
                  <p className='text-sm font-semibold text-stone-900'>{account.bank}</p>
                  <p className='text-xs text-stone-500'>{account.code}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  account.status === 'Mặc định' ? 'bg-amber-900 text-white' : account.active ? 'bg-amber-900/10 text-amber-900' : 'bg-orange-100 text-stone-900'
                }`}
              >
                {account.status}
              </span>
            </div>

            <div className='space-y-3 rounded-2xl border-t border-amber-900/10 pt-3 text-xs text-stone-600'>
              <div>
                <p className='text-[11px] uppercase tracking-wide text-stone-400'>Số tài khoản</p>
                <p className='font-mono text-sm font-bold text-stone-900'>{account.number}</p>
              </div>
              <div className='grid gap-2 sm:grid-cols-2'>
                <div>
                  <p className='text-[11px] uppercase tracking-wide text-stone-400'>Chủ tài khoản</p>
                  <p className='font-semibold text-stone-900'>{account.owner}</p>
                </div>
                <div>
                  <p className='text-[11px] uppercase tracking-wide text-stone-400'>Chi nhánh</p>
                  <p className='font-semibold text-stone-900'>{account.branch}</p>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-2 text-xs font-semibold'>
              {account.status !== 'Mặc định' && account.active && (
                <button type='button' className='flex-1 rounded-2xl border border-amber-900/20 bg-stone-100 px-3 py-2 text-stone-900'>
                  Đặt làm mặc định
                </button>
              )}
              <button type='button' className='flex-1 rounded-2xl border border-amber-900/20 px-3 py-2 text-stone-900'>Sửa</button>
              <button type='button' className='flex-1 rounded-2xl px-3 py-2 text-rose-600'>Xóa</button>
            </div>
          </article>
        ))}

        <article className='flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-600'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-lime-700 text-white'>＋</div>
          <p className='text-stone-900'>Thêm tài khoản ngân hàng</p>
          <p className='text-xs text-stone-500'>Thêm tài khoản để nhận thanh toán</p>
          <button type='button' className='rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white'>Thêm tài khoản</button>
        </article>
      </section>
    </div>
  )
}
