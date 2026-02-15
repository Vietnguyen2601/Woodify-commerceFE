import React from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks'
import { locationService, queryKeys, sellerService } from '@/services'
import type {
  DistrictDTO,
  ProvinceDTO,
  SellerAddressPayload,
  SellerRegistrationPayload,
  WardDTO,
} from '@/types'

interface RegistrationFormValues {
  shopName: string
}

interface PickupAddress extends SellerAddressPayload {}

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: PickupAddress) => void
  initialValue?: PickupAddress | null
}

interface AddressFormValues {
  receiverName: string
  phone: string
  provinceCode: string
  districtCode: string
  wardCode: string
  addressLine: string
  isDefault: boolean
}

const shopNameMessages = {
  idle: 'Đặt tên thể hiện phong cách thương hiệu của bạn (3-50 ký tự).',
  checking: 'Đang kiểm tra tên shop...',
  available: 'Tên shop này có thể sử dụng.',
  duplicate: 'Tên shop đã tồn tại. Vui lòng chọn tên khác.',
  error: 'Không thể kiểm tra tên shop. Vui lòng thử lại.',
}

type ShopNameStatus = keyof typeof shopNameMessages

export default function SellerRegistrationPage() {
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

  const registrationMutation = useMutation({
    mutationFn: (payload: SellerRegistrationPayload) => sellerService.registerSeller(payload),
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedAddress || shopNameStatus !== 'available') {
      if (!selectedAddress) {
        setSubmissionFeedback({ type: 'error', message: 'Vui lòng thêm địa chỉ lấy hàng.' })
      }
      return
    }

    setSubmissionFeedback(null)

    try {
      await registrationMutation.mutateAsync({
        shopName: values.shopName.trim(),
        pickupAddress: selectedAddress,
      })
      setSubmissionFeedback({ type: 'success', message: 'Đăng ký thành công! Hệ thống sẽ điều hướng bạn vào trang người bán.' })
    } catch (error) {
      console.error(error)
      setSubmissionFeedback({ type: 'error', message: 'Đăng ký thất bại. Vui lòng thử lại sau.' })
    }
  })

  const isContinueDisabled =
    !selectedAddress || !isValid || shopNameStatus !== 'available' || isSubmitting || registrationMutation.isPending

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
                  {registrationMutation.isPending || isSubmitting ? 'Đang xử lý...' : 'Tiếp theo'}
                </button>
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
  const fullAddress = `${address.addressLine}, ${address.wardName}, ${address.districtName}, ${address.provinceName}`

  return (
    <div className='rounded-2xl border border-stone-200 bg-white p-5 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-base font-semibold text-stone-900'>{address.receiverName}</p>
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

function AddressModal({ isOpen, onClose, onSave, initialValue }: AddressModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AddressFormValues>({
    mode: 'onChange',
    defaultValues: {
      receiverName: initialValue?.receiverName ?? '',
      phone: initialValue?.phone ?? '',
      provinceCode: initialValue?.provinceCode ?? '',
      districtCode: initialValue?.districtCode ?? '',
      wardCode: initialValue?.wardCode ?? '',
      addressLine: initialValue?.addressLine ?? '',
      isDefault: initialValue?.isDefault ?? true,
    },
  })

  React.useEffect(() => {
    reset({
      receiverName: initialValue?.receiverName ?? '',
      phone: initialValue?.phone ?? '',
      provinceCode: initialValue?.provinceCode ?? '',
      districtCode: initialValue?.districtCode ?? '',
      wardCode: initialValue?.wardCode ?? '',
      addressLine: initialValue?.addressLine ?? '',
      isDefault: initialValue?.isDefault ?? true,
    })
  }, [initialValue, reset])

  const provinceCode = watch('provinceCode')
  const districtCode = watch('districtCode')

  const prevProvinceRef = React.useRef<string>('')
  const prevDistrictRef = React.useRef<string>('')

  React.useEffect(() => {
    if (!prevProvinceRef.current) {
      prevProvinceRef.current = provinceCode
      return
    }
    if (provinceCode && prevProvinceRef.current === provinceCode) return
    setValue('districtCode', '')
    setValue('wardCode', '')
    prevProvinceRef.current = provinceCode
  }, [provinceCode, setValue])

  React.useEffect(() => {
    if (!prevDistrictRef.current) {
      prevDistrictRef.current = districtCode
      return
    }
    if (districtCode && prevDistrictRef.current === districtCode) return
    setValue('wardCode', '')
    prevDistrictRef.current = districtCode
  }, [districtCode, setValue])

  const { data: provinceResponse, isLoading: provinceLoading } = useQuery({
    queryKey: queryKeys.location.provinces(),
    queryFn: () => locationService.getProvinces(),
    staleTime: Infinity,
  })

  const { data: districtResponse, isLoading: districtLoading } = useQuery({
    queryKey: queryKeys.location.districts(provinceCode || 'unknown'),
    queryFn: () => locationService.getDistricts(provinceCode),
    enabled: Boolean(provinceCode),
    staleTime: Infinity,
  })

  const { data: wardResponse, isLoading: wardLoading } = useQuery({
    queryKey: queryKeys.location.wards(districtCode || 'unknown'),
    queryFn: () => locationService.getWards(districtCode),
    enabled: Boolean(districtCode),
    staleTime: Infinity,
  })

  const provinces = provinceResponse?.data ?? []
  const districts = districtResponse?.data ?? []
  const wards = wardResponse?.data ?? []

  const onSubmitAddress = handleSubmit((values) => {
    const province = provinces.find((item) => item.code === values.provinceCode)
    const district = districts.find((item) => item.code === values.districtCode)
    const ward = wards.find((item) => item.code === values.wardCode)

    if (!province || !district || !ward) return

    const payload: PickupAddress = {
      receiverName: values.receiverName.trim(),
      phone: values.phone.trim(),
      provinceCode: province.code,
      provinceName: province.name,
      districtCode: district.code,
      districtName: district.name,
      wardCode: ward.code,
      wardName: ward.name,
      addressLine: values.addressLine.trim(),
      isDefault: values.isDefault,
    }

    onSave(payload)
  })

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4 py-8'>
      <div className='flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl'>
        <header className='border-b border-stone-100 px-6 py-4'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.25em] text-stone-500'>Lấy hàng</p>
              <h2 className='text-lg font-semibold text-stone-900'>Thêm Địa Chỉ Mới</h2>
            </div>
            <button
              type='button'
              className='rounded-full border border-stone-200 p-2 text-stone-500 hover:text-stone-900'
              onClick={onClose}
              aria-label='Đóng'
            >
              ✕
            </button>
          </div>
        </header>

        <form className='flex flex-1 flex-col' onSubmit={onSubmitAddress}>
          <div className='flex-1 space-y-4 overflow-y-auto px-6 py-5'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Field label='Họ & Tên' required error={errors.receiverName?.message}>
                <input
                  type='text'
                  {...register('receiverName', { required: 'Vui lòng nhập họ tên' })}
                  className='h-11 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-yellow-900'
                />
              </Field>
              <Field label='Số điện thoại (+84)' required error={errors.phone?.message}>
                <input
                  type='tel'
                  {...register('phone', {
                    required: 'Vui lòng nhập số điện thoại',
                    validate: (value) => (/^(\+?84|0)(3|5|7|8|9)\d{8}$/.test(value.trim()) ? true : 'Số điện thoại không hợp lệ'),
                  })}
                  className='h-11 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-yellow-900'
                />
              </Field>
            </div>

            <Field label='Tỉnh/Thành phố' required error={errors.provinceCode?.message}>
              <Select
                placeholder={provinceLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                loading={provinceLoading}
                registerProps={register('provinceCode', { required: 'Vui lòng chọn tỉnh/thành phố' })}
              >
                {provinces.map((province: ProvinceDTO) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </Select>
            </Field>

            <div className='grid gap-4 md:grid-cols-2'>
              <Field label='Quận/Huyện' required error={errors.districtCode?.message}>
                <Select
                  placeholder={!provinceCode ? 'Chọn tỉnh trước' : districtLoading ? 'Đang tải...' : 'Chọn quận/huyện'}
                  loading={districtLoading}
                  disabled={!provinceCode || districtLoading}
                  registerProps={register('districtCode', { required: 'Vui lòng chọn quận/huyện' })}
                >
                  {districts.map((district: DistrictDTO) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label='Phường/Xã' required error={errors.wardCode?.message}>
                <Select
                  placeholder={!districtCode ? 'Chọn quận trước' : wardLoading ? 'Đang tải...' : 'Chọn phường/xã'}
                  loading={wardLoading}
                  disabled={!districtCode || wardLoading}
                  registerProps={register('wardCode', { required: 'Vui lòng chọn phường/xã' })}
                >
                  {wards.map((ward: WardDTO) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label='Địa chỉ chi tiết' required error={errors.addressLine?.message}>
              <textarea
                rows={3}
                {...register('addressLine', { required: 'Vui lòng nhập địa chỉ chi tiết' })}
                className='w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-yellow-900'
                placeholder='Số nhà, tên đường, mô tả bổ sung...'
              />
            </Field>

            <label className='flex items-start gap-3 text-sm text-stone-600'>
              <input type='checkbox' className='mt-1 h-4 w-4 rounded border-stone-300' {...register('isDefault')} />
              <span>Đặt làm địa chỉ mặc định</span>
            </label>
          </div>

          <div className='sticky bottom-0 flex justify-end gap-3 border-t border-stone-100 bg-white px-6 py-4'>
            <button type='button' className='rounded-full px-5 py-2 text-sm font-semibold text-stone-500 hover:text-stone-900' onClick={onClose}>
              Hủy
            </button>
            <button
              type='submit'
              disabled={!isValid || isSubmitting}
              className={`rounded-full px-6 py-2 text-sm font-semibold text-white ${
                !isValid || isSubmitting ? 'bg-stone-300' : 'bg-yellow-900 hover:bg-yellow-800'
              }`}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className='flex flex-col gap-2 text-sm text-stone-700'>
      <span className='text-xs font-semibold uppercase tracking-wide text-stone-500'>
        {label}
        {required && <span className='ml-1 text-rose-600'>*</span>}
      </span>
      {children}
      {error && <span className='text-xs text-rose-600'>{error}</span>}
    </label>
  )
}

function Select({
  children,
  placeholder,
  loading,
  disabled,
  registerProps,
}: {
  children: React.ReactNode
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  registerProps: UseFormRegisterReturn
}) {
  return (
    <div className='relative'>
      <select
        {...registerProps}
        disabled={disabled}
        className='h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-3 pr-10 text-sm outline-none focus:border-yellow-900 disabled:bg-stone-50'
      >
        <option value=''>
          {placeholder}
        </option>
        {children}
      </select>
      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400'>⌄</span>
      {loading && <span className='absolute right-8 top-1/2 -translate-y-1/2 text-xs text-yellow-900'>Đang tải...</span>}
    </div>
  )
}
