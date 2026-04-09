import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface CancelInfo {
  orderCode: string | null
  reason: string | null
}

const DEFAULT_REASON = 'Người dùng đã hủy'

export default function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [cancelInfo, setCancelInfo] = useState<CancelInfo>({
    orderCode: null,
    reason: null,
  })

  useEffect(() => {
    const orderCode = searchParams.get('orderCode')
    const reason = searchParams.get('reason')

    const info: CancelInfo = { orderCode, reason }
    setCancelInfo(info)

    // Persist to localStorage so user can still see it after refresh
    if (orderCode) {
      try {
        localStorage.setItem(
          `payos_cancel_${orderCode}`,
          JSON.stringify({ ...info, timestamp: Date.now() })
        )
      } catch {
        // ignore storage errors
      }
    }
  }, [searchParams])

  const displayReason = cancelInfo.reason
    ? cancelInfo.reason.replace(/_/g, ' ')
    : DEFAULT_REASON

  const hasDetail = Boolean(cancelInfo.orderCode)

  return (
    <div className='relative min-h-screen w-full flex items-center justify-center py-12 px-4'>
      {/* Background */}
      <div
        className='fixed inset-0 pointer-events-none'
        style={{
          background: 'linear-gradient(to bottom, rgba(254, 226, 226, 0.4), #FFFBEB, #FFF7ED)',
          zIndex: -1,
        }}
      />

      <div className='w-full max-w-lg'>
        {/* Card */}
        <div
          className='bg-white rounded-3xl shadow-lg overflow-hidden'
          style={{ boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.10)' }}
        >
          {/* Red/orange header banner */}
          <div
            className='flex flex-col items-center justify-center py-10 px-6'
            style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}
          >
            <div className='text-6xl mb-4 select-none' aria-hidden='true'>
              ❌
            </div>
            <h1
              className='text-2xl sm:text-3xl font-bold text-white text-center'
              style={{ fontFamily: 'Arimo, sans-serif' }}
            >
              Thanh toán bị hủy
            </h1>
            <p className='text-red-100 mt-2 text-sm sm:text-base text-center'>
              Giao dịch chưa được hoàn tất. Đừng lo, bạn có thể thử lại bất kỳ lúc nào.
            </p>
          </div>

          {/* Cancel details */}
          <div className='px-6 py-6'>
            {/* Warning notice */}
            <div
              className='flex items-start gap-3 rounded-xl px-4 py-3 mb-6 text-sm'
              style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
            >
              <span className='text-orange-400 text-lg leading-none mt-0.5'>⚠️</span>
              <p className='text-orange-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                Đơn hàng của bạn vẫn đang chờ thanh toán. Bạn có thể thay đổi phương thức
                thanh toán hoặc liên hệ hỗ trợ.
              </p>
            </div>

            {/* Detail rows */}
            <div className='rounded-2xl border border-red-100 bg-red-50 divide-y divide-red-100 mb-6'>
              {hasDetail && (
                <DetailRow label='Mã thanh toán' value={cancelInfo.orderCode!} mono />
              )}
              <DetailRow label='Lý do hủy' value={displayReason} />
              <DetailRow
                label='Trạng thái'
                value='Bị hủy'
                valueClass='font-semibold text-red-600'
              />
            </div>

            {/* Action buttons */}
            <div className='flex flex-col gap-3'>
              <button
                onClick={() => navigate(ROUTES.CART)}
                className='w-full py-3 rounded-xl font-semibold text-white transition-all'
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #f97316)',
                  fontFamily: 'Arimo, sans-serif',
                }}
              >
                Quay lại giỏ hàng
              </button>

              <button
                onClick={() => navigate(ROUTES.CHECKOUT_MULTISHOP)}
                className='w-full py-3 rounded-xl font-semibold border-2 transition-all hover:bg-red-50'
                style={{
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  fontFamily: 'Arimo, sans-serif',
                }}
              >
                Thử thanh toán lại
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

        {/* Support note */}
        <p className='text-center text-xs text-gray-400 mt-4'>
          Cần trợ giúp? Liên hệ hỗ trợ Woodify để được giải quyết nhanh nhất
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
