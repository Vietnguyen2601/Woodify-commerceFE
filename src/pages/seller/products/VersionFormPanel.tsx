import React, { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { uploadImageToCloudinary } from '@/services/cloudinary.service'
import { productVersionService, imageService } from '@/services'
import type { ProductVersion } from '@/types'

// ── Schema ────────────────────────────────────────────────────────────────────
export const versionSchema = z.object({
  versionName: z.string().min(1, 'Tên phiên bản không được để trống'),
  sellerSku: z.string().min(1, 'Seller SKU không được để trống'),
  price: z.number().gt(0, 'Giá phải lớn hơn 0'),
  stockQuantity: z.number().int().min(0, 'Tồn kho không được âm'),
  woodType: z.string().min(1, 'Loại gỗ không được để trống'),
  weightGrams: z.number().min(0, 'Khối lượng không được âm'),
  lengthCm: z.number().min(0, 'Chiều dài không được âm'),
  widthCm: z.number().min(0, 'Chiều rộng không được âm'),
  heightCm: z.number().min(0, 'Chiều cao không được âm'),
  isActive: z.boolean(),
})
export type VersionFormData = z.infer<typeof versionSchema>

// ── Style tokens ───────────────────────────────────────────────────────────────
const inputBase =
  'h-9 w-full rounded border border-black/5 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-500 focus:border-yellow-800 focus:outline-none'
const inputError =
  'h-9 w-full rounded border border-rose-400 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-500 focus:border-rose-500 focus:outline-none'
const subtleLabel = 'text-[10px] font-medium leading-3 text-stone-900'
const helperText = 'text-[10px] leading-3 text-stone-600'
const sectionWrapper =
  'rounded-xl border border-yellow-800/20 bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.08)]'

// ── Props ──────────────────────────────────────────────────────────────────────
interface VersionFormPanelProps {
  productId: string
  versionNumber: number
  onSuccess: (version: ProductVersion) => void
  onCancel?: () => void
  submitLabel?: string
}

export function VersionFormPanel({
  productId,
  versionNumber,
  onSuccess,
  onCancel,
  submitLabel,
}: VersionFormPanelProps) {
  const versionImgRef = useRef<HTMLInputElement>(null)
  const [versionImgs, setVersionImgs] = useState<{ url: string; publicId: string }[]>([])
  const [versionImgUploading, setVersionImgUploading] = useState(false)
  const [versionImgError, setVersionImgError] = useState<string | null>(null)

  const form = useForm<VersionFormData>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      isActive: true,
      stockQuantity: 0,
      weightGrams: 0,
      lengthCm: 0,
      widthCm: 0,
      heightCm: 0,
    },
  })

  const createVersionMutation = useMutation({
    mutationFn: (data: VersionFormData) =>
      productVersionService.createVersion({
        productId,
        sellerSku: data.sellerSku,
        versionNumber,
        versionName: data.versionName,
        price: data.price,
        stockQuantity: data.stockQuantity,
        woodType: data.woodType,
        weightGrams: data.weightGrams,
        lengthCm: data.lengthCm,
        widthCm: data.widthCm,
        heightCm: data.heightCm,
        isActive: data.isActive,
      }),
    onSuccess: async (version) => {
      if (versionImgs.length > 0) {
        await imageService
          .saveBulk(
            versionImgs.map((img, idx) => ({
              imageType: 'PRODUCT_VERSION' as const,
              referenceId: version.versionId,
              originalUrl: img.url,
              publicId: img.publicId,
              sortOrder: idx,
            }))
          )
          .catch(() => {})
      }
      onSuccess(version)
    },
    onError: (err: any) => {
      form.setError('sellerSku', { message: err?.message || 'Tạo phiên bản thất bại' })
    },
  })

  const handleImgsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setVersionImgUploading(true)
    setVersionImgError(null)
    try {
      const uploads = await Promise.all(files.map((f) => uploadImageToCloudinary(f)))
      setVersionImgs((prev) => [
        ...prev,
        ...uploads.map((u) => ({ url: u.secureUrl, publicId: u.publicId })),
      ])
    } catch {
      setVersionImgError('Một số ảnh tải lên thất bại.')
    } finally {
      setVersionImgUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = form.handleSubmit((data) => createVersionMutation.mutate(data))

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* Version info */}
      <div className={sectionWrapper}>
        <div className='border-b border-yellow-800/20 px-5 py-4'>
          <p className='text-sm font-semibold'>Phiên bản sản phẩm (Version #{versionNumber})</p>
          <p className={helperText}>
            Định nghĩa thông tin bán hàng: giá, kho hàng và thông số kỹ thuật.
          </p>
        </div>
        <div className='space-y-4 px-5 py-6'>
          <label className='block space-y-1'>
            <span className={subtleLabel}>
              Tên phiên bản <span className='text-rose-600'>*</span>
            </span>
            <input
              type='text'
              placeholder='vd: Bàn sồi tiêu chuẩn 120cm'
              className={form.formState.errors.versionName ? inputError : inputBase}
              {...form.register('versionName')}
            />
            {form.formState.errors.versionName && (
              <p className='text-[10px] text-rose-600'>
                {form.formState.errors.versionName.message}
              </p>
            )}
          </label>

          <label className='block space-y-1'>
            <span className={subtleLabel}>
              Seller SKU <span className='text-rose-600'>*</span>
            </span>
            <input
              type='text'
              placeholder='vd: WS001-OAK-TABLE-120-001'
              className={`${form.formState.errors.sellerSku ? inputError : inputBase} font-mono`}
              {...form.register('sellerSku')}
            />
            {form.formState.errors.sellerSku ? (
              <p className='text-[10px] text-rose-600'>{form.formState.errors.sellerSku.message}</p>
            ) : (
              <p className={helperText}>
                Định dạng: &lt;SHOP&gt;-&lt;GỖ&gt;-&lt;LOẠI&gt;-&lt;KÍCH THƯỚC&gt;-&lt;STT&gt;
              </p>
            )}
          </label>

          <div className='grid grid-cols-2 gap-4'>
            <label className='block space-y-1'>
              <span className={subtleLabel}>
                Giá (VND) <span className='text-rose-600'>*</span>
              </span>
              <input
                type='number'
                min={0}
                placeholder='0'
                className={form.formState.errors.price ? inputError : inputBase}
                {...form.register('price', { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className='text-[10px] text-rose-600'>{form.formState.errors.price.message}</p>
              )}
            </label>
            <label className='block space-y-1'>
              <span className={subtleLabel}>
                Số lượng tồn kho <span className='text-rose-600'>*</span>
              </span>
              <input
                type='number'
                min={0}
                placeholder='0'
                className={
                  form.formState.errors.stockQuantity ? inputError : inputBase
                }
                {...form.register('stockQuantity', { valueAsNumber: true })}
              />
            </label>
          </div>

          <label className='block space-y-1'>
            <span className={subtleLabel}>
              Loại gỗ <span className='text-rose-600'>*</span>
            </span>
            <input
              type='text'
              placeholder='vd: Oak, Walnut, Pine...'
              className={form.formState.errors.woodType ? inputError : inputBase}
              {...form.register('woodType')}
            />
            {form.formState.errors.woodType && (
              <p className='text-[10px] text-rose-600'>
                {form.formState.errors.woodType.message}
              </p>
            )}
          </label>

          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <label className='block space-y-1'>
              <span className={subtleLabel}>Khối lượng (g)</span>
              <input
                type='number'
                min={0}
                placeholder='0'
                className={inputBase}
                {...form.register('weightGrams', { valueAsNumber: true })}
              />
            </label>
            <label className='block space-y-1'>
              <span className={subtleLabel}>Dài (cm)</span>
              <input
                type='number'
                min={0}
                placeholder='0'
                className={inputBase}
                {...form.register('lengthCm', { valueAsNumber: true })}
              />
            </label>
            <label className='block space-y-1'>
              <span className={subtleLabel}>Rộng (cm)</span>
              <input
                type='number'
                min={0}
                placeholder='0'
                className={inputBase}
                {...form.register('widthCm', { valueAsNumber: true })}
              />
            </label>
            <label className='block space-y-1'>
              <span className={subtleLabel}>Cao (cm)</span>
              <input
                type='number'
                min={0}
                placeholder='0'
                className={inputBase}
                {...form.register('heightCm', { valueAsNumber: true })}
              />
            </label>
          </div>

          {/* IsActive toggle */}
          <div className='flex items-center justify-between rounded-md bg-orange-100/50 px-4 py-3'>
            <div>
              <p className={subtleLabel}>Kích hoạt phiên bản</p>
              <p className={helperText}>Phiên bản cần Active để có thể gửi duyệt</p>
            </div>
            <button
              type='button'
              role='switch'
              aria-checked={form.watch('isActive')}
              onClick={() => form.setValue('isActive', !form.watch('isActive'))}
              className={`relative h-5 w-9 rounded-full border transition-colors ${
                form.watch('isActive')
                  ? 'border-yellow-800 bg-yellow-800'
                  : 'border-yellow-800/30 bg-white'
              }`}
            >
              <span
                className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow transition-transform ${
                  form.watch('isActive') ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Version images */}
      <div className={sectionWrapper}>
        <div className='border-b border-yellow-800/20 px-5 py-4'>
          <p className='text-sm font-semibold'>Ảnh phiên bản (tối đa 5 ảnh)</p>
          <p className={helperText}>
            Ảnh thực tế của phiên bản này (màu sắc, kích thước, góc nhìn khác nhau)
          </p>
        </div>
        <div className='space-y-3 px-5 py-6'>
          <input
            ref={versionImgRef}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={handleImgsUpload}
          />
          {versionImgs.length > 0 && (
            <div className='flex flex-wrap gap-3'>
              {versionImgs.map((img, idx) => (
                <div key={idx} className='relative'>
                  <img
                    src={img.url}
                    alt={`version-img-${idx}`}
                    className='h-20 w-20 rounded-lg border border-yellow-800/20 object-cover'
                  />
                  <button
                    type='button'
                    onClick={() => setVersionImgs((prev) => prev.filter((_, i) => i !== idx))}
                    className='absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px]'
                  >
                    ✕
                  </button>
                  {idx === 0 && (
                    <span className='absolute bottom-0.5 left-0.5 rounded bg-yellow-800 px-1 text-[8px] text-white'>
                      Chính
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {versionImgs.length < 5 && (
            <button
              type='button'
              onClick={() => versionImgRef.current?.click()}
              disabled={versionImgUploading}
              className='flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-yellow-800/30 text-center text-[10px] text-stone-600 hover:border-yellow-800/60 disabled:opacity-60'
            >
              <svg
                className='h-6 w-6'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
              >
                <path
                  d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <polyline points='17 8 12 3 7 8' strokeLinecap='round' strokeLinejoin='round' />
                <line x1='12' y1='3' x2='12' y2='15' strokeLinecap='round' />
              </svg>
              {versionImgUploading ? 'Đang tải lên...' : `Thêm ảnh (${versionImgs.length}/5)`}
            </button>
          )}
          {versionImgError && <p className='text-[10px] text-rose-600'>{versionImgError}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center justify-between'>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            className='inline-flex items-center gap-2 rounded border border-yellow-800/20 bg-stone-100 px-4 py-2 text-xs font-medium'
          >
            Hủy
          </button>
        )}
        <button
          type='submit'
          disabled={createVersionMutation.isPending}
          className='ml-auto rounded bg-yellow-800 px-6 py-2 text-xs font-medium text-white disabled:opacity-60'
        >
          {createVersionMutation.isPending
            ? 'Đang tạo phiên bản...'
            : (submitLabel ?? 'Tạo phiên bản')}
        </button>
      </div>
    </form>
  )
}
