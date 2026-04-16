interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    pages.push(totalPages)
  }

  return (
    <div className='pagination'>
      <button
        type='button'
        className='pagination__btn pagination__prev'
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label='Previous page'
      >
        ← Trước
      </button>

      <div className='pagination__pages'>
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className='pagination__ellipsis'>
                ...
              </span>
            )
          }

          return (
            <button
              key={page}
              type='button'
              className={`pagination__page ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          )
        })}
      </div>

      <button
        type='button'
        className='pagination__btn pagination__next'
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label='Next page'
      >
        Sau →
      </button>
    </div>
  )
}
