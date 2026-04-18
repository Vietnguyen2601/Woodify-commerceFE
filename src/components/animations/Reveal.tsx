import React from 'react'

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Trễ (ms) — dùng để stagger nhiều phần tử */
  delayMs?: number
  /** Ngưỡng hiển thị (0–1) */
  threshold?: number
}

/**
 * Fade + slide nhẹ khi phần tử vào viewport (IntersectionObserver).
 */
export default function Reveal({ children, className = '', delayMs = 0, threshold = 0.1 }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -24px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={[
        'will-change-transform',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
        className,
      ].join(' ')}
      style={{ transitionDelay: visible ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
