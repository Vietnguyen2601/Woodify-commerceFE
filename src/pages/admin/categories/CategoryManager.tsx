import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoryService, queryKeys } from '@/services'
import type { CategoryDTO } from '@/types'
import CategoryCreateForm from './CategoryCreateForm'

type CategoryNode = CategoryDTO & { children: CategoryNode[] }

const STATUS_BADGE: Record<'true' | 'false', string> = {
  true: 'bg-green-100 text-green-700 border border-green-200',
  false: 'bg-gray-100 text-gray-600 border border-gray-200',
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

const filterTree = (nodes: CategoryNode[], keyword: string): CategoryNode[] => {
  if (!keyword.trim()) return nodes
  const lowerKeyword = keyword.toLowerCase()

  const filtered: CategoryNode[] = []

  nodes.forEach((node) => {
    const childMatches = filterTree(node.children, keyword)
    const selfMatch = node.name.toLowerCase().includes(lowerKeyword)
    if (selfMatch || childMatches.length) {
      filtered.push({ ...node, children: childMatches })
    }
  })

  return filtered
}

export default function CategoryManager() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set())
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false)
  const [createParentId, setCreateParentId] = React.useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: categoryService.getAllCategories,
    staleTime: 0,
  })

  const categories = data?.data ?? []

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
  const filteredTree = React.useMemo(() => filterTree(treeData, searchTerm), [treeData, searchTerm])

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
      <ul className='space-y-1'>
        {nodes.map((node) => {
          const hasChildren = node.children.length > 0
          const isExpanded = expandedNodes.has(node.categoryId)
          return (
            <li key={node.categoryId}>
              <div
                className={`flex items-center gap-2 rounded-xl px-2 py-1 text-sm ${
                  selectedCategoryId === node.categoryId ? 'bg-stone-100 text-stone-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
              >
                {hasChildren ? (
                  <button
                    type='button'
                    className='rounded-full border border-gray-200 p-0.5 text-gray-500 hover:bg-white'
                    onClick={() => toggleNode(node.categoryId)}
                    aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                  >
                    <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                      {isExpanded ? <path d='M6 12h12' strokeLinecap='round' /> : <path d='M12 6v12M6 12h12' strokeLinecap='round' />}
                    </svg>
                  </button>
                ) : (
                  <span className='h-2 w-2 rounded-full bg-gray-300' />
                )}
                <button type='button' className='flex-1 text-left' onClick={() => handleSelect(node.categoryId)}>
                  <p className='font-medium leading-tight'>{node.name}</p>
                  <p className='text-xs text-gray-500'>{node.subCategoriesCount} danh mục con</p>
                </button>
                <span className={`inline-flex rounded-xl px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[node.isActive ? 'true' : 'false']}`}>
                  {node.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {hasChildren && isExpanded && <div className='mt-1'>{renderTree(node.children, depth + 1)}</div>}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className='space-y-6'>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Quản lý danh mục</h1>
          <p className='text-sm text-gray-500'>Sắp xếp danh mục đa tầng để dễ quản trị và phân loại sản phẩm</p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'
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
            className='inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-stone-500 to-stone-600 px-5 py-2.5 text-sm font-semibold text-white shadow'
            onClick={() => openCreateForm(null)}
          >
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M12 6v12M6 12h12' strokeLinecap='round' />
            </svg>
            Thêm danh mục
          </button>
        </div>
      </header>

      <div className='grid gap-4 md:grid-cols-3'>
        {metrics.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{isLoading ? '...' : metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconBg}`}>{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='grid gap-6 lg:grid-cols-[360px_1fr]'>
        <section className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='space-y-3'>
            <div className='space-y-2'>
              <label className='text-xs font-medium text-gray-700'>Tìm kiếm danh mục</label>
              <div className='relative'>
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
                  placeholder='Tên danh mục, mô tả...'
                  className='h-10 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
                />
              </div>
            </div>
            <div className='rounded-xl border border-dashed border-gray-200 bg-stone-50/60 p-3 text-xs text-gray-600'>
              Dùng cây danh mục bên dưới để xem nhanh cấu trúc nhiều cấp. Nhấn " + " để mở nhánh, hoặc chọn danh mục để xem chi tiết.
            </div>
          </div>

          <div className='mt-4 max-h-[520px] overflow-y-auto pr-2'>
            {isLoading && <p className='text-sm text-gray-500'>Đang tải danh mục...</p>}
            {isError && (
              <p className='text-sm text-red-500'>Không thể tải danh mục. Vui lòng thử lại.</p>
            )}
            {!isLoading && !isError && filteredTree.length === 0 && (
              <p className='text-sm text-gray-500'>Không tìm thấy danh mục phù hợp.</p>
            )}
            {!isLoading && !isError && renderTree(filteredTree)}
          </div>
        </section>

        <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
          {selectedCategory ? (
            <div className='space-y-5'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>{selectedCategory.name}</h2>
                  <p className='text-sm text-gray-500'>{selectedCategory.description || 'Chưa có mô tả'}</p>
                </div>
                <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${STATUS_BADGE[selectedCategory.isActive ? 'true' : 'false']}`}>
                  {selectedCategory.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
              </div>

              <dl className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-2xl border border-gray-100 bg-gray-50/50 p-4'>
                  <dt className='text-xs font-medium uppercase tracking-wide text-gray-500'>Danh mục cha</dt>
                  <dd className='text-sm font-medium text-gray-900'>
                    {selectedCategory.parentCategoryName ?? 'Danh mục gốc'}
                  </dd>
                </div>
                <div className='rounded-2xl border border-gray-100 bg-gray-50/50 p-4'>
                  <dt className='text-xs font-medium uppercase tracking-wide text-gray-500'>Số danh mục con</dt>
                  <dd className='text-sm font-medium text-gray-900'>
                    {selectedCategory.subCategoriesCount}
                  </dd>
                </div>
                <div className='rounded-2xl border border-gray-100 bg-gray-50/50 p-4'>
                  <dt className='text-xs font-medium uppercase tracking-wide text-gray-500'>Ngày tạo</dt>
                  <dd className='text-sm font-medium text-gray-900'>{formatDate(selectedCategory.createdAt)}</dd>
                </div>
                <div className='rounded-2xl border border-gray-100 bg-gray-50/50 p-4'>
                  <dt className='text-xs font-medium uppercase tracking-wide text-gray-500'>Cập nhật gần nhất</dt>
                  <dd className='text-sm font-medium text-gray-900'>{formatDate(selectedCategory.updatedAt)}</dd>
                </div>
              </dl>

              <div className='flex flex-wrap gap-3'>
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'
                >
                  <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                    <path d='m12.5 5.5 6 6L9 21l-6 .5.5-6z' strokeLinejoin='round' />
                    <path d='M4 21h16' strokeLinecap='round' />
                  </svg>
                  Chỉnh sửa danh mục
                </button>
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50'
                  onClick={() => openCreateForm(selectedCategory.categoryId)}
                >
                  <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                    <path d='M12 6v12M6 12h12' strokeLinecap='round' />
                  </svg>
                  Thêm danh mục con
                </button>
              </div>
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
