import React, { useState } from 'react'
import { CategoryTreeSelect } from '@/components/forms/CategoryTreeSelect'
import type { CategoryDTO } from '@/types'

const sectionWrapper = 'rounded-xl border border-yellow-800/20 bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.08)]'

const inputBase =
  'h-9 w-full rounded border border-black/5 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-500 focus:border-yellow-800 focus:outline-none'

const subtleLabel = 'text-[10px] font-medium leading-3 text-stone-900'

const helperText = 'text-[10px] leading-3 text-stone-600'

export default function AddProduct() {
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <div className="min-h-screen bg-stone-100 font-['Arimo'] text-stone-900">
      <div className='mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10'>
        {step === 1 ? (
          <section className='space-y-5'>
            <Header title='Create New Product' subtitle='Add a new wood product to your shop catalog' />
            <StepIndicator activeStep={1} leadLabel='Product Master' trailLabel='Product Version' variant='primary' />
            <ProductMasterCard />
            <div className='flex flex-wrap justify-between gap-3'>
              <button type='button' className='inline-flex items-center rounded border border-yellow-800/20 bg-stone-100 px-4 py-2 text-xs font-medium'>
                Save as Draft
              </button>
              <button
                type='button'
                className='inline-flex items-center justify-center gap-2 rounded bg-yellow-800 px-5 py-2 text-xs font-medium text-white'
                onClick={() => setStep(2)}
              >
                Continue to Version Setup
                <ArrowRightIcon className='h-3 w-3 text-white' />
              </button>
            </div>
          </section>
        ) : (
          <section className='space-y-5'>
            <Header title='Create New Product' subtitle='Add a new wood product to your shop catalog' />
            <StepIndicator
              activeStep={2}
              leadLabel='Product Master'
              trailLabel='Product Version'
              leadingComplete
              variant='success'
            />
            <ProductVersionCard />
            <ProductMediaCard />
            <StatusCard />
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <button
                type='button'
                className='inline-flex items-center gap-2 rounded border border-yellow-800/20 bg-stone-100 px-4 py-2 text-xs font-medium'
                onClick={() => setStep(1)}
              >
                <ArrowLeftIcon className='h-3 w-3 text-stone-900' />
                Back to Master
              </button>
              <div className='flex flex-wrap gap-2'>
                <button type='button' className='rounded border border-yellow-800/20 bg-stone-100 px-4 py-2 text-xs font-medium'>
                  Create Version
                </button>
                <button type='button' className='rounded bg-lime-700 px-5 py-2 text-xs font-medium text-white'>
                  Create & Publish Product
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <p className='text-xl font-bold leading-6'>{title}</p>
        <p className='text-[10px] leading-3 text-stone-600'>{subtitle}</p>
      </div>
      <button
        type='button'
        className='inline-flex items-center gap-2 rounded border border-yellow-800/20 bg-stone-100 px-3 py-1.5 text-xs font-medium'
      >
        <ArrowLeftIcon className='h-3 w-3 text-stone-900' />
        Back to Products
      </button>
    </div>
  )
}

function StepIndicator({
  activeStep,
  leadLabel,
  trailLabel,
  leadingComplete,
  variant
}: {
  activeStep: 1 | 2
  leadLabel: string
  trailLabel: string
  leadingComplete?: boolean
  variant: 'primary' | 'success'
}) {
  const leadingColor = variant === 'success' ? 'bg-lime-700' : 'bg-yellow-800'
  const trailingCircleClass =
    activeStep === 2 ? 'bg-yellow-800 text-white' : 'bg-orange-100 text-stone-600'

  return (
    <div className={`${sectionWrapper} px-5 py-3`}>
      <div className='flex items-center justify-center gap-4 text-[10px]'>
        <div className='flex items-center gap-2'>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${leadingColor} text-white`}>
            {leadingComplete ? <CheckIcon className='h-3 w-3 text-white' /> : '1'}
          </span>
          <span className={leadingComplete ? 'text-stone-600' : 'text-stone-900'}>{leadLabel}</span>
        </div>
        <span className='h-px w-12 bg-orange-100' />
        <div className='flex items-center gap-2'>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${trailingCircleClass}`}>
            2
          </span>
          <span className={activeStep === 2 ? 'text-stone-900' : 'text-stone-600'}>{trailLabel}</span>
        </div>
      </div>
    </div>
  )
}

function ProductMasterCard() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(null)

  return (
    <div className={`${sectionWrapper}`}>
      <div className='border-b border-yellow-800/20 px-5 py-4'>
        <p className='text-sm font-semibold'>Product Master Information</p>
        <p className={helperText}>This step defines the general product. Pricing and SKU live in product versions.</p>
      </div>
      <div className='space-y-4 px-5 py-6'>
        <label className='block space-y-1'>
          <span className={subtleLabel}>
            Product Name <span className='text-rose-600'>*</span>
          </span>
          <input type='text' placeholder='e.g., Oak Dining Table' className={inputBase} />
        </label>
        <label className='block space-y-1'>
          <span className={subtleLabel}>
            Category <span className='text-rose-600'>*</span>
          </span>
          <CategoryTreeSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder='Search or browse categories'
          />
          <input type='hidden' name='categoryId' value={selectedCategory?.categoryId ?? ''} />
          <p className={helperText}>Choose the most specific leaf category to match marketplace taxonomy.</p>
        </label>
        <label className='block space-y-1'>
          <span className={subtleLabel}>Product Description</span>
          <textarea rows={4} className={`${inputBase} min-h-[112px] resize-none`} placeholder='Describe your product...' />
        </label>
        <ToggleRow
          title='Certified Wood Product'
          description='Mark if this product has FSC or sustainability certification'
        />
        <div className='flex flex-wrap items-center justify-between rounded-md bg-orange-100/60 px-4 py-3'>
          <div>
            <p className={subtleLabel}>Product Status</p>
            <p className={helperText}>Default status for new products</p>
          </div>
          <span className='rounded border border-yellow-800/20 bg-orange-100 px-3 py-1 text-[10px] font-semibold'>DRAFT</span>
        </div>
      </div>
    </div>
  )
}

