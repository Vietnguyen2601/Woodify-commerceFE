import React, { useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CategoryTreeSelect } from '@/components/forms/CategoryTreeSelect'
import { uploadImageToCloudinary } from '@/services/cloudinary.service'
import { productMasterService, productVersionService, imageService, categoryService } from '@/services'
import { useShopStore } from '@/store/shopStore'
import { ROUTES } from '@/constants/routes'
import type { CategoryDTO, ProductMaster, ProductVersion } from '@/types'

// ── Schemas ────────────────────────────────────────────────────────────────────
const masterSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
})
type MasterFormData = z.infer<typeof masterSchema>

const versionSchema = z.object({
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
type VersionFormData = z.infer<typeof versionSchema>

const sectionWrapper = 'rounded-xl border border-yellow-800/20 bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.08)]'

const inputBase =
  'h-9 w-full rounded border border-black/5 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-500 focus:border-yellow-800 focus:outline-none'

const inputError =
  'h-9 w-full rounded border border-rose-400 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-500 focus:border-rose-500 focus:outline-none'

const subtleLabel = 'text-[10px] font-medium leading-3 text-stone-900'

const helperText = 'text-[10px] leading-3 text-stone-600'

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AddProduct() {
  const navigate = useNavigate()
  const { shop } = useShopStore()

  // wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [createdMaster, setCreatedMaster] = useState<ProductMaster | null>(null)
  const [createdVersion, setCreatedVersion] = useState<ProductVersion | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  // master thumbnail
  const masterImgRef = useRef<HTMLInputElement>(null)
  const [masterImgUploading, setMasterImgUploading] = useState(false)
  const [masterImgUrl, setMasterImgUrl] = useState<string | null>(null)
  const [masterImgError, setMasterImgError] = useState<string | null>(null)

  // version images (multi)
  const versionImgRef = useRef<HTMLInputElement>(null)
  const [versionImgs, setVersionImgs] = useState<{ url: string; publicId: string }[]>([])
  const [versionImgUploading, setVersionImgUploading] = useState(false)
  const [versionImgError, setVersionImgError] = useState<string | null>(null)

  // forms
  const masterForm = useForm<MasterFormData>({ resolver: zodResolver(masterSchema) })
  const versionForm = useForm<VersionFormData>({
    resolver: zodResolver(versionSchema),
    defaultValues: { isActive: true, stockQuantity: 0, weightGrams: 0, lengthCm: 0, widthCm: 0, heightCm: 0 },
  })

  // ── Load categories ──────────────────────────────────────────────────────────
  const { data: categoriesData = [] } = useQuery<CategoryDTO[]>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const response = await categoryService.getAllCategories()
      // interceptor already unwraps response.data, so this returns CategoryDTO[]
      return Array.isArray(response) ? response : []
    },
  })

  // ── API mutations ────────────────────────────────────────────────────────────
  const createMasterMutation = useMutation({
    mutationFn: (data: MasterFormData) =>
      productMasterService.createProduct({
        shopId: shop!.shopId,
        categoryId: selectedCategory!.categoryId,
        name: data.name,
        description: data.description,
      }),
    onSuccess: async (master) => {
      setCreatedMaster(master)
      // save master thumbnail if uploaded
      if (masterImgUrl) {
        await imageService.save({
          imageType: 'PRODUCT',
          referenceId: master.productId,
          originalUrl: masterImgUrl,
          sortOrder: 0,
        }).catch(() => {})
      }
      setStep(2)
    },
    onError: (err: any) => {
      masterForm.setError('name', { message: err?.message || 'Tạo sản phẩm thất bại' })
    },
  })

  const createVersionMutation = useMutation({
    mutationFn: (data: VersionFormData) =>
      productVersionService.createVersion({
        productId: createdMaster!.productId,
        sellerSku: data.sellerSku,
        versionNumber: 1,
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
      setCreatedVersion(version)
      // save version images in bulk
      if (versionImgs.length > 0) {
        await imageService.saveBulk(
          versionImgs.map((img, idx) => ({
            imageType: 'PRODUCT_VERSION' as const,
            referenceId: version.versionId,
            originalUrl: img.url,
            publicId: img.publicId,
            sortOrder: idx,
          }))
        ).catch(() => {})
      }
      setStep(3)
    },
    onError: (err: any) => {
      versionForm.setError('sellerSku', { message: err?.message || 'Tạo phiên bản thất bại' })
    },
  })

  const submitApprovalMutation = useMutation({
    mutationFn: () => productMasterService.submitForApproval(createdMaster!.productId),
    onSuccess: () => {
      navigate(ROUTES.SELLER_PRODUCTS)
    },
    onError: (err: any) => {
      alert(`Gửi duyệt thất bại: ${err?.message || 'Lỗi không xác định'}`)
    },
  })

  // ── Image upload handlers ────────────────────────────────────────────────────
  const handleMasterImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMasterImgUploading(true)
    setMasterImgError(null)
    try {
      const res = await uploadImageToCloudinary(file)
      setMasterImgUrl(res.secureUrl)
    } catch {
      setMasterImgError('Tải ảnh thất bại. Vui lòng thử lại.')
    } finally {
      setMasterImgUploading(false)
      e.target.value = ''
    }
  }

  const handleVersionImgsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setVersionImgUploading(true)
    setVersionImgError(null)
    try {
      const uploads = await Promise.all(files.map((f) => uploadImageToCloudinary(f)))
      setVersionImgs((prev) => [...prev, ...uploads.map((u) => ({ url: u.secureUrl, publicId: u.publicId }))])
    } catch {
      setVersionImgError('Một số ảnh tải lên thất bại.')
    } finally {
      setVersionImgUploading(false)
      e.target.value = ''
    }
  }

  const removeVersionImg = (idx: number) => {
    setVersionImgs((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Step submit handlers ────────────────────────────────────────────────────
  const handleMasterSubmit = masterForm.handleSubmit((data) => {
    if (!selectedCategory) {
      setCategoryError('Vui lòng chọn danh mục')
      return
    }
    setCategoryError(null)
    createMasterMutation.mutate(data)
  })

  const handleVersionSubmit = versionForm.handleSubmit((data) => {
    createVersionMutation.mutate(data)
  })

  if (!shop) return null

  return (
    <div className="min-h-screen bg-stone-100 font-['Arimo'] text-stone-900">
      <div className='mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10'>

        {/* ── STEP 1: Product Master ─────────────────────────────────────────── */}
        {step === 1 && (
          <section className='space-y-5'>
            <PageHeader onBack={() => navigate(ROUTES.SELLER_PRODUCTS)} />
            <StepIndicator step={step} />
            <form onSubmit={handleMasterSubmit} className='space-y-5'>
              <div className={sectionWrapper}>
                <div className='border-b border-yellow-800/20 px-5 py-4'>
                  <p className='text-sm font-semibold'>Thông tin sản phẩm chính</p>
                  <p className={helperText}>Định nghĩa sản phẩm tổng quát. Giá và SKU sẽ nằm trong phiên bản.</p>
                </div>
                <div className='space-y-4 px-5 py-6'>
                  {/* Name */}
                  <label className='block space-y-1'>
                    <span className={subtleLabel}>Tên sản phẩm <span className='text-rose-600'>*</span></span>
                    <input
                      type='text'
                      placeholder='vd: Bàn ăn gỗ sồi'
                      className={masterForm.formState.errors.name ? inputError : inputBase}
                      {...masterForm.register('name')}
                    />
                    {masterForm.formState.errors.name && (
                      <p className='text-[10px] text-rose-600'>{masterForm.formState.errors.name.message}</p>
                    )}
                  </label>
                  {/* Category */}
                  <div className='space-y-1'>
                    <span className={subtleLabel}>Danh mục <span className='text-rose-600'>*</span></span>
                    <CategoryTreeSelect
                      value={selectedCategory}
                      onChange={(cat) => { setSelectedCategory(cat); setCategoryError(null) }}
                      placeholder='Tìm kiếm danh mục...'
                    />
                    {categoryError && <p className='text-[10px] text-rose-600'>{categoryError}</p>}
                    <p className={helperText}>Chọn danh mục cụ thể nhất phù hợp với sản phẩm.</p>
                    
                    {/* Category list */}
                    {categoriesData.length > 0 && (
                      <div className='mt-3 space-y-2'>
                        <p className='text-[10px] font-medium text-stone-700'>Danh mục phổ biến:</p>
                        <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
                          {categoriesData.slice(0, 6).map((cat: CategoryDTO) => {
                            const isActive = selectedCategory?.categoryId === cat.categoryId
                            return (
                              <button
                                key={cat.categoryId}
                                type='button'
                                onClick={() => { setSelectedCategory(cat); setCategoryError(null) }}
                                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                                  isActive
                                    ? 'border-yellow-800 bg-yellow-50 text-yellow-900'
                                    : 'border-yellow-800/20 text-stone-600 hover:border-yellow-800/40 hover:bg-yellow-50/50'
                                }`}
                              >
                                <p className='truncate font-medium'>{cat.name}</p>
                                {cat.description && <p className='truncate text-[9px] opacity-70'>{cat.description}</p>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Description */}
                  <label className='block space-y-1'>
                    <span className={subtleLabel}>Mô tả sản phẩm <span className='text-rose-600'>*</span></span>
                    <textarea
                      rows={4}
                      placeholder='Mô tả chi tiết sản phẩm của bạn...'
                      className={`${masterForm.formState.errors.description ? inputError : inputBase} min-h-[96px] resize-none`}
                      {...masterForm.register('description')}
                    />
                    {masterForm.formState.errors.description && (
                      <p className='text-[10px] text-rose-600'>{masterForm.formState.errors.description.message}</p>
                    )}
                  </label>
                  {/* Thumbnail */}
                  <div className='space-y-1'>
                    <span className={subtleLabel}>Ảnh đại diện sản phẩm (1 ảnh)</span>
                    <input ref={masterImgRef} type='file' accept='image/*' className='hidden' onChange={handleMasterImgUpload} />
                    {masterImgUrl ? (
                      <div className='relative inline-block'>
                        <img src={masterImgUrl} alt='thumbnail' className='h-32 w-32 rounded-lg border border-yellow-800/20 object-cover' />
                        <button
                          type='button'
                          onClick={() => setMasterImgUrl(null)}
                          className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px]'
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        type='button'
                        onClick={() => masterImgRef.current?.click()}
                        disabled={masterImgUploading}
                        className='flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-yellow-800/30 text-center text-[10px] text-stone-600 hover:border-yellow-800/60 disabled:opacity-60'
                      >
                        <UploadIcon className='h-6 w-6' />
                        {masterImgUploading ? 'Đang tải lên...' : 'Nhấn để chọn ảnh (JPG, PNG, tối đa 10MB)'}
                      </button>
                    )}
                    {masterImgError && <p className='text-[10px] text-rose-600'>{masterImgError}</p>}
                  </div>
                  {/* Status indicator */}
                  <div className='flex items-center justify-between rounded-md bg-orange-100/60 px-4 py-3'>
                    <div>
                      <p className={subtleLabel}>Trạng thái</p>
                      <p className={helperText}>Sản phẩm mới được tạo ở trạng thái nháp</p>
                    </div>
                    <span className='rounded border border-yellow-800/20 bg-orange-100 px-3 py-1 text-[10px] font-semibold'>DRAFT</span>
                  </div>
                </div>
              </div>
              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={createMasterMutation.isPending}
                  className='inline-flex items-center justify-center gap-2 rounded bg-yellow-800 px-6 py-2 text-xs font-medium text-white disabled:opacity-60'
                >
                  {createMasterMutation.isPending ? 'Đang tạo...' : 'Tiếp theo: Tạo phiên bản'}
                  <ArrowRightIcon className='h-3 w-3 text-white' />
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── STEP 2: Product Version ──────────────────────────────────────────── */}
        {step === 2 && createdMaster && (
          <section className='space-y-5'>
            <PageHeader onBack={() => navigate(ROUTES.SELLER_PRODUCTS)} />
            <StepIndicator step={step} />
            {/* Master summary strip */}
            <div className='flex items-center gap-3 rounded-xl border border-yellow-800/20 bg-white px-5 py-3 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]'>
              {masterImgUrl
                ? <img src={masterImgUrl} alt={createdMaster.name} className='h-10 w-10 rounded border border-yellow-800/10 object-cover' />
                : <div className='h-10 w-10 rounded border border-yellow-800/10 bg-orange-100' />
              }
              <div>
                <p className='text-xs font-semibold text-stone-900'>{createdMaster.name}</p>
                <p className='text-[10px] text-stone-500'>{createdMaster.categoryName} · SKU: {createdMaster.globalSku}</p>
              </div>
              <span className='ml-auto rounded border border-yellow-800/20 bg-orange-100 px-2 py-0.5 text-[10px] font-semibold'>DRAFT</span>
            </div>
            <form onSubmit={handleVersionSubmit} className='space-y-5'>
              {/* Version info */}
              <div className={sectionWrapper}>
                <div className='border-b border-yellow-800/20 px-5 py-4'>
                  <p className='text-sm font-semibold'>Phiên bản sản phẩm (Version #1)</p>
                  <p className={helperText}>Định nghĩa thông tin bán hàng: giá, kho hàng và thông số kỹ thuật.</p>
                </div>
                <div className='space-y-4 px-5 py-6'>
                  <label className='block space-y-1'>
                    <span className={subtleLabel}>Tên phiên bản <span className='text-rose-600'>*</span></span>
                    <input
                      type='text'
                      placeholder='vd: Bàn sồi tiêu chuẩn 120cm'
                      className={versionForm.formState.errors.versionName ? inputError : inputBase}
                      {...versionForm.register('versionName')}
                    />
                    {versionForm.formState.errors.versionName && (
                      <p className='text-[10px] text-rose-600'>{versionForm.formState.errors.versionName.message}</p>
                    )}
                  </label>
                  <label className='block space-y-1'>
                    <span className={subtleLabel}>Seller SKU <span className='text-rose-600'>*</span></span>
                    <input
                      type='text'
                      placeholder='vd: WS001-OAK-TABLE-120-001'
                      className={`${versionForm.formState.errors.sellerSku ? inputError : inputBase} font-mono`}
                      {...versionForm.register('sellerSku')}
                    />
                    {versionForm.formState.errors.sellerSku
                      ? <p className='text-[10px] text-rose-600'>{versionForm.formState.errors.sellerSku.message}</p>
                      : <p className={helperText}>Định dạng: &lt;SHOP&gt;-&lt;GỖ&gt;-&lt;LOẠI&gt;-&lt;KÍCH THƯỚC&gt;-&lt;STT&gt;</p>
                    }
                  </label>
                  <div className='grid grid-cols-2 gap-4'>
                    <label className='block space-y-1'>
                      <span className={subtleLabel}>Giá (VND) <span className='text-rose-600'>*</span></span>
                      <input
                        type='number'
                        min={0}
                        placeholder='0'
                        className={versionForm.formState.errors.price ? inputError : inputBase}
                        {...versionForm.register('price', { valueAsNumber: true })}
                      />
                      {versionForm.formState.errors.price && (
                        <p className='text-[10px] text-rose-600'>{versionForm.formState.errors.price.message}</p>
                      )}
                    </label>
                    <label className='block space-y-1'>
                      <span className={subtleLabel}>Số lượng tồn kho <span className='text-rose-600'>*</span></span>
                      <input
                        type='number'
                        min={0}
                        placeholder='0'
                        className={versionForm.formState.errors.stockQuantity ? inputError : inputBase}
                        {...versionForm.register('stockQuantity', { valueAsNumber: true })}
                      />
                    </label>
                  </div>
                  <label className='block space-y-1'>
                    <span className={subtleLabel}>Loại gỗ <span className='text-rose-600'>*</span></span>
                    <input
                      type='text'
                      placeholder='vd: Oak, Walnut, Pine...'
                      className={versionForm.formState.errors.woodType ? inputError : inputBase}
                      {...versionForm.register('woodType')}
                    />
                    {versionForm.formState.errors.woodType && (
                      <p className='text-[10px] text-rose-600'>{versionForm.formState.errors.woodType.message}</p>
                    )}
                  </label>
                  <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <label className='block space-y-1'>
                      <span className={subtleLabel}>Khối lượng (g)</span>
                      <input type='number' min={0} placeholder='0' className={inputBase} {...versionForm.register('weightGrams', { valueAsNumber: true })} />
                    </label>
                    <label className='block space-y-1'>
                      <span className={subtleLabel}>Dài (cm)</span>
                      <input type='number' min={0} placeholder='0' className={inputBase} {...versionForm.register('lengthCm', { valueAsNumber: true })} />
                    </label>
                    <label className='block space-y-1'>
                      <span className={subtleLabel}>Rộng (cm)</span>
                      <input type='number' min={0} placeholder='0' className={inputBase} {...versionForm.register('widthCm', { valueAsNumber: true })} />
                    </label>
                    <label className='block space-y-1'>
                      <span className={subtleLabel}>Cao (cm)</span>
                      <input type='number' min={0} placeholder='0' className={inputBase} {...versionForm.register('heightCm', { valueAsNumber: true })} />
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
                      aria-checked={versionForm.watch('isActive')}
                      onClick={() => versionForm.setValue('isActive', !versionForm.watch('isActive'))}
                      className={`relative h-5 w-9 rounded-full border transition-colors ${versionForm.watch('isActive') ? 'border-yellow-800 bg-yellow-800' : 'border-yellow-800/30 bg-white'}`}
                    >
                      <span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow transition-transform ${versionForm.watch('isActive') ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Version images */}
              <div className={sectionWrapper}>
                <div className='border-b border-yellow-800/20 px-5 py-4'>
                  <p className='text-sm font-semibold'>Ảnh phiên bản (tối đa 5 ảnh)</p>
                  <p className={helperText}>Ảnh thực tế của phiên bản này (màu sắc, kích thước, góc nhìn khác nhau)</p>
                </div>
                <div className='space-y-3 px-5 py-6'>
                  <input ref={versionImgRef} type='file' accept='image/*' multiple className='hidden' onChange={handleVersionImgsUpload} />
                  {versionImgs.length > 0 && (
                    <div className='flex flex-wrap gap-3'>
                      {versionImgs.map((img, idx) => (
                        <div key={idx} className='relative'>
                          <img src={img.url} alt={`version-img-${idx}`} className='h-20 w-20 rounded-lg border border-yellow-800/20 object-cover' />
                          <button
                            type='button'
                            onClick={() => removeVersionImg(idx)}
                            className='absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px]'
                          >✕</button>
                          {idx === 0 && (
                            <span className='absolute bottom-0.5 left-0.5 rounded bg-yellow-800 px-1 text-[8px] text-white'>Chính</span>
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
                      <UploadIcon className='h-6 w-6' />
                      {versionImgUploading ? 'Đang tải lên...' : `Thêm ảnh (${versionImgs.length}/5)`}
                    </button>
                  )}
                  {versionImgError && <p className='text-[10px] text-rose-600'>{versionImgError}</p>}
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <button
                  type='button'
                  disabled={createMasterMutation.isPending}
                  className='inline-flex items-center gap-2 rounded border border-yellow-800/20 bg-stone-100 px-4 py-2 text-xs font-medium disabled:opacity-60'
                  onClick={() => setStep(1)}
                >
                  <ArrowLeftIcon className='h-3 w-3' />
                  Quay lại
                </button>
                <button
                  type='submit'
                  disabled={createVersionMutation.isPending}
                  className='rounded bg-yellow-800 px-6 py-2 text-xs font-medium text-white disabled:opacity-60'
                >
                  {createVersionMutation.isPending ? 'Đang tạo phiên bản...' : 'Tạo phiên bản & Tiếp theo'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── STEP 3: Review & Submit ───────────────────────────────────────────── */}
        {step === 3 && createdMaster && createdVersion && (
          <section className='space-y-5'>
            <PageHeader onBack={() => navigate(ROUTES.SELLER_PRODUCTS)} />
            <StepIndicator step={step} />
            {/* Summary card */}
            <div className={sectionWrapper}>
              <div className='border-b border-yellow-800/20 px-5 py-4'>
                <p className='text-sm font-semibold'>Tóm tắt sản phẩm đã tạo</p>
              </div>
              <div className='space-y-5 px-5 py-6'>
                <div className='flex gap-4'>
                  {masterImgUrl
                    ? <img src={masterImgUrl} alt={createdMaster.name} className='h-20 w-20 flex-shrink-0 rounded-lg border border-yellow-800/20 object-cover' />
                    : <div className='h-20 w-20 flex-shrink-0 rounded-lg border border-yellow-800/20 bg-orange-100' />
                  }
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold'>{createdMaster.name}</p>
                    <p className='text-[10px] text-stone-500'>{createdMaster.categoryName}</p>
                    <p className='text-[10px] font-mono text-stone-400'>SKU: {createdMaster.globalSku}</p>
                    <p className='text-[10px] text-stone-600 line-clamp-2'>{createdMaster.description}</p>
                  </div>
                </div>
                <div className='rounded-md border border-yellow-800/10 bg-orange-50 px-4 py-3'>
                  <div className='grid grid-cols-2 gap-3 text-[10px] md:grid-cols-4'>
                    <div>
                      <p className='text-stone-500'>Phiên bản</p>
                      <p className='font-semibold text-stone-900'>{createdVersion.versionName}</p>
                    </div>
                    <div>
                      <p className='text-stone-500'>Giá</p>
                      <p className='font-semibold text-stone-900'>{createdVersion.price.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div>
                      <p className='text-stone-500'>Tồn kho</p>
                      <p className='font-semibold text-stone-900'>{createdVersion.stockQuantity}</p>
                    </div>
                    <div>
                      <p className='text-stone-500'>Loại gỗ</p>
                      <p className='font-semibold text-stone-900'>{createdVersion.woodType}</p>
                    </div>
                  </div>
                </div>
                {versionImgs.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {versionImgs.map((img, idx) => (
                      <img key={idx} src={img.url} alt={`v-img-${idx}`} className='h-14 w-14 rounded-md border border-yellow-800/20 object-cover' />
                    ))}
                  </div>
                )}
                <div className='flex items-center justify-between rounded-md bg-orange-100/60 px-4 py-3'>
                  <div>
                    <p className={subtleLabel}>Trạng thái hiện tại</p>
                    <p className={helperText}>Sản phẩm đang ở trạng thái DRAFT</p>
                  </div>
                  <StatusBadge status={createdMaster.status} />
                </div>
              </div>
            </div>
            {/* Submit info box */}
            <div className='rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-[11px] text-amber-800'>
              <p className='font-semibold'>Gửi sản phẩm để Admin duyệt</p>
              <p className='mt-1'>Sau khi gửi, sản phẩm sẽ chuyển sang trạng thái <strong>PENDING_APPROVAL</strong>. Admin sẽ xem xét và phê duyệt trước khi sản phẩm được đăng lên sàn.</p>
            </div>
            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={() => navigate(ROUTES.SELLER_PRODUCTS)}
                className='rounded border border-yellow-800/20 bg-stone-100 px-5 py-2 text-xs font-medium'
              >
                Lưu nháp & Thoát
              </button>
              <button
                type='button'
                disabled={submitApprovalMutation.isPending}
                onClick={() => submitApprovalMutation.mutate()}
                className='rounded bg-amber-700 px-6 py-2 text-xs font-medium text-white disabled:opacity-60'
              >
                {submitApprovalMutation.isPending ? 'Đang gửi...' : 'Gửi Admin duyệt →'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <p className='text-xl font-bold leading-6'>Tạo sản phẩm mới</p>
        <p className='text-[10px] leading-3 text-stone-600'>Thêm sản phẩm gỗ mới vào cửa hàng của bạn</p>
      </div>
      <button
        type='button'
        onClick={onBack}
        className='inline-flex items-center gap-2 rounded border border-yellow-800/20 bg-stone-100 px-3 py-1.5 text-xs font-medium'
      >
        <ArrowLeftIcon className='h-3 w-3 text-stone-900' />
        Danh sách sản phẩm
      </button>
    </div>
  )
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Product Master' },
    { n: 2, label: 'Product Version' },
    { n: 3, label: 'Xem lại & Gửi' },
  ]
  return (
    <div className={`${sectionWrapper} px-5 py-3`}>
      <div className='flex items-center justify-center gap-3 text-[10px]'>
        {steps.map((s, idx) => (
          <React.Fragment key={s.n}>
            {idx > 0 && <span className='h-px w-10 bg-orange-100' />}
            <div className='flex items-center gap-2'>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                s.n < step ? 'bg-lime-700 text-white' :
                s.n === step ? 'bg-yellow-800 text-white' :
                'bg-orange-100 text-stone-600'
              }`}>
                {s.n < step ? <CheckIcon className='h-3 w-3' /> : s.n}
              </span>
              <span className={s.n === step ? 'font-semibold text-stone-900' : 'text-stone-500'}>{s.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: 'bg-orange-100 text-stone-700 border-yellow-800/20',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-800 border-amber-300',
    APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
    PUBLISHED: 'bg-yellow-800 text-white border-yellow-900',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    ARCHIVED: 'bg-stone-200 text-stone-500 border-stone-300',
  }
  return (
    <span className={`rounded border px-3 py-1 text-[10px] font-semibold ${map[status] ?? 'bg-stone-100 text-stone-500'}`}>
      {status}
    </span>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path d='M10 4L6 8L10 12' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path d='M6 4L10 8L6 12' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path d='M4.5 8.5L6.5 10.5L11.5 5.5' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path
        d='M12 16V4M12 4L8 8M12 4L16 8M4 16V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 20 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <rect x='1' y='3' width='12' height='10' rx='2' stroke='currentColor' strokeWidth='1.5' />
      <path d='M13 6L18.5 3.5V12.5L13 10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path d='M10 2L17 6V14L10 18L3 14V6L10 2Z' stroke='currentColor' strokeWidth='1.3' strokeLinejoin='round' />
      <path d='M10 9L17 5.5' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' />
      <path d='M10 9L3 5.5' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' />
      <path d='M10 9V18' stroke='currentColor' strokeWidth='1.3' strokeLinecap='round' />
    </svg>
  )
}
