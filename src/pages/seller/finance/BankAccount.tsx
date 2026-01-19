import React from 'react'

const BANKS = [
  { bank: 'Vietcombank', accountName: 'CTY TNHH WOODIFY', accountNo: '0451 2345 6789', status: 'Mặc định' },
  { bank: 'Techcombank', accountName: 'WOODIFY STUDIO', accountNo: '1903 4567 888', status: 'Dự phòng' }
]

export default function BankAccount() {
  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Tài khoản ngân hàng</p>
          <h2>Liên kết thanh toán</h2>
        </div>
        <button type='button' className='seller-page__primary'>Thêm tài khoản</button>
      </header>

      <div className='seller-list'>
        {BANKS.map(item => (
          <article key={item.accountNo} className='seller-list__item'>
            <div>
              <h3>{item.bank}</h3>
              <p>{item.accountName}</p>
            </div>
            <div>
              <strong>{item.accountNo}</strong>
              <span>{item.status}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