function ProductVersionCard() {
  return (
    <div className={`${sectionWrapper}`}>
      <div className='border-b border-yellow-800/20 px-5 py-4'>
        <p className='text-sm font-semibold'>Create Product Version</p>
        <p className={helperText}>Define the sellable version with pricing and inventory details.</p>
      </div>
      <div className='space-y-4 px-5 py-6'>
        <label className='block space-y-1'>
          <span className={subtleLabel}>
            Version Name <span className='text-rose-600'>*</span>
          </span>
          <input type='text' placeholder='e.g., Standard Oak Table 120cm' className={inputBase} />
        </label>
        <div className='flex flex-col gap-4 md:flex-row'>
          <label className='block flex-1 space-y-1'>
            <span className={subtleLabel}>
              Price <span className='text-rose-600'>*</span>
            </span>
            <input type='number' placeholder='0' className={inputBase} />
          </label>
          <label className='block w-full space-y-1 md:w-40'>
            <span className={subtleLabel}>Currency</span>
            <input type='text' value='VND' readOnly className={`${inputBase} bg-orange-100/60 font-semibold`} />
          </label>
        </div>
        <label className='block space-y-1'>
          <span className={subtleLabel}>Seller SKU</span>
          <input type='text' placeholder='e.g., WS001-OAK-TABLE-120-001' className={`${inputBase} font-mono`} />
          <p className={helperText}>Format: &lt;SHOP&gt;-&lt;WOOD&gt;-&lt;TYPE&gt;-&lt;SIZE&gt;-&lt;SEQ&gt;</p>
        </label>
        <div className='rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-[10px] leading-4 text-blue-800'>
          <p className='font-semibold text-blue-900'>SKU Information</p>
          <p>
            <span className='font-semibold'>Global SKU:</span> Generated by system for marketplace-wide tracking
          </p>
          <p>
            <span className='font-semibold'>Seller SKU:</span> Your custom SKU for internal inventory management
          </p>
        </div>
        <ToggleRow title='AR Model Available' description='Allow customers to preview product in AR' />
      </div>
    </div>
  )
}

function ProductMediaCard() {
  return (
    <div className={`${sectionWrapper}`}>
      <div className='border-b border-yellow-800/20 px-5 py-4'>
        <p className='text-sm font-semibold'>Product Media</p>
        <p className={helperText}>Upload images, videos, and AR models for your product</p>
      </div>
      <div className='space-y-5 px-5 py-6'>
        <div>
          <p className={subtleLabel}>Product Images</p>
          <div className='mt-2 flex h-32 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-yellow-800/30 px-5 text-center text-[10px] text-stone-600'>
            <UploadIcon className='h-6 w-6 text-stone-600' />
            <p className='text-stone-900'>Drop images here or click to upload</p>
            <p>PNG, JPG up to 10MB each</p>
          </div>
        </div>
        <div className='grid gap-3 md:grid-cols-2'>
          <MediaTile title='Product Video' description='Upload demonstration video'>
            <VideoIcon className='h-6 w-6 text-stone-600' />
          </MediaTile>
          <MediaTile title='AR Model' description='Upload 3D model (.glb)'>
            <CubeIcon className='h-6 w-6 text-stone-600' />
          </MediaTile>
        </div>
      </div>
    </div>
  )
}

function StatusCard() {
  return (
    <div className={`${sectionWrapper} px-5 py-4`}>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className={subtleLabel}>Version Status</p>
          <p className={helperText}>Version will be locked after first sale</p>
        </div>
        <span className='rounded bg-lime-700 px-3 py-1 text-[10px] font-semibold text-white'>ACTIVE</span>
      </div>
    </div>
  )
}

function ToggleRow({ title, description }: { title: string; description: string }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-md bg-orange-100/50 px-4 py-3'>
      <div>
        <p className={subtleLabel}>{title}</p>
        <p className={helperText}>{description}</p>
      </div>
      <button type='button' role='switch' aria-checked='false' className='relative h-5 w-9 rounded-full border border-yellow-800/30 bg-white'>
        <span className='absolute left-1 top-1 h-3 w-3 rounded-full bg-stone-200 shadow' />
      </button>
    </div>
  )
}

function MediaTile({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className='rounded-md border border-yellow-800/20 px-4 py-3'>
      <div className='mb-2 flex items-center gap-2'>
        {children}
        <div>
          <p className={subtleLabel}>{title}</p>
          <p className={helperText}>{description}</p>
        </div>
      </div>
    </div>
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
