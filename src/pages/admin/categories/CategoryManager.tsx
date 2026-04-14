import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce, useAppLanguage } from '@/hooks'
import { categoryService, queryKeys } from '@/services'
import type { CategoryDTO } from '@/types'
import CategoryCreateForm from './CategoryCreateForm'

type CategoryNode = CategoryDTO & { children: CategoryNode[] }
type HierarchyOption = { value: string; label: string }

const STATUS_BADGE: Record<'true' | 'false', string> = {
  true: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  false: 'bg-amber-50 text-amber-700 border border-amber-200',
}

const formatDate = (isoDate: string | null | undefined, locale: string, fallback: string) => {
  if (!isoDate) return fallback
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

type CategoryTexts = {
  searchLabel: string
  searchPlaceholder: string
  statusLabel: string
  statusAll: string
  statusActive: string
  statusInactive: string
  addLabel: string
  pageTitle: string
  pageSubtitle: string
  metricsTotal: string
  metricsRoot: string
  metricsActive: string
  rootSectionTitle: string
  rootSectionDesc: string
  rootCountLabel: string
  rootLoadError: string
  rootEmpty: string
  rootSelectAction: string
  rootSubCount: string
  statusActiveLabel: string
  statusInactiveLabel: string
  subSectionTitle: string
  subSectionDesc: string
  addChild: string
  selectRootPrompt: string
  childEmpty: string
  detailEmpty: string
  detailSectionTitle: string
  detailQuickInfo: string
  detailIdLabel: string
  detailDescriptionLabel: string
  detailDescriptionNone: string
  detailParent: string
  detailRootParent: string
  detailStatusLabel: string
  detailChildrenCount: string
  detailCreatedAt: string
  detailUpdatedAt: string
  timelineTitle: string
  timelineCreated: string
  timelineUpdated: string
  timelineStatus: string
  editCategory: string
  dateUnknown: string
}

export default function CategoryManager() {
  const { isVietnamese } = useAppLanguage()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')

  const t = React.useMemo<CategoryTexts>(
    () => ({
      searchLabel: isVietnamese ? 'Tìm kiếm' : 'Search',
      searchPlaceholder: isVietnamese ? 'Tìm nhanh theo tên hoặc mô tả danh mục' : 'Search by name or description...',
      statusLabel: isVietnamese ? 'Trạng thái' : 'Status',
      statusAll: isVietnamese ? 'Tất cả' : 'All',
      statusActive: isVietnamese ? 'Hoạt động' : 'Active',
      statusInactive: isVietnamese ? 'Tạm dừng' : 'Inactive',
      addLabel: isVietnamese ? 'Thêm' : 'Add',
      pageTitle: isVietnamese ? 'Quản lý danh mục' : 'Category Management',
      pageSubtitle: isVietnamese
        ? 'Quản trị danh mục đa cấp với bố cục ngang trực quan hơn.'
        : 'Manage multi-level categories with a clear horizontal layout.',
      metricsTotal: isVietnamese ? 'Tổng số danh mục' : 'Total categories',
      metricsRoot: isVietnamese ? 'Danh mục gốc' : 'Root categories',
      metricsActive: isVietnamese ? 'Đang hoạt động' : 'Active categories',
      rootSectionTitle: isVietnamese ? 'Danh mục gốc' : 'Root categories',
      rootSectionDesc: isVietnamese
        ? '6 thẻ ngang. Cuộn để xem thêm hoặc chọn bằng dropdown.'
        : 'Six cards across. Scroll to see more or pick from the dropdown.',
      rootCountLabel: isVietnamese ? 'Danh muc sản phẩm' : 'Category',
      rootLoadError: isVietnamese ? 'Không thể tải danh mục. Vui lòng thử lại.' : 'Unable to load categories. Please try again.',
      rootEmpty: isVietnamese
        ? 'Không có danh mục gốc phù hợp với bộ lọc hiện tại.'
        : 'No root categories match the current filters.',
      rootSelectAction: isVietnamese ? 'Chọn danh mục' : 'Select category',
      rootSubCount: isVietnamese ? 'danh mục con' : 'subcategories',
      statusActiveLabel: isVietnamese ? 'Đang hoạt động' : 'Active',
      statusInactiveLabel: isVietnamese ? 'Tạm dừng' : 'Inactive',
      subSectionTitle: isVietnamese ? 'Danh mục con' : 'Subcategories',
      subSectionDesc: isVietnamese
        ? 'Hiển thị cấp 1 của danh mục gốc đang chọn.'
        : 'Showing level-1 categories under the selected root.',
      addChild: isVietnamese ? 'Thêm danh mục con' : 'Add subcategory',
      selectRootPrompt: isVietnamese
        ? 'Chọn một danh mục gốc ở phía trên để xem danh mục con.'
        : 'Select a root category above to view its subcategories.',
      childEmpty: isVietnamese
        ? 'Chưa có danh mục con. Nhấn "Thêm danh mục con" để tạo mới.'
        : 'No subcategories yet. Click "Add subcategory" to create one.',
      detailEmpty: isVietnamese
        ? 'Chọn danh mục gốc hoặc danh mục con để xem chi tiết.'
        : 'Select a root or subcategory to view details.',
      detailSectionTitle: isVietnamese ? 'Danh mục đang xem' : 'Selected category',
      detailQuickInfo: isVietnamese ? 'Thông tin nhanh' : 'Quick info',
      detailIdLabel: isVietnamese ? 'Mã' : 'ID',
      detailDescriptionLabel: isVietnamese ? 'Mô tả' : 'Description',
      detailDescriptionNone: isVietnamese ? 'Chưa có mô tả' : 'No description',
      detailParent: isVietnamese ? 'Danh mục cha' : 'Parent category',
      detailRootParent: isVietnamese ? 'Danh mục gốc' : 'Root category',
      detailStatusLabel: isVietnamese ? 'Trạng thái' : 'Status',
      detailChildrenCount: isVietnamese ? 'Số danh mục con' : 'Subcategory count',
      detailCreatedAt: isVietnamese ? 'Ngày tạo' : 'Created at',
      detailUpdatedAt: isVietnamese ? 'Cập nhật gần nhất' : 'Last updated',
      timelineTitle: isVietnamese ? 'Timeline' : 'Timeline',
      timelineCreated: isVietnamese ? 'Tạo' : 'Created',
      timelineUpdated: isVietnamese ? 'Cập nhật' : 'Updated',
      timelineStatus: isVietnamese ? 'Tình trạng' : 'Status',
      editCategory: isVietnamese ? 'Chỉnh sửa danh mục' : 'Edit category',
      dateUnknown: isVietnamese ? 'Chưa xác định' : 'Unknown',
    }),
    [isVietnamese]
  )
  const [selectedRootId, setSelectedRootId] = React.useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false)
  const [createParentId, setCreateParentId] = React.useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: categoryService.getAllCategories,
    staleTime: 0,
  })

  const debouncedKeyword = useDebounce(searchTerm, 300)

  const { data: searchData, isFetching: isSearching } = useQuery({
    queryKey: [...queryKeys.categories.all(), 'search', debouncedKeyword],
    queryFn: () => categoryService.searchCategoryByName(debouncedKeyword),
    enabled: Boolean(debouncedKeyword),
    staleTime: 0,
  })

  const categories = React.useMemo(() => normalizeCategoryList(data), [data])
  const searchResults: CategoryDTO[] = React.useMemo(() => normalizeCategorySearch(searchData), [searchData])

  const parentMap = React.useMemo(() => createParentMap(categories), [categories])
  const childrenMap = React.useMemo(() => createChildrenMap(categories), [categories])
  const treeData = React.useMemo(() => buildCategoryTree(categories), [categories])
  const hierarchyOptions = React.useMemo(() => collectHierarchyOptions(treeData), [treeData])

  const searchHighlightIds = React.useMemo(() => new Set(searchResults.map((item) => item.categoryId)), [searchResults])
  const normalizedKeyword = React.useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm])

  const resolveRootId = React.useCallback(
    (categoryId: string | null | undefined) => {
      if (!categoryId) return null
      let currentId: string | null = categoryId
      let parentId = parentMap.get(currentId) ?? null
      while (parentId) {
        currentId = parentId
        parentId = parentMap.get(currentId) ?? null
      }
      return currentId
    },
    [parentMap]
  )

  const matchesStatus = React.useCallback(
    (category: CategoryDTO) =>
      statusFilter === 'all' || (statusFilter === 'active' ? category.isActive : !category.isActive),
    [statusFilter]
  )

  const matchesKeyword = React.useCallback(
    (category: CategoryDTO) => {
      if (!normalizedKeyword) return true
      const localMatch = category.name.toLowerCase().includes(normalizedKeyword)
      const descriptionMatch = category.description?.toLowerCase().includes(normalizedKeyword) ?? false
      return localMatch || descriptionMatch || searchHighlightIds.has(category.categoryId)
    },
    [normalizedKeyword, searchHighlightIds]
  )

  const rootCategories = React.useMemo(
    () => sortByName(categories.filter((cat) => !cat.parentCategoryId)),
    [categories]
  )

  const highlightRootIds = React.useMemo(() => {
    if (!normalizedKeyword && searchHighlightIds.size === 0) return new Set<string>()
    const ids = new Set<string>()
    categories.forEach((category) => {
      const localMatch = normalizedKeyword
        ? category.name.toLowerCase().includes(normalizedKeyword) ||
          (category.description?.toLowerCase().includes(normalizedKeyword) ?? false)
        : false
      if (localMatch || searchHighlightIds.has(category.categoryId)) {
        const rootId = resolveRootId(category.categoryId)
        if (rootId) ids.add(rootId)
      }
    })
    return ids
  }, [categories, normalizedKeyword, resolveRootId, searchHighlightIds])

  const filteredRootCategories = React.useMemo(() => {
    return rootCategories.filter((root) => {
      if (!matchesStatus(root)) return false
      if (!normalizedKeyword) return true
      if (matchesKeyword(root)) return true
      const children = childrenMap[root.categoryId] ?? []
      return children.some((child) => matchesKeyword(child))
    })
  }, [childrenMap, matchesKeyword, matchesStatus, normalizedKeyword, rootCategories])

  React.useEffect(() => {
    if (!filteredRootCategories.length) {
      setSelectedRootId(null)
      setSelectedCategoryId(null)
      return
    }
    const hasSelectedRoot = selectedRootId && filteredRootCategories.some((cat) => cat.categoryId === selectedRootId)
    if (!hasSelectedRoot) {
      const nextRootId = filteredRootCategories[0].categoryId
      setSelectedRootId(nextRootId)
      setSelectedCategoryId((prev) => prev ?? nextRootId)
    }
  }, [filteredRootCategories, selectedRootId])

  React.useEffect(() => {
    if (!selectedCategoryId && selectedRootId) {
      setSelectedCategoryId(selectedRootId)
    }
  }, [selectedCategoryId, selectedRootId])

  const displayedChildren = React.useMemo(() => {
    if (!selectedRootId) return []
    const children = childrenMap[selectedRootId] ?? []
    return sortByName(children.filter((child) => matchesStatus(child) && matchesKeyword(child)))
  }, [childrenMap, matchesKeyword, matchesStatus, selectedRootId])

  const selectedCategory = React.useMemo(
    () => categories.find((cat) => cat.categoryId === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  )

  const metrics = React.useMemo(() => {
    const total = categories.length
    const root = categories.filter((cat) => !cat.parentCategoryId).length
    const active = categories.filter((cat) => cat.isActive).length
    return [
      {
        label: t.metricsTotal,
        value: total,
        iconBg: 'bg-blue-50',
        icon: (
          <svg className='h-5 w-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
            <path d='M4 6h16v12H4z' strokeLinejoin='round' />
            <path d='M4 10h16M9 2v4M15 2v4' strokeLinecap='round' />
          </svg>
        ),
      },
      {
        label: t.metricsRoot,
        value: root,
        iconBg: 'bg-purple-50',
        icon: (
          <svg className='h-5 w-5 text-purple-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
            <path d='M6 18V6m0 0 4-4m-4 4-4-4M18 6v12m0 0-4 4m4-4 4 4' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        ),
      },
      {
        label: t.metricsActive,
        value: active,
        iconBg: 'bg-green-50',
        icon: (
          <svg className='h-5 w-5 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
            <path d='m6 12 3 3 9-9' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        ),
      },
    ]
  }, [categories, t.metricsActive, t.metricsRoot, t.metricsTotal])

  const handleRootSelect = (categoryId: string) => {
    setSelectedRootId(categoryId)
    setSelectedCategoryId(categoryId)
  }

  const handleChildSelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }

  const handleQuickSelect = (categoryId: string) => {
    if (!categoryId) return
    const rootId = resolveRootId(categoryId) ?? categoryId
    setSelectedRootId(rootId)
    setSelectedCategoryId(categoryId)
    window.requestAnimationFrame(() => {
      document.getElementById(`root-card-${rootId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }

  const openCreateForm = (parentId: string | null = null) => {
    setCreateParentId(parentId)
    setIsCreateFormOpen(true)
  }

  const closeCreateForm = () => {
    setIsCreateFormOpen(false)
    setCreateParentId(null)
  }

  const handleCreateSuccess = (newCategory: CategoryDTO) => {
    setSelectedCategoryId(newCategory.categoryId)
    const nextRootId = resolveRootId(newCategory.parentCategoryId ?? newCategory.categoryId) ?? newCategory.categoryId
    setSelectedRootId(nextRootId)
    setIsCreateFormOpen(false)
    setCreateParentId(null)
    window.requestAnimationFrame(() => {
      document
        .getElementById(`root-card-${nextRootId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }

  const selectedHierarchyValue = selectedCategoryId ?? ''

  return (
    <div className='mx-auto w-full max-w-[1500px] space-y-6 px-1'>
      <header className='flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm'>
        <div>
          <h1 className='text-[22px] font-semibold text-gray-900'>{t.pageTitle}</h1>
          <p className='mt-1 text-sm text-gray-500'>{t.pageSubtitle}</p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='inline-flex h-10 items-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300'
            onClick={() => openCreateForm(null)}
          >
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M12 6v12M6 12h12' strokeLinecap='round' />
            </svg>
            {t.addLabel}
          </button>
        </div>
      </header>

      <div className='grid gap-4 md:grid-cols-3'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>{metric.label}</p>
                <p className='mt-2 text-2xl font-semibold text-gray-900'>{isLoading ? '...' : metric.value}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.iconBg}`}>
                {metric.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
        <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]'>
          <div className='flex flex-col space-y-2'>
            <label className='text-xs font-medium text-gray-700'>{t.searchLabel || 'Search'}</label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='7' />
                  <path d='m16.5 16.5 4 4' strokeLinecap='round' />
                </svg>
              </span>
              <input
                type='text'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t.searchPlaceholder}
                className='h-10 w-full appearance-none rounded-xl border border-gray-200 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
                style={{ paddingLeft: '3rem' }}
              />
              {isSearching && (
                <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
                  <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                    <circle cx='12' cy='12' r='9' strokeOpacity='0.25' />
                    <path d='M21 12a9 9 0 0 0-9-9' strokeLinecap='round' />
                  </svg>
                </span>
              )}
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='w-[150px] rounded-xl border border-gray-200 bg-white p-3'>
              <label className='mb-1 block text-xs font-medium text-gray-600'>{t.statusLabel}</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
                className='h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'
              >
                <option value='all'>{t.statusAll}</option>
                <option value='active'>{t.statusActive}</option>
                <option value='inactive'>{t.statusInactive}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <section className='space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>{t.rootSectionTitle}</p>
            <p className='text-sm text-gray-600'>{t.rootSectionDesc}</p>
          </div>
          <span className='text-xs font-semibold text-gray-400'>
            {filteredRootCategories.length} {t.rootCountLabel}
          </span>
        </div>
        {isError && <p className='text-sm text-red-500'>{t.rootLoadError}</p>}
        <RootCategoryGrid
          categories={filteredRootCategories}
          highlightIds={highlightRootIds}
          isLoading={isLoading}
          selectedId={selectedRootId}
          texts={t}
          onSelect={handleRootSelect}
        />
      </section>

      <div className='overflow-x-auto'>
        <div className='grid min-w-[1050px] gap-6 grid-cols-[280px_minmax(740px,1fr)] xl:grid-cols-[300px_minmax(760px,1fr)]'>
        <div className='w-full'>
          <SubCategoryPanel
            categories={displayedChildren}
            isLoading={isLoading}
            parentCategory={categories.find((cat) => cat.categoryId === selectedRootId) ?? null}
            selectedId={selectedCategoryId}
            texts={t}
            onSelect={handleChildSelect}
            onAddChild={openCreateForm}
          />
        </div>

        <div className='w-full col-start-2 justify-self-stretch'>
          <CategoryDetailPanel
            category={selectedCategory}
            onAddChild={openCreateForm}
            texts={t}
            locale={isVietnamese ? 'vi-VN' : 'en-US'}
          />
        </div>
      </div>
      </div>

      {isCreateFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4'>
          <div className='relative w-full max-w-xl'>
            <button
              type='button'
              onClick={closeCreateForm}
              className='absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow hover:text-gray-800'
              aria-label={isVietnamese ? 'Đóng form tạo danh mục' : 'Close category form'}
            >
              <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                <path d='M6 6l12 12M18 6l-12 12' strokeLinecap='round' />
              </svg>
            </button>

            <CategoryCreateForm
              parentOptions={categories}
              defaultParentId={createParentId}
              onSuccess={handleCreateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function buildCategoryTree(categories: CategoryDTO[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>()
  categories.forEach((category) => {
    map.set(category.categoryId, { ...category, children: [] })
  })

  const roots: CategoryNode[] = []

  map.forEach((node) => {
    if (node.parentCategoryId && map.has(node.parentCategoryId)) {
      map.get(node.parentCategoryId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (nodes: CategoryNode[]): CategoryNode[] =>
    nodes
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((node) => ({ ...node, children: sortNodes(node.children) }))

  return sortNodes(roots)
}

function collectHierarchyOptions(nodes: CategoryNode[]): HierarchyOption[] {
  const options: HierarchyOption[] = []
  const traverse = (input: CategoryNode[], path: string[]) => {
    input.forEach((node) => {
      const currentPath = [...path, node.name]
      options.push({ value: node.categoryId, label: currentPath.join(' > ') })
      if (node.children.length) traverse(node.children, currentPath)
    })
  }
  traverse(nodes, [])
  return options
}

function createChildrenMap(categories: CategoryDTO[]) {
  const map: Record<string, CategoryDTO[]> = {}
  categories.forEach((category) => {
    if (!category.parentCategoryId) return
    if (!map[category.parentCategoryId]) {
      map[category.parentCategoryId] = []
    }
    map[category.parentCategoryId].push(category)
  })
  Object.values(map).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)))
  return map
}

function createParentMap(categories: CategoryDTO[]) {
  const map = new Map<string, string | null>()
  categories.forEach((category) => {
    map.set(category.categoryId, category.parentCategoryId ?? null)
  })
  return map
}

function sortByName(categories: CategoryDTO[]) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name))
}

function normalizeCategoryList(payload: unknown): CategoryDTO[] {
  if (Array.isArray(payload)) return payload as CategoryDTO[]
  if (!payload || typeof payload !== 'object') return []
  const maybeData = (payload as { data?: unknown }).data
  return Array.isArray(maybeData) ? (maybeData as CategoryDTO[]) : []
}

function normalizeCategorySearch(payload: unknown): CategoryDTO[] {
  if (Array.isArray(payload)) return payload as CategoryDTO[]
  if (!payload || typeof payload !== 'object') return []
  const maybeData = (payload as { data?: unknown }).data
  if (Array.isArray(maybeData)) return maybeData as CategoryDTO[]
  if (maybeData && typeof maybeData === 'object') return [maybeData as CategoryDTO]
  return []
}

interface RootCategoryGridProps {
  categories: CategoryDTO[]
  selectedId: string | null
  highlightIds: Set<string>
  isLoading: boolean
  texts: CategoryTexts
  onSelect: (categoryId: string) => void
}

function RootCategoryGrid({ categories, selectedId, highlightIds, isLoading, texts, onSelect }: RootCategoryGridProps) {
  if (isLoading) {
    return (
      <div className='overflow-x-auto pb-2'>
        <div className='flex min-w-max gap-3'>
        {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='h-28 w-[180px] shrink-0 rounded-lg border border-dashed border-gray-200 bg-gray-50 animate-pulse' />
        ))}
        </div>
      </div>
    )
  }

  if (!categories.length) {
    return <p className='text-sm text-gray-500'>{texts.rootEmpty}</p>
  }

  return (
    <div className='overflow-x-auto pb-2'>
      <div className='flex min-w-max gap-3'>
        {categories.map((category) => {
          const isSelected = selectedId === category.categoryId
          const isHighlighted = highlightIds.has(category.categoryId)
          return (
            <button
              key={category.categoryId}
              id={`root-card-${category.categoryId}`}
              type='button'
              onClick={() => onSelect(category.categoryId)}
              className={`flex h-28 w-[180px] shrink-0 flex-col overflow-hidden !rounded-xl border !px-3 !py-2.5 text-left transition duration-150 ${
                isSelected
                  ? 'border-stone-900 bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-md ring-1 ring-[#e8dccd] ring-offset-1 ring-offset-white'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-[#fdfaf5] hover:shadow-sm'
              } ${isHighlighted && !isSelected ? 'ring-2 ring-stone-200 ring-offset-2' : ''}`}
            >
              <div className='flex items-start justify-between gap-2'>
                <h3 className='line-clamp-2 text-xs font-semibold leading-snug'>{category.name}</h3>
                <span className={`inline-flex shrink-0 rounded-lg px-1.5 py-0.5 text-[9px] font-semibold ${
                  STATUS_BADGE[category.isActive ? 'true' : 'false']
                } ${isSelected ? 'bg-white/20 text-white' : ''}`}>
                  {category.isActive ? texts.statusActiveLabel : texts.statusInactiveLabel}
                </span>
              </div>
              <p className={`mt-1 text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                {category.subCategoriesCount} {texts.rootSubCount}
              </p>
              <span className={`mt-auto inline-flex items-center text-[10px] font-semibold ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                {texts.rootSelectAction}
                <svg className='ml-1 h-3.5 w-3.5' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.4'>
                  <path d='M6 4l4 4-4 4' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface SubCategoryPanelProps {
  categories: CategoryDTO[]
  parentCategory: CategoryDTO | null
  selectedId: string | null
  isLoading: boolean
  texts: CategoryTexts
  onSelect: (categoryId: string) => void
  onAddChild: (parentId: string | null) => void
}

function SubCategoryPanel({ categories, parentCategory, selectedId, isLoading, texts, onSelect, onAddChild }: SubCategoryPanelProps) {
  return (
    <section className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>{texts.subSectionTitle}</p>
          <p className='text-sm text-gray-600'>{texts.subSectionDesc}</p>
        </div>
        {parentCategory && (
          <button
            type='button'
            className='inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50'
            onClick={() => onAddChild(parentCategory.categoryId)}
          >
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M12 6v12M6 12h12' strokeLinecap='round' />
            </svg>
            {texts.addChild}
          </button>
        )}
      </div>

      {!parentCategory && <p className='mt-4 text-sm text-gray-500'>{texts.selectRootPrompt}</p>}

      {parentCategory && (
        <div className='mt-4'>
          {isLoading ? (
            <div className='flex flex-wrap gap-3 overflow-x-auto pb-2'>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='h-28 min-w-[220px] flex-1 rounded-xl border border-dashed border-gray-200 bg-gray-50 animate-pulse' />
              ))}
            </div>
          ) : categories.length ? (
            <div className='grid gap-3 md:grid-cols-2'>
              {categories.map((category) => {
                const isSelected = selectedId === category.categoryId
                return (
                  <button
                    key={category.categoryId}
                    type='button'
                    onClick={() => onSelect(category.categoryId)}
                    className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-stone-300 ${
                      isSelected ? 'border-stone-900 bg-stone-900/90 text-white shadow-lg' : 'border-stone-100 bg-white'
                    }`}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <p className='font-semibold'>{category.name}</p>
                      <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${
                        STATUS_BADGE[category.isActive ? 'true' : 'false']
                      } ${isSelected ? 'bg-white/20 text-white' : ''}`}>
                        {category.isActive ? texts.statusActiveLabel : texts.statusInactiveLabel}
                      </span>
                    </div>
                    <p className={`mt-2 text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {category.description || texts.detailDescriptionNone}
                    </p>
                    <p className={`mt-3 text-sm font-medium ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      {category.subCategoriesCount} {texts.rootSubCount}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500'>
              {texts.childEmpty}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function CategoryDetailPanel({
  category,
  onAddChild,
  texts,
  locale,
}: {
  category: CategoryDTO | null
  onAddChild: (parentId: string | null) => void
  texts: CategoryTexts
  locale: string
}) {
  if (!category) {
    return (
      <section className='flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm'>
        {texts.detailEmpty}
      </section>
    )
  }

  return (
    <section className='min-h-[760px] space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
      <div className='flex items-start justify-between gap-3 border-b border-gray-100 pb-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>{texts.detailSectionTitle}</p>
          <h2 className='text-xl font-semibold text-gray-900'>{category.name}</h2>
          <p className='mt-1 text-sm text-gray-500'>{category.description || texts.detailDescriptionNone}</p>
        </div>
        <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${STATUS_BADGE[category.isActive ? 'true' : 'false']}`}>
          {category.isActive ? texts.statusActiveLabel : texts.statusInactiveLabel}
        </span>
      </div>
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h3 className='text-sm font-semibold text-gray-900'>{texts.detailQuickInfo}</h3>
          <span className='text-xs text-gray-500'>
            {texts.detailIdLabel} #{category.categoryId}
          </span>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <DetailCard label={texts.detailDescriptionLabel} value={category.description || texts.detailDescriptionNone} tone='muted' />
          <DetailCard label={texts.detailStatusLabel} value={category.isActive ? texts.statusActiveLabel : texts.statusInactiveLabel} highlight />
          <DetailCard
            label={texts.detailParent}
            value={category.parentCategoryName ?? texts.detailRootParent}
          />
          <DetailCard label={texts.detailChildrenCount} value={`${category.subCategoriesCount}`} />
          <DetailCard label={texts.detailCreatedAt} value={formatDate(category.createdAt, locale, texts.dateUnknown)} />
          <DetailCard label={texts.detailUpdatedAt} value={formatDate(category.updatedAt, locale, texts.dateUnknown)} />
        </div>
      </div>

      <div className='rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4'>
        <h3 className='text-sm font-semibold text-gray-900'>{texts.timelineTitle}</h3>
        <div className='mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          <TimelineItem label={texts.timelineCreated} value={formatDate(category.createdAt, locale, texts.dateUnknown)} />
          <TimelineItem label={texts.timelineUpdated} value={formatDate(category.updatedAt, locale, texts.dateUnknown)} />
          <TimelineItem label={texts.timelineStatus} value={category.isActive ? texts.statusActiveLabel : texts.statusInactiveLabel} />
        </div>
      </div>

      <div className='flex flex-wrap gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4'>
        <button
          type='button'
          className='inline-flex flex-1 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300'
        >
          <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
            <path d='m12.5 5.5 6 6L9 21l-6 .5.5-6z' strokeLinejoin='round' />
            <path d='M4 21h16' strokeLinecap='round' />
          </svg>
          {texts.editCategory}
        </button>
        <button
          type='button'
          className='inline-flex flex-1 min-w-[180px] items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-200'
          onClick={() => onAddChild(category.categoryId)}
        >
          <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
            <path d='M12 6v12M6 12h12' strokeLinecap='round' />
          </svg>
          {texts.addChild}
        </button>
      </div>
    </section>
  )
}

function DetailCard({ label, value, highlight, tone }: { label: string; value: string; highlight?: boolean; tone?: 'muted' }) {
  return (
    <div
      className={`flex w-full min-w-0 rounded-2xl border p-4 ${
        highlight ? 'border-stone-900 bg-stone-900/90 text-white' : 'border-gray-100 bg-white'
      } ${tone === 'muted' && !highlight ? 'bg-gray-50/70' : ''}`}
    >
      <div className='min-w-0'>
      <dt className={`text-[11px] font-medium uppercase tracking-wide ${highlight ? 'text-white/70' : 'text-gray-500'}`}>{label}</dt>
      <dd className={`mt-2 text-sm font-semibold break-words ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</dd>
      </div>
    </div>
  )
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm'>
      <span className='shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400'>{label}</span>
      <span className='min-w-0 text-xs font-medium text-gray-900 break-words'>{value}</span>
    </div>
  )
}