import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ROUTES } from '@/constants/routes'
import { providerService, shopService } from '@/services'
import { uploadImageToCloudinary } from '@/services/cloudinary.service'
import { useShopStore } from '@/store/shopStore'
import type { CreateShopPayload, ShippingProvider } from '@/types'

const STEP_ONE_STORAGE_KEY = 'seller_register_step1'

type StepOneDraft = Pick<CreateShopPayload, 'ownerAccountId' | 'name' | 'description' | 'defaultPickupAddress'>

const mediaSchema = z.object({
  logoUrl: z.string().url('Logo phải là URL hợp lệ'),
  coverImageUrl: z.string().url('Cover phải là URL hợp lệ'),
  defaultProvider: z.string().min(1, 'Vui lòng chọn nhà vận chuyển'),
})

type MediaFormData = z.infer<typeof mediaSchema>

export default function SellerRegister() {
  const navigate = useNavigate()
  const { setShop } = useShopStore()
  const [stepOneData, setStepOneData] = useState<StepOneDraft | null>(null)
  const [isDraftLoading, setIsDraftLoading] = useState(true)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STEP_ONE_STORAGE_KEY)
    if (!raw) {
      setIsDraftLoading(false)
      return
    }
    try {
      const parsed = JSON.parse(raw) as StepOneDraft
      setStepOneData(parsed)
    } catch (error) {
      console.error('Không thể đọc dữ liệu bước 1:', error)
      localStorage.removeItem(STEP_ONE_STORAGE_KEY)
    } finally {
      setIsDraftLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isDraftLoading && !stepOneData) {
      navigate(ROUTES.SELLER_REGISTRATION, { replace: true })
    }
  }, [isDraftLoading, stepOneData, navigate])

  const mediaForm = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      logoUrl: '',
      coverImageUrl: '',
      defaultProvider: '',
    },
  })

  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => providerService.getProviders({ page: 1, limit: 20 }),
  })

  const providers = providersData?.providers ?? []

  const { mutate: createShop, isPending } = useMutation({
    mutationFn: async (payload: CreateShopPayload) => {
      const response = await shopService.createShop(payload)
      return response
    },
    onSuccess: (data) => {
      localStorage.setItem('current_shop', JSON.stringify(data))
      localStorage.removeItem(STEP_ONE_STORAGE_KEY)
      setShop(data)
      navigate(ROUTES.SELLER)
    },
    onError: (error: any) => {
      const errorMsg = error?.message || 'Lỗi tạo cửa hàng'
      alert(`❌ ${errorMsg}`)
    },
  })

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'coverImageUrl'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const setUploading = field === 'logoUrl' ? setLogoUploading : setCoverUploading
    const setError = field === 'logoUrl' ? setLogoUploadError : setCoverUploadError

    setUploading(true)
    setError(null)
    try {
      const result = await uploadImageToCloudinary(file)
      mediaForm.setValue(field, result.secureUrl, { shouldValidate: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải ảnh lên'
      setError(message)
    } finally {
      setUploading(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const logoUrlValue = mediaForm.watch('logoUrl')
  const coverUrlValue = mediaForm.watch('coverImageUrl')

  const handleEditStepOne = () => {
    navigate(ROUTES.SELLER_REGISTRATION)
  }

  const onSubmit = mediaForm.handleSubmit(async (values) => {
    if (!stepOneData) {
      navigate(ROUTES.SELLER_REGISTRATION, { replace: true })
      return
    }

    const finalPayload: CreateShopPayload = {
      ownerAccountId: stepOneData.ownerAccountId,
      name: stepOneData.name,
      description: stepOneData.description,
      defaultPickupAddress: stepOneData.defaultPickupAddress,
      logoUrl: values.logoUrl,
      coverImageUrl: values.coverImageUrl,
      defaultProvider: values.defaultProvider,
    }

    createShop(finalPayload)
  })

  if (isDraftLoading || !stepOneData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center text-gray-600'>
        Đang chuẩn bị dữ liệu đăng ký...
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-10'>
          <p className='text-sm font-semibold uppercase tracking-[0.28em] text-gray-500'>Woodify Seller Center</p>
          <h1 className='mt-2 text-3xl font-bold text-gray-900'>Bước 2: Hình ảnh & vận chuyển</h1>
          <p className='mt-1 text-sm text-gray-600'>Hoàn thiện logo, ảnh cover và chọn nhà vận chuyển mặc định.</p>
        </div>

        <div className='mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-blue-700'>Thông tin bước 1</p>
              <h2 className='mt-1 text-lg font-semibold text-blue-900'>{stepOneData.name}</h2>
            </div>
            <button
              type='button'
              onClick={handleEditStepOne}
              className='text-sm font-semibold text-blue-700 underline-offset-4 hover:underline'
            >
              Chỉnh sửa bước 1
            </button>
          </div>
          <p className='mt-3 text-sm text-blue-900/80'>{stepOneData.description}</p>
          <p className='mt-2 text-sm font-medium text-blue-900'>Địa chỉ lấy hàng: {stepOneData.defaultPickupAddress}</p>
        </div>

        <div className='bg-white rounded-2xl shadow-md p-8'>
          <form className='space-y-6' onSubmit={onSubmit}>
            <div className='grid gap-6'>
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <label className='text-sm font-medium text-gray-700'>Logo cửa hàng *</label>
                  <button
                    type='button'
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className='inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60'
                  >
                    {logoUploading ? 'Đang tải...' : 'Upload từ máy'}
                  </button>
                </div>
                <input
                  type='url'
                  placeholder='https://example.com/logo.jpg'
                  {...mediaForm.register('logoUrl')}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <input
                  ref={logoInputRef}
                  type='file'
                  accept='image/png,image/jpeg,image/webp'
                  className='hidden'
                  onChange={(event) => handleImageUpload(event, 'logoUrl')}
                />
                {logoUploadError && <p className='text-sm text-red-500'>{logoUploadError}</p>}
                {mediaForm.formState.errors.logoUrl && (
                  <p className='text-sm text-red-500'>{mediaForm.formState.errors.logoUrl.message}</p>
                )}
                {logoUrlValue && (
                  <img src={logoUrlValue} alt='Logo preview' className='w-24 h-24 mt-3 rounded-lg object-cover border border-gray-200' />
                )}
              </div>

              <div className='space-y-2'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <label className='text-sm font-medium text-gray-700'>Ảnh cover *</label>
                  <button
                    type='button'
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className='inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60'
                  >
                    {coverUploading ? 'Đang tải...' : 'Upload từ máy'}
                  </button>
                </div>
                <input
                  type='url'
                  placeholder='https://example.com/cover.jpg'
                  {...mediaForm.register('coverImageUrl')}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <input
                  ref={coverInputRef}
                  type='file'
                  accept='image/png,image/jpeg,image/webp'
                  className='hidden'
                  onChange={(event) => handleImageUpload(event, 'coverImageUrl')}
                />
                {coverUploadError && <p className='text-sm text-red-500'>{coverUploadError}</p>}
                {mediaForm.formState.errors.coverImageUrl && (
                  <p className='text-sm text-red-500'>{mediaForm.formState.errors.coverImageUrl.message}</p>
                )}
                {coverUrlValue && (
                  <img src={coverUrlValue} alt='Cover preview' className='w-full h-40 mt-3 rounded-lg object-cover border border-gray-200' />
                )}
              </div>
            </div>

            <section className='space-y-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h3 className='text-sm font-semibold text-gray-900'>Nhà vận chuyển mặc định *</h3>
                <p className='text-xs text-gray-500'>Danh sách hiển thị tên nhà vận chuyển.</p>
              </div>
              {providersLoading ? (
                <div className='py-4 text-center text-gray-600'>Đang tải danh sách nhà vận chuyển...</div>
              ) : providers.length ? (
                <div className='space-y-2'>
                  {providers.map((provider: ShippingProvider) => (
                    <label
                      key={provider.providerId}
                      className='flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-400 cursor-pointer transition'
                    >
                      <input
                        type='radio'
                        {...mediaForm.register('defaultProvider')}
                        value={provider.providerId}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm font-medium text-gray-900'>{provider.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-gray-500'>Không có nhà vận chuyển khả dụng.</p>
              )}
              {mediaForm.formState.errors.defaultProvider && (
                <p className='text-sm text-red-500'>{mediaForm.formState.errors.defaultProvider.message}</p>
              )}
            </section>

            <p className='text-sm text-gray-500'>💡 Gợi ý: Dùng Cloudinary hoặc dịch vụ tương tự để lấy URL sau khi upload.</p>

            <div className='flex justify-between gap-4 pt-6'>
              <button
                type='button'
                onClick={handleEditStepOne}
                className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Quay lại bước 1
              </button>
              <button
                type='submit'
                disabled={isPending || logoUploading || coverUploading}
                className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isPending ? 'Đang Xử Lý...' : 'Hoàn tất đăng ký'}
              </button>
            </div>
          </form>
        </div>

        <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-2'>ℹ️ Lưu ý</h3>
          <ul className='text-sm text-blue-800 space-y-1 list-disc list-inside'>
            <li>Bạn có thể cập nhật thông tin cửa hàng sau khi hoàn tất đăng ký.</li>
            <li>Nhà vận chuyển mặc định sẽ áp dụng cho mọi đơn hàng mới.</li>
            <li>Ảnh rõ nét và chuyên nghiệp giúp tăng độ tin cậy cho thương hiệu.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
