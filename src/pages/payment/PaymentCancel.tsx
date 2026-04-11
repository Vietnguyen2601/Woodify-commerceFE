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
    <div className='min-h-screen w-full bg-[#f8f3ea] py-8 sm:py-10'>
      <div className='mx-auto w-full max-w-[min(860px,calc(100%-2rem))]'>
        <div className='overflow-hidden rounded-[26px] border border-[#e8dccd] bg-white shadow-[0_12px_32px_rgba(92,56,30,0.1)]'>
          <div className='bg-gradient-to-r from-[#7b2d26] via-[#a63f2c] to-[#c95d33] px-5 py-6 sm:px-8 sm:py-8'>
            <div className='flex flex-col items-center gap-2.5 text-center'>
              <span className='text-3xl leading-none sm:text-4xl' aria-hidden='true'>
                ✕
              </span>
              <h1 className='font-["Inter"] text-xl font-extrabold text-white sm:text-2xl'>
                Thanh toán bị hủy
              </h1>
              <p className='max-w-xl font-["Arimo"] text-xs text-white/90 sm:text-sm'>
                Giao dịch chưa được hoàn tất. Bạn có thể quay lại giỏ hàng hoặc thử thanh toán lại.
              </p>
            </div>
          </div>

          <div className='space-y-5 px-4 py-5 sm:px-6 sm:py-6'>
            <div className='rounded-xl border border-[#f2c89e] bg-[#fff7ef] px-3.5 py-2.5 text-xs text-[#7a4f2d] sm:px-4 sm:text-sm'>
              <p className='font-["Arimo"] leading-relaxed'>
                Đơn hàng của bạn vẫn đang ở trạng thái chờ thanh toán. Hãy kiểm tra lại phương thức
                thanh toán hoặc liên hệ hỗ trợ nếu cần.
              </p>
            </div>

            <div className='overflow-hidden rounded-2xl border border-[#eadfd2] bg-[#fffdfa]'>
              {hasDetail && (
                <DetailRow label='Mã thanh toán' value={cancelInfo.orderCode!} mono />
              )}
              <DetailRow label='Lý do hủy' value={displayReason} />
              <DetailRow
                label='Trạng thái'
                value='Bị hủy'
                valueClass='font-semibold text-[#b42318]'
              />
            </div>

            <div className='grid gap-2.5 sm:grid-cols-3'>
              <button
                onClick={() => navigate(ROUTES.CART)}
                className='rounded-lg bg-[#6C5B50] px-3 py-2.5 font-["Inter"] text-xs font-semibold text-white transition hover:bg-[#5b4b40] sm:text-sm'
              >
                Quay lại giỏ hàng
              </button>

              <button
                onClick={() => navigate(ROUTES.CHECKOUT)}
                className='rounded-lg border border-[#BE9C73] bg-white px-3 py-2.5 font-["Inter"] text-xs font-semibold text-[#6C5B50] transition hover:bg-[#f8f3ea] sm:text-sm'
              >
                Thử thanh toán lại
              </button>

              <button
                onClick={() => navigate(ROUTES.HOME)}
                className='rounded-lg border border-[#e5dccf] bg-[#faf7f2] px-3 py-2.5 font-["Inter"] text-xs font-semibold text-[#6C5B50] transition hover:bg-[#f4eee6] sm:text-sm'
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>

        <p className='mt-4 text-center font-["Arimo"] text-xs text-[#8b7b6b] sm:text-sm'>
          Cần hỗ trợ? Liên hệ đội ngũ Woodify để được xử lý nhanh nhất.
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
    <div className='flex items-center justify-between gap-4 border-b border-[#f1e7db] px-4 py-3 last:border-b-0 sm:px-5'>
      <span className='font-["Arimo"] text-sm text-[#8b7b6b] sm:text-base'>
        {label}
      </span>
      <span
        className={`text-right text-sm text-[#3f2a1d] sm:text-base ${mono ? 'font-mono' : 'font-medium'} ${valueClass ?? ''}`}
        style={mono ? undefined : { fontFamily: 'Arimo, sans-serif' }}
      >
        {value}
      </span>
    </div>
  )
}
