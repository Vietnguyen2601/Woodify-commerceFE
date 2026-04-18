import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ROUTES } from '@/constants/routes'
import { providerService, shopService, queryKeys } from '@/services'
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
  const queryClient = useQueryClient()
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
    queryKey: ['shipping-providers', 'list'],
    queryFn: () => providerService.getAllProviders(),
    staleTime: 5 * 60 * 1000,
  })

  const providers = providersData ?? []

  const { mutate: createShop, isPending } = useMutation({
    mutationFn: async (payload: CreateShopPayload) => {
      const response = await shopService.createShop(payload)
      return response
    },
    onSuccess: (data) => {
      // Invalidate user query to refetch with updated role/shop info
      queryClient.invalidateQueries({ queryKey: queryKeys.user() })
      
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
      <div className='flex min-h-screen items-center justify-center bg-[#f7f4ee] text-stone-600'>
        Đang chuẩn bị dữ liệu đăng ký...
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f4ee] px-4 py-10'>
      <div className='mx-auto flex max-w-5xl flex-col items-center gap-6'>
        <div className='text-center'>
          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-stone-500'>Woodify Seller Center</p>
          <h1 className='mt-2 text-3xl font-semibold text-stone-900'>Bước 2: Hình ảnh & vận chuyển</h1>
          <p className='mt-2 max-w-2xl text-sm text-stone-600'>Hoàn thiện logo, ảnh cover và chọn nhà vận chuyển mặc định cho gian hàng của bạn.</p>
        </div>

        <div className='w-full max-w-3xl rounded-2xl border border-yellow-100 bg-[#fff9ee] p-6 shadow-[0_12px_35px_rgba(105,64,25,0.08)]'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.25em] text-stone-500'>Thông tin bước 1</p>
              <h2 className='mt-1 text-lg font-semibold text-stone-900'>{stepOneData.name}</h2>
            </div>
            <button
              type='button'
              onClick={handleEditStepOne}
              className='text-sm font-semibold text-yellow-900 underline-offset-4 hover:underline'
            >
              Chỉnh sửa bước 1
            </button>
          </div>
          <p className='mt-3 text-sm text-stone-700'>{stepOneData.description}</p>
          <p className='mt-2 text-sm font-medium text-stone-800'>Địa chỉ lấy hàng: {stepOneData.defaultPickupAddress}</p>
        </div>

        <div className='w-full max-w-3xl rounded-2xl border border-stone-100 bg-white p-8 shadow-[0_20px_60px_rgba(105,64,25,0.08)]'>
          <form className='space-y-6' onSubmit={onSubmit}>
            <div className='grid gap-6'>
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <label className='text-sm font-semibold text-stone-700'>Logo cửa hàng *</label>
                  <button
                    type='button'
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className='inline-flex items-center rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60'
                  >
                    {logoUploading ? 'Đang tải...' : 'Upload từ máy'}
                  </button>
                </div>
                <input
                  type='url'
                  placeholder='https://example.com/logo.jpg'
                  {...mediaForm.register('logoUrl')}
                  className='w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-yellow-800 focus:outline-none'
                />
                <input
                  ref={logoInputRef}
                  type='file'
                  accept='image/png,image/jpeg,image/webp'
                  className='hidden'
                  onChange={(event) => handleImageUpload(event, 'logoUrl')}
                />
                {logoUploadError && <p className='text-sm text-rose-600'>{logoUploadError}</p>}
                {mediaForm.formState.errors.logoUrl && (
                  <p className='text-sm text-rose-600'>{mediaForm.formState.errors.logoUrl.message}</p>
                )}
                {logoUrlValue && (
                  <img src={logoUrlValue} alt='Logo preview' className='mt-3 h-24 w-24 rounded-2xl border border-stone-200 object-cover' />
                )}
              </div>

              <div className='space-y-2'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <label className='text-sm font-semibold text-stone-700'>Ảnh cover *</label>
                  <button
                    type='button'
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className='inline-flex items-center rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60'
                  >
                    {coverUploading ? 'Đang tải...' : 'Upload từ máy'}
                  </button>
                </div>
                <input
                  type='url'
                  placeholder='https://example.com/cover.jpg'
                  {...mediaForm.register('coverImageUrl')}
                  className='w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-yellow-800 focus:outline-none'
                />
                <input
                  ref={coverInputRef}
                  type='file'
                  accept='image/png,image/jpeg,image/webp'
                  className='hidden'
                  onChange={(event) => handleImageUpload(event, 'coverImageUrl')}
                />
                {coverUploadError && <p className='text-sm text-rose-600'>{coverUploadError}</p>}
                {mediaForm.formState.errors.coverImageUrl && (
                  <p className='text-sm text-rose-600'>{mediaForm.formState.errors.coverImageUrl.message}</p>
                )}
                {coverUrlValue && (
                  <img src={coverUrlValue} alt='Cover preview' className='mt-3 h-40 w-full rounded-2xl border border-stone-200 object-cover' />
                )}
              </div>
            </div>

            <section className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h3 className='text-sm font-semibold text-stone-900'>Nhà vận chuyển mặc định *</h3>
                <p className='text-xs text-stone-500'>Danh sách hiển thị tên nhà vận chuyển.</p>
              </div>
              {providersLoading ? (
                <div className='py-4 text-center text-stone-600'>Đang tải danh sách nhà vận chuyển...</div>
              ) : providers.length ? (
                <div className='space-y-2'>
                  {providers.map((provider: ShippingProvider) => (
                    <label
                      key={provider.providerId}
                      className='flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 transition hover:border-yellow-700/50 hover:bg-[#fffbf3]'
                    >
                      <input
                        type='radio'
                        {...mediaForm.register('defaultProvider')}
                        value={provider.providerId}
                        className='h-4 w-4 border-stone-300 text-yellow-900 focus:ring-yellow-800'
                      />
                      <span className='text-sm font-medium text-stone-900'>{provider.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className='rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 px-4 py-4 text-sm text-stone-500'>Không có nhà vận chuyển khả dụng.</p>
              )}
              {mediaForm.formState.errors.defaultProvider && (
                <p className='text-sm text-rose-600'>{mediaForm.formState.errors.defaultProvider.message}</p>
              )}
            </section>

            <div className='flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-6'>
              <button
                type='button'
                onClick={handleEditStepOne}
                className='text-sm font-semibold text-stone-500 transition hover:text-stone-800'
              >
                Quay lại bước 1
              </button>
              <button
                type='submit'
                disabled={isPending || logoUploading || coverUploading}
                className='inline-flex min-w-[160px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:opacity-100 bg-yellow-900 hover:bg-yellow-800'
              >
                {isPending ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
              </button>
            </div>
          </form>
        </div>

        <div className='w-full max-w-3xl rounded-2xl border border-yellow-100 bg-[#fff8eb] p-6'>
          <h3 className='mb-2 font-semibold text-yellow-900'>Lưu ý</h3>
          <ul className='list-inside list-disc space-y-1 text-sm text-yellow-900/80'>
            <li>Bạn có thể cập nhật thông tin cửa hàng sau khi hoàn tất đăng ký.</li>
            <li>Nhà vận chuyển mặc định sẽ áp dụng cho mọi đơn hàng mới.</li>
            <li>Ảnh rõ nét và chuyên nghiệp giúp tăng độ tin cậy cho thương hiệu.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
