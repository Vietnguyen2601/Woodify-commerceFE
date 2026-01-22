import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
  totalItems: number
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

interface UsePaginationReturn {
  page: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPrevPage: boolean
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirst: () => void
  goToLast: () => void
}

/**
 * Hook for managing pagination state
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize) || 1,
    [totalItems, pageSize]
  )

  const startIndex = useMemo(() => (page - 1) * pageSize, [page, pageSize])
  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize - 1, totalItems - 1),
    [startIndex, pageSize, totalItems]
  )

  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const setPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages))
      setPageState(validPage)
    },
    [totalPages]
  )

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPageState(1) // Reset to first page when changing page size
  }, [])

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(page + 1)
  }, [hasNextPage, page, setPage])

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage(page - 1)
  }, [hasPrevPage, page, setPage])

  const goToFirst = useCallback(() => setPage(1), [setPage])
  const goToLast = useCallback(() => setPage(totalPages), [setPage, totalPages])

  return {
    page,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
  }
}
