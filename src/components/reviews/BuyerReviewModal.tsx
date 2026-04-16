import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productReviewService } from '@/services'
import { uploadImageToCloudinary } from '@/services/cloudinary.service'
import { readStoredUser } from '@/features/auth/utils/storage'

export interface BuyerReviewModalProps {
  open: boolean
  onClose: () => void
  orderId: string
  versionId: string
  orderItemId: string
  productName: string
}

const MAX_IMAGES = 5

type PendingImage = { id: string; file: File; preview: string }

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function BuyerReviewModal({
  open,
  onClose,
  orderId,
  versionId,
  orderItemId,
  productName,
}: BuyerReviewModalProps) {
  const queryClient = useQueryClient()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [rating, setRating] = React.useState(5)
  const [content, setContent] = React.useState('')
  const [pendingImages, setPendingImages] = React.useState<PendingImage[]>([])

  const revokeAll = React.useCallback((list: PendingImage[]) => {
    list.forEach((p) => URL.revokeObjectURL(p.preview))
  }, [])

  React.useEffect(() => {
    if (!open) {
      setRating(5)
      setContent('')
      setPendingImages((prev) => {
        revokeAll(prev)
        return []
      })
    }
  }, [open, revokeAll])

  const mutation = useMutation({
    mutationFn: async () => {
      const user = readStoredUser()
      if (!user?.accountId) throw new Error('B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 \u0111\u00e1nh gi\u00e1.')
      const urls: string[] = []
      for (const p of pendingImages) {
        const up = await uploadImageToCloudinary(p.file)
        urls.push(up.secureUrl)
      }
      return productReviewService.createReview({
        versionId,
        orderId,
        orderItemId,
        accountId: user.accountId,
        rating,
        content: content.trim() || undefined,
        imageUrls: urls.length ? urls.slice(0, MAX_IMAGES) : undefined,
      })
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['order-reviews', orderId] })
      void queryClient.invalidateQueries({ queryKey: ['product-visible-reviews', data.productId] })
      void queryClient.invalidateQueries({ queryKey: ['product-detail'] })
      onClose()
    },
  })

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return
    const additions: PendingImage[] = []
    let room = MAX_IMAGES - pendingImages.length
    for (let i = 0; i < fileList.length && room > 0; i++) {
      const file = fileList[i]
      if (!file.type.startsWith('image/')) continue
      additions.push({
        id: makeId(),
        file,
        preview: URL.createObjectURL(file),
      })
      room--
    }
    if (additions.length) setPendingImages((prev) => [...prev, ...additions])
  }

  const removeImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  if (!open) return null

  const errMsg = mutation.error
    ? typeof mutation.error === 'object' && mutation.error && 'message' in mutation.error
      ? String((mutation.error as { message?: string }).message)
      : 'Kh\u00f4ng th\u1ec3 g\u1eedi \u0111\u00e1nh gi\u00e1.'
    : null

  const canAddMore = pendingImages.length < MAX_IMAGES

  return (
    <div
      className='fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='buyer-review-title'
    >
      <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-white p-6 shadow-xl'>
        <h2
          id='buyer-review-title'
          className='mb-1 text-lg font-bold text-[#6C5B50]'
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {'\u0110\u00e1nh gi\u00e1 s\u1ea3n ph\u1ea9m'}
        </h2>
        <p className='mb-4 text-sm text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
          {productName}
        </p>

        <div className='mb-4'>
          <p className='mb-2 text-sm font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
            {'S\u1ed1 sao'}
          </p>
          <div className='flex gap-1'>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type='button'
                className={`text-2xl leading-none ${n <= rating ? 'text-amber-500' : 'text-gray-300'}`}
                onClick={() => setRating(n)}
                aria-label={`${n} sao`}
              >
                &#9733;
              </button>
            ))}
          </div>
        </div>

        <div className='mb-4'>
          <label className='mb-2 block text-sm font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
            {'N\u1ed9i dung (tu\u1ef3 ch\u1ecdn)'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className='w-full rounded-[10px] border border-gray-200 px-3 py-2 text-sm'
            style={{ fontFamily: 'Arimo, sans-serif' }}
          />
        </div>

        <div className='mb-4'>
          <p className='mb-2 text-sm font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
            {'\u1ea2nh (tu\u1ef3 ch\u1ecdn, t\u1ed1i \u0111a '}
            {MAX_IMAGES})
          </p>
          <p className='mb-3 text-xs text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
            {
              'Ch\u1ecdn \u1ea3nh t\u1eeb m\u00e1y \u2014 ch\u1ec9 hi\u1ec3n th\u1ecb xem tr\u01b0\u1edbc, kh\u00f4ng hi\u1ec7n \u0111\u01b0\u1eddng d\u1eabn.'
            }
          </p>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            className='sr-only'
            tabIndex={-1}
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />

          <div className='flex flex-wrap gap-3'>
            {pendingImages.map((p) => (
              <div
                key={p.id}
                className='relative h-24 w-24 overflow-hidden rounded-[10px] border border-gray-200 bg-gray-50'
              >
                <img src={p.preview} alt='' className='h-full w-full object-cover' />
                <button
                  type='button'
                  className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black/80'
                  onClick={() => removeImage(p.id)}
                  aria-label={'\u0110\u00e3 x\u00f3a \u1ea3nh'}
                >
                  &times;
                </button>
              </div>
            ))}
            {canAddMore && (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='flex h-24 w-24 flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#D4B896] bg-amber-50/50 text-xs font-semibold text-[#6C5B50] transition hover:bg-amber-50'
                style={{ fontFamily: 'Arimo, sans-serif' }}
              >
                <span className='text-base leading-none'>+</span>
                <span>{'\u1ea2nh'}</span>
              </button>
            )}
          </div>
        </div>

        {errMsg && (
          <p className='mb-3 text-sm text-red-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
            {errMsg}
          </p>
        )}

        <div className='flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4'>
          <button
            type='button'
            className='rounded-[10px] border-2 px-4 py-2 text-sm font-semibold text-[#6C5B50]'
            style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {'H\u1ee7y'}
          </button>
          <button
            type='button'
            className='rounded-[10px] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60'
            style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending
              ? '\u0110ang t\u1ea3i & g\u1eedi...'
              : 'G\u1eedi \u0111\u00e1nh gi\u00e1'}
          </button>
        </div>
      </div>
    </div>
  )
}
