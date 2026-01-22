import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium no-underline border border-transparent',
    'cursor-pointer transition-all duration-150 rounded-lg whitespace-nowrap',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  variants: {
    variant: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
      outline: 'bg-transparent border-neutral-200 text-neutral-900 hover:bg-neutral-100 hover:border-neutral-300',
      ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100',
      danger: 'bg-error-500 text-white hover:bg-error-600',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
    fullWidth: {
      true: 'w-full',
    },
    isLoading: {
      true: 'text-transparent relative',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

const spinner = tv({
  base: 'absolute w-5 h-5 animate-spin',
})

const icon = tv({
  base: 'inline-flex text-[1.125em]',
  variants: {
    position: {
      left: '-mr-0.5',
      right: '-ml-0.5',
    },
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={button({ variant, size, fullWidth, isLoading, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className={spinner()} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="40"
                strokeDashoffset="20"
              />
            </svg>
          </span>
        )}
        {!isLoading && leftIcon && (
          <span className={icon({ position: 'left' })}>{leftIcon}</span>
        )}
        <span className={isLoading ? 'invisible' : ''}>{children}</span>
        {!isLoading && rightIcon && (
          <span className={icon({ position: 'right' })}>{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
