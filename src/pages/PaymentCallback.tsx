import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

export default function PaymentCallback() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidate wallet queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['wallet'] })
    queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })

    // Auto-redirect to profile after 2 seconds
    const timer = setTimeout(() => {
      navigate('/profile', { state: { tab: 'wallet' } })
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate, queryClient])

  return (
    <div className='w-full min-h-screen bg-gray-100 flex items-center justify-center px-4'>
      <div className='bg-white rounded-[20px] shadow-lg p-8 max-w-md w-full text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
        </div>

        <h2 className='text-2xl font-bold text-green-600 mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
          Thành công!
        </h2>

        <p className='text-gray-600 mb-6' style={{ fontFamily: 'Arimo, sans-serif' }}>
          Thanh toán đã được xác nhận. Đang quay lại ví...
        </p>

        <div className='flex items-center justify-center gap-1'>
          <span className='inline-block w-2 h-2 bg-amber-700 rounded-full animate-bounce'></span>
          <span
            className='inline-block w-2 h-2 bg-amber-600 rounded-full animate-bounce'
            style={{ animationDelay: '0.2s' }}
          ></span>
          <span
            className='inline-block w-2 h-2 bg-amber-500 rounded-full animate-bounce'
            style={{ animationDelay: '0.4s' }}
          ></span>
        </div>
      </div>
    </div>
  )
}
