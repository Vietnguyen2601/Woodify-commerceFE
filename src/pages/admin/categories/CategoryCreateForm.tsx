import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppLanguage } from '@/hooks'
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

const extractErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const maybeResponse = error as { response?: { data?: { message?: string } } }
    return maybeResponse.response?.data?.message ?? fallbackMessage
  }
  return fallbackMessage
}

export function CategoryCreateForm({ parentOptions = [], defaultParentId = null, onSuccess }: CategoryCreateFormProps) {
  const { isVietnamese } = useAppLanguage()
  const queryClient = useQueryClient()
  const t = React.useMemo(
    () => ({
      headingEyebrow: isVietnamese ? 'Thêm danh mục' : 'Add category',
      headingTitle: isVietnamese ? 'Tạo mới cấu trúc phân loại' : 'Create a new classification structure',
      headingSubtitle: isVietnamese
        ? 'Gán danh mục cha phù hợp để giữ dữ liệu nhất quán.'
        : 'Assign the right parent to keep data consistent.',
      nameLabel: isVietnamese ? 'Tên danh mục' : 'Category name',
      namePlaceholder: isVietnamese ? 'Ví dụ: Thiết bị điện tử' : 'Example: Electronics',
      parentTitle: isVietnamese ? 'Chọn danh mục cha' : 'Choose a parent category',
      parentSubtitle: isVietnamese
        ? 'Chọn danh mục cấp 1, sau đó chọn danh mục con (cấp 2) phù hợp.'
        : 'Pick a level-1 category, then select the matching level-2 subcategory.',
      parentSelected: isVietnamese ? 'Đã chọn danh mục con' : 'Subcategory selected',
      parentNotSelected: isVietnamese ? 'Chưa chọn danh mục con' : 'No subcategory selected',
      pathLabel: isVietnamese ? 'Đường dẫn' : 'Path',
      levelOneTitle: isVietnamese ? 'Danh mục cấp 1' : 'Level-1 categories',
      levelTwoTitle: isVietnamese ? 'Danh mục cấp 2' : 'Level-2 categories',
      levelTwoUnder: isVietnamese ? 'Thuộc' : 'Under',
      subCountLabel: isVietnamese ? 'danh mục con' : 'subcategories',
      subLoadError: isVietnamese ? 'Không thể tải danh mục con. Vui lòng thử lại.' : 'Unable to load subcategories. Please try again.',
      levelOneEmpty: isVietnamese
        ? 'Chưa có danh mục cấp 1. Danh mục mới sẽ trở thành danh mục gốc.'
        : 'No level-1 categories yet. The new category will become a root category.',
      levelTwoEmpty: isVietnamese ? 'Chưa có mô tả' : 'No description',
      levelTwoNone: isVietnamese
        ? 'Chọn một danh mục cấp 1 để hiển thị danh mục con.'
        : 'Select a level-1 category to show subcategories.',
      levelTwoMissing: (name: string) =>
        isVietnamese ? `Danh mục "${name}" chưa có danh mục con.` : `Category "${name}" has no subcategories.`,
      leafWarning: isVietnamese
        ? 'Để tạo sản phẩm hoặc danh mục con, hãy chọn danh mục cấp 2. Danh mục cấp 1 chỉ đóng vai trò nhóm.'
        : 'To create products or subcategories, choose a level-2 category. Level-1 categories are grouping only.',
      descriptionLabel: isVietnamese ? 'Mô tả (tối đa 160 ký tự)' : 'Description (up to 160 chars)',
      descriptionPlaceholder: isVietnamese
        ? 'Thêm ghi chú giúp đội ngũ bán hàng dễ hiểu phạm vi danh mục này'
        : 'Add notes so the sales team understands this category scope',
      footerNote: isVietnamese
        ? 'Hệ thống sẽ tự động lưu lịch sử tạo danh mục để dễ truy vết.'
        : 'The system will log category creation for traceability.',
      submitLabel: isVietnamese ? 'Tạo danh mục' : 'Create category',
      submitPending: isVietnamese ? 'Đang tạo...' : 'Creating...',
      successMessage: isVietnamese ? 'Tạo danh mục thành công.' : 'Category created successfully.',
      errorFallback: isVietnamese ? 'Không thể tạo danh mục mới. Vui lòng thử lại.' : 'Unable to create category. Please try again.',
      nameRequired: isVietnamese ? 'Tên danh mục là bắt buộc.' : 'Category name is required.',
      nameMin: isVietnamese ? 'Tên danh mục cần ít nhất 3 ký tự.' : 'Category name must be at least 3 characters.',
      descriptionMax: isVietnamese ? 'Mô tả không vượt quá 160 ký tự.' : 'Description must be 160 characters or fewer.',
      parentRequired: isVietnamese
        ? 'Vui lòng chọn danh mục cấp 2 làm danh mục cha.'
        : 'Please select a level-2 category as the parent.',
      pathDefault: isVietnamese ? 'Chưa chọn danh mục' : 'No category selected',
      pathRoot: isVietnamese ? 'Danh mục' : 'Category',
    }),
    [isVietnamese]
  )
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
    ? `${selectedLevelOne?.name ?? t.pathRoot} > ${selectedLevelTwo.name}`
    : selectedLevelOne?.name ?? t.pathDefault

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
      setFeedback({ type: 'success', message: response.message || t.successMessage })
      setFormState({ ...initialState, parentCategoryId: defaultParentId ?? '' })
      setFormErrors({})
      onSuccess?.(response.data)
    },
    onError: (error: unknown) => {
      setFeedback({ type: 'error', message: extractErrorMessage(error, t.errorFallback) })
    },
  })

  const validate = (state: FormState) => {
    const nextErrors: FormErrors = {}
    if (!state.name.trim()) {
      nextErrors.name = t.nameRequired
    } else if (state.name.trim().length < 3) {
      nextErrors.name = t.nameMin
    }
    if (state.description && state.description.length > 160) {
      nextErrors.description = t.descriptionMax
    }
    if (hasHierarchy && levelTwoAvailable && !state.parentCategoryId) {
      nextErrors.parentCategoryId = t.parentRequired
    }
    return nextErrors
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target
    const checked = (event.target as HTMLInputElement).checked
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
        <p className='text-xs font-semibold uppercase tracking-wide text-stone-500'>{t.headingEyebrow}</p>
        <h2 className='text-xl font-semibold text-gray-900'>{t.headingTitle}</h2>
        <p className='text-sm text-gray-500'>{t.headingSubtitle}</p>
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
            {t.nameLabel} <span className='text-rose-500'>*</span>
          </label>
          <input
            id='name'
            name='name'
            value={formState.name}
            onChange={handleChange}
            placeholder={t.namePlaceholder}
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
              <p className='text-sm font-semibold text-gray-900'>{t.parentTitle}</p>
              <p className='text-xs text-gray-500'>{t.parentSubtitle}</p>
            </div>
            <div className='rounded-2xl border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700'>
              {selectedLevelTwo ? t.parentSelected : t.parentNotSelected}
            </div>
          </div>

          <div className='rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-2 text-xs font-medium text-stone-700'>
            {t.pathLabel}: <span className='font-semibold text-stone-900'>{selectionPath}</span>
          </div>

          <div className='grid gap-4 lg:grid-cols-[220px_1fr]'>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>{t.levelOneTitle}</p>
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
                          <p className='text-xs text-gray-500'>
                            {category.subCategoriesCount} {t.subCountLabel}
                          </p>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className='rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500'>
                    {t.levelOneEmpty}
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>{t.levelTwoTitle}</p>
                {selectedLevelOne && (
                  <span className='text-xs text-gray-400'>
                    {t.levelTwoUnder} {selectedLevelOne.name}
                  </span>
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
                            <p className='text-xs text-gray-500'>
                              {subcategory.description || t.levelTwoEmpty}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : selectedLevelOne ? (
                <div className='rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900'>
                  {t.levelTwoMissing(selectedLevelOne.name)}
                </div>
              ) : (
                <div className='rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500'>
                  {t.levelTwoNone}
                </div>
              )}

              {isSubCategoriesError && (
                <p className='text-xs text-rose-500'>
                  {subCategoriesError instanceof Error
                    ? subCategoriesError.message
                    : t.subLoadError}
                </p>
              )}
            </div>
          </div>

          {showLeafWarning && (
            <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900'>
              {t.leafWarning}
            </div>
          )}
          {formErrors.parentCategoryId && (
            <p className='text-xs font-medium text-rose-500'>{formErrors.parentCategoryId}</p>
          )}
        </div>

        <div className='space-y-1'>
          <label htmlFor='description' className='text-sm font-medium text-gray-700'>
            {t.descriptionLabel}
          </label>
          <textarea
            id='description'
            name='description'
            value={formState.description}
            onChange={handleChange}
            placeholder={t.descriptionPlaceholder}
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
        <p className='text-xs text-gray-500'>{t.footerNote}</p>
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
          {isPending ? t.submitPending : t.submitLabel}
        </button>
      </div>
    </form>
  )
}

export default CategoryCreateForm
