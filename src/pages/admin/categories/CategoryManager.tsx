import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks'
import { categoryService, queryKeys } from '@/services'
import type { CategoryDTO } from '@/types'
import CategoryCreateForm from './CategoryCreateForm'

type CategoryNode = CategoryDTO & { children: CategoryNode[] }

const STATUS_BADGE: Record<'true' | 'false', string> = {
  true: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  false: 'bg-amber-50 text-amber-700 border border-amber-200',
}

const formatDate = (isoDate?: string | null) => {
  if (!isoDate) return 'Chưa xác định'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

const buildCategoryTree = (categories: CategoryDTO[]): CategoryNode[] => {
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

  const sortNodes = (nodes: CategoryNode[]) => {
    return nodes
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((node) => ({ ...node, children: sortNodes(node.children) }))
  }

  return sortNodes(roots)
}

const filterTree = (
  nodes: CategoryNode[],
  keyword: string,
  statusFilter: 'all' | 'active' | 'inactive',
  matchIds?: Set<string>
): CategoryNode[] => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  const walk = (input: CategoryNode[]): CategoryNode[] => {
    const filtered: CategoryNode[] = []

    input.forEach((node) => {
      const childMatches = walk(node.children)
      const searchMatch = !normalizedKeyword || node.name.toLowerCase().includes(normalizedKeyword)
      const forcedMatch = matchIds?.has(node.categoryId) ?? false
      const statusMatch =
        statusFilter === 'all' || (statusFilter === 'active' ? node.isActive : !node.isActive)

      const includeSelf = statusMatch && (normalizedKeyword ? searchMatch || forcedMatch : true)

      if (includeSelf || childMatches.length) {
        filtered.push({ ...node, children: childMatches })
      }
    })

    return filtered
  }

  return walk(nodes)
}

const findNodeById = (nodes: CategoryNode[], nodeId: string): CategoryNode | null => {
  for (const node of nodes) {
    if (node.categoryId === nodeId) return node
    const childMatch = findNodeById(node.children, nodeId)
    if (childMatch) return childMatch
  }
  return null
}

