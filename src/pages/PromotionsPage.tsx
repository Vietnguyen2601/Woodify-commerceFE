import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { imageService, queryKeys } from '@/services'
import { ROUTES } from '@/constants'
import type { ImageUrlData } from '@/types'
import Reveal from '@/components/animations/Reveal'

function AdBanner({ item, index }: { item: ImageUrlData; index: number }) {
  const url = item.originalUrl != null ? String(item.originalUrl).trim() : ''
  const delayMs = Math.min(index * 70, 560)

  return (
    <Reveal delayMs={delayMs}>
      <article
        className='group w-full overflow-hidden rounded-2xl border border-stone-200/60 bg-stone-100/80'
        style={{
          boxShadow:
            '0 28px 56px -20px rgba(61, 37, 14, 0.45), 0 14px 32px -18px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.4) inset',
        }}
      >
        <div className='relative w-full overflow-hidden bg-stone-200 aspect-[21/9] min-h-[140px] sm:min-h-[180px] sm:aspect-[2.4/1]'>
          {url ? (
            <img
              src={url}
              alt=''
              className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]'
            />
          ) : (
            <div className='flex h-full min-h-[140px] w-full items-center justify-center text-sm text-stone-500'>
              Không có ảnh
            </div>
          )}
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
          <div className='flex flex-col gap-8'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='animate-pulse overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100/80 shadow-[0_24px_48px_-22px_rgba(61,37,14,0.35)]'
              >
                <div className='aspect-[21/9] min-h-[140px] bg-stone-200 sm:min-h-[180px]' />
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
          <div className={`flex w-full flex-col gap-10 ${isFetching && !isLoading ? 'opacity-90' : ''}`}>
            {items.map((item, index) => (
              <AdBanner key={item.imageId} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
