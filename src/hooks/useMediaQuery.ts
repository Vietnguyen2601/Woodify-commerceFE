import { useState, useEffect } from 'react'

/**
 * Breakpoints matching CSS media queries
 */
const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const

type Breakpoint = keyof typeof breakpoints

/**
 * Hook to check if a media query matches
 * @param query - CSS media query string or breakpoint key
 */
export function useMediaQuery(query: string | Breakpoint): boolean {
  const mediaQuery = query in breakpoints ? breakpoints[query as Breakpoint] : query
  
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(mediaQuery).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(mediaQuery)
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    mediaQueryList.addEventListener('change', listener)
    
    // Set initial value
    setMatches(mediaQueryList.matches)

    return () => {
      mediaQueryList.removeEventListener('change', listener)
    }
  }, [mediaQuery])

  return matches
}

/**
 * Hook to check responsive breakpoints
 */
export function useBreakpoint() {
  const isSm = useMediaQuery('sm')
  const isMd = useMediaQuery('md')
  const isLg = useMediaQuery('lg')
  const isXl = useMediaQuery('xl')
  const is2Xl = useMediaQuery('2xl')

  return {
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
  }
}
