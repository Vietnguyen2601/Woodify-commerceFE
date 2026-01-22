import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const badge = tv({
  base: 'inline-flex items-center font-medium rounded-full whitespace-nowrap',
  variants: {
    variant: {
      default: 'bg-neutral-100 text-neutral-600',
      primary: 'bg-primary-100 text-primary-700',
      success: 'bg-success-500/10 text-success-600',
      warning: 'bg-warning-500/10 text-warning-600',
      error: 'bg-error-500/10 text-error-600',
      info: 'bg-info-500/10 text-info-600',
    },
    size: {
      sm: 'h-5 px-2 text-xs',
      md: 'h-6 px-3 text-xs',
      lg: 'h-7 px-3 text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export interface BadgeProps extends VariantProps<typeof badge> {
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size,
  children,
  className = '',
}) => {
  return <span className={badge({ variant, size, className })}>{children}</span>
}

Badge.displayName = 'Badge'
