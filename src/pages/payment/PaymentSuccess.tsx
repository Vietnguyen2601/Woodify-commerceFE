import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface PaymentInfo {
  orderCode: string | null
  amount: string | null
  reference: string | null
}

const formatCurrency = (value: string | null): string => {
  if (!value) return '—'
  const num = Number(value)
  if (isNaN(num)) return value
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    orderCode: null,
    amount: null,
    reference: null,
  })

  useEffect(() => {
    const orderCode = searchParams.get('orderCode')
    const amount = searchParams.get('amount')
    const reference = searchParams.get('reference')

    const info: PaymentInfo = { orderCode, amount, reference }
    setPaymentInfo(info)

    // Persist to localStorage so user can still see it after refresh
    if (orderCode) {
      try {
        localStorage.setItem(
          `payos_success_${orderCode}`,
          JSON.stringify({ ...info, timestamp: Date.now() })
        )
      } catch {
        // ignore storage errors
      }
    }
  }, [searchParams])

  const handlePrint = () => {
    window.print()
  }

  const hasDetail = Boolean(paymentInfo.orderCode || paymentInfo.amount)

  return (
    <div className='relative min-h-screen w-full flex items-center justify-center py-12 px-4'>
      {/* Background */}
      <div
        className='fixed inset-0 pointer-events-none'
        style={{
          background: 'linear-gradient(to bottom, rgba(209, 250, 229, 0.4), #FFFBEB, #F0FDF4)',
          zIndex: -1,
        }}
      />

      <div className='w-full max-w-lg'>
        {/* Card */}
        <div
          className='bg-white rounded-3xl shadow-lg overflow-hidden'
          style={{ boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.10)' }}
        >
          {/* Green header banner */}
          <div
            className='flex flex-col items-center justify-center py-10 px-6'
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
          >
            <div className='text-6xl mb-4 select-none' aria-hidden='true'>
              ✅
            </div>
            <h1
              className='text-2xl sm:text-3xl font-bold text-white text-center'
              style={{ fontFamily: 'Arimo, sans-serif' }}
            >
              Thanh toán thành công!
            </h1>
            <p className='text-green-100 mt-2 text-sm sm:text-base text-center'>
              Cảm ơn bạn đã tin tưởng Woodify. Đơn hàng của bạn đã được ghi nhận.
            </p>
          </div>

          {/* Payment details */}
          <div className='px-6 py-6'>
            {hasDetail ? (
              <div className='rounded-2xl border border-green-100 bg-green-50 divide-y divide-green-100 mb-6'>
                {paymentInfo.orderCode && (
                  <DetailRow label='Mã thanh toán' value={paymentInfo.orderCode} mono />
                )}
                {paymentInfo.amount && (
                  <DetailRow label='Số tiền đã thanh toán' value={formatCurrency(paymentInfo.amount)} />
                )}
                {paymentInfo.reference && (
                  <DetailRow label='Mã tham chiếu' value={paymentInfo.reference} mono />
                )}
                <DetailRow label='Phương thức' value='PayOS' />
                <DetailRow
                  label='Trạng thái'
                  value='Thành công'
                  valueClass='font-semibold text-green-700'
                />
              </div>
            ) : (
              <div className='rounded-2xl border border-green-100 bg-green-50 px-4 py-4 mb-6 text-center text-green-700 text-sm'>
                Thanh toán của bạn đã được xử lý thành công.
              </div>
            )}

            {/* Action buttons */}
            <div className='flex flex-col gap-3'>
              <button
                onClick={() => navigate(ROUTES.PROFILE_ORDERS)}
                className='w-full py-3 rounded-xl font-semibold text-white transition-all'
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  fontFamily: 'Arimo, sans-serif',
                }}
              >
                Xem đơn hàng
              </button>

              <button
                onClick={handlePrint}
                className='w-full py-3 rounded-xl font-semibold border-2 transition-all hover:bg-green-50'
                style={{
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  fontFamily: 'Arimo, sans-serif',
                }}
              >
                In hóa đơn
              </button>

              <button
                onClick={() => navigate(ROUTES.HOME)}
                className='w-full py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 transition-all hover:bg-gray-50'
                style={{ fontFamily: 'Arimo, sans-serif' }}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <p className='text-center text-xs text-gray-400 mt-4'>
          Mọi thắc mắc, vui lòng liên hệ hỗ trợ Woodify
        </p>
      </div>
    </div>
  )
}

/* ─── Helper component ─────────────────────────────────────── */

interface DetailRowProps {
  label: string
  value: string
  mono?: boolean
  valueClass?: string
}

function DetailRow({ label, value, mono = false, valueClass }: DetailRowProps) {
  return (
    <div className='flex items-center justify-between px-4 py-3 gap-4'>
      <span className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
        {label}
      </span>
      <span
        className={`text-sm text-right text-gray-800 ${mono ? 'font-mono' : 'font-medium'} ${valueClass ?? ''}`}
        style={mono ? undefined : { fontFamily: 'Arimo, sans-serif' }}
      >
        {value}
      </span>
    </div>
  )
}
