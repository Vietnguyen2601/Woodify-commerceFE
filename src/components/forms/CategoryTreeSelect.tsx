import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { categoryService } from '@/services/category.service'
import type { CategoryDTO } from '@/types'

const INDENTATION = 16
const PANEL_MAX_HEIGHT = 360
const SEARCH_DELAY = 300

interface CategoryTreeNode extends CategoryDTO {
  children: CategoryTreeNode[]
  level: number
  path: string[]
}

interface FlatNode {
  node: CategoryTreeNode
  parentId: string | null
}

interface CategoryTreeSelectProps {
  value: CategoryDTO | null
  onChange: (category: CategoryDTO | null) => void
  placeholder?: string
  disabled?: boolean
}

export function CategoryTreeSelect({ value, onChange, placeholder = 'Select a category', disabled }: CategoryTreeSelectProps) {
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [autoExpandedIds, setAutoExpandedIds] = useState<Set<string>>(new Set())
  const [loadingNodeIds, setLoadingNodeIds] = useState<Set<string>>(new Set())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [apiMatchIds, setApiMatchIds] = useState<Set<string>>(new Set())
  const [activeIndex, setActiveIndex] = useState(-1)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebounce(searchValue.trim(), SEARCH_DELAY)

  useEffect(() => {
    let ignore = false
    setIsLoading(true)

    categoryService
      .getAllCategories()
      .then(({ data }) => {
        if (ignore) return
        setCategories(data ?? [])
      })
      .catch(() => {
        if (!ignore) setCategories([])
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const treeData = useMemo(() => buildCategoryTree(categories), [categories])

  const filteredTree = useMemo(() => {
    if (!debouncedSearch) return treeData.roots
    return filterTreeByQuery(treeData.roots, debouncedSearch)
  }, [treeData.roots, debouncedSearch])

  useEffect(() => {
    if (!debouncedSearch) {
      setAutoExpandedIds(new Set())
      return
    }

    const ids = new Set<string>()
    collectExpandableNodes(filteredTree, ids)
    setAutoExpandedIds(ids)
  }, [debouncedSearch, filteredTree])

  const resolvedExpandedIds = useMemo(() => {
    const union = new Set<string>(expandedIds)
    autoExpandedIds.forEach((id) => union.add(id))
    return union
  }, [expandedIds, autoExpandedIds])

  const flatNodes = useMemo(() => flattenTree(filteredTree, resolvedExpandedIds), [filteredTree, resolvedExpandedIds])

  useEffect(() => {
    if (!isDropdownOpen) return
    if (!flatNodes.length) {
      setActiveIndex(-1)
      return
    }

    setActiveIndex((prev) => {
      if (prev !== -1 && prev < flatNodes.length) return prev
      if (value) {
        const selectedIndex = flatNodes.findIndex((entry) => entry.node.categoryId === value.categoryId)
        if (selectedIndex !== -1) return selectedIndex
      }
      return 0
    })
  }, [isDropdownOpen, flatNodes, value])

  useEffect(() => {
    if (!isDropdownOpen || activeIndex === -1) return
    const focusedNodeId = flatNodes[activeIndex]?.node.categoryId
    if (!focusedNodeId) return

    const target = listRef.current?.querySelector<HTMLDivElement>(`[data-node-id="${focusedNodeId}"]`)
    if (!target || !listRef.current) return

    const { offsetTop, offsetHeight } = target
    const { scrollTop, clientHeight } = listRef.current

    if (offsetTop < scrollTop) {
      listRef.current.scrollTo({ top: offsetTop - 20, behavior: 'smooth' })
    } else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
      listRef.current.scrollTo({ top: offsetTop - clientHeight + offsetHeight + 20, behavior: 'smooth' })
    }
  }, [activeIndex, flatNodes, isDropdownOpen])

  useEffect(() => {
    if (!value) return
    setExpandedIds((prev) => {
      const next = new Set(prev)
      expandAncestors(value.categoryId, treeData.map, next)
      return next
    })
  }, [value, treeData.map])

  useEffect(() => {
    if (!debouncedSearch) {
      setApiMatchIds(new Set())
      setIsSearching(false)
      return
    }

    let ignore = false
    setIsSearching(true)

    categoryService
      .searchCategoryByName(debouncedSearch)
      .then(({ data }) => {
        if (ignore) return
        const matches = normalizeSearchResponse(data)
        const ids = new Set(matches.map((cat) => cat.categoryId))
        setApiMatchIds(ids)

        if (matches.length) {
          setExpandedIds((prev) => {
            const next = new Set(prev)
            matches.forEach((match) => expandAncestors(match.categoryId, treeData.map, next))
            return next
          })
        }
      })
      .catch(() => {
        if (!ignore) setApiMatchIds(new Set())
      })
      .finally(() => {
        if (!ignore) setIsSearching(false)
      })

    return () => {
      ignore = true
    }
  }, [debouncedSearch, treeData.map])

  const handleDocumentClick = useCallback((event: MouseEvent) => {
    if (
      !dropdownRef.current ||
      dropdownRef.current.contains(event.target as Node) ||
      buttonRef.current?.contains(event.target as Node)
    ) {
      return
    }
    setIsDropdownOpen(false)
    setActiveIndex(-1)
  }, [])

  useEffect(() => {
    if (!isDropdownOpen) return
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [handleDocumentClick, isDropdownOpen])

  const loadChildren = useCallback(async (parentId: string) => {
    setLoadingNodeIds((prev) => {
      const next = new Set(prev)
      next.add(parentId)
      return next
    })

    try {
      const { data } = await categoryService.getSubCategories(parentId)
      if (data?.length) {
        setCategories((prev) => {
          const knownIds = new Set(prev.map((item) => item.categoryId))
          const merged = [...prev]
          data.forEach((child) => {
            if (!knownIds.has(child.categoryId)) {
              merged.push(child)
            }
          })
          return merged
        })
      }
    } finally {
      setLoadingNodeIds((prev) => {
        const next = new Set(prev)
        next.delete(parentId)
        return next
      })
    }
  }, [])

  const handleToggleNode = useCallback(
    async (node: CategoryTreeNode) => {
      const isCurrentlyExpanded = expandedIds.has(node.categoryId)

      if (!isCurrentlyExpanded && node.subCategoriesCount > 0 && node.children.length === 0) {
        await loadChildren(node.categoryId)
      }

      setExpandedIds((prev) => {
        const next = new Set(prev)
        if (next.has(node.categoryId)) {
          next.delete(node.categoryId)
        } else {
          next.add(node.categoryId)
        }
        return next
      })
    },
    [expandedIds, loadChildren]
  )

  const handleSelectNode = useCallback(
    (node: CategoryTreeNode) => {
      const isLeaf = node.subCategoriesCount === 0
      if (!isLeaf) return
      onChange(node)
      setIsDropdownOpen(false)
      setActiveIndex(-1)
    },
    [onChange]
  )

  const handleClearSelection = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onChange(null)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return

      if ((event.key === 'Enter' || event.key === ' ') && !isDropdownOpen) {
        event.preventDefault()
        setIsDropdownOpen(true)
        return
      }

      if (!isDropdownOpen) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setIsDropdownOpen(true)
        }
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setIsDropdownOpen(false)
        setActiveIndex(-1)
        return
      }

      if (!flatNodes.length) return
      const clampIndex = (index: number) => Math.min(Math.max(index, 0), flatNodes.length - 1)

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((prev) => (prev === -1 ? 0 : clampIndex(prev + 1)))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((prev) => (prev === -1 ? flatNodes.length - 1 : clampIndex(prev - 1)))
      } else if (event.key === 'Home') {
        event.preventDefault()
        setActiveIndex(flatNodes.length ? 0 : -1)
      } else if (event.key === 'End') {
        event.preventDefault()
        setActiveIndex(flatNodes.length ? flatNodes.length - 1 : -1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        const target = flatNodes[activeIndex]?.node
        if (target && target.subCategoriesCount > 0 && !resolvedExpandedIds.has(target.categoryId)) {
          void handleToggleNode(target)
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        const target = flatNodes[activeIndex]
        if (!target) return
        if (resolvedExpandedIds.has(target.node.categoryId)) {
          void handleToggleNode(target.node)
        } else if (target.parentId) {
          const parentIndex = flatNodes.findIndex((entry) => entry.node.categoryId === target.parentId)
          if (parentIndex !== -1) setActiveIndex(parentIndex)
        }
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const target = flatNodes[activeIndex]?.node
        if (!target) return
        if (target.subCategoriesCount > 0) {
          void handleToggleNode(target)
        } else {
          handleSelectNode(target)
        }
      }
    },
    [disabled, flatNodes, handleSelectNode, handleToggleNode, isDropdownOpen, resolvedExpandedIds]
  )

  const selectedLabel = useMemo(() => {
    if (!value) return ''
    const node = treeData.map.get(value.categoryId)
    if (node?.path?.length) return node.path.join(' > ')
    return value.name
  }, [treeData.map, value])

  const focusedNodeId = activeIndex >= 0 ? flatNodes[activeIndex]?.node.categoryId : null

  const showEmptyState = !isLoading && !filteredTree.length
  const showNoMatch = Boolean(debouncedSearch) && showEmptyState
  const showStartTyping = !debouncedSearch && showEmptyState

  return (
    <div className='relative' onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type='button'
        aria-haspopup='tree'
        aria-expanded={isDropdownOpen}
        disabled={disabled}
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className={`inline-flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm transition focus:border-yellow-800 focus:outline-none ${
          disabled ? 'cursor-not-allowed bg-stone-100 text-stone-400' : 'border-black/5 bg-white'
        }`}
      >
        <span className={`flex-1 truncate ${selectedLabel ? 'text-stone-900' : 'text-stone-500'}`}>
          {selectedLabel || placeholder}
        </span>
        <div className='ml-2 flex items-center gap-1'>
          {value && (
            <button
              type='button'
              aria-label='Clear category'
              className='rounded-full border border-transparent p-1 text-stone-500 transition hover:border-stone-200 hover:text-stone-800'
              onClick={handleClearSelection}
            >
              <ClearIcon className='h-3.5 w-3.5' />
            </button>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 text-stone-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className='absolute left-0 right-0 top-full z-30 mt-1 rounded-2xl border border-stone-200 bg-white shadow-2xl'
        >
          <div className='sticky top-0 z-10 border-b border-stone-100 bg-white px-3 py-3'>
            <div className='relative'>
              <SearchIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400' />
              <input
                className='h-9 w-full rounded-full border border-stone-200 bg-stone-50 pl-9 pr-9 text-sm text-stone-900 placeholder:text-stone-500 focus:border-yellow-800 focus:bg-white focus:outline-none'
                placeholder='Search category by name...'
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                autoFocus
              />
              {searchValue && (
                <button
                  type='button'
                  aria-label='Clear search keyword'
                  className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 transition hover:text-stone-700'
                  onClick={() => setSearchValue('')}
                >
                  <ClearIcon className='h-4 w-4' />
                </button>
              )}
              {(isLoading || isSearching) && (
                <SpinnerIcon className='absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-700' />
              )}
            </div>
            <p className='mt-2 text-[10px] font-medium uppercase tracking-wide text-stone-400'>Browse or search the full tree</p>
          </div>

          <div ref={listRef} className='max-h-[360px] overflow-y-auto px-2 py-2'>
            {isLoading ? (
              <SkeletonList />
            ) : showEmptyState ? (
              <EmptyState message={showNoMatch ? 'No categories found' : showStartTyping ? 'Start typing to search' : 'No categories available'} />
            ) : (
              <div role='tree' aria-label='Category tree'>
                <TreeBranch
                  nodes={filteredTree}
                  level={0}
                  expandedIds={resolvedExpandedIds}
                  selectedId={value?.categoryId ?? null}
                  focusedId={focusedNodeId}
                  searchQuery={debouncedSearch}
                  apiMatchIds={apiMatchIds}
                  loadingNodeIds={loadingNodeIds}
                  onToggle={handleToggleNode}
                  onSelect={handleSelectNode}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function buildCategoryTree(categories: CategoryDTO[]) {
  const map = new Map<string, CategoryTreeNode>()

  categories.forEach((category) => {
    map.set(category.categoryId, {
      ...category,
      children: [],
      level: 0,
      path: [],
    })
  })

  const roots: CategoryTreeNode[] = []

  map.forEach((node) => {
    if (node.parentCategoryId) {
      const parent = map.get(node.parentCategoryId)
      if (parent) {
        node.level = parent.level + 1
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  const assignPath = (node: CategoryTreeNode, trail: string[]) => {
    const nextTrail = [...trail, node.name]
    node.path = nextTrail
    node.children.forEach((child) => assignPath(child, nextTrail))
  }

  roots.forEach((root) => assignPath(root, []))

  return { roots, map }
}

function filterTreeByQuery(nodes: CategoryTreeNode[], query: string): CategoryTreeNode[] {
  const normalizedQuery = query.toLowerCase()

  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
    const filteredChildren = node.children.map(filterNode).filter((child): child is CategoryTreeNode => Boolean(child))
    const matchesSelf = node.name.toLowerCase().includes(normalizedQuery)

    if (matchesSelf || filteredChildren.length) {
      return {
        ...node,
        children: filteredChildren,
      }
    }

    return null
  }

  return nodes.map(filterNode).filter((node): node is CategoryTreeNode => Boolean(node))
}

function flattenTree(nodes: CategoryTreeNode[], expandedIds: Set<string>, parentId: string | null = null, acc: FlatNode[] = []) {
  nodes.forEach((node) => {
    acc.push({ node, parentId })
    if (expandedIds.has(node.categoryId) && node.children.length) {
      flattenTree(node.children, expandedIds, node.categoryId, acc)
    }
  })
  return acc
}

function expandAncestors(categoryId: string, map: Map<string, CategoryTreeNode>, expanded: Set<string>) {
  let currentParentId = map.get(categoryId)?.parentCategoryId ?? null
  while (currentParentId) {
    expanded.add(currentParentId)
    currentParentId = map.get(currentParentId)?.parentCategoryId ?? null
  }
}

function normalizeSearchResponse(data: CategoryDTO | CategoryDTO[] | null | undefined): CategoryDTO[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  return [data]
}

function collectExpandableNodes(nodes: CategoryTreeNode[], accumulator: Set<string>) {
  nodes.forEach((node) => {
    if (node.children.length) {
      accumulator.add(node.categoryId)
      collectExpandableNodes(node.children, accumulator)
    }
  })
}

function TreeBranch({
  nodes,
  level,
  expandedIds,
  selectedId,
  focusedId,
  searchQuery,
  apiMatchIds,
  loadingNodeIds,
  onToggle,
  onSelect,
}: {
  nodes: CategoryTreeNode[]
  level: number
  expandedIds: Set<string>
  selectedId: string | null
  focusedId: string | null
  searchQuery: string
  apiMatchIds: Set<string>
  loadingNodeIds: Set<string>
  onToggle: (node: CategoryTreeNode) => void | Promise<void>
  onSelect: (node: CategoryTreeNode) => void
}) {
  return (
    <>
      {nodes.map((node) => {
        const isLeaf = node.subCategoriesCount === 0
        const isExpanded = expandedIds.has(node.categoryId)
        const isSelected = selectedId === node.categoryId
        const isFocused = focusedId === node.categoryId
        const isApiMatch = apiMatchIds.has(node.categoryId)
        const isLoadingChildren = loadingNodeIds.has(node.categoryId)

        return (
          <div key={node.categoryId}>
            <div
              role='treeitem'
              aria-expanded={!isLeaf ? isExpanded : undefined}
              aria-selected={isSelected}
              data-node-id={node.categoryId}
              style={{ paddingLeft: 12 + level * INDENTATION }}
              className={`relative mb-1 flex min-h-[36px] items-center justify-between rounded-lg border px-2 text-sm transition ${
                isSelected
                  ? 'border-yellow-500/40 bg-yellow-50 text-yellow-900'
                  : 'border-transparent bg-white text-stone-900'
              } ${
                isLeaf
                  ? 'cursor-pointer hover:bg-yellow-50'
                  : 'cursor-default hover:bg-stone-50'
              } ${isFocused ? 'ring-1 ring-yellow-700 ring-offset-1 ring-offset-white' : ''} ${isApiMatch ? 'shadow-[0_0_0_1px_rgba(187,134,21,0.4)]' : ''}`}
              onClick={() => (isLeaf ? onSelect(node) : void onToggle(node))}
            >
              <div className='flex flex-1 items-center gap-2'>
                {!isLeaf && (
                  <button
                    type='button'
                    aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                    className='rounded border border-stone-200 bg-white p-1 text-stone-600 transition hover:border-stone-300 hover:text-stone-900'
                    onClick={(event) => {
                      event.stopPropagation()
                      void onToggle(node)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className='h-3.5 w-3.5' />
                    ) : (
                      <ChevronRightIcon className='h-3.5 w-3.5' />
                    )}
                  </button>
                )}
                {isLeaf && (
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                      isSelected ? 'border-yellow-700 bg-yellow-700 text-white' : 'border-stone-300'
                    }`}
                    aria-hidden
                  >
                    {isSelected ? '•' : ''}
                  </span>
                )}
                <span className='flex-1 truncate font-medium'>
                  <HighlightedText text={node.name} query={searchQuery} />
                  {node.path.length > 1 && (
                    <span className='ml-2 text-[10px] font-normal uppercase tracking-wide text-stone-400'>
                      lvl {node.level + 1}
                    </span>
                  )}
                </span>
              </div>
              <div className='flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-stone-400'>
                {isLoadingChildren && <SpinnerIcon className='h-3.5 w-3.5 text-yellow-700' />}
                {!isLeaf && <span>{node.subCategoriesCount} sub</span>}
              </div>
            </div>
            {node.children.length > 0 && (
              <div
                className={`ml-4 overflow-hidden border-l border-dashed border-stone-200 pl-2 transition-[max-height] duration-200 ${
                  isExpanded ? 'max-h-[480px]' : 'max-h-0'
                }`}
              >
                <TreeBranch
                  nodes={node.children}
                  level={level + 1}
                  expandedIds={expandedIds}
                  selectedId={selectedId}
                  focusedId={focusedId}
                  searchQuery={searchQuery}
                  apiMatchIds={apiMatchIds}
                  loadingNodeIds={loadingNodeIds}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const parts: Array<{ value: string; match: boolean }> = []

  let startIndex = 0
  let matchIndex = lowerText.indexOf(lowerQuery)

  if (matchIndex === -1) {
    return <>{text}</>
  }

  while (matchIndex !== -1) {
    if (matchIndex > startIndex) {
      parts.push({ value: text.slice(startIndex, matchIndex), match: false })
    }
    parts.push({ value: text.slice(matchIndex, matchIndex + query.length), match: true })
    startIndex = matchIndex + query.length
    matchIndex = lowerText.indexOf(lowerQuery, startIndex)
  }

  if (startIndex < text.length) {
    parts.push({ value: text.slice(startIndex), match: false })
  }

  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part.value}-${index}`} className={part.match ? 'bg-yellow-100 text-yellow-900' : undefined}>
          {part.value}
        </span>
      ))}
    </>
  )
}

function SkeletonList() {
  return (
    <div className='space-y-2'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className='h-9 w-full animate-pulse rounded-lg bg-stone-100' />
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='flex h-40 flex-col items-center justify-center text-center text-sm text-stone-500'>
      <p>{message}</p>
    </div>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path d='M4 6L8 10L12 6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path d='M6 4L10 8L6 12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <path d='M5 5L11 11M11 5L5 11' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
      <circle cx='9' cy='9' r='7' stroke='currentColor' strokeWidth='1.5' />
      <path d='M14 14L18 18' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='12' cy='12' r='9' stroke='currentColor' strokeOpacity='0.2' strokeWidth='2' />
      <path d='M21 12A9 9 0 0012 3' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    </svg>
  )
}
