import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService, queryKeys } from '@/services'
import type { CategoryDTO, CreateCategoryRequest } from '@/types'

type CategoryCreateFormProps = {
  parentOptions?: CategoryDTO[]
  defaultParentId?: string | null
  onSuccess?: (category: CategoryDTO) => void
}

type FormState = {
  name: string
  description: string
  parentCategoryId: string
  isActive: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const initialState: FormState = {
  name: '',
  description: '',
  parentCategoryId: '',
  isActive: true,
}

const extractErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const maybeResponse = error as { response?: { data?: { message?: string } } }
    return maybeResponse.response?.data?.message ?? 'Không thể tạo danh mục mới. Vui lòng thử lại.'
  }
  return 'Không thể tạo danh mục mới. Vui lòng thử lại.'
}

export function CategoryCreateForm({ parentOptions = [], defaultParentId = null, onSuccess }: CategoryCreateFormProps) {
  const queryClient = useQueryClient()
  const [formState, setFormState] = React.useState<FormState>({
    ...initialState,
    parentCategoryId: defaultParentId ?? '',
  })
  const [formErrors, setFormErrors] = React.useState<FormErrors>({})
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [selectedLevelOneId, setSelectedLevelOneId] = React.useState<string | null>(null)
  const [selectedLevelTwoId, setSelectedLevelTwoId] = React.useState<string | null>(null)

  const levelOneCategories = React.useMemo(() => {
    return parentOptions
      .filter((category) => !category.parentCategoryId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [parentOptions])

  React.useEffect(() => {
    if (!parentOptions.length) {
      setSelectedLevelOneId(null)
      setSelectedLevelTwoId(null)
      setFormState((prev) => ({ ...prev, parentCategoryId: '' }))
      return
    }

    if (defaultParentId) {
      const matchedCategory = parentOptions.find((category) => category.categoryId === defaultParentId)
      if (matchedCategory) {
        if (matchedCategory.parentCategoryId) {
          setSelectedLevelOneId(matchedCategory.parentCategoryId)
          setSelectedLevelTwoId(matchedCategory.categoryId)
          setFormState((prev) => ({ ...prev, parentCategoryId: matchedCategory.categoryId }))
          return
        }
        setSelectedLevelOneId(matchedCategory.categoryId)
        setSelectedLevelTwoId(null)
        setFormState((prev) => ({ ...prev, parentCategoryId: '' }))
        return
      }
    }

    if (!selectedLevelOneId && levelOneCategories.length) {
      setSelectedLevelOneId(levelOneCategories[0].categoryId)
    }
  }, [defaultParentId, parentOptions, levelOneCategories, selectedLevelOneId])

  const subCategoriesQueryKey = selectedLevelOneId
    ? queryKeys.categories.children(selectedLevelOneId)
    : (['categories', 'children', 'idle'] as const)

  const {
    data: subCategoriesResponse,
    isLoading: isSubCategoriesLoading,
    isError: isSubCategoriesError,
    error: subCategoriesError,
  } = useQuery({
    queryKey: subCategoriesQueryKey,
    queryFn: () => categoryService.getSubCategories(selectedLevelOneId!),
    enabled: Boolean(selectedLevelOneId),
    staleTime: 0,
  })

  const levelTwoCategories = React.useMemo(() => {
    return subCategoriesResponse?.data ?? []
  }, [subCategoriesResponse])

  const selectedLevelOne = React.useMemo(() => {
    return levelOneCategories.find((category) => category.categoryId === selectedLevelOneId) ?? null
  }, [levelOneCategories, selectedLevelOneId])

  const selectedLevelTwo = React.useMemo(() => {
    return levelTwoCategories.find((category) => category.categoryId === selectedLevelTwoId) ?? null
  }, [levelTwoCategories, selectedLevelTwoId])

  const selectionPath = selectedLevelTwo
    ? `${selectedLevelOne?.name ?? 'Danh mục'} > ${selectedLevelTwo.name}`
    : selectedLevelOne?.name ?? 'Chưa chọn danh mục'

  const levelTwoAvailable = levelTwoCategories.length > 0
  const showLeafWarning = Boolean(selectedLevelOneId && !selectedLevelTwoId && levelTwoAvailable)
  const hasHierarchy = levelOneCategories.length > 0

  React.useEffect(() => {
    if (!selectedLevelOneId || isSubCategoriesLoading) return
    if (!levelTwoAvailable) {
      setSelectedLevelTwoId(null)
      setFormState((prev) => ({ ...prev, parentCategoryId: selectedLevelOneId }))
      setFormErrors((prev) => ({ ...prev, parentCategoryId: undefined }))
    } else if (!selectedLevelTwoId) {
      setFormState((prev) => ({ ...prev, parentCategoryId: '' }))
    }
  }, [selectedLevelOneId, levelTwoAvailable, isSubCategoriesLoading, selectedLevelTwoId])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => categoryService.createCategory(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
      if (selectedLevelOneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.children(selectedLevelOneId) })
      }
      setFeedback({ type: 'success', message: response.message || 'Tạo danh mục thành công.' })
      setFormState({ ...initialState, parentCategoryId: defaultParentId ?? '' })
      setFormErrors({})
      onSuccess?.(response.data)
    },
    onError: (error: unknown) => {
      setFeedback({ type: 'error', message: extractErrorMessage(error) })
    },
  })

  const validate = (state: FormState) => {
    const nextErrors: FormErrors = {}
    if (!state.name.trim()) {
      nextErrors.name = 'Tên danh mục là bắt buộc.'
    } else if (state.name.trim().length < 3) {
      nextErrors.name = 'Tên danh mục cần ít nhất 3 ký tự.'
    }
    if (state.description && state.description.length > 160) {
      nextErrors.description = 'Mô tả không vượt quá 160 ký tự.'
    }
    if (hasHierarchy && levelTwoAvailable && !state.parentCategoryId) {
      nextErrors.parentCategoryId = 'Vui lòng chọn danh mục cấp 2 làm danh mục cha.'
    }
    return nextErrors
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    setFeedback(null)
  }

  const handleSelectLevelOne = (categoryId: string) => {
    if (categoryId === selectedLevelOneId) return
    setSelectedLevelOneId(categoryId)
    setSelectedLevelTwoId(null)
    setFormState((prev) => ({ ...prev, parentCategoryId: '' }))
    setFormErrors((prev) => ({ ...prev, parentCategoryId: undefined }))
    setFeedback(null)
  }

  const handleSelectLevelTwo = (categoryId: string) => {
    setSelectedLevelTwoId(categoryId)
    setFormState((prev) => ({ ...prev, parentCategoryId: categoryId }))
    setFormErrors((prev) => ({ ...prev, parentCategoryId: undefined }))
    setFeedback(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validate(formState)
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors)
      return
    }

    const payload: CreateCategoryRequest = {
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      parentCategoryId: formState.parentCategoryId || undefined,
      isActive: formState.isActive,
    }

    setFeedback(null)
    await mutateAsync(payload)
  }

  return (
    <form onSubmit={handleSubmit} className='mx-auto w-full max-w-3xl space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-1'>
        <p className='text-xs font-semibold uppercase tracking-wide text-stone-500'>Thêm danh mục</p>
        <h2 className='text-xl font-semibold text-gray-900'>Tạo mới cấu trúc phân loại</h2>
        <p className='text-sm text-gray-500'>Gán danh mục cha phù hợp để giữ dữ liệu nhất quán.</p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className='space-y-4'>
        <div className='space-y-1'>
          <label htmlFor='name' className='text-sm font-medium text-gray-700'>
            Tên danh mục <span className='text-rose-500'>*</span>
          </label>
          <input
            id='name'
            name='name'
            value={formState.name}
            onChange={handleChange}
            placeholder='Ví dụ: Thiết bị điện tử'
            className={`h-11 w-full rounded-2xl border px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500/40 ${
              formErrors.name ? 'border-rose-300' : 'border-gray-200'
            }`}
            disabled={isPending}
          />
          {formErrors.name && <p className='text-xs text-rose-500'>{formErrors.name}</p>}
        </div>

        <div className='space-y-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm font-semibold text-gray-900'>Chọn danh mục cha</p>
              <p className='text-xs text-gray-500'>Chọn danh mục cấp 1, sau đó chọn danh mục con (cấp 2) phù hợp.</p>
            </div>
            <div className='rounded-2xl border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700'>
              {selectedLevelTwo ? 'Đã chọn danh mục con' : 'Chưa chọn danh mục con'}
            </div>
          </div>

          <div className='rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-2 text-xs font-medium text-stone-700'>
            Đường dẫn: <span className='font-semibold text-stone-900'>{selectionPath}</span>
          </div>

          <div className='grid gap-4 lg:grid-cols-[220px_1fr]'>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Danh mục cấp 1</p>
              <div className='space-y-2'>
                {levelOneCategories.length ? (
                  levelOneCategories.map((category) => {
                    const isActive = category.categoryId === selectedLevelOneId
                    const initial = category.name.trim().charAt(0).toUpperCase() || 'C'
                    return (
                      <button
                        type='button'
                        key={category.categoryId}
                        onClick={() => handleSelectLevelOne(category.categoryId)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                          isActive
                            ? 'border-amber-500 bg-amber-50/80 text-amber-900 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-amber-200 hover:bg-amber-50/40'
                        }`}
                        disabled={isPending}
                      >
                        <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-base font-semibold text-stone-700'>
                          {initial}
                        </span>
                        <div>
                          <p className='font-semibold leading-tight'>{category.name}</p>
                          <p className='text-xs text-gray-500'>{category.subCategoriesCount} danh mục con</p>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className='rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500'>
                    Chưa có danh mục cấp 1. Danh mục mới sẽ trở thành danh mục gốc.
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Danh mục cấp 2</p>
                {selectedLevelOne && (
                  <span className='text-xs text-gray-400'>Thuộc {selectedLevelOne.name}</span>
                )}
              </div>

              {isSubCategoriesLoading ? (
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className='h-24 animate-pulse rounded-2xl border border-dashed border-gray-200 bg-gray-50' />
                  ))}
                </div>
              ) : levelTwoCategories.length ? (
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {levelTwoCategories.map((subcategory) => {
                    const isSelected = subcategory.categoryId === selectedLevelTwoId
                    const initial = subcategory.name.trim().charAt(0).toUpperCase() || 'S'
                    return (
                      <button
                        type='button'
                        key={subcategory.categoryId}
                        onClick={() => handleSelectLevelTwo(subcategory.categoryId)}
                        className={`rounded-2xl border px-3 py-3 text-left transition ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 shadow-sm shadow-amber-100'
                            : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50/40'
                        }`}
                        disabled={isPending}
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-white text-lg font-semibold text-amber-800'>
                            {initial}
                          </div>
                          <div className='space-y-0.5'>
                            <p className='text-sm font-semibold text-gray-900'>{subcategory.name}</p>
                            <p className='text-xs text-gray-500'>{subcategory.description || 'Chưa có mô tả'}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : selectedLevelOne ? (
                <div className='rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900'>
                  Danh mục "{selectedLevelOne.name}" chưa có danh mục con.
                </div>
              ) : (
                <div className='rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500'>
                  Chọn một danh mục cấp 1 để hiển thị danh mục con.
                </div>
              )}

              {isSubCategoriesError && (
                <p className='text-xs text-rose-500'>
                  {subCategoriesError instanceof Error
                    ? subCategoriesError.message
                    : 'Không thể tải danh mục con. Vui lòng thử lại.'}
                </p>
              )}
            </div>
          </div>

          {showLeafWarning && (
            <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900'>
              Để tạo sản phẩm hoặc danh mục con, hãy chọn danh mục cấp 2. Danh mục cấp 1 chỉ đóng vai trò nhóm.
            </div>
          )}
          {formErrors.parentCategoryId && (
            <p className='text-xs font-medium text-rose-500'>{formErrors.parentCategoryId}</p>
          )}
        </div>

        <div className='space-y-1'>
          <label htmlFor='description' className='text-sm font-medium text-gray-700'>
            Mô tả (tối đa 160 ký tự)
          </label>
          <textarea
            id='description'
            name='description'
            value={formState.description}
            onChange={handleChange}
            placeholder='Thêm ghi chú giúp đội ngũ bán hàng dễ hiểu phạm vi danh mục này'
            rows={3}
            className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500/40 ${
              formErrors.description ? 'border-rose-300' : 'border-gray-200'
            }`}
            disabled={isPending}
          />
          {formErrors.description && <p className='text-xs text-rose-500'>{formErrors.description}</p>}
        </div>

      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-gray-200 pt-4'>
        <p className='text-xs text-gray-500'>Hệ thống sẽ tự động lưu lịch sử tạo danh mục để dễ truy vết.</p>
        <button
          type='submit'
          className='inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-stone-600 to-stone-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/10'
          disabled={isPending}
        >
          {isPending ? (
            <svg className='h-4 w-4 animate-spin text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <circle cx='12' cy='12' r='10' className='opacity-25' />
              <path d='M12 2a10 10 0 0 1 10 10' className='opacity-75' strokeLinecap='round' />
            </svg>
          ) : (
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M12 6v12M6 12h12' strokeLinecap='round' />
            </svg>
          )}
          {isPending ? 'Đang tạo...' : 'Tạo danh mục'}
        </button>
      </div>
    </form>
  )
}

export default CategoryCreateForm
