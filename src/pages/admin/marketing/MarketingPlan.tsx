import React from 'react'
import { useAppLanguage } from '@/hooks'
import { useMutation, useQuery } from '@tanstack/react-query'
import { APP_CONFIG } from '@/constants'
import { imageService, queryClient, queryKeys } from '@/services'
import { uploadImageToCloudinary } from '@/services/cloudinary.service'
import type { ImageUrlData } from '@/types'

type ImageKind = 'BANNER' | 'ADS'

const kindMeta: Record<ImageKind, { titleVi: string; titleEn: string; subtitleVi: string; subtitleEn: string }> = {
  BANNER: {
    titleVi: 'Banner',
    titleEn: 'Banner',
    subtitleVi: 'Ảnh banner trang chủ (có sort order). Upload Cloudinary → lưu metadata vào DB.',
    subtitleEn: 'Homepage banners (sorted). Upload to Cloudinary → save metadata to DB.',
  },
  ADS: {
    titleVi: 'Quảng cáo',
    titleEn: 'Ads',
    subtitleVi: 'Ảnh quảng cáo (đồng thời dùng như banner/ads). Upload Cloudinary → lưu metadata vào DB.',
    subtitleEn: 'Advertising images (also used as banners/ads). Upload to Cloudinary → save metadata to DB.',
  },
}

export default function MarketingPlan() {
  const { isVietnamese } = useAppLanguage()
  const [activeKind, setActiveKind] = React.useState<ImageKind>('BANNER')
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const t = React.useMemo(
    () => ({
      eyebrow: isVietnamese ? 'Tiếp thị' : 'Marketing',
      title: isVietnamese ? 'Quản lý Banner & Quảng cáo' : 'Banner & Ads Manager',
      upload: isVietnamese ? 'Tải ảnh' : 'Upload images',
      uploading: isVietnamese ? 'Đang tải lên...' : 'Uploading...',
      loadFailed: isVietnamese ? 'Không tải được danh sách.' : 'Failed to load.',
      empty: isVietnamese ? 'Chưa có ảnh.' : 'No images yet.',
      confirmDelete: isVietnamese ? 'Bạn có chắc muốn xóa ảnh này?' : 'Are you sure you want to delete this image?',
      delete: isVietnamese ? 'Xóa' : 'Delete',
      sortOrder: isVietnamese ? 'Thứ tự' : 'Sort',
      created: isVietnamese ? 'Tạo lúc' : 'Created',
      refreshHint: isVietnamese ? 'Sau khi upload/xóa, danh sách sẽ tự refresh.' : 'List refreshes after upload/delete.',
    }),
    [isVietnamese]
  )

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: [...queryKeys.admin.banners(), activeKind],
    queryFn: () => imageService.listByType(activeKind),
    staleTime: 60 * 1000,
  })

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploads = await Promise.all(files.map((f) => uploadImageToCloudinary(f)))
      const referenceId =
        activeKind === 'BANNER' ? APP_CONFIG.MARKETING.BANNER_REFERENCE_ID : APP_CONFIG.MARKETING.ADS_REFERENCE_ID
      await imageService.saveBulk(
        uploads.map((u) => ({
          imageType: activeKind,
          referenceId,
          originalUrl: u.secureUrl,
          publicId: u.publicId,
          sortOrder: null,
        }))
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.banners()] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await imageService.deleteById(imageId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.banners()] })
    },
  })

  const onPickFiles = () => fileInputRef.current?.click()

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const list = e.target.files ? Array.from(e.target.files) : []
    e.target.value = ''
    if (list.length === 0) return
    await uploadMutation.mutateAsync(list)
  }

  const onDelete = async (imageId: string) => {
    if (!window.confirm(t.confirmDelete)) return
    await deleteMutation.mutateAsync(imageId)
  }

  const fmtDateTime = (iso: string | undefined, locale: 'vi-VN' | 'en-US') => {
    if (!iso) return '—'
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  return (
    <div className='admin-view'>
      <header className='admin-view__header'>
        <div>
          <p className='admin-eyebrow'>{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <span>{t.refreshHint}</span>
        </div>
        <div className='flex items-center gap-2'>
          <button type='button' className='admin-btn outline' onClick={() => setActiveKind('BANNER')}>
            {kindMeta.BANNER[isVietnamese ? 'titleVi' : 'titleEn']}
          </button>
          <button type='button' className='admin-btn outline' onClick={() => setActiveKind('ADS')}>
            {kindMeta.ADS[isVietnamese ? 'titleVi' : 'titleEn']}
          </button>
          <button
            type='button'
            className='admin-btn primary'
            onClick={onPickFiles}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? t.uploading : t.upload}
          </button>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={onFilesSelected}
          />
        </div>
      </header>

      <section className='admin-panel'>
        <header className='admin-panel__header'>
          <h3>{kindMeta[activeKind][isVietnamese ? 'titleVi' : 'titleEn']}</h3>
          <span>{kindMeta[activeKind][isVietnamese ? 'subtitleVi' : 'subtitleEn']}</span>
        </header>

        {isError && <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{t.loadFailed}</div>}

        {isLoading ? (
          <div className='py-10 text-center text-gray-500'>{t.uploading}</div>
        ) : items.length === 0 ? (
          <div className='py-10 text-center text-gray-500'>{t.empty}</div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {items.map((img: ImageUrlData) => (
              <div key={img.imageId} className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                <div className='aspect-video bg-gray-100'>
                  {img.originalUrl && <img src={img.originalUrl} alt='' className='h-full w-full object-cover' />}
                </div>
                <div className='space-y-3 p-4'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-xs text-gray-600'>{t.sortOrder}</p>
                      <p className='font-medium text-gray-900'>{img.sortOrder ?? '—'}</p>
                    </div>
                    <button
                      type='button'
                      className='rounded-xl bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50'
                      onClick={() => onDelete(img.imageId)}
                      disabled={deleteMutation.isPending}
                    >
                      {t.delete}
                    </button>
                  </div>
                  <div>
                    <p className='text-xs text-gray-600'>{t.created}</p>
                    <p className='text-sm text-gray-700'>{fmtDateTime(img.createdAt, isVietnamese ? 'vi-VN' : 'en-US')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
