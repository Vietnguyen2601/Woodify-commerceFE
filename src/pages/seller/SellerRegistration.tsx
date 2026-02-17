import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import AddressModal from '@/components/seller/AddressModal/AddressModal'
import type { PickupAddressPayload } from '@/components/seller/AddressModal/types'
import { useAuth } from '@/features/auth/hooks'
import { useDebounce } from '@/hooks'
import { sellerService, shopService } from '@/services'
import type { CreateShopPayload } from '@/types'

interface RegistrationFormValues {
  shopName: string
}

type PickupAddress = PickupAddressPayload

const SHOP_NAME_CHECK_ENABLED = false

const formatPickupAddress = (address: PickupAddress) =>
  `${address.detailAddress}, ${address.wardName}, ${address.districtName}, ${address.provinceName}`

const shopNameMessages = {
  idle: 'Đặt tên thể hiện phong cách thương hiệu của bạn (3-50 ký tự).',
  checking: 'Đang kiểm tra tên shop...',
  available: 'Tên shop này có thể sử dụng.',
  duplicate: 'Tên shop đã tồn tại. Vui lòng chọn tên khác.',
  error: 'Không thể kiểm tra tên shop. Vui lòng thử lại.',
}

type ShopNameStatus = keyof typeof shopNameMessages

