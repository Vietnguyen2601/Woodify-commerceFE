import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { providerService, shopService } from '@/services'
import { ROUTES } from '@/constants/routes'
import { uploadImageToCloudinary } from '@/services/cloudinary.service'
import { useShopStore } from '@/store/shopStore'
import type { ShippingProvider, UpdateShopInfoPayload } from '@/types'

const formSchema = z.object({
  name: z.string().min(1, 'Nhập tên shop'),
  description: z.string(),
  logoUrl: z
    .string()
    .refine((s) => s.trim() === '' || /^https?:\/\/.+/i.test(s), 'Logo phải là URL hợp lệ (http/https)'),
  coverImageUrl: z
    .string()
    .refine((s) => s.trim() === '' || /^https?:\/\/.+/i.test(s), 'Cover phải là URL hợp lệ (http/https)'),
  defaultPickupAddress: z.string().min(1, 'Nhập địa chỉ lấy hàng'),
  defaultProvider: z.string().min(1, 'Chọn nhà vận chuyển mặc định'),
})

type ShopProfileForm = z.infer<typeof formSchema>

export default function ShopProfile() {
  const shop = useShopStore((s) => s.shop)
  const setShop = useShopStore((s) => s.setShop)
  const shopId = shop?.shopId ?? ''
  const [banner, setBanner] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const [logoUploading, setLogoUploading] = React.useState(false)
  const [coverUploading, setCoverUploading] = React.useState(false)

  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['shipping-providers', 'list'],
    queryFn: () => providerService.getAllProviders(),
    staleTime: 5 * 60 * 1000,
  })
  const providers: ShippingProvider[] = providersData?.filter((p) => p.isActive !== false) ?? []

  const form = useForm<ShopProfileForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
      coverImageUrl: '',
      defaultPickupAddress: '',
      defaultProvider: '',
    },
  })

  React.useEffect(() => {
    if (!shop) return
    form.reset({
      name: shop.name ?? '',
      description: shop.description ?? '',
      logoUrl: shop.logoUrl ?? '',
      coverImageUrl: shop.coverImageUrl ?? '',
      defaultPickupAddress: shop.defaultPickupAddress ?? '',
      defaultProvider: shop.defaultProvider ?? '',
    })
  }, [shop, form])

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateShopInfoPayload) => shopService.updateShopInfo(shopId, payload),
    onSuccess: (updated) => {
      setShop(updated)
      setBanner({ type: 'ok', text: 'Đã lưu hồ sơ shop.' })
    },
    onError: (e: unknown) => {
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message: string }).message)
          : 'Không thể cập nhật. Vui lòng thử lại.'
      setBanner({ type: 'err', text: msg })
    },
  })

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'coverImageUrl'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    const setUploading = field === 'logoUrl' ? setLogoUploading : setCoverUploading
    setUploading(true)
    try {
      const result = await uploadImageToCloudinary(file)
      form.setValue(field, result.secureUrl, { shouldValidate: true, shouldDirty: true })
      setBanner(null)
    } catch {
      setBanner({ type: 'err', text: 'Tải ảnh lên thất bại.' })
    } finally {
      setUploading(false)
      if (event.target) event.target.value = ''
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    setBanner(null)
    const payload: UpdateShopInfoPayload = {
      name: values.name.trim(),
      description: values.description.trim(),
      logoUrl: values.logoUrl.trim(),
      coverImageUrl: values.coverImageUrl.trim(),
      defaultPickupAddress: values.defaultPickupAddress.trim(),
      defaultProvider: values.defaultProvider.trim(),
    }
    updateMutation.mutate(payload)
  })

  const handleResetToCurrent = () => {
    if (!shop) return
    form.reset({
      name: shop.name ?? '',
      description: shop.description ?? '',
      logoUrl: shop.logoUrl ?? '',
      coverImageUrl: shop.coverImageUrl ?? '',
      defaultPickupAddress: shop.defaultPickupAddress ?? '',
      defaultProvider: shop.defaultProvider ?? '',
    })
    setBanner(null)
  }

  const logoUrl = form.watch('logoUrl')
  const coverUrl = form.watch('coverImageUrl')

  if (!shopId || !shop) {
    return (
      <div className='rounded-2xl border border-amber-900/20 bg-white p-6 text-sm text-stone-600'>
        Không tìm thấy shop. Vui lòng đăng nhập lại hoặc hoàn tất đăng ký shop.
      </div>
    )
  }

  return (
    <div className='seller-page'>
      <header className='seller-page__header'>
        <div>
          <p className='seller-page__eyebrow'>Hồ sơ shop</p>
          <h2>Cập nhật thông tin thương hiệu</h2>
          <p className='mt-1 text-sm text-stone-600'>
            Dữ liệu hiển thị theo hồ sơ hiện tại; chỉnh sửa và bấm Lưu để gửi lên server (PATCH UpdateShopInfo).
          </p>
        </div>
        <Link
          to={ROUTES.SHOP(shop.shopId, shop.name)}
          className='rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50'
        >
          Xem shop công khai
        </Link>
      </header>

      {banner && (
        <div
          role='status'
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            banner.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {banner.text}
        </div>
      )}

      <form className='seller-form max-w-3xl space-y-5' onSubmit={onSubmit}>
        <label className='flex flex-col gap-1'>
          <span className='text-sm font-semibold text-stone-800'>Tên shop *</span>
          <input
            type='text'
            className='rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-amber-800 focus:outline-none'
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <span className='text-xs text-rose-600'>{form.formState.errors.name.message}</span>
          )}
        </label>

        <label className='flex flex-col gap-1'>
          <span className='text-sm font-semibold text-stone-800'>Mô tả</span>
          <textarea
            rows={4}
            className='rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-amber-800 focus:outline-none'
            {...form.register('description')}
          />
        </label>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-sm font-semibold text-stone-800'>Logo (URL hoặc upload)</span>
              <button
                type='button'
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className='rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50'
              >
                {logoUploading ? 'Đang tải…' : 'Upload'}
              </button>
            </div>
            <input
              type='url'
              placeholder='https://...'
              className='w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm'
              {...form.register('logoUrl')}
            />
            <input
              ref={logoInputRef}
              type='file'
              accept='image/png,image/jpeg,image/webp'
              className='hidden'
              onChange={(e) => void handleImageUpload(e, 'logoUrl')}
            />
            {form.formState.errors.logoUrl && (
              <span className='text-xs text-rose-600'>{form.formState.errors.logoUrl.message}</span>
            )}
            {logoUrl?.trim() ? (
              <img src={logoUrl.trim()} alt='Logo' className='mt-2 h-20 w-20 rounded-xl border border-stone-200 object-cover' />
            ) : null}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-sm font-semibold text-stone-800'>Ảnh bìa (URL hoặc upload)</span>
              <button
                type='button'
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className='rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50'
              >
                {coverUploading ? 'Đang tải…' : 'Upload'}
              </button>
            </div>
            <input
              type='url'
              placeholder='https://...'
              className='w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm'
              {...form.register('coverImageUrl')}
            />
            <input
              ref={coverInputRef}
              type='file'
              accept='image/png,image/jpeg,image/webp'
              className='hidden'
              onChange={(e) => void handleImageUpload(e, 'coverImageUrl')}
            />
            {form.formState.errors.coverImageUrl && (
              <span className='text-xs text-rose-600'>{form.formState.errors.coverImageUrl.message}</span>
            )}
            {coverUrl?.trim() ? (
              <img
                src={coverUrl.trim()}
                alt='Cover'
                className='mt-2 h-24 w-full rounded-xl border border-stone-200 object-cover'
              />
            ) : null}
          </div>
        </div>

        <label className='flex flex-col gap-1'>
          <span className='text-sm font-semibold text-stone-800'>Địa chỉ lấy hàng (kho) *</span>
          <input
            type='text'
            className='rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-amber-800 focus:outline-none'
            {...form.register('defaultPickupAddress')}
          />
          {form.formState.errors.defaultPickupAddress && (
            <span className='text-xs text-rose-600'>{form.formState.errors.defaultPickupAddress.message}</span>
          )}
        </label>

        <div className='space-y-2'>
          <span className='text-sm font-semibold text-stone-800'>Nhà vận chuyển mặc định *</span>
          {providersLoading ? (
            <p className='text-sm text-stone-500'>Đang tải danh sách nhà vận chuyển…</p>
          ) : (
            <select
              className='w-full max-w-md rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 focus:border-amber-800 focus:outline-none'
              {...form.register('defaultProvider')}
            >
              <option value=''>— Chọn nhà vận chuyển —</option>
              {providers.map((p) => (
                <option key={p.providerId} value={p.providerId}>
                  {p.name}
                  {p.supportPhone ? ` (${p.supportPhone})` : ''}
                </option>
              ))}
            </select>
          )}
          {form.formState.errors.defaultProvider && (
            <span className='text-xs text-rose-600'>{form.formState.errors.defaultProvider.message}</span>
          )}
          {providers.length === 0 && !providersLoading ? (
            <p className='text-xs text-amber-800'>Chưa có nhà vận chuyển khả dụng. Liên hệ quản trị hệ thống.</p>
          ) : null}
        </div>

        <div className='seller-form__actions flex flex-wrap gap-3 pt-2'>
          <button
            type='button'
            onClick={handleResetToCurrent}
            className='rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50'
          >
            Hoàn tác (khôi phục dữ liệu đang lưu trên server)
          </button>
          <button
            type='submit'
            disabled={updateMutation.isPending || logoUploading || coverUploading}
            className='seller-page__primary rounded-xl px-6 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
          >
            {updateMutation.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}