export default function CategoryManager() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')
  const [parentFilter, setParentFilter] = React.useState<'all' | string>('all')
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set())
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

  const categories = data?.data ?? []
  const searchResults: CategoryDTO[] = React.useMemo(() => {
    if (!searchData?.data) return []
    return Array.isArray(searchData.data) ? searchData.data : [searchData.data]
  }, [searchData])
  const parentOptions = React.useMemo(() => {
    const roots = categories
      .filter((cat) => !cat.parentCategoryId)
      .map((cat) => ({ value: cat.categoryId, label: cat.name }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return [{ value: 'all', label: 'Tất cả danh mục' }, ...roots]
  }, [categories])

  React.useEffect(() => {
    if (!selectedCategoryId && categories.length) {
      setSelectedCategoryId(categories[0].categoryId)
    }
    if (categories.length && expandedNodes.size === 0) {
      const rootIds = categories.filter((cat) => !cat.parentCategoryId).map((cat) => cat.categoryId)
      setExpandedNodes(new Set(rootIds))
    }
  }, [categories, selectedCategoryId, expandedNodes.size])

  const treeData = React.useMemo(() => buildCategoryTree(categories), [categories])

  const scopedTree = React.useMemo(() => {
    if (parentFilter === 'all') return treeData
    const targetNode = findNodeById(treeData, parentFilter)
    return targetNode ? [targetNode] : []
  }, [treeData, parentFilter])

  const filteredTree = React.useMemo(() => {
    const highlightIds = debouncedKeyword && searchResults.length ? new Set(searchResults.map((item) => item.categoryId)) : undefined
    return filterTree(scopedTree, debouncedKeyword || searchTerm, statusFilter, highlightIds)
  }, [scopedTree, debouncedKeyword, searchResults, searchTerm, statusFilter])

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
        label: 'Tổng số danh mục',
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
        label: 'Danh mục gốc',
        value: root,
        iconBg: 'bg-purple-50',
        icon: (
          <svg className='h-5 w-5 text-purple-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
            <path d='M6 18V6m0 0 4-4m-4 4-4-4M18 6v12m0 0-4 4m4-4 4 4' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        ),
      },
      {
        label: 'Đang hoạt động',
        value: active,
        iconBg: 'bg-green-50',
        icon: (
          <svg className='h-5 w-5 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
            <path d='m6 12 3 3 9-9' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        ),
      },
    ]
  }, [categories])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const handleSelect = (nodeId: string) => {
    setSelectedCategoryId(nodeId)
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
    setIsCreateFormOpen(false)
    setCreateParentId(null)
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (newCategory.parentCategoryId) {
        next.add(newCategory.parentCategoryId)
      } else {
        next.add(newCategory.categoryId)
      }
      return next
    })
  }

  const renderTree = (nodes: CategoryNode[], depth = 0) => {
    if (!nodes.length) return null
    return (
      <ul className='space-y-1.5' role={depth === 0 ? 'tree' : 'group'}>
        {nodes.map((node) => {
          const hasChildren = node.children.length > 0
          const isExpanded = expandedNodes.has(node.categoryId)
          const isSelected = selectedCategoryId === node.categoryId
          return (
            <li key={node.categoryId}>
              <div
                className={`group flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-sm transition-colors duration-150 ${
                  isSelected
                    ? 'bg-stone-100/80 text-stone-900 ring-1 ring-stone-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={{ paddingLeft: `${depth * 20 + 12}px` }}
                role='treeitem'
                aria-selected={isSelected}
              >
                {hasChildren ? (
                  <button
                    type='button'
                    className='rounded-full border border-gray-200 bg-white p-1 text-gray-500 transition hover:border-gray-300 hover:text-gray-700'
                    onClick={() => toggleNode(node.categoryId)}
                    aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                    aria-expanded={isExpanded}
                  >
                    <svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                      {isExpanded ? <path d='M6 12h12' strokeLinecap='round' /> : <path d='M12 6v12M6 12h12' strokeLinecap='round' />}
                    </svg>
                  </button>
                ) : (
                  <span className='h-1.5 w-1.5 rounded-full bg-gray-300' aria-hidden='true' />
                )}
                <button
                  type='button'
                  className='flex-1 text-left'
                  onClick={() => handleSelect(node.categoryId)}
                >
                  <p className='font-medium leading-tight'>{node.name}</p>
                  <p className='text-xs text-gray-500'>{node.subCategoriesCount} danh mục con</p>
                </button>
                <span className={`inline-flex rounded-xl px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[node.isActive ? 'true' : 'false']}`}>
                  {node.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {hasChildren && isExpanded && (
                <div className='mt-1 border-l border-dashed border-gray-200 pl-4'>{renderTree(node.children, depth + 1)}</div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className='space-y-6'>
      <header className='flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.28em] text-gray-500'>Woodify Admin</p>
          <h1 className='text-[22px] font-semibold text-gray-900'>Quản lý danh mục</h1>
          <p className='mt-1 text-sm text-gray-500'>Sắp xếp danh mục đa tầng để tối ưu hiển thị và kiểm soát sản phẩm.</p>
        </div>
      </header>

      <div className='rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap items-center gap-3 md:gap-4'>
          <div className='relative flex-1 min-w-[240px]'>
            <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
              <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                <circle cx='11' cy='11' r='7' />
                <path d='m16.5 16.5 4 4' strokeLinecap='round' />
              </svg>
            </span>
            <input
              type='search'
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder='Tìm nhanh theo tên hoặc mô tả danh mục'
              className='h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 transition focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200'
            />
          </div>

          <div className='flex flex-1 min-w-[200px] flex-wrap gap-3 sm:flex-nowrap'>
            <label className='flex-1 text-xs font-medium text-gray-600'>
              <span className='mb-1 block text-[11px] uppercase tracking-wide text-gray-500'>Trạng thái</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
                className='h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200'
              >
                <option value='all'>Tất cả</option>
                <option value='active'>Đang hoạt động</option>
                <option value='inactive'>Tạm dừng</option>
              </select>
            </label>
            <label className='flex-1 text-xs font-medium text-gray-600'>
              <span className='mb-1 block text-[11px] uppercase tracking-wide text-gray-500'>Danh mục cha</span>
              <select
                value={parentFilter}
                onChange={(event) => setParentFilter(event.target.value)}
                className='h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200'
              >
                {parentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className='ml-auto flex items-center gap-2'>
            <button
              type='button'
              className='inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-200'
              onClick={() => refetch()}
            >
              <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                <path d='M4 4v6h6' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M20 20v-6h-6' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M5 19a9 9 0 0 0 14-2.1M19 5A9 9 0 0 0 5 7.1' strokeLinecap='round' />
              </svg>
              Làm mới
            </button>
            <button
              type='button'
              className='inline-flex h-11 items-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300'
              onClick={() => openCreateForm(null)}
            >
              <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                <path d='M12 6v12M6 12h12' strokeLinecap='round' />
              </svg>
              Thêm danh mục
            </button>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-xl border border-gray-100 bg-white/90 p-4 shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>{metric.label}</p>
                <p className='mt-1 text-xl font-semibold text-gray-900'>{isLoading ? '...' : metric.value}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.iconBg}`}>{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='grid gap-6 lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr]'>
        <section className='relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='top-0 z-10 border-b border-gray-100 bg-white/95 p-5'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Cây danh mục</p>
                <p className='mt-1 text-sm text-gray-600'>Mở rộng nhánh để rà soát cấu trúc nhiều cấp nhanh chóng.</p>
              </div>
              <span className='text-xs font-semibold text-gray-400'>{categories.length} mục</span>
            </div>
          </div>
          <div className='flex-1 overflow-y-auto p-5 pt-4'>
            <div className='mb-4 rounded-xl border border-dashed border-gray-200 bg-stone-50/70 px-4 py-3 text-xs text-gray-600'>
              Sử dụng thanh tìm kiếm và bộ lọc phía trên để thu hẹp danh mục. Nhấn biểu tượng cộng để mở nhánh con.
            </div>
            {isLoading && <p className='text-sm text-gray-500'>Đang tải danh mục...</p>}
            {isError && <p className='text-sm text-red-500'>Không thể tải danh mục. Vui lòng thử lại.</p>}
            {!isLoading && !isError && filteredTree.length === 0 && (
              <p className='text-sm text-gray-500'>Không tìm thấy danh mục phù hợp.</p>
            )}
            {!isLoading && !isError && <div className='pr-1'>{renderTree(filteredTree)}</div>}
          </div>
        </section>

        <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
          {selectedCategory ? (
            <div className='space-y-6'>
              <div className='flex items-start justify-between gap-3 border-b border-gray-100 pb-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Danh mục đang xem</p>
                  <h2 className='text-xl font-semibold text-gray-900'>{selectedCategory.name}</h2>
                  <p className='mt-1 text-sm text-gray-500'>{selectedCategory.description || 'Chưa có mô tả'}</p>
                </div>
                <span
                  className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${
                    STATUS_BADGE[selectedCategory.isActive ? 'true' : 'false']
                  }`}
                >
                  {selectedCategory.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
              </div>

              <section className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold text-gray-900'>Thông tin cơ bản</h3>
                  <span className='text-xs text-gray-500'>Mã #{selectedCategory.categoryId}</span>
                </div>
                <dl className='grid gap-3 md:grid-cols-2'>
                  <div className='rounded-xl border border-gray-100 bg-gray-50/60 p-4'>
                    <dt className='text-[11px] font-medium uppercase tracking-wide text-gray-500'>Mô tả</dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {selectedCategory.description || 'Chưa có mô tả'}
                    </dd>
                  </div>
                  <div className='rounded-xl border border-gray-100 bg-gray-50/60 p-4'>
                    <dt className='text-[11px] font-medium uppercase tracking-wide text-gray-500'>Trạng thái</dt>
                    <dd className='mt-2 text-sm font-semibold text-gray-900'>
                      {selectedCategory.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                    </dd>
                  </div>
                </dl>
              </section>

              <div className='h-px bg-gray-100' />

              <section className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>Phân cấp</h3>
                <dl className='grid gap-3 md:grid-cols-2'>
                  <div className='rounded-xl border border-gray-100 bg-white p-4'>
                    <dt className='text-[11px] font-medium uppercase tracking-wide text-gray-500'>Danh mục cha</dt>
                    <dd className='mt-1 text-sm font-medium text-gray-900'>
                      {selectedCategory.parentCategoryName ?? 'Danh mục gốc'}
                    </dd>
                  </div>
                  <div className='rounded-xl border border-gray-100 bg-white p-4'>
                    <dt className='text-[11px] font-medium uppercase tracking-wide text-gray-500'>Số danh mục con</dt>
                    <dd className='mt-1 text-sm font-medium text-gray-900'>
                      {selectedCategory.subCategoriesCount}
                    </dd>
                  </div>
                </dl>
              </section>

              <div className='h-px bg-gray-100' />

              <section className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>Thống kê</h3>
                <dl className='grid gap-3 md:grid-cols-2'>
                  <div className='rounded-xl border border-gray-100 bg-white p-4'>
                    <dt className='text-[11px] font-medium uppercase tracking-wide text-gray-500'>Ngày tạo</dt>
                    <dd className='mt-1 text-sm font-medium text-gray-900'>{formatDate(selectedCategory.createdAt)}</dd>
                  </div>
                  <div className='rounded-xl border border-gray-100 bg-white p-4'>
                    <dt className='text-[11px] font-medium uppercase tracking-wide text-gray-500'>Cập nhật gần nhất</dt>
                    <dd className='mt-1 text-sm font-medium text-gray-900'>{formatDate(selectedCategory.updatedAt)}</dd>
                  </div>
                </dl>
              </section>

              <div className='h-px bg-gray-100' />

              <section className='space-y-3'>
                <h3 className='text-sm font-semibold text-gray-900'>Hành động</h3>
                <div className='flex flex-wrap gap-3'>
                  <button
                    type='button'
                    className='inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300'
                  >
                    <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                      <path d='m12.5 5.5 6 6L9 21l-6 .5.5-6z' strokeLinejoin='round' />
                      <path d='M4 21h16' strokeLinecap='round' />
                    </svg>
                    Chỉnh sửa danh mục
                  </button>
                  <button
                    type='button'
                    className='inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-200'
                    onClick={() => openCreateForm(selectedCategory.categoryId)}
                  >
                    <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                      <path d='M12 6v12M6 12h12' strokeLinecap='round' />
                    </svg>
                    Thêm danh mục con
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-gray-500'>
              Chọn một danh mục trong cây bên trái để xem chi tiết
            </div>
          )}
        </section>
      </div>

      {isCreateFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4'>
          <div className='relative w-full max-w-xl'>
            <button
              type='button'
              onClick={closeCreateForm}
              className='absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow hover:text-gray-800'
              aria-label='Đóng form tạo danh mục'
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
