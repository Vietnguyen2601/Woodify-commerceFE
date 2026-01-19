import React from 'react'

const BANKS = [
  { id: 'b1', name: 'Vietcombank', masked: '**** 8123', primary: true },
  { id: 'b2', name: 'Techcombank', masked: '**** 4411', primary: false }
]

export default function BankAccount() {
  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Tài khoản ngân hàng</p>
          <h3>Quản lý phương thức thanh toán</h3>
        </div>
        <button className='cart-cta ghost'>+ Liên kết ngân hàng</button>
      </header>

      <div className='bank-list'>
        {BANKS.map(bank => (
          <article key={bank.id}>
            <div>
              <h4>{bank.name}</h4>
              <p>{bank.masked}</p>
            </div>
            <div className='bank-list__actions'>
              {bank.primary && <span className='badge'>Mặc định</span>}
              <button className='cart-link'>Cập nhật</button>
              <button className='cart-link muted'>Xóa</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
