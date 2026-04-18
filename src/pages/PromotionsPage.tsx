import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { imageService, queryKeys } from '@/services'
import { ROUTES } from '@/constants'
import type { ImageUrlData } from '@/types'
import Reveal from '@/components/animations/Reveal'

function formatDateVi(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function AdCard({ item, index }: { item: ImageUrlData; index: number }) {
  const url = item.originalUrl != null ? String(item.originalUrl).trim() : ''
  const delayMs = Math.min(index * 70, 560)

  return (
    <Reveal delayMs={delayMs}>
      <article className='group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_20px_50px_-28px_rgba(61,37,14,0.35)]'>
        <div className='relative aspect-[16/10] overflow-hidden bg-stone-200'>
          {url ? (
            <img
              src={url}
              alt=''
              className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-sm text-stone-500'>Không có ảnh</div>
          )}
        </div>
        <div className='border-t border-stone-100 px-4 py-3'>
          <p className='font-["Inter"] text-sm font-semibold text-stone-900'>
            Ưu đãi & quảng cáo
            {item.sortOrder != null ? (
              <span className='ml-2 font-normal text-stone-500'>#{item.sortOrder}</span>
            ) : null}
          </p>
          <p className='mt-1 font-["Arimo",sans-serif] text-xs text-stone-500'>Cập nhật {formatDateVi(item.createdAt)}</p>
        </div>
      </article>
    </Reveal>
  )
}

export default function PromotionsPage() {
  const { data: rawItems = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.home.ads(),
    queryFn: () => imageService.listByType('ADS'),
    staleTime: 2 * 60 * 1000,
  })

  const items = React.useMemo(() => {
    return [...rawItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [rawItems])

  return (
    <div className='min-h-screen w-full max-w-[1200px] mx-auto bg-[#E3DCC8] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-x-hidden'>
      <div className='px-[60px] pb-16 pt-10 lg:px-10 sm:px-4 sm:pt-8'>
        <Reveal>
          <nav className='mb-6 font-["Arimo",sans-serif] text-sm text-stone-600'>
            <Link to={ROUTES.HOME} className='text-[#6C5B50] underline-offset-2 hover:underline'>
              Trang chủ
            </Link>
            <span className='mx-2 text-stone-400'>/</span>
            <span className='font-medium text-stone-800'>Khuyến mãi</span>
          </nav>
        </Reveal>

        <Reveal delayMs={80}>
          <header className='mb-10 max-w-2xl'>
            <h1 className='font-["Inter"] text-[28px] font-extrabold text-stone-900 sm:text-[24px]'>Khuyến mãi & quảng cáo</h1>
            <p className='mt-3 font-["Arimo",sans-serif] text-base leading-relaxed text-stone-700'>
              Các chương trình ưu đãi và hình ảnh quảng cáo được cập nhật trên Woodify. Nội dung lấy từ hệ thống (imageType{' '}
              <span className='font-mono text-sm'>ADS</span>).
            </p>
          </header>
        </Reveal>

        {isError && (
          <Reveal>
            <div
              role='alert'
              className='rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 font-["Arimo",sans-serif] text-sm text-red-900'
            >
              <p className='font-semibold'>Không tải được danh sách.</p>
              <p className='mt-1 opacity-90'>
                {error instanceof Error ? error.message : 'Vui lòng thử lại sau.'}
              </p>
              <button
                type='button'
                onClick={() => void refetch()}
                className='mt-3 rounded-xl bg-[#BE9C73] px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-95'
              >
                Thử lại
              </button>
            </div>
          </Reveal>
        )}

        {isLoading && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='animate-pulse overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100/80'
              >
                <div className='aspect-[16/10] bg-stone-200' />
                <div className='space-y-2 px-4 py-3'>
                  <div className='h-4 w-2/3 rounded bg-stone-200' />
                  <div className='h-3 w-1/3 rounded bg-stone-200' />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Reveal delayMs={100}>
            <div className='rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center'>
              <p className='font-["Arimo",sans-serif] text-stone-700'>
                Chưa có hình quảng cáo (ADS) nào. Vui lòng quay lại sau hoặc xem{' '}
                <Link className='font-semibold text-[#6C5B50] underline-offset-2 hover:underline' to={ROUTES.CATALOG}>
                  sản phẩm
                </Link>
                .
              </p>
            </div>
          </Reveal>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${isFetching && !isLoading ? 'opacity-90' : ''}`}
          >
            {items.map((item, index) => (
              <AdCard key={item.imageId} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