export default function SellerRegistrationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedAddress, setSelectedAddress] = React.useState<PickupAddress | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingAddress, setEditingAddress] = React.useState<PickupAddress | null>(null)
  const [shopNameStatus, setShopNameStatus] = React.useState<ShopNameStatus>('idle')
  const [submissionFeedback, setSubmissionFeedback] = React.useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegistrationFormValues>({
    mode: 'onChange',
    defaultValues: {
      shopName: '',
    },
  })

  const shopNameValue = watch('shopName') || ''
  const debouncedShopName = useDebounce(shopNameValue.trim(), 400)

  React.useEffect(() => {
    if (!SHOP_NAME_CHECK_ENABLED) {
      if (!debouncedShopName || debouncedShopName.length < 3) {
        setShopNameStatus('idle')
      } else {
        setShopNameStatus('available')
      }
      return
    }

    if (!debouncedShopName) {
      setShopNameStatus('idle')
      clearErrors('shopName')
      return
    }

    if (debouncedShopName.length < 3) {
      setShopNameStatus('idle')
      return
    }

    let cancelled = false
    setShopNameStatus('checking')

    sellerService
      .checkShopNameAvailability(debouncedShopName)
      .then(({ data }) => {
        if (cancelled) return
        if (data.available) {
          setShopNameStatus('available')
          clearErrors('shopName')
        } else {
          setShopNameStatus('duplicate')
          setError('shopName', {
            type: 'manual',
            message: data.suggestion ? `Tên đã tồn tại. Gợi ý: ${data.suggestion}` : 'Tên shop đã tồn tại',
          })
        }
      })
      .catch(() => {
        if (cancelled) return
        setShopNameStatus('error')
        setError('shopName', {
          type: 'manual',
          message: 'Không thể kiểm tra tên shop. Vui lòng thử lại.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [debouncedShopName, clearErrors, setError])

  const shopCreationMutation = useMutation({
    mutationFn: (payload: CreateShopPayload) => shopService.createShop(payload),
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedAddress || shopNameStatus !== 'available') {
      if (!selectedAddress) {
        setSubmissionFeedback({ type: 'error', message: 'Vui lòng thêm địa chỉ lấy hàng.' })
      }
      return
    }

    if (!user?.accountId) {
      setSubmissionFeedback({ type: 'error', message: 'Không tìm thấy thông tin chủ shop. Vui lòng đăng nhập lại.' })
      return
    }

    setSubmissionFeedback(null)

    const normalizedShopName = values.shopName.trim()
    const shopPayload: CreateShopPayload = {
      shopName: normalizedShopName,
      description: `Gian hàng ${normalizedShopName}`,
      address: formatPickupAddress(selectedAddress),
      phoneNumber: selectedAddress.phone,
      ownerId: user.accountId,
    }

    try {
      await shopCreationMutation.mutateAsync(shopPayload)
      setSubmissionFeedback({
        type: 'success',
        message: 'Tạo shop thành công! Đang chuyển tới trang quản trị người bán...',
      })
      navigate('/seller', { replace: true })
    } catch (error) {
      console.error(error)
      setSubmissionFeedback({ type: 'error', message: 'Tạo shop thất bại. Vui lòng thử lại sau.' })
    }
  })

  const requiresLogin = !user?.accountId

  const isContinueDisabled =
    !selectedAddress ||
    !isValid ||
    shopNameStatus !== 'available' ||
    isSubmitting ||
    shopCreationMutation.isPending ||
    requiresLogin

  const openAddressModal = (address?: PickupAddress | null) => {
    setEditingAddress(address ?? null)
    setIsModalOpen(true)
  }

  const handleAddressSave = (address: PickupAddress) => {
    setSelectedAddress(address)
    setIsModalOpen(false)
    setEditingAddress(null)
  }

  return (
    <div className='min-h-screen bg-[#f7f4ee] px-4 py-10'>
      <div className='mx-auto flex max-w-5xl flex-col items-center gap-6'>
        <div className='text-center'>
          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-stone-500'>Woodify Seller Center</p>
          <h1 className='mt-2 text-3xl font-semibold text-stone-900'>Đăng ký trở thành Người bán</h1>
          <p className='mt-2 max-w-2xl text-sm text-stone-600'>Hoàn tất thông tin bên dưới để khởi tạo gian hàng và bắt đầu tham gia Woodify Marketplace. Thao tác chỉ mất khoảng 2 phút.</p>
        </div>

        <div className='w-full max-w-3xl rounded-2xl border border-stone-100 bg-white p-8 shadow-[0_20px_60px_rgba(105,64,25,0.08)]'>
          <form className='space-y-8' onSubmit={onSubmit}>
            <section className='space-y-3'>
              <header>
                <p className='text-xs font-semibold uppercase tracking-[0.25em] text-stone-500'>Thông tin gian hàng</p>
                <p className='mt-1 text-base font-semibold text-stone-900'>Tên shop *</p>
              </header>
              <div className='space-y-2'>
                <div className='relative flex items-center rounded-2xl border bg-white px-4 py-3 focus-within:border-yellow-800'>
                  <input
                    type='text'
                    maxLength={50}
                    {...register('shopName', {
                      required: 'Vui lòng nhập tên shop',
                      minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
                      maxLength: { value: 50, message: 'Tối đa 50 ký tự' },
                    })}
                    placeholder='VD: GoCraft Studio'
                    className={`w-full bg-transparent text-base font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none ${
                      errors.shopName
                        ? 'text-rose-600'
                        : shopNameStatus === 'available'
                          ? 'text-emerald-700'
                          : 'text-stone-900'
                    }`}
                    aria-invalid={Boolean(errors.shopName)}
                    aria-describedby='shop-name-message'
                  />
                  <span className='ml-2 text-xs font-medium text-stone-500'>{shopNameValue.length}/50</span>
                </div>
                <p
                  id='shop-name-message'
                  className={`text-sm ${
                    errors.shopName
                      ? 'text-rose-600'
                      : shopNameStatus === 'available'
                        ? 'text-emerald-700'
                        : shopNameStatus === 'checking'
                          ? 'text-yellow-700'
                          : 'text-stone-500'
                  }`}
                >
                  {errors.shopName?.message ?? shopNameMessages[shopNameStatus]}
                </p>
              </div>
            </section>

            <section className='space-y-4'>
              <header className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.25em] text-stone-500'>Điểm lấy hàng</p>
                  <p className='mt-1 text-base font-semibold text-stone-900'>Địa chỉ nhận hàng của đơn vị vận chuyển *</p>
                </div>
                {selectedAddress && (
                  <button
                    type='button'
                    className='text-sm font-semibold text-yellow-900 underline-offset-4 hover:underline'
                    onClick={() => openAddressModal(selectedAddress)}
                  >
                    Thay đổi
                  </button>
                )}
              </header>

              {selectedAddress ? (
                <AddressCard address={selectedAddress} />
              ) : (
                <div className='rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 px-6 py-10 text-center'>
                  <p className='text-sm text-stone-500'>Chưa có địa chỉ lấy hàng</p>
                  <button
                    type='button'
                    className='mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-yellow-800'
                    onClick={() => openAddressModal(null)}
                  >
                    <span className='text-lg leading-none'>+</span>
                    Thêm địa chỉ
                  </button>
                </div>
              )}
              {!selectedAddress && (
                <p className='text-sm text-rose-600'>Vui lòng thêm địa chỉ lấy hàng để tiếp tục.</p>
              )}
            </section>

            {submissionFeedback && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  submissionFeedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {submissionFeedback.message}
              </div>
            )}

            <footer className='flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-5'>
              <button type='button' className='text-sm font-semibold text-stone-500 hover:text-stone-800'>
                Lưu nháp
              </button>
              <div className='flex items-center gap-3'>
                <button
                  type='submit'
                  disabled={isContinueDisabled}
                  className={`inline-flex min-w-[140px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300 ${
                    isContinueDisabled ? 'bg-stone-300' : 'bg-yellow-900 hover:bg-yellow-800'
                  }`}
                >
                  {shopCreationMutation.isPending || isSubmitting ? 'Đang xử lý...' : 'Tạo shop'}
                </button>
                {requiresLogin && (
                  <p className='text-xs font-medium text-rose-600'>Vui lòng đăng nhập lại để tiếp tục.</p>
                )}
              </div>
            </footer>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <AddressModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAddress(null)
          }}
          onSave={handleAddressSave}
          initialValue={editingAddress}
        />
      )}
    </div>
  )
}

function AddressCard({ address }: { address: PickupAddress }) {
  const fullAddress = formatPickupAddress(address)

  return (
    <div className='rounded-2xl border border-stone-200 bg-white p-5 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-base font-semibold text-stone-900'>{address.fullName}</p>
          <p className='text-sm text-stone-600'>{address.phone}</p>
        </div>
        {address.isDefault && (
          <span className='inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-900'>Mặc định</span>
        )}
      </div>
      <p className='mt-3 text-sm text-stone-700'>{fullAddress}</p>
    </div>
  )
}

