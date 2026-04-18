type Props = {
  isLoading: boolean
  isError: boolean
  error: unknown | null
  onRefresh: () => void
}

/** Làm mới đơn + vận đơn và hiển thị trạng thái tải/lỗi (thao tác vận đơn nằm trong từng đơn / chi tiết). */
export default function SellerOrdersShippingHub({ isLoading, isError, error, onRefresh }: Props) {
  return (
    <section className='mb-6 space-y-4'>
      <div className='flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={() => onRefresh()}
          className='rounded-lg border border-yellow-800/30 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50'
        >
          Làm mới dữ liệu đơn &amp; vận đơn
        </button>
      </div>

      {isLoading && (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-yellow-800/20 bg-white py-12'>
          <div className='h-9 w-9 animate-spin rounded-full border-4 border-yellow-800 border-t-transparent' />
          <p className='text-sm text-stone-600'>Đang tải dữ liệu…</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className='rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800'>
          <p className='font-medium'>Không tải được đơn hàng.</p>
          <p className='mt-1 opacity-90'>
            {(error as { message?: string })?.message || 'Kiểm tra kết nối hoặc đăng nhập seller.'}
          </p>
          <button
            type='button'
            onClick={() => onRefresh()}
            className='mt-4 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800'
          >
            Thử lại
          </button>
        </div>
      )}
    </section>
  )
}
