import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
import { adminService, queryKeys } from '@/services'
import type { ImageUrlData } from '@/types'

const fmtDateTime = (iso: string | undefined, locale: 'vi-VN' | 'en-US') => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function BannerManager() {
  const { isVietnamese } = useAppLanguage()

  const t = {
    eyebrow: isVietnamese ? 'Tiếp thị' : 'Marketing',
    title: isVietnamese ? 'Quản lý Banner' : 'Banner Management',
    subtitle: isVietnamese ? 'Tạo, chỉnh sửa hoặc xóa banners trên trang chủ.' : 'Create, edit, or delete homepage banners.',
    loading: isVietnamese ? 'Đang tải...' : 'Loading...',
    loadFailed: isVietnamese ? 'Không tải được banner' : 'Failed to load banners',
    noResults: isVietnamese ? 'Không có banner' : 'No banners found',
    uploadBanner: isVietnamese ? '+ Tải banner' : '+ Upload Banner',
    image: isVietnamese ? 'Hình ảnh' : 'Image',
    sortOrder: isVietnamese ? 'Thứ tự' : 'Sort Order',
    created: isVietnamese ? 'Tạo lúc' : 'Created',
    actions: isVietnamese ? 'Hành động' : 'Actions',
    edit: isVietnamese ? 'Chỉnh sửa' : 'Edit',
    delete: isVietnamese ? 'Xóa' : 'Delete',
    confirm: isVietnamese ? 'Bạn có chắc muốn xóa banner này?' : 'Are you sure you want to delete this banner?',
  }

  const { data: banners = [], isLoading, error } = useQuery({
    queryKey: [queryKeys.ADMIN_BANNERS],
    queryFn: () => adminService.getAllBanners(),
    staleTime: 5 * 60 * 1000,
  })

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirm)) {
      adminService.deleteBanner(id)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <p className='text-sm font-semibold uppercase tracking-wider text-gray-500'>{t.eyebrow}</p>
        <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
        <p className='text-gray-600'>{t.subtitle}</p>
      </div>

      {/* Upload button */}
      <div className='flex justify-end'>
        <button className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'>
          {t.uploadBanner}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          {t.loadFailed}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className='flex justify-center py-8'>
          <div className='text-gray-500'>{t.loading}</div>
        </div>
      )}

      {/* Banners grid */}
      {!isLoading && banners.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {banners.map((banner: ImageUrlData) => (
            <div key={banner.imageId} className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
              <div className='aspect-video bg-gray-100'>
                {banner.originalUrl && (
                  <img
                    src={banner.originalUrl}
                    alt=''
                    className='h-full w-full object-cover'
                  />
                )}
              </div>
              <div className='space-y-3 p-4'>
                <div>
                  <p className='text-xs text-gray-600'>{t.sortOrder}</p>
                  <p className='font-medium text-gray-900'>{banner.sortOrder ?? '—'}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-600'>{t.created}</p>
                  <p className='text-sm text-gray-700'>
                    {fmtDateTime(banner.createdAt, isVietnamese ? 'vi-VN' : 'en-US')}
                  </p>
                </div>
                <div className='flex gap-2 pt-2'>
                  <button className='flex-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50'>
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.imageId)}
                    className='flex-1 rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200'
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && banners.length === 0 && !error && (
        <div className='flex justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12'>
          <div className='text-center'>
            <p className='mb-4 text-gray-500'>{t.noResults}</p>
            <button className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'>
              {t.uploadBanner}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
